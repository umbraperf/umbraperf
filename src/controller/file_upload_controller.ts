import * as model from '../model';
import { store, appContext } from '../app_config';

export function handleNewFile(file: File){
    setFileLoading(true);
    setUmbraperfFileParsingFinished(false);
    setFile(file);
    appContext.controller.registerFileAtWorker(file);
}

export function setFile(newFile: File) {
    store.dispatch({
        type: model.StateMutationType.SET_FILE,
        data: newFile,
    });
}

export function setUmbraperfFileParsingFinished(newUmbraperfFileParsingFinished: boolean) {
    store.dispatch({
        type: model.StateMutationType.SET_UMBRAPERF_FILE_PARSING_FINISHED,
        data: newUmbraperfFileParsingFinished,
    });
}

export function setFileLoading(newFileLoading: boolean) {
    store.dispatch({
        type: model.StateMutationType.SET_FILE_LOADING,
        data: newFileLoading,
    });
}

export function resetState() {
    store.dispatch({
        type: model.StateMutationType.SET_RESET_STATE,
        data: undefined,
    });
}
