export interface Emitter {
  emit(event: string, ...data: any[]): void;
  on(event: string, listener: (...data: any[]) => void): void;
  off(event: string, listener: (...data: any[]) => void): void;
  once(event: string, listener: (...data: any[]) => void): void;
}

export interface Store<S extends {[key: string]: any}> extends Emitter {
  setState(updater: Partial<S> | ((state: S) => S)): void;
  getState(): S;
}

type ReplaceReturn<T extends (...a: any[]) => any, NewReturn> = (...a: Parameters<T>) => NewReturn;

export interface ReducerMap {
  [key: string]: (...data: any[]) => any;
}

export type ActionMap<T extends Record<string, (...a: any[]) => any>> = {
  [P in keyof T]: ReplaceReturn<T[P], void>;
}
