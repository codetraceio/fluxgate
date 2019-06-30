import { IStore, IEmitter, IReducerMap, IActionMap } from "./interfaces";
import { getConfig } from "./config";
import { loadingEvent, completedEvent, CHANGE_EVENT, failedEvent } from "./events";

export function createStore<S extends {[key: string]: any}>(
  emitter: IEmitter,
  defaultState: S,
  storeName?: string,
): IStore<S> {
  let backendState: S = {} as S;
  if (!getConfig().isBackend && storeName) {
    backendState = (window as any).__rexStores__ && (window as any).__rexStores__[storeName] || {};
  }

  let state = {...defaultState, ...backendState};

  function setState(updater: S | ((state: S) => S)) {
    if (typeof updater === "function") {
      state = (updater as any)(state);
    }
    if (typeof updater === "object" && typeof state === "object") {
      state = ({...state, ...updater});
    }
    emitter.emit(CHANGE_EVENT, state);
  }

  function getState() {
    return state;
  }

  return {
    emit: emitter.emit,
    on: emitter.on,
    off: emitter.off,
    setState,
    getState,
  };
}

function createAction<T>(
  store: IStore<T>,
  key: string,
  reducer: (...data: any[]) => void | Promise<any>,
) {
  store.on(key, (...data: any[]) => {
    const promise = reducer(...data);
    if (promise instanceof Promise) {
      store.emit(loadingEvent(key));
      promise.then((result) => {
        store.emit(completedEvent(key), result);
      }).catch((e) => {
        store.emit(failedEvent(key), e);
      });
    } else {
      store.emit(completedEvent(key), promise);
    }
  });

  const action = (...data: any[]) => {
    store.emit(key, ...data);
    return new Promise<any>((resolve, reject) => {
      store.on(completedEvent(key), (result) => {
        resolve(result);
      });
      store.on(failedEvent(key), (e) => {
        reject(e);
      });
    });
  };

  Object.defineProperty(action, "name", {
    value: key,
  });

  return action;
}

export function createActions<T extends IReducerMap, S>(store: IStore<S>, reducerMap: T): IActionMap<T> {
  const actionMap: IActionMap<T> = {} as IActionMap<T>;
  Object.keys(reducerMap).forEach((key: keyof T) => {
    actionMap[key] = createAction<S>(store, key as string, reducerMap[key]);
  });
  return actionMap;
}
