import { createEmitter } from "../src/emitter";
import { completedEvent, failedEvent, loadingEvent } from "../src/events";
import { createActions, createStore } from "../src/store";

interface ExampleState {
  value: number;
}

describe("store actions", () => {
  it("returns a resolved promise for synchronous reducers", async () => {
    const emitter = createEmitter();
    const store = createStore<ExampleState>(emitter, {
      value: 1,
    });
    const completed = jest.fn();
    store.on(completedEvent("increment"), completed);

    const actions = createActions(store, {
      increment(amount: number) {
        const next = store.getState().value + amount;
        store.setState({
          value: next,
        });
        return next;
      },
    });

    await expect(actions.increment(2)).resolves.toBe(3);
    expect(completed).toHaveBeenCalledWith(3);
  });

  it("emits loading/completed for asynchronous reducers and resolves", async () => {
    const emitter = createEmitter();
    const store = createStore<ExampleState>(emitter, {
      value: 0,
    });
    const loading = jest.fn();
    const completed = jest.fn();
    store.on(loadingEvent("load"), loading);
    store.on(completedEvent("load"), completed);

    const actions = createActions(store, {
      async load(value: number) {
        return value + 1;
      },
    });

    await expect(actions.load(10)).resolves.toBe(11);
    expect(loading).toHaveBeenCalledTimes(1);
    expect(completed).toHaveBeenCalledWith(11);
  });

  it("returns a rejected promise and emits failed when reducer throws", async () => {
    const emitter = createEmitter();
    const store = createStore<ExampleState>(emitter, {
      value: 0,
    });
    const failed = jest.fn();
    const error = new Error("boom");
    store.on(failedEvent("explode"), failed);

    const actions = createActions(store, {
      explode() {
        throw error;
      },
    });

    await expect(actions.explode()).rejects.toBe(error);
    expect(failed).toHaveBeenCalledWith(error);
  });
});
