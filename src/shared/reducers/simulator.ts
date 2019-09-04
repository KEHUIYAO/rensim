import {
  APPLY_EDITOR_STATE,
  ARCHIVE_CURRENT_FIELD_FINISHED,
  DEBUG_SET_HISTORY,
  DEBUG_SET_PATTERN,
  EDIT_ARCHIVE_FINISHED,
  INITIALIZE_SIMULATOR,
  LOAD_ARCHIVE,
  MOVE_HIGHLIGHTS_LEFT,
  MOVE_HIGHLIGHTS_RIGHT,
  MOVE_HISTORY,
  PUT_NEXT_PAIR,
  RECONSTRUCT_HISTORY,
  REDO_FIELD,
  REFRESH_PLAY_ID,
  RESET_FIELD,
  RESTART,
  ROTATE_HIGHLIGHTS_LEFT,
  ROTATE_HIGHLIGHTS_RIGHT,
  UNDO_FIELD
} from '../actions/actions';
import { getDefaultMove, moveLeft, moveRight, rotateLeft, rotateRight } from '../models/move';
import { fieldCols, fieldRows } from '../utils/constants';
import { generateQueue, getCurrentHand } from '../models/queue';
import { setPatternByName, setRandomHistory } from '../models/debug';
import {
  appendHistoryRecord,
  createEditHistoryRecord,
  createHistoryFromMinimumHistory,
  createHistoryRecord,
  createInitialHistoryRecord,
  getDefaultNextMove,
  History,
  HistoryRecord,
  reindexDefaultNexts
} from '../models/history';
import { createField, getSplitHeight, setPair } from '../models/stack';
import { deserializeHistoryRecords, deserializeQueue } from "../models/serializer";
import uuid from 'uuid/v4';
import _ from 'lodash';
import { createFieldReducer, FieldState, initialFieldState } from "./field";
import { State } from "./index";
import { ConfigState } from "./config";
import { Archive, Move } from "../../types";
import { original } from 'immer';

export type SimulatorState = FieldState & {
  queue: number[][],
  numHands: number,
  numSplit: number,
  pendingPair: Move,
  history: HistoryRecord[],
  historyIndex: number,

  startDateTime: Date, // Date を直接編集すると immer が immutability を保証しないので注意

  playId: string,
  title: string,
  isSaved: boolean,

  isReady: boolean, // config のロードなどを終えた状態フラグ
};

function rotateHighlightsLeft(state: SimulatorState, action) {
  state.pendingPair = rotateLeft(state.pendingPair);
  return state;
}

function rotateHighlightsRight(state: SimulatorState, action) {
  state.pendingPair = rotateRight(state.pendingPair);
  return state;
}

function moveHighlightsLeft(state: SimulatorState, action) {
  state.pendingPair = moveLeft(state.pendingPair);
  return state;
}

function moveHighlightsRight(state: SimulatorState, action) {
  state.pendingPair = moveRight(state.pendingPair);
  return state;
}

function putNextPair(state: SimulatorState, action) {
  const hand = getCurrentHand(state.queue, state.numHands);
  const move = state.pendingPair;
  const prevStack = state.stack;
  const splitHeight = getSplitHeight(prevStack, move);

  state.stack = setPair(prevStack, move, hand);

  if (state.stack === prevStack) {
    // 設置不可だった場合（= Stack が変化しなかった場合）、設置処理を行わない
    return state;
  }

  state.numHands += 1;
  state.isResetChainRequired = true;
  state.numSplit += splitHeight ? 1 : 0;

  const record = createHistoryRecord(
    move,
    hand,
    state.numHands,
    state.stack,
    state.chain,
    state.score,
    state.chainScore,
    state.numSplit);

  let result = appendHistoryRecord({
    version: 0,
    records: state.history,
    currentIndex: state.historyIndex
  }, record);

  state.history = result.records;
  state.historyIndex = result.currentIndex;

  // history が更新されてから次の move をとる必要がある
  state.pendingPair = getDefaultNextMove(state);

  return state;
}

function revertFromRecord(state: SimulatorState, record: HistoryRecord) {
  state.numHands = record.numHands;
  state.stack = record.stack;
  state.chainScore = record.chainScore;
  state.chain = record.chain;
  state.score = record.score;
  state.numSplit = record.numSplit;

  return state
}

function revert(state: SimulatorState, historyIndex: number) {
  const record = state.history[historyIndex];
  state = revertFromRecord(state, record);
  state.vanishingPuyos = [];
  state.droppingPuyos = [];
  state.historyIndex = historyIndex;
  state.pendingPair = getDefaultNextMove(state);
  state.isResetChainRequired = true;

  return state;
}

function undoField(state: SimulatorState, action) {
  const currentIndex = state.historyIndex;
  const prevIndex = state.history[currentIndex].prev;

  if (prevIndex === null) {
    // There is no history
    return state;
  }

  return revert(state, prevIndex);
}

function redoField(state: SimulatorState, action) {
  const currentIndex = state.historyIndex;
  const next = state.history[currentIndex].defaultNext;
  if (next == null) {
    return state;
  }
  return revert(state, next);
}

function moveHistory(state: SimulatorState, action): SimulatorState {
  const next = action.index;

  state = revert(state, next);

  // update defaultNext path
  state.history = reindexDefaultNexts(state.history, state.historyIndex);

  return state;
}

function resetField(state: SimulatorState, action) {
  return moveHistory(state, { index: 0 });
}

function restart(state: SimulatorState, action, config) {
  return {
    ...createInitialState(config),
    isReady: true,
  };
}

function setPattern(state: SimulatorState, action) {
  state.stack = setPatternByName(state.stack, action.name);
  return state;
}

function setHistory(state: SimulatorState, action) {
  const history: History = {
    records: state.history,
    currentIndex: state.historyIndex,
    version: 0
  };
  const result = setRandomHistory(history, state.stack);
  state.history = result.records;
  state.historyIndex = result.currentIndex;
  return state;
}

function reconstructHistory(state: SimulatorState, action): SimulatorState {
  const { history, queue, index, reset } = action;
  state.queue = deserializeQueue(queue);
  state.history = createHistoryFromMinimumHistory(
    deserializeHistoryRecords(history),
    state.queue,
    index);

  if (reset) {
    state.historyIndex = 0;
    state.history = reindexDefaultNexts(state.history, index);
  } else {
    state.historyIndex = index;
  }

  state.startDateTime = new Date();
  state.playId = uuid();

  state = revert(state, state.historyIndex);

  return state;
}

function loadArchive(state: SimulatorState, action, archives) {
  const archive: Archive = archives.archives[action.id];
  state.playId = archive.play.id;
  state.queue = _.chunk(archive.play.queue, 2);
  state.history = createHistoryFromMinimumHistory(
    deserializeHistoryRecords(archive.play.history),
    state.queue,
    archive.play.historyIndex);
  state.historyIndex = archive.play.historyIndex;
  state.startDateTime = archive.play.createdAt;
  state.isSaved = true;
  state.title = archive.title;

  state = revert(state, state.historyIndex);
  return state;
}

function archiveCurrentFieldFinished(state: SimulatorState, action) {
  const { archive } = action;
  state.isSaved = true;
  state.title = archive.title;
  return state;
}

function editArchiveFinished(state: SimulatorState, action) {
  const { archive } = action;
  if (archive.play.id === state.playId) {
    state.title = archive.title;
  }
  return state;
}

function refreshPlayId(state: SimulatorState, action) {
  state.playId = uuid();
  return state;
}

function applyEditorState(state: SimulatorState, action, rootState: State) {

  // Stack が変化しなかった場合、設置処理を行わない
  if (original(state.stack) === original(rootState.editor.stack)) {
    return state;
  }

  state.stack = rootState.editor.stack;
  state.isResetChainRequired = true;

  const record = createEditHistoryRecord(
    state.numHands,
    state.stack,
    state.chain,
    state.score,
    state.chainScore,
    state.numSplit);

  let result = appendHistoryRecord({
    version: 0,
    records: state.history,
    currentIndex: state.historyIndex
  }, record);

  state.history = result.records;
  state.historyIndex = result.currentIndex;

  return state;
}

function initializeSimulator(state: SimulatorState, config: ConfigState) {
  return {
    ...createInitialState(config),
    isReady: true
  };
}

function createInitialState(config): SimulatorState {
  const queue = generateQueue(config);
  const stack = createField(fieldRows, fieldCols);
  return {
    ...initialFieldState,
    queue: queue,
    numHands: 0,
    numSplit: 0,
    pendingPair: getDefaultMove(),
    history: [createInitialHistoryRecord(stack)],
    historyIndex: 0,
    startDateTime: new Date(),
    playId: uuid(),
    isSaved: false,
    title: '',
    isReady: false
  };
}

export function getInitialState(config) {
  return createInitialState(config);
}

const fieldReducer = createFieldReducer('simulator');

export const reducer = (state, action, rootState) => {
  state = {
    ...state,
    ...fieldReducer(state, action)
  };

  switch (action.type) {
    case INITIALIZE_SIMULATOR:
      return initializeSimulator(state, rootState.config);
    case ROTATE_HIGHLIGHTS_LEFT:
      return rotateHighlightsLeft(state, action);
    case ROTATE_HIGHLIGHTS_RIGHT:
      return rotateHighlightsRight(state, action);
    case MOVE_HIGHLIGHTS_LEFT:
      return moveHighlightsLeft(state, action);
    case MOVE_HIGHLIGHTS_RIGHT:
      return moveHighlightsRight(state, action);
    case PUT_NEXT_PAIR:
      return putNextPair(state, action);
    case UNDO_FIELD:
      return undoField(state, action);
    case REDO_FIELD:
      return redoField(state, action);
    case MOVE_HISTORY:
      return moveHistory(state, action);
    case RESET_FIELD:
      return resetField(state, action);
    case RESTART:
      return restart(state, action, rootState.config);
    case RECONSTRUCT_HISTORY:
      return reconstructHistory(state, action);
    case LOAD_ARCHIVE:
      return loadArchive(state, action, rootState.archive);
    case ARCHIVE_CURRENT_FIELD_FINISHED:
      return archiveCurrentFieldFinished(state, action);
    case EDIT_ARCHIVE_FINISHED:
      return editArchiveFinished(state, action);
    case REFRESH_PLAY_ID:
      return refreshPlayId(state, action);
    case APPLY_EDITOR_STATE:
      return applyEditorState(state, action, rootState);
    case DEBUG_SET_PATTERN:
      return setPattern(state, action);
    case DEBUG_SET_HISTORY:
      return setHistory(state, action);
    default:
      return state;
  }
};