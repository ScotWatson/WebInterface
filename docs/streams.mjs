/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// A source is an iterable, an iterator, or a function; it takes no parameters and returns the next value.
// A sink is a function; it takes one parameter and returns undefined.
// Use ActiveSource when the values are arriving via callback (e.g. event listeners)
// Use SourceNode when the source is a function.

// null = information not available at the moment
// undefined = no more information available, will return undefined indefinately
// An operation is a generator. The operation is initialized by parameters passed to the generator when obtaining its iterator.
// Each iterator returned by the generator has its own state. The iterator takes its input via the parameter of the next function.
// The first input to next(input) must be ignored, even if it is undefined.
// If the iterator is used in a for...of loop, the input is always undefined, which puts the iterator in a flushing state after the first pass.
// Operation iterators have two types of states: waiting & flushing.
// If the operation iterator is in a waiting state, next(null) must return null.
// If next(null) returns null, the operation iterator is in a waiting state.
// If next(null) returns null, next(input) must return null until input !== null.
// If the operation iterator is in a waiting state, next(null) must return null.
// If the operation iterator is in a flushing state, next(input), where (input !== null) && (input !== undefined), must throw.
// If next() is called, and is not the first call to next, all future input via next(input) must be ignored.
// If next(input) returns undefined, all future invocations of next must return undefined.

// Guaranteed by Note of Section 27.1.2 of ECMAScript 14.0
const __IteratorPrototype__ = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));

function conformsToIteratorInterface(obj) {
  return (typeof obj === "object" && obj !== null && typeof obj.next === "function");
}
function isIterator(obj) {
  return obj instanceof __IteratorPrototype__.constructor;
}

function isNamedArguments(obj) {
  return (typeof obj === "object" && obj !== null && obj.constructor.name === "Object");
}

function getSourceCallback(obj) {
  if (typeof obj === "object" && obj !== null) {
    if (typeof obj[Symbol.iterator] === "function") {
      // obj conforms to the iterable interface
      const iterator = obj[Symbol.iterator]();
      if (isIterator(iterator)) {
        return iteratorCallback(iterator.next);
      } else {
        throw Error("[Symbol.iterator]() did not return an iterator.");
      }
    } else if (typeof obj.next === "function") {
      // obj conforms to the iterator interface
      return iteratorCallback(iterator.next);
    } else {
      return null;
    }
  } else if (typeof obj === "function") {
    // obj is to be treated as a callback function
    return callbackWrapper(obj);
  } else {
    return null;
  }
  function iteratorCallback(iterator) {
    return () => {
      let item = iterator.next();
      while (!item.done) {
        if (item.value !== undefined) {
          return item.value;
        }
        // iterator returned undefined, but did not set the done flag
        // attempt to get the next item
        item = iterator.next();
      }
      // iterator has set the done flag, return undefined forever
      return undefined;
    };
  }
  function callbackWrapper(callback) {
    return () => {
      const value = callback();
      if (value !== undefined) {
        callback = () => {};
      }
      return value;
    };
  }
}

// Conforms to the async iterable protocol, therefore it is an active source
export class SourceNode {
  // function init is expected to be a function that takes two arguments (resolve, reject), which each are functions that take a single argument.
  // Each time resolve is called, every iterator instance resolves with a structured clone of the value passed (therefore, the value must be clonable).
  // Each time reject is called, every iterator instance resolves with the error passed.
  #inputResolve;
  #inputReject;
  #nextInput;
  constructor(args) {
    let init;
    if (isNamedArguments(args)) {
      if (!(init in args)) {
        throw "source is a required argument.";
      }
      init = args.init;
    } else if (typeof args == "function") {
      init = args;
    } else {
      throw "Invalid args";
    }
    const nextInput = () => {
      this.#nextInput = new Promise((resolve, reject) => {
        this.#inputResolve = resolve;
        this.#inputReject = reject;
      });
    };
    nextInput();
    init(
      /* resolve */(value) => {
        this.#inputResolve({
          value: value,
          done: (value === undefined),
        });
        nextInput();
      },
      /* reject */(error) => {
        this.#inputReject(error);
        nextInput();
      },
    );
  }
  async *[Symbol.asyncIterator](options) {
    if (!options) {
      options = {};
    }
    try {
      let value;
      let done = false;
      ({ value, done } = await this.#nextInput);
      while (!done) {
        if (value !== null) {
          if (!options.noCopy) {
            yield self.structuredClone(value);
          } else {
            yield value;
          }
        }
        ({ value, done } = await this.#nextInput);
      }
      return value;
    } catch (e) {
      // Error has been thrown
      throw e;
    } finally {
      // Perform any cleanup
    }
  }
};

export function sourceFunctionToNode(args) {
  let source;
  if (isNamedArguments(args)) {
    if (!(source in args)) {
      throw "source is a required argument.";
    }
    source = args.source;
  } else if (typeof args == "function") {
    source = args;
  } else {
    throw "Invalid args";
  }
  const ret = new SourceNode((resolve, reject) => {
    thisResolve = resolve;
    thisReject = reject;
  });
  // This function must be called repeatedly to drive the source
  ret.cycle = () => {
    try {
      const value = source();
      thisResolve(value);
    } catch (e) {
      thisReject(e);
    }
  };
  return ret;
}

export class SinkNode {
  #internalCallback;
  #validCallback;
  constructor(args) {
    if (typeof args === "function") {
      this.#internalCallback = args;
    } else if (isNamedArguments(args)) {
      // args is a named arguments object
      if (!(sink in args)) {
        throw Error("sink is a required argument.");
      }
      if (typeof args.sink !== "function") {
        throw Error("sink is not a valid sink.");
      }
      this.#internalCallback = args.sink;
    } else {
      throw Error("Invalid Args");
    }
  }
  get callback() {
    if (this.locked) {
      throw "sink is locked";
    }
    const thisCallback = (obj) => {
      // Check to ensure the callback has not been invalidated
      if (thisCallback !== this.#validCallback) {
        throw "Attempt to send data to invalidated callback.";
      }
      // The return value from the internal callback is ignored.
      if (obj === undefined) {
        // If undefined is received, there is no more input
        this.unlock();
      } else if (obj !== null) {
        this.#internalCallback(obj);
      }
      // The sink always returns undefined.
    };
    this.#validCallback = thisCallback;
    return thisCallback;
  }
  get locked() {
    return !!this.#validCallback;
  }
  unlock() {
    this.#validCallback = undefined;
  }
}

export class Pipe {
  constructor(args, arg2) {
    const { source, sink, noCopy } = (() => {
      if (isNamedArguments(args)) {
        // args is a named arguments object
        if (!("source" in args)) {
          throw Error("source is a required parameter.");
        }
        if (!("sink" in args)) {
          throw Error("sink is a required parameter.");
        }
        return {
          source: args.source,
          sink: args.sink,
          noCopy: !!args.noCopy,
        };
      } else {
        if (arg2 === "undefined") {
          throw Error("sink is a required parameter.");
        }
        return {
          source: args,
          sink: arg2,
          noCopy: !!args.noCopy,
        };
      }
    })();
    if (typeof source !== "object") {
      throw Error("source must be an object.");
    }
    if (!(Symbol.asyncIterator in source)) {
      throw Error("source must be an async iterable.");
    }
    if (typeof sink !== "object") {
      throw Error("sink must be an object.");
    }
    if (!("callback" in sink)) {
      console.error(sink);
      throw Error("sink must provide a callback.");
    }
    const connection = source[Symbol.asyncIterator]({
      noCopy,
    });
    let abort_return;
    let abort_throw;
    const abort = new Promise((resolve, reject) => {
      abort_return = resolve;
      abort_throw = reject;
    })
    function fetchData() {
      return Promise.race([ connection.next(), abort ]).then(({ value, done }) => {
        if (!!done) {
          return value;
        } else {
          if (value === undefined) {
            return null;
          } else {
            return value;
          }
        }
      });
    }
    const sendData = sink.callback;
    if (typeof sendData !== "function") {
      console.error(sendData);
      throw "sink.callback must be invocable.";
    }
    const process = (async () => {
      let data;
      do {
        data = await fetchData();
        if (data !== null) {
          sendData(data);
        }
      } while (data !== undefined);
    })();
    // These two functions make the pipe act as a promise
    this.then = process.then;
    this.catch = process.catch;
    // These two functions make the promise abortable
    this.return = () => {
      abort_return({ done: true });
    };
    this.throw = (error) => {
      abort_throw(error);
    };
  }
}

// Conforms to the iterator interface
// If it is intended to be a source, use Source to create a passive source.
// If it is intended to be a transform, use LazyTransform or EagerTransform to create a stream node.
// Transforms are not to have side effects, therefore there is no TransformSink
class Transform {
  #initialize;
  #execute;
  constructor(args) {
    if (!isNamedArguments(args)) {
      throw "Invalid arguments";
    }
    if (initialize in args) {
      if (typeof args.initialize !== "function") {
        throw Error("initialize must be a function.");
      }
      this.#initialize = args.initialize;
    } else {
      this.#initialize = () => ({});
    }
    if (execute in args) {
      if (typeof args.execute !== "function") {
        throw Error("execute must be a function.");
      }
      this.#execute = args.execute;
    } else {
      this.#execute = () => { return; };
    }
  }
  static fromTransforms(transforms) {
    if (!(Symbol.iterator in transforms)) {
      throw Error("transforms must be iterable");
    }
    const initialize = () => {
      const state = {};
      let currentCallback = (source) => { return source(); };
      for (const transform of transforms) {
        currentCallback = createCallback(currentCallback, transform.callback);
      }
      state.callback = currentCallback;
      return state;
    };
    const execute = (state, input) => {
      return state.callback(input);
    };
    return new Transform({
      initialize,
      execute,
    });
    function createCallback(transform1Callback, transform2Callback) {
      return (source) => {
        transform2Callback(() => {
          transform1Callback(source);
        });
      };
    }
  }
  *[Symbol.iterator]() {
    let state = this.#initialize();
    if (!(typeof state === "object" && state !== null)) {
      throw Error("state must be an object");
    }
    // The first input provided to the execute function is always null, to allow any initial outputs to be generated.
    let input = null;
    let output = null;
    while (true) {
      output = this.#execute(state, input);
      if (output === undefined) {
        return;
      }
      input = yield output;
    }
  }
  get callback() {
    const state = this.#initialize();
    let waitingState = false;
    let finishedState = false;
    return (source) => {
      if (finishedState) {
        return;
      }
      if (waitingState) {
        const input = source();
        output = this.#execute(state, input);
      } else {
        let output = this.#execute(state, null);
        if (output === null) {
          // operation is in a waiting state
          // needs input
          const input = source();
          output = this.#execute(state, input);
        }
      }
      waitingState = (output === null);
      finishedState = (output === undefined);
      return output;
    };
  }
}

export class TransformNode {
  #buffer;
  #source;
  constructor(args) {
    if (!isNamedArguments(args)) {
      throw Error("Invalid arguments");
    }
    if (!(transform in args)) {
      throw Error("transform is a required parameter.");
    }
    if (typeof args.transform.callback !== "function") {
      throw Error("transform must be a valid transform.");
    }
    this.#buffer = [];
    const dequeue = getSourceCallback(() => {
      if (this.#buffer.length === 0) {
        // Just because the queue is empty at the moment, does not indicate that it will never have data.
        return null;
      } else {
        return this.#buffer.shift();
      }
    });
    // (obj !== undefined) && (obj !== null) guaranteed
    this.input = new SinkNode((obj) => { this.#buffer.push(obj); });
    this.output = new SourceNode(() => { return args.transform.callback(dequeue); });
  }
  // This function must be called repeatedly to drive the transform
  cycle() {
    return this.output.cycle();
  }
  get used() {
    return this.#buffer.length;
  }
}

// synchronously evaluates a transform, taking values from a source and sending the output to a sink
export function syncEvaluate(transform, source, sink) {
  const sourceCallback = getSourceFunction(source);
  if (typeof sourceCallback !== "function") {
    throw Error("source is not a valid source.");
  }
  const transformCallback = transform.callback;
  if (typeof transformCallback !== "function") {
    throw Error("transform is not a valid transform.");
  }
  const sinkCallback = sink;
  if (typeof sinkCallback !== "function") {
    throw Error("sink is not a valid sink.");
  }
  let input = null;
  let output;
  while (true) {
    output = transformCallback(source);
    if (output === undefined) {
      // end of output, end of function
      return;
    }
    sinkCallback(output);
  }
}
