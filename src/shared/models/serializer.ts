import _ from 'lodash';
import { createInitialHistoryRecord, History, HistoryRecord, MinimumHistoryRecord } from "./history";
import { isEqualMove, Move } from "./move";

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * The maximum of color number that serializer can handle
 */
const maxColor = 7;

/**
 * Serialize queue into string
 * @param queue color array
 */
export function serializeQueue(queue: number[]): string {
  if (queue.length % 2 !== 0) {
    throw new Error('The length of queue must be even');
  }

  if (queue.find(c => (c < 0 || maxColor <= c)) !== undefined) {
    throw new Error('Invalid color in queue: [' + queue.join(',') + ']');
  }

  return _.chunk(queue, 2)
    .map(pair => chars[pair[0] * maxColor + pair[1]])
    .join('');
}

/**
 * Deserialize queue from string
 * @param serializedQueue string queue
 */
export function deserializeQueue(serializedQueue: string): number[] {
  const pairNumbers = serializedQueue
    .split('')
    .map(char => chars.indexOf(char));

  if (pairNumbers.find(num => num === -1) !== undefined) {
    throw new Error('Invalid char in serialized queue: [' + serializedQueue + ']')
  }

  return _.flatMap(pairNumbers, n => [Math.floor(n / maxColor), n % maxColor]);
}

const moveList: Move[] = [
  { rotation: 'top', col: 0 },
  { rotation: 'top', col: 1 },
  { rotation: 'top', col: 2 },
  { rotation: 'top', col: 3 },
  { rotation: 'top', col: 4 },
  { rotation: 'top', col: 5 },
  { rotation: 'bottom', col: 0 },
  { rotation: 'bottom', col: 1 },
  { rotation: 'bottom', col: 2 },
  { rotation: 'bottom', col: 3 },
  { rotation: 'bottom', col: 4 },
  { rotation: 'bottom', col: 5 },
  { rotation: 'right', col: 0 },
  { rotation: 'right', col: 1 },
  { rotation: 'right', col: 2 },
  { rotation: 'right', col: 3 },
  { rotation: 'right', col: 4 },
  { rotation: 'left', col: 0 },
  { rotation: 'left', col: 1 },
  { rotation: 'left', col: 2 },
  { rotation: 'left', col: 3 },
  { rotation: 'left', col: 4 }
];

const specialChars = [
  { type: 'tail' },
  { type: 'jump', numNextChars: 1 },
  { type: 'jump', numNextChars: 2 },
  { type: 'jump', numNextChars: 3 },
];

function baseLog(value: number, base: number) {
  return Math.log(value) / Math.log(base);
}

/**
 * Serialize history records into string
 * @param records history records
 */
export function serializeHistoryRecords(records: HistoryRecord[]): string {
  let result = '';
  let i = 1;
  while (i < records.length) {
    const record = records[i];

    // append move
    const moveIndex = moveList.findIndex(m => isEqualMove(m, record.move));
    if (0 <= moveIndex) {
      result += chars[moveIndex];
    }

    // append terminal mark
    if (record.next.length === 0) {
      const specialIndex = specialChars.findIndex(c => c.type === 'tail');
      result += chars[chars.length - (specialIndex + 1)];
    }

    // append jump mark
    const jumps = record.next.filter(next => next !== i + 1);
    for (let jump of jumps) {
      const numRequiredChars = Math.ceil(baseLog(jump, chars.length));
      const specialIndex = specialChars
        .findIndex(c => c.type === 'jump' && c.numNextChars === numRequiredChars);
      result += chars[chars.length - (specialIndex + 1)];

      // encode jump destination index
      let encodedJump = '';
      for (let j = 0; j < numRequiredChars; j++) {
        encodedJump += chars[Math.floor(jump % chars.length)];
        jump = Math.floor(jump / chars.length);
      }
      result += _.reverse(encodedJump);
    }

    i++;
  }

  return result;
}

/**
 * Deserialize history records from string
 * @param serialized string history
 */
export function deserializeHistoryRecords(serialized: string): MinimumHistoryRecord[] {
  let i = 0;
  let result: MinimumHistoryRecord[] = [];

  while (i < serialized.length) {
    let currentNumber = chars.indexOf(serialized[i++]);

    // parse move
    if (moveList[currentNumber] !== undefined) {
      result.push({
        move: moveList[currentNumber]!,
        next: []
      });
    }

    const specialCommand = specialChars[chars.length - currentNumber - 1];
    if (specialCommand === undefined) {
      result[result.length - 1].next.push(result.length);
    } else {
      switch (specialCommand.type) {
        case 'tail':
          // tail node has empty next
          result[result.length - 1].next = [];
          break;
        case 'jump':
          // parse jump destination
          let destination = 0;
          for (let j = 0; j < specialCommand.numNextChars!; j++) {
            destination *= (j === 0 ? 1 : chars.length);
            destination += chars.indexOf(serialized[i++]) - 1;
          }
          result[result.length - 1].next.push(destination);
          break;
        default:
          throw new Error('Invalid special command');
      }
    }
  }

  return result;
}