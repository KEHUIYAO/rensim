import * as simulator from './simulator';
import * as editor from './editor';
import * as config from './config';
import * as layout from './layout';
import * as theme from './theme';
import * as archive from './archive';
import * as auth from './auth';
import * as shareOption from './shareOption';
import produce from 'immer';

export interface State {
  simulator: simulator.SimulatorState,
  editor: editor.EditorState,
  config: any,
  layout: layout.LayoutState,
  theme: theme.ThemeState,
  archive: archive.ArchiveState,
  auth: auth.AuthState,
  shareOption: shareOption.ShareOptionState
}

let initialState: State = {
  simulator: simulator.getInitialState(config.initialState),
  editor: editor.initialState,
  config: config.initialState,
  layout: layout.initialState,
  theme: theme.initialState,
  archive: archive.initialState,
  auth: auth.initialState,
  shareOption: shareOption.initialState
};

export default function (state: State = initialState, action): State {
  return produce<State>(state, _state => {
    _state.simulator = simulator.reducer(_state.simulator, action, _state);
    _state.editor = editor.reducer(_state.editor, action, _state);
    _state.config = config.reducer(_state.config, action);
    _state.layout = layout.reducer(_state.layout, action);
    _state.theme = theme.reducer(_state.theme, action);
    _state.archive = archive.reducer(_state.archive, action);
    _state.auth = auth.reducer(_state.auth, action);
    _state.shareOption = shareOption.reducer(_state.shareOption, action);
    return _state;
  });
};
