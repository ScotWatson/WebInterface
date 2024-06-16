/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// An active source is an async iterable, an async iterator, or an async function.
// A passive source is an iterable, an iterator, or a function.
// A passive sink is a function.
// An active sink is any object that iterates over a passive source.
// There is no implemetation of an active sink. Active sinks are given a queue of their own and get implemented as passive sinks
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
  return (typeof obj === "object" && obj !== null && obj.prototype.constructor.name = "Object");
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
    this.#internalCallback = rawCallback(obj);
  } else {
    throw Error("Invalid Args");
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
}
function getSinkCallback(obj) {
  if (typeof args === "object") {
    const callback = args[Streams.callback];
    if (typeof callback !== "function") {
      throw Error("callback property must return a function");
    }
    return callback;
  } else if (typeof args === "function") {
    return args;
  } else {
    return null;
  }
}

// Conforms to the iterable interface, therefore it is a passive source.
// This class provides the guarantee that at most one iterator will be active.
// It also provides the guarentee that once the returned value is undefined, it is always undefined.
export class Source {
  #internalCallback;
  #validIterator;
  constructor(args) {
    let callback = getSourceCallback(args);
    if (typeof callback === "function") {
      this.#internalCallback = callbackWrapper(callback);
    } else if (isNamedArguments(args)) {
      // args is a named arguments object
      if (!(source in args)) {
        throw Error("source is a required parameter");
      }
      callback = getSourceCallback(args);
      if (typeof callback !== "function") {
        throw Error("source is not a valid source");
      }
      this.#internalCallback = callbackWrapper(callback);
    } else {
      throw Error("Invalid Args");
    }
    function callbackWrapper(callback) {
      return () => {
        const value = this.#internalCallback();
        if (value !== undefined) {
          this.#internalCallback = () => {};
        }
        return value;
      };
    }
  }
  *#getIterator() {
    try {
      while (true) {
        const value = this.internalCallback();
        if (value === undefined) {
          // no more information available, set the done flag
          return;
        }
        // pass value to sink, even if the value is null (which would indicate no information available at this time)
        yield value;
      }
    } finally {
      this.#validIterator = null;
    }
  };
  [Symbol.iterator]() {
    if (this.#validIterator) {
      throw "This source is locked.";
    }
    this.#validIterator = this.#getIterator();
    return this.#validIterator;
  }
  get locked() {
    return !!this.#validIterator;
  }
  unlock() {
    this.#validIterator.return();
    this.#validIterator = undefined;
  }
}

// Implements [Streams.callback], therefore it is a passive sink.
// [Streams.callback] takes only one argument, all other arguments are ignored.
export class Sink {
  #internalCallback;
  #validCallback;
  constructor(args) {
    const callback = getSinkCallback(args);
    if (typeof callback === "function") {
      this.#internalCallback = callback;
    } else if (isNamedArguments(args)) {
      // args is a named arguments object
      if (!(sink in args)) {
        throw Error("sink is a required argument.");
      }
      const callback = getSinkCallback(args.sink);
      if (typeof callback !== "function") {
        throw Error("sink is not a valid sink.");
      }
      this.#internalCallback = callback;
    } else {
      throw Error("Invalid Args");
    }
  }
  get [Streams.callback]() {
    if (this.locked) {
      throw "sink is locked";
    }
    const myId = self.crypto.randomUUID();
    this.#locked = myId;
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
  }
  get locked() {
    return !!this.#validCallback;
  }
  unlock() {
    this.#validCallback = undefined;
  }
}

export class Queue {
  #data;
  constructor() {
    this.#data = [];
    this.input = new Sink((obj) {
      // (obj !== undefined) && (obj !== null) guaranteed
      this.#data.push(obj);
    });
    this.output = new Source(() {
      if (this.#data.length === 0) {
        // Just because the queue is empty at the moment, does not indicate that it will never have data.
        return null;
      } else {
        return this.#data.shift();
      }
    });
  }
  get used() {
    return this.#data.length;
  }
}

// Conforms to the async iterable protocol, therefore it is an active source
export class ActiveSource {
  // function init is expected to be a function that takes two arguments (resolve, reject), which each are functions that take a single argument.
  // Each time resolve is called, every iterator instance resolves with a structured clone of the value passed (therefore, the value must be clonable).
  // Each time reject is called, every iterator instance resolves with the error passed.
  #inputResolve;
  #inputReject;
  #nextInput;
  constructor(init) {
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
  async *[Symbol.asyncIterator]() {
    try {
      let value;
      let done = false;
      ({ value, done } = await this.#nextInput);
      while (!done) {
        if (value !== null) {
          yield self.structuredClone(value);
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

// Derives from ActiveSource, therefore it is an active source.
// Iterates a passive source, therefore it is an active sink.
export class Pump extends ActiveSource {
  #source;
  #resolve;
  #reject;
  constructor(args) {
    const source = (() => {
      let source = getSourceCallback(args);
      if (typeof source === "function") {
        return source;
      } else if (isNamedArguments(args)) {
        source = getSourceCallback(args);
        if (typeof source !== "function") {
          throw Error("source is not a valid source");
        }
        return source;
      } else {
        throw Error("Invalid Arguments");
      }
    })();
    super((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
    this.#source = source;
  }
  // This function must be called repeatedly to drive the pump
  cycle() {
    try {
      const value = this.#source();
      this.#resolve(value);
    } catch (e) {
      this.#reject(e);
    }
  }
}

export class Pipe {
  constructor(args, arg2) {
    const { source, sink } = (() => {
      if (typeof args == "object" && args !== null && args.prototype.constructor.name = "Object") {
        // args is a named arguments object
        if (!(source in args)) {
          throw Error("source is a required parameter.");
        }
        if (!(sink in args)) {
          throw Error("sink is a required parameter.");
        }
        return {
          source: getSourceCallback(args.source),
          sink: getSinkCallback(args.sink),
        };
      } else {
        return {
          source: getSourceCallback(args),
          sink: getSinkCallback(arg2),
        };
      }
    })();
    if (typeof sink !== "function") {
      throw Error("Invalid sink");
    }
    this.done = (async () => {
      let forwarding = source();
      if (then in forwarding) {
        let forward = await forwarding;
      } else {
        throw Error("Active source must return a thenable.");
      }
      while (forward !== undefined) {
        sink(forward);
        forwarding = await source();
        if (then in forwarding) {
          let forward = await forwarding;
        } else {
          throw Error("Active source must return a thenable.");
        }
      }
    })();
  }
}

// Conforms to the iterator interface
// If it is intended to be a source operation, use Source to create a passive source.
// If it is intended to be a transform operation, use OperationTransform to create a lazy transform.
class Operation {
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
    if (execute in args)) {
      if (typeof args.execute !== "function") {
        throw Error("execute must be a function.");
      }
      this.#execute = args.execute;
    } else {
      this.#execute = () => { return; };
    }
  }
  *[Symbol.iterator](args) {
    let state = this.#initialize(args);
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
}

// Derives from Source, therefore it is a passive source
class OperationSource extends Source {
  constructor(operation) {
    if (!isNamedArguments(args)) {
      throw "Invalid arguments";
    }
    if (!(operation in args)) {
      throw Error("operation is a required parameter.");
    }
    if (!(Symbol.iterator in args.operation)) {
      throw "Argument must be an operation";
    }
    let iterator = operation[Symbol.iterator]();
    if (!conformsToInteratorInterface(iterator)) {
      throw "[Symbol.iterator]() must conform to iterator interface.";
    }
    super(() => {
      let output;
      while (output === null) {
        output = iterator.next();
        if (output === undefined) {
          // The operation takes no input, therefore information not available at this time is equivalent to no more information available.
          return undefined;
        }
      }
      return output;
    });
  }
}

// Operations are not to have side effects, therefore there is no OperationSink

// Derived from Source, therefore it is an passive source
// Iterates over a passive source, therefore it is an active sink
// Lazy Transform
export class OperationTransform extends Source {
  constructor(args) {
    if (!isNamedArguments(args)) {
      throw "Invalid arguments";
    }
    if (!(source in args)) {
      throw Error("source is a required parameter.");
    }
    const source = getSourceCallback(args.source);
    if (!(operation in args)) {
      throw Error("operation is a required parameter.");
    }
    const operation = args.operation;
    if (!(initArgs in args)) {
      throw Error("initArgs is a required parameter.");
    }
    const iterator = operation[Symbol.iterator](initArgs);
    super(() => {
      const value = iterator.next(null);
      if (value === undefined) {
        return;
      } else if (value === null) {
        // needs input
        const item = source();
        if (item === undefined) {
          // no more input available, switch to flushing
          return execute(state);
        } else if (item === null) {
          // no input availble at this time, therefore no output available at this time
          return null;
        } else {
          return iterator.next(input);
        }
      } else {
        return value;
      }
    });
  }
}

function waitResolve(value, ms) {
  return new Promise((resolve) => { setTimeout(() => { resolve(value); }, ms); });
}

function getActiveSource(obj) {
  if (isAsyncGenerator(obj)) {
    return obj();
  } else if (typeof obj === "object" && obj !== null && isAsyncGenerator(obj[Symbol.asyncIterator])) {
    return obj[Symbol.asyncIterator]();
  } else {
    throw "Not an active source";
  }
  function isAsyncGenerator(obj) {
    return (typeof obj === "function") && (obj[Symbol.toStringTag] === "AsyncGeneratorFunction");
  }
}
function getPassiveSource(obj) {
  if (isGeneratorFunction(obj)) {
    return obj();
  } else if (typeof obj === "object" && obj !== null && typeof obj[Symbol.iterator] === "function") {
    const ret = obj[Symbol.iterator]();
    if (!isGenerator(ret)) {
      throw;
    }
    return ret;
  } else {
    throw "Not a passive source";
  }
  function isGeneratorFunction(obj) {
    return (typeof obj === "function") && (obj[Symbol.toStringTag] === "GeneratorFunction");
  }
  function isGenerator(obj) {  // An iterator produced by a GeneratorFunction
    return (typeof obj === "function") && (obj[Symbol.toStringTag] === "Generator");
  }
}
function getPassiveSink(obj) {
  if (obj === null) {
    throw;
  }
  if (callback in obj) {
    return obj.callback;
  } else if (typeof obj === "function") {
    return obj;
  } else {
    throw "sink is not a passive sink.";
  }
  return obj;
}

export function pipePassiveToActive(source, sink) {
  if (typeof source[Symbol.iterator] !== "function") {
    throw "source is not a passive source.";
  }
  if (typeof sink[Symbol.asyncIterator] !== "function") {
    throw "sink is not an active sink.";
  }
  const sourceIterator = source[Symbol.iterator]();
  const sinkIterator = sink[Symbol.asyncIterator]();
  (async () => {
    let input = {};
    while (!(await sinkIterator.next(input.value).done)) {
      input = source.next();
      if (input.done) {
        break;
      }
    }
  })();
  const obj = {
    source,
    sink,
    close() {
      sinkIterator.return();
    },
  };
  return obj;
}
