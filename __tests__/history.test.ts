import {
  createHistoryFromMinimumHistory,
  getCurrentPathRecords,
  MinimumHistoryRecord, MoveHistoryRecord
} from '../src/shared/models/history';

describe('history', () => {
  describe('create history from minimum history', () => {
    test('with simple history', () => {
      const queue = [[1, 2], [3, 4], [1, 2], [3, 4]];
      const history: MinimumHistoryRecord[] = [
        { type: 'move', move: { rotation: 'top', col: 1 }, next: [1] },
        { type: 'move', move: { rotation: 'bottom', col: 1 }, next: [2] },
        { type: 'move', move: { rotation: 'left', col: 3 }, next: [3] },
        { type: 'move', move: { rotation: 'right', col: 3 }, next: [] }
      ];

      const result = createHistoryFromMinimumHistory(history, queue);
      // console.log(JSON.stringify(result, null, '\t'));

      expect(result).toHaveLength(5);

      expect(result[1].stack).toEqual([
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0]
      ]);

      expect(result[4].stack).toEqual([
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 3, 0, 0, 0, 0],
        [0, 4, 0, 0, 0, 0],
        [0, 2, 0, 3, 0, 0],
        [0, 1, 2, 1, 4, 0]
      ]);
    });

    test('with chain', () => {
      const queue = [[1, 1], [2, 2], [1, 1], [3, 3], [2, 2], [1, 1]];
      const history: MinimumHistoryRecord[] = [
        { type: 'move', move: { rotation: 'top', col: 1 }, next: [1] },
        { type: 'move', move: { rotation: 'top', col: 2 }, next: [2] },
        { type: 'move', move: { rotation: 'top', col: 2 }, next: [3] },
        { type: 'move', move: { rotation: 'top', col: 2 }, next: [4] },
        { type: 'move', move: { rotation: 'top', col: 3 }, next: [5] },
        { type: 'move', move: { rotation: 'top', col: 3 }, next: [] }
      ];

      const result = createHistoryFromMinimumHistory(history, queue);
      // console.log(JSON.stringify(result, null, '\t'));

      expect(result).toHaveLength(7);

      expect(result[4].chain).toEqual(0);
      expect(result[4].chainScore).toEqual(0);
      expect(result[4].score).toEqual(0);

      expect(result[5].chain).toEqual(2);
      expect(result[5].chainScore).toEqual(360);
      expect(result[5].score).toEqual(360);

      expect(result[6].chain).toEqual(0);
      expect(result[6].chainScore).toEqual(0);
      expect(result[6].score).toEqual(360);

      expect(result[6].stack).toEqual([
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 3, 1, 0, 0],
        [0, 0, 3, 1, 0, 0]
      ]);
    });

    test('with branches', () => {
      const queue = [[1, 1], [2, 2], [1, 1], [3, 3], [2, 2], [1, 1]];
      const history: MinimumHistoryRecord[] = [
        { type: 'move', move: { rotation: 'top', col: 1 }, next: [1, 2, 4] },
        { type: 'move', move: { rotation: 'top', col: 1 }, next: [] },
        { type: 'move', move: { rotation: 'top', col: 2 }, next: [3] },
        { type: 'move', move: { rotation: 'top', col: 2 }, next: [] },
        { type: 'move', move: { rotation: 'top', col: 3 }, next: [5] },
        { type: 'move', move: { rotation: 'top', col: 3 }, next: [] }
      ];

      const result = createHistoryFromMinimumHistory(history, queue);
      // console.log(JSON.stringify(result, null, '\t'));

      expect(result).toHaveLength(7);

      expect(result[0].prev).toEqual(null);
      expect(result[0].next).toEqual([1]);
      expect(result[0].defaultNext).toEqual(1);

      expect(result[1].prev).toEqual(0);
      expect(result[1].next).toEqual([2, 3, 5]);
      expect(result[1].defaultNext).toEqual(2);

      expect(result[2].prev).toEqual(1);
      expect(result[2].next).toEqual([]);
      expect(result[2].defaultNext).toEqual(null);

      expect(result[3].prev).toEqual(1);
      expect(result[3].next).toEqual([4]);
      expect(result[3].defaultNext).toEqual(4);

      expect(result[4].prev).toEqual(3);
      expect(result[4].next).toEqual([]);
      expect(result[4].defaultNext).toEqual(null);
    });
  });

  describe('getCurrentPath', () => {
    test('' , () => {
      const queue = [[1, 1]];
      const history: MinimumHistoryRecord[] = [
        { type: 'move', move: { rotation: 'top', col: 0 }, next: [1, 2, 4] },
        { type: 'move', move: { rotation: 'top', col: 1 }, next: [] },
        { type: 'move', move: { rotation: 'top', col: 2 }, next: [3] },
        { type: 'move', move: { rotation: 'top', col: 3 }, next: [] },
        { type: 'move', move: { rotation: 'top', col: 4 }, next: [5] },
        { type: 'move', move: { rotation: 'top', col: 5 }, next: [] }
      ];
      const target = createHistoryFromMinimumHistory(history, queue);

      {
        const actual = getCurrentPathRecords(target, 3);
        expect(actual[0].type).toBe("head");
        expect(actual[1].type).toBe("move");
        expect((actual[1] as MoveHistoryRecord).move.col).toEqual(0);
        expect(actual[1].next).toEqual([2]);
        expect(actual[1].defaultNext).toEqual(2);
        expect((actual[2] as MoveHistoryRecord).move.col).toEqual(2);
        expect(actual[2].next).toEqual([]);
        expect(actual[2].defaultNext).toBeNull();
      }
    });

    test('' , () => {
      const queue = [[1, 1]];
      const history: MinimumHistoryRecord[] = [
        { type: 'move', move: { rotation: 'top', col: 0 }, next: [1, 2, 4] },
        { type: 'move', move: { rotation: 'top', col: 1 }, next: [] },
        { type: 'move', move: { rotation: 'top', col: 2 }, next: [3] },
        { type: 'move', move: { rotation: 'top', col: 3 }, next: [] },
        { type: 'move', move: { rotation: 'top', col: 4 }, next: [5] },
        { type: 'move', move: { rotation: 'top', col: 5 }, next: [] }
      ];
      const target = createHistoryFromMinimumHistory(history, queue);

      {
        const actual = getCurrentPathRecords(target, 4);
        expect(actual[0].type).toBe("head");
        expect((actual[1] as MoveHistoryRecord).move.col).toEqual(0);
        expect(actual[1].next).toEqual([2]);
        expect(actual[1].defaultNext).toEqual(2);
        expect((actual[2] as MoveHistoryRecord).move.col).toEqual(2);
        expect(actual[2].next).toEqual([3]);
        expect(actual[2].defaultNext).toEqual(3);
        expect((actual[3] as MoveHistoryRecord).move.col).toEqual(3);
        expect(actual[3].next).toEqual([]);
        expect(actual[3].defaultNext).toBeNull();
      }
    });
  });
});

