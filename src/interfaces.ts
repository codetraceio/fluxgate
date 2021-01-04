export interface IEmitter {
  emit(event: string, ...data: any[]): void;
  on(event: string, listener: (...data: any[]) => void): void;
  off(event: string, listener: (...data: any[]) => void): void;
}

export interface IStore<S extends {[key: string]: any}> extends IEmitter {
  setState(updater: Partial<S> | ((state: S) => S)): void;
  getState(): S;
}

type ReplaceReturnType<T extends (...a: any[]) => any, TNewReturn> = (...a: Parameters<T>) => TNewReturn;

export interface IReducerMap {
  [key: string]: (...data: any[]) => any;
}

export type IActionMap<T extends Record<string, (...a: any[]) => any>> = {
  [P in keyof T]: ReplaceReturnType<T[P], void>;
}
