function makeActionCreator(type, ...argNames) {
  return function (...args) {
    let action = { type };
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index];
    });
    return action;
  };
}

export const INITIALIZE_SIMULATOR = 'INITIALIZE_SIMULATOR';
export const PUT_NEXT_PAIR = 'PUT_NEXT_PAIR';
export const ROTATE_HIGHLIGHTS_LEFT = 'ROTATE_HIGHLIGHTS_LEFT';
export const ROTATE_HIGHLIGHTS_RIGHT = 'ROTATE_HIGHLIGHTS_RIGHT';
export const MOVE_HIGHLIGHTS_LEFT = 'MOVE_HIGHLIGHTS_LEFT';
export const MOVE_HIGHLIGHTS_RIGHT = 'MOVE_HIGHLIGHTS_RIGHT';
export const FINISH_VANISHING_ANIMATIONS = 'FINISH_VANISHING_ANIMATIONS';
export const FINISH_DROPPING_ANIMATIONS = 'FINISH_DROPPING_ANIMATIONS';
export const APPLY_GRAVITY = 'APPLY_GRAVITY';
export const VANISH_PUYOS = 'VANISH_PUYOS';
export const FINISH_VANISHING_ANIMATIONS_EDITOR = 'FINISH_VANISHING_ANIMATIONS_EDITOR';
export const FINISH_DROPPING_ANIMATIONS_EDITOR = 'FINISH_DROPPING_ANIMATIONS_EDITOR';
export const APPLY_GRAVITY_EDITOR = 'APPLY_GRAVITY_EDITOR';
export const VANISH_PUYOS_EDITOR = 'VANISH_PUYOS_EDITOR';
export const UNDO_FIELD = 'UNDO_FIELD';
export const REDO_FIELD = 'REDO_FIELD';
export const MOVE_HISTORY = 'MOVE_HISTORY';
export const RESET_FIELD = 'RESET_FIELD';
export const RESTART = 'RESTART';
export const RECONSTRUCT_HISTORY = 'RECONSTRUCT_HISTORY';
export const SELECT_EDIT_ITEM = 'SELECT_EDIT_ITEM';
export const PUT_CURRENT_ITEM = 'PUT_CURRENT_ITEM';
export const INITIALIZE_EDITOR = 'INITIALIZE_EDITOR';
export const SAVE_CONFIG = 'SAVE_CONFIG';
export const RESET_LAYOUT = 'RESET_LAYOUT';
export const REFRESH_PLAY_ID = 'REFRESH_PLAY_ID';
export const REQUEST_LOGIN = 'REQUEST_LOGIN';
export const REQUEST_LOGIN_SUCCEED = 'REQUEST_LOGIN_SUCCEED';
export const ARCHIVE_CURRENT_FIELD = 'ARCHIVE_CURRENT_FIELD';
export const ARCHIVE_CURRENT_FIELD_FINISHED = 'ARCHIVE_CURRENT_FIELD_FINISHED';
export const LOAD_ARCHIVE_LIST_FIRST_PAGE = 'LOAD_ARCHIVE_LIST_FIRST_PAGE';
export const LOAD_ARCHIVE_LIST_NEXT_PAGE = 'LOAD_ARCHIVE_LIST_NEXT_PAGE';
export const LOAD_ARCHIVE_LIST_FIRST_PAGE_FINISHED = 'LOAD_ARCHIVE_LIST_FIRST_PAGE_FINISHED';
export const LOAD_ARCHIVE_LIST_NEXT_PAGE_FINISHED = 'LOAD_ARCHIVE_LIST_NEXT_PAGE_FINISHED';
export const LOAD_ARCHIVE = 'LOAD_ARCHIVE';
export const EDIT_ARCHIVE = 'EDIT_ARCHIVE';
export const EDIT_ARCHIVE_FINISHED = 'EDIT_ARCHIVE_FINISHED';
export const DELETE_ARCHIVE = 'DELETE_ARCHIVE';
export const DELETE_ARCHIVE_FINISHED = 'DELETE_ARCHIVE_FINISHED';
export const SNOW_SNACKBAR = 'SNOW_SNACKBAR';
export const DEBUG_SET_PATTERN = 'DEBUG_SET_PATTERN';
export const DEBUG_SET_HISTORY = 'DEBUG_SET_HISTORY';

export const putNextPair = makeActionCreator(PUT_NEXT_PAIR);
export const initializeSimulator = makeActionCreator(INITIALIZE_SIMULATOR);
export const rotateHighlightsLeft = makeActionCreator(ROTATE_HIGHLIGHTS_LEFT);
export const rotateHighlightsRight = makeActionCreator(ROTATE_HIGHLIGHTS_RIGHT);
export const moveHighlightsLeft = makeActionCreator(MOVE_HIGHLIGHTS_LEFT);
export const moveHighlightsRight = makeActionCreator(MOVE_HIGHLIGHTS_RIGHT);
export const finishDroppingAnimations = makeActionCreator(FINISH_DROPPING_ANIMATIONS);
export const finishVanishingAnimations = makeActionCreator(FINISH_VANISHING_ANIMATIONS);
export const applyGravity = makeActionCreator(APPLY_GRAVITY);
export const vanishPuyos = makeActionCreator(VANISH_PUYOS);
export const finishDroppingAnimationsEditor = makeActionCreator(FINISH_DROPPING_ANIMATIONS_EDITOR);
export const finishVanishingAnimationsEditor = makeActionCreator(FINISH_VANISHING_ANIMATIONS_EDITOR);
export const applyGravityEditor = makeActionCreator(APPLY_GRAVITY_EDITOR);
export const vanishPuyosEditor = makeActionCreator(VANISH_PUYOS_EDITOR);
export const undoField = makeActionCreator(UNDO_FIELD);
export const redoField = makeActionCreator(REDO_FIELD);
export const moveHistory = makeActionCreator(MOVE_HISTORY, 'index');
export const resetField = makeActionCreator(RESET_FIELD);
export const restart = makeActionCreator(RESTART);
export const reconstructHistory = makeActionCreator(RECONSTRUCT_HISTORY, 'history', 'queue', 'index');
export const selectEditItem = makeActionCreator(SELECT_EDIT_ITEM, 'item');
export const putCurrentItem = makeActionCreator(PUT_CURRENT_ITEM, 'position');
export const initializeEditor = makeActionCreator(INITIALIZE_EDITOR);
export const saveConfig = makeActionCreator(SAVE_CONFIG, 'key', 'value');
export const resetLayout = makeActionCreator(RESET_LAYOUT, 'layout');
export const refreshPlayId = makeActionCreator(REFRESH_PLAY_ID);
export const requestLogin = makeActionCreator(REQUEST_LOGIN);
export const requestLoginSucceed = makeActionCreator(REQUEST_LOGIN_SUCCEED, 'user');
export const archiveCurrentField = makeActionCreator(ARCHIVE_CURRENT_FIELD, 'archivePayload');
export const archiveCurrentFieldFinished = makeActionCreator(ARCHIVE_CURRENT_FIELD_FINISHED, 'archive');
export const loadArchiveListFirstPage = makeActionCreator(LOAD_ARCHIVE_LIST_FIRST_PAGE);
export const loadArchiveListFirstPageFinished = makeActionCreator(LOAD_ARCHIVE_LIST_FIRST_PAGE_FINISHED, 'archives');
export const loadArchiveListNextPage = makeActionCreator(LOAD_ARCHIVE_LIST_NEXT_PAGE);
export const loadArchiveListNextPageFinished = makeActionCreator(LOAD_ARCHIVE_LIST_NEXT_PAGE_FINISHED, 'archives');
export const loadArchive = makeActionCreator(LOAD_ARCHIVE, 'id');
export const editArchive = makeActionCreator(EDIT_ARCHIVE,  'archivePayload');
export const editArchiveFinished = makeActionCreator(EDIT_ARCHIVE_FINISHED, 'archive');
export const deleteArchive = makeActionCreator(DELETE_ARCHIVE, 'id');
export const deleteArchiveFinished = makeActionCreator(DELETE_ARCHIVE_FINISHED, 'id');
export const showSnackbar = makeActionCreator(SNOW_SNACKBAR, 'message');
export const debugSetPattern = makeActionCreator(DEBUG_SET_PATTERN, 'name');
export const debugSetHistory = makeActionCreator(DEBUG_SET_HISTORY, 'name');
