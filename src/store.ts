import { IStore, IEmitter, IReducerMap, IActionMap } from "./interfaces";

export const EVENT_CHANGE = "change";

export function createStore<S extends {[key: string]: any}>(
  emitter: IEmitter,
  defaultState: S,
): IStore<S> {

  let state = {...defaultState};

  function setState(updater: S | ((state: S) => S)) {
    if (typeof updater === "function") {
      state = (updater as any)(state);
    }
    if (typeof updater === "object" && typeof state === "object") {
      state = ({...state, ...updater});
    }
    emitter.emit(EVENT_CHANGE, state);
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
      store.emit(`${key}.loading`);
      promise.then(() => {
        store.emit(`${key}.done`);
      });
    } else {
      store.emit(`${key}.done`);
    }
  });
  return (...data: any[]) => {
    store.emit(key, ...data);
    return new Promise((resolve) => {
      store.on(`${key}.done`, () => {
        resolve();
      });
    });
  };
}

export function createActions<T extends IReducerMap, S>(store: IStore<S>, reducerMap: T): IActionMap<T> {
  const actionMap: IActionMap<T> = {} as IActionMap<T>;
  Object.keys(reducerMap).forEach((key: string) => {
    actionMap[key] = createAction(store, key, reducerMap[key]);
  });
  return actionMap;
}
