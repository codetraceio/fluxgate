export interface IEmitter {
    emit(event: string, ...data: any[]): void;
    on(event: string, listener: (...data: any[]) => void): void;
    off(event: string, listener: (...data: any[]) => void): void;
}
export interface IStore<S extends {
    [key: string]: any;
}> extends IEmitter {
    setState(updater: S | ((state: S) => S)): void;
    getState(): S;
}
export interface IReducerMap {
    [key: string]: (...data: any[]) => Promise<any>;
}
