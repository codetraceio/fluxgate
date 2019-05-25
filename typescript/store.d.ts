import { IStore, IEmitter, IReducerMap, IActionMap } from "./interfaces";
export declare const EVENT_CHANGE = "change";
export declare function createStore<S extends {
    [key: string]: any;
}>(defaultState: S): IStore<S>;
export declare function createActions<T extends IReducerMap>(emitter: IEmitter, reducerMap: T): IActionMap<T>;
