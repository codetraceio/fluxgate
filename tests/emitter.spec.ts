import { createEmitter } from "../src/emitter";

const addListener = jest.fn();
const removeListener = jest.fn();
const emit = jest.fn();
jest.mock("events", () => {
  return {
    EventEmitter: jest.fn().mockImplementation(() => {
      return {
        addListener,
        removeListener,
        emit,
      };
    }),
  };
});

const exampleData = {aaa: "bbb"};
const exampleFunction = () => {};
const exampleEvent = "change";

describe("emmiter", () => {
  describe("createEmitter", () => {
    it("on", () => {
      const emmiter = createEmitter();
      emmiter.on(exampleEvent, exampleFunction);
      expect(addListener).toHaveBeenCalledWith(exampleEvent, exampleFunction);
    });

    it("off", () => {
      const emmiter = createEmitter();
      emmiter.off(exampleEvent, exampleFunction);
      expect(removeListener).toHaveBeenCalledWith(exampleEvent, exampleFunction);
    });

    it("emit", () => {
      const emmiter = createEmitter();
      emmiter.emit(exampleEvent, exampleData);
      expect(emit).toHaveBeenCalledWith(exampleEvent, exampleData);
    });
  });
});
