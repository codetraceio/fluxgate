import { createEmitter } from "../src/emitter";

const addListener = jest.fn();
const removeListener = jest.fn();
const once = jest.fn();
const emit = jest.fn();
jest.mock("events", () => {
  return {
    EventEmitter: jest.fn().mockImplementation(() => {
      return {
        addListener,
        removeListener,
        once,
        emit,
      };
    }),
  };
});

const exampleData = {aaa: "bbb"};
const exampleFunction = () => {};
const exampleEvent = "change";

describe("emitter", () => {
  describe("createEmitter", () => {
    it("on", () => {
      const emitter = createEmitter();
      emitter.on(exampleEvent, exampleFunction);
      expect(addListener).toHaveBeenCalledWith(exampleEvent, exampleFunction);
    });

    it("once", () => {
      const emitter = createEmitter();
      emitter.once(exampleEvent, exampleFunction);
      expect(addListener).toHaveBeenCalledWith(exampleEvent, exampleFunction);
    });

    it("off", () => {
      const emitter = createEmitter();
      emitter.off(exampleEvent, exampleFunction);
      expect(removeListener).toHaveBeenCalledWith(exampleEvent, exampleFunction);
    });

    it("emit", () => {
      const emitter = createEmitter();
      emitter.emit(exampleEvent, exampleData);
      expect(emit).toHaveBeenCalledWith(exampleEvent, exampleData);
    });
  });
});
