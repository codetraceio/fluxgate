import { createEmitter } from "./emitter";
import { IStore, IEmitter, IReducerMap, IActionMap } from "./interfaces";

export const EVENT_CHANGE = "change";

export function createStore<S extends {[key: string]: any}>(defaultState: S): IStore<S> {
  const emitter = createEmitter();
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

function createAction(emitter: IEmitter, key: string, reducer: (...data: any[]) => void) {
  emitter.on(key, reducer);
  return (...data: any[]) => {
    emitter.emit(key, data);
  };
}

export function createActions<T extends IReducerMap>(emitter: IEmitter, reducerMap: T): IActionMap<T> {
  const actionMap: IActionMap<T> = {} as IActionMap<T>;
  Object.keys(reducerMap).forEach((key: string) => {
    actionMap[key] = createAction(emitter, key, reducerMap[key]);
  });
  return actionMap;
}
