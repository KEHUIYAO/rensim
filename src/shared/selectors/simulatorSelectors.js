import Immutable, { Map, List } from 'immutable';
import { fieldCols, fieldRows } from '../utils/constants';
import _ from 'lodash';
import { getFirstCol, getSecondCol } from '../models/move';
import { createField, isValidPosition } from '../models/stack';
import { VanishingPlan } from '../models/chainPlanner';

export function wrapCache(f, ...args) {
  let argsCache = {};
  let resultCache = null;

  return state => {
    const isNotUpdated = _.every(args, arg => state.get(arg) === argsCache[arg]);

    if (isNotUpdated && resultCache !== null) {
      // use cache
      return resultCache;
    }

    for (let arg of args) {
      argsCache[arg] = state.get(arg);
    }

    resultCache = f(..._.values(_.pick(argsCache, args)), state);
    return resultCache;
  }
}

export function isActive(state) {
  return !(
    state.get('simulator').get('droppingPuyos').count() > 0 ||
    state.get('simulator').get('vanishingPuyos').count() > 0
  );
}

export function canUndo(state) {
  const history = state.get('history');
  const historyIndex = state.get('historyIndex');
  return history.get(historyIndex).get('prev') !== null;
}

export function canRedo(state) {
  const history = state.get('history');
  const historyIndex = state.get('historyIndex');
  return history.get(historyIndex).get('next').size > 0;
}

export function getGhost(state) {
  return getDropPositions(state);
}

export function getPendingPair(state) {
  const pair = state.get('pendingPair').toJS(); // as Move
  const hand = getCurrentHand(state);

  let secondRow = 1;
  if (pair.rotation === 'bottom') {
    secondRow = 2;
  } else if (pair.rotation === 'top') {
    secondRow = 0;
  }

  return [
    { row: 1, col: getFirstCol(pair), color: hand.get(0) },
    { row: secondRow, col: getSecondCol(pair), color: hand.get(1) }
  ];
}

export const getVanishingPuyos = wrapCache(_getVanishingPuyos, 'vanishingPuyos');

function _getVanishingPuyos(_vanishings) {

  const vanishings = _vanishings.toJS();
  let field = createField(fieldRows, fieldCols);

  for (let plan of vanishings) {
    for (let puyo of plan.puyos) {
      field[puyo.row][puyo.col] = plan.color;
    }
  }

  const hasConnection = (row, col, color) => {
    return isValidPosition({ row, col }) && field[row][col] === color;
  };

  let result = [];

  for (let plan of vanishings) {
    for (let puyo of plan.puyos) {
      const row = puyo.row;
      const col = puyo.col;
      const color = plan.color;
      result.push({
        row: row,
        col: col,
        color: plan.color,
        connections: {
          top: hasConnection(row - 1, col, color),
          bottom: hasConnection(row + 1, col, color),
          left: hasConnection(row, col - 1, color),
          right: hasConnection(row, col + 1, color)
        }
      });
    }
  }

  return Immutable.fromJS(result);
}


export const getStack = wrapCache(_getStack, 'stack', 'droppingPuyos');

function _getStack(stack, droppings) {
  const isDropping = (row, col) => {
    return !!droppings.find(p => p.get('row') === row && p.get('col') === col);
  };

  const hasConnection = (row, col, color) => {
    return isValidPosition({ row, col }) &&
      0 < row &&
      stack.getIn([row, col]) === color &&
      color !== 0 &&
      !isDropping(row, col);
  };

  return stack.map((cols, row) => {
    return cols.map((color, col) => {
      let connections = {
        top: hasConnection(row - 1, col, color),
        bottom: hasConnection(row + 1, col, color),
        left: hasConnection(row, col - 1, color),
        right: hasConnection(row, col + 1, color)
      };
      if (row === 0) connections = {}; // puyos on row = 0 have no connection
      return Map({
        row: row,
        col: col,
        color: color,
        connections: Map(connections),
        isDropping: isDropping(row, col)
      });
    });
  });
}

export const getCurrentHand = wrapCache(
  (queue, numHands) => queue.get(numHands % queue.size),
  'queue', 'numHands');

export const getNextHand = wrapCache(
  (queue, numHands) => queue.get((numHands + 1) % queue.size),
  'queue', 'numHands');

export const getDoubleNextHand = wrapCache(
  (queue, numHands) => queue.get((numHands + 2) % queue.size),
  'queue', 'numHands');

export const getDropPositions = wrapCache(_getDropPositions, 'pendingPair', 'stack', 'queue', 'numHands');

function _getDropPositions(_pair, stack, queue, numHands, state) {
  const hand = getCurrentHand(state);
  const pair = _pair.toJS();
  const firstCol = getFirstCol(pair);
  const secondCol = getSecondCol(pair);

  const getDropRow = (col) => {
    let i = fieldRows - 1;
    while (stack.get(i) && stack.getIn([i, col]) !== 0) {
      i--;
    }
    return i;
  };

  const drop1 = { row: getDropRow(firstCol), col: firstCol, color: hand.get(0) };
  const drop2 = { row: getDropRow(secondCol), col: secondCol, color: hand.get(1) };
  if (drop1.col === drop2.col && drop1.row === drop2.row) {
    if (pair.rotation === 'bottom') {
      drop1.row -= 1;
    } else {
      drop2.row -= 1;
    }
  }

  return [drop1, drop2].filter(d => isValidPosition(d));
}

export const getHistoryTreeLayout = wrapCache(_getHistoryTreeLayout, 'history', 'historyIndex');

function _getHistoryTreeLayout(history, historyIndexBase) {
  let nodes = List();
  let paths = List();
  let rightmostRow = 0;
  let deepestColumn = 0;

  // calc indexMap
  let indexMap = {};
  {
    let index = historyIndexBase;
    while (index) {
      const p = history.get(index);
      indexMap[p.get('prev')] = index;
      index = p.get('prev');
    }
  }

  // calc graph layout
  const calcLayout = (historyIndex, depth, parentRow) => {
    const record = history.get(historyIndex);
    if (!record) {
      return;
    }

    return record.get('next').map((nextIndex, index) => {
      if (index > 0) {
        rightmostRow += 1;
      }
      const isCurrentPath = indexMap[historyIndex] === nextIndex;

      if (historyIndex > 0) {
        paths = paths.push(Map({
          from: Map({ row: parentRow, col: depth - 1 }),
          to: Map({ row: rightmostRow, col: depth }),
          isCurrentPath
        }));
      }
      if (depth > deepestColumn) {
        deepestColumn = depth;
      }
      nodes = nodes.push(Map({
        row: rightmostRow,
        col: depth,
        move: history.getIn([nextIndex, 'move']),
        isCurrentNode: nextIndex === historyIndexBase,
        historyIndex: nextIndex
      }));
      calcLayout(nextIndex, depth + 1, rightmostRow);
    });
  };
  calcLayout(0, 0, 0);

  // extract hands from history
  let hands = List();
  hands = hands.withMutations(h => {
    const searchHands = (index, depth) => {
      const record = history.get(index);
      if (depth > 0) {
        h.set(depth - 1, record.get('pair'));
      }
      record.get('next').map(nextIndex => {
        searchHands(nextIndex, depth + 1);
      });
    };
    searchHands(0, 0);
  });

  return Map({
    nodes,
    paths,
    hands,
    width: rightmostRow,
    height: deepestColumn
  });
}