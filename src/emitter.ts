import { EventEmitter } from "events";

import { IEmitter } from "./interfaces";

export function createEmitter(): IEmitter {
  const emitter = new EventEmitter();

  function emit(event: string, ...data: any[]) {
    emitter.emit(event, ...data);
  }

  function on(event: string, listener: (...data: any[]) => void) {
    emitter.addListener(event, listener);
  }

  function off(event: string, listener: (...data: any[]) => void) {
    emitter.removeListener(event, listener);
  }

  return {
    emit,
    on,
    off,
  };
}
