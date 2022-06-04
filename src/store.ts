import { Store, Emitter, ReducerMap, ActionMap } from "./interfaces";
import { getConfig } from "./config";
import { loadingEvent, completedEvent, CHANGE_EVENT, failedEvent } from "./events";

export function createStore<S extends {[key: string]: any}>(
  emitter: Emitter,
  defaultState: S,
  storeName?: string,
): Store<S> {
  let backendState: S = {} as S;
  if (!getConfig().isBackend && storeName) {
    backendState = (window as any).__fluxgateStores__ && (window as any).__fluxgateStores__[storeName] || {};
  }

  let state = {...defaultState, ...backendState};

  function setState(updater: Partial<S> | ((state: S) => S)) {
    const oldState = state;
    if (typeof updater === "function") {
      state = (updater as any)(state);
    }
    if (typeof updater === "object" && typeof state === "object") {
      state = ({...state, ...updater});
    }
    emitter.emit(CHANGE_EVENT, state, oldState);
  }

  function getState() {
    return state;
  }

  return {
    emit: emitter.emit,
    on: emitter.on,
    off: emitter.off,
    once: emitter.once,
    setState,
    getState,
  };
}

function createAction<T>(
  store: Store<T>,
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
  };

  Object.defineProperty(action, "name", {
    value: key,
  });

  return action;
}

export function createActions<T extends ReducerMap, S>(store: Store<S>, reducerMap: T): ActionMap<T> {
  const actionMap: ActionMap<T> = {} as ActionMap<T>;
  Object.keys(reducerMap).forEach((key: keyof T) => {
    actionMap[key] = createAction<S>(store, key as string, reducerMap[key]);
  });
  return actionMap;
}
