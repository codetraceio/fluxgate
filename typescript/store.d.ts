import { IStore, IEmitter } from "./interfaces";
export declare const EVENT_CHANGE = "change";
export declare function createStore<S extends {
    [key: string]: any;
}>(defaultState: S): IStore<S>;
export declare function createAction(emitter: IEmitter, key: string, reducer: (...data: any[]) => void): (...data: any[]) => void;
