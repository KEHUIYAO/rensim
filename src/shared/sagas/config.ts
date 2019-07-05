import { call, put, select, takeEvery } from "redux-saga/effects";
import { ConfigState } from "../reducers/config";
import {
  initializeSimulator,
  LOAD_CONFIG,
  loadConfigCompleted,
  SAVE_CONFIG,
  saveConfigCompleted
} from "../actions/actions";
import { loadConfig, saveConfig } from "../platformServices/storage";
import { captureException } from "../platformServices/sentry";

function* load() {
  let config = {};

  try {
    config = yield call(loadConfig);
  } catch (e) {
    console.error(e);
    captureException(e);
  }

  yield put(loadConfigCompleted(config));
  yield put(initializeSimulator());
}

function* save(action) {
  const { key, value } = action;
  let configState = yield select<(State) => ConfigState>(state => state.config);

  // config constraints
  if (key === 'numColors') {
    // 初手固定の設定をリセットする
    configState.initialColors = 'noLimit';
    configState.specify1stHand = 'AA';
    configState.specify2ndHand = 'notSpecified';
    configState.specify3rdHand = 'notSpecified';
  }

  try {
    yield call(saveConfig, key, value);
    configState[key] = value;
  } catch (e) {
    console.error(e);
    captureException(e);
  }

  yield put(saveConfigCompleted(configState));
}

function* sagas() {
  yield takeEvery(LOAD_CONFIG, load);
  yield takeEvery(SAVE_CONFIG, save);
}

export default sagas;
