import { EventEmitter } from "events";

import { Emitter } from "./interfaces";
import { getConfig } from "./config";

export function createEmitter(): Emitter {
  if (getConfig().isBackend) {
    return {
      emit: () => {},
      on: () => {},
      off: () => {},
      once: () => {},
    }
  }

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

  function once(event: string, listener: (...data: any[]) => void) {
    emitter.once(event, listener);
  }

  return {
    emit,
    on,
    off,
    once,
  };
}
