import { Store, Emitter, ReducerMap, ActionMap } from "./interfaces";
import { getConfig } from "./config";
import { loadingEvent, completedEvent, CHANGE_EVENT, failedEvent } from "./events";

function noop() {}
type PromiseResult<T> = T extends PromiseLike<infer U> ? U : T;
function isPromiseLike<T>(value: any): value is PromiseLike<T> {
  return value !== null && (typeof value === "object" || typeof value === "function") && typeof value.then === "function";
}

export function createStore<S extends {[key: string]: any}>(
  emitter: Emitter | null,
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
    emitter?.emit(CHANGE_EVENT, state, oldState);
  }

  function getState() {
    return state;
  }

  return {
    emit: emitter?.emit || noop,
    on: emitter?.on || noop,
    off: emitter?.off || noop,
    once: emitter?.once || noop,
    setState,
    getState,
  };
}

function createAction<T, R extends (...data: any[]) => any>(
  store: Store<T>,
  key: string,
  reducer: R,
): (...data: Parameters<R>) => Promise<PromiseResult<ReturnType<R>>> {
  const action = (...data: Parameters<R>): Promise<PromiseResult<ReturnType<R>>> => {
    try {
      store.emit(key, ...data);
      const result = reducer(...data);
      if (isPromiseLike(result)) {
        store.emit(loadingEvent(key));
        return Promise.resolve(result).then((resolved) => {
          store.emit(completedEvent(key), resolved);
          return resolved;
        }).catch((e) => {
          store.emit(failedEvent(key), e);
          throw e;
        }) as Promise<PromiseResult<ReturnType<R>>>;
      }
      store.emit(completedEvent(key), result);
      return Promise.resolve(result as PromiseResult<ReturnType<R>>);
    } catch (e) {
      store.emit(failedEvent(key), e);
      return Promise.reject(e);
    }
  };

  Object.defineProperty(action, "name", {
    value: key,
  });

  return action;
}

export function createActions<T extends ReducerMap, S>(store: Store<S>, reducerMap: T): ActionMap<T> {
  const actionMap: ActionMap<T> = {} as ActionMap<T>;
  (Object.keys(reducerMap) as Array<keyof T>).forEach((key) => {
    const reducer = reducerMap[key];
    actionMap[key] = createAction<S, typeof reducer>(store, key as string, reducer) as ActionMap<T>[typeof key];
  });
  return actionMap;
}
