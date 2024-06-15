/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// An active source is implemented as an async iterator
// A passive source is implemented as an iterator
// A passive sink is implemeted as a function that takes a single parameter and returns undefined
// There is no implemetation of an active sink. Active sinks are given a queue of their own and get implemented as passive sinks
// null = information not available at the moment
// undefined = no more information available, will return undefined indefinately
// All operation objects have an Operations.execute property, which is a function that takes the current state object and the current input and returns the next output.
// If the state object represents a normal state, [Operations.execute](state, input) may be dependent on input.
// If the state object represents a flushing state, the result of [Operations.execute](state, input) and the resulting state is independent of input.
// If the state object represents a normal state, the resulting state of [Operations.execute](state, input) is flushing iff input === undefined.
// If the state object represents a flushing state, the resulting state of [Operations.execute](state, input) is flushing.

export class Source {  // Passive Source
  #callback;
  #iterator;
  constructor(args) {
    if (typeof args === "object" && next in args) {  // is iterator
      this.#callback = iteratorCallback(args);
    } else if (typeof args === "function") {
      this.#callback = args;
    } else {
      throw "Invalid Args";
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
  *#getIterator() {
    try {
      while (true) {
        const value = callback();
        if (value === undefined) {
          // no more information available, set the done flag
          return;
        }
        // pass value to consumer, even if the value is null (which would indicate no information available at this time)
        yield value;
      }
    } finally {
      this.#iterator = null;
    }
  };
  [Symbol.iterator]() {
    if (this.#iterator) {
      throw "This source is locked.";
    }
    this.#iterator = this.#getIterator();
    return this.#iterator;
  }
  get locked() {
    return !!this.#iterator;
  }
}

export class Sink {  // Passive Sink
  #callback;
  #locked;
  constructor(callback) {
    this.#callback = callback;
    this.#locked = "";
  }
  get callback() {
    if (this.locked) {
      throw "sink is locked";
    }
    const myId = self.crypto.randomUUID();
    this.#locked = myId;
    return (obj) => {
      this.#invoke(obj, myId);
    };
  }
  #invoke(obj, id) {
    if (id !== this.#locked) {
      throw "Invalidated Callback";
    }
    this.#callback(obj);
  }
  get locked() {
    return (this.#locked !== "");
  }
}

export class Queue {
  #data;
  constructor() {
    this.#data = [];
    this.input = new Sink(this.#enqueue);
    this.output = new Source(this.#dequeue);
  }
  #enqueue(obj) {
    this.#data.push(obj);
  }
  #dequeue() {
    if (this.#data.length === 0) {
      // Just because the queue is empty at the moment, does not indicate that it will never have data.
      return null;
    } else {
      return this.#data.shift();
    }
  }
  get used() {
    return this.#data.length;
  }
}

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
        internal.inputResolve({
          value: value,
          done: (value === undefined),
        });
        nextInput();
      },
      /* reject */(error) => {
        internal.inputReject(error);
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

export class Pump extends ActiveSource {
  #source;
  #resolve;
  #reject;
  #return;
  constructor(passiveSource) {
    const source = getPassiveSource(passiveSource);
    super((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
    this.#source = source;
  }
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
  constructor(activeSource, passiveSink) {
    const source = getActiveSource(activeSource);
    const sink = getPassiveSink(passiveSink);
    this.done = (async () => {
      forward = await source();
      while (!forward.done) {
        sink(forward.value);
        forward = await source();
      }
    })();
  }
}

class OperationSource extends Source {  // Passive Source
  constructor(operation) {
    if (!(Operations.execute in operation)) {
      throw "Argument must be an operation";
    }
    let state = operation[Operations.initialize]();
    let flushing = false;
    if ((Operations.initialize in operation) && (typeof operation[Operations.initialize] === "function")) {
      state = operation[Operations.initialize]();
    } else {
      state = {};
    }
    super(() => {
      const output = operation[Operations.execute](state);
      if ((output === null) || (output === undefined)) {
        // The operation takes no input, therefore information not available at this time is equivalent to no more information available.
        return undefined;
      }
      return output;
    });
  }
}

// Operations are not to have side effects, therefore there is no OperationSink

// Derived from Source, therefore it is an passive source
// Iterates over a passive source, therefore it is an active sink
export class OperationTransform extends Source {
  #state;
  constructor(passiveSource, operation) {
    const execute = operation[Operations.execute];
    if (Operations.initialize in operation) {
      this.#state = operation[Operations.initialize]();
    } else {
      this.#state = {};
    }
    const source = getPassiveSource(passiveSource);
    super(() => {
      const value = execute(state, null);
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
          return execute(state, input);
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
    return (typeof obj === "function") && (obj.prototype.constructor.toString() === "[object AsyncGenerator]")
  }
}
function getPassiveSource(obj) {
  if (isGenerator(obj)) {
    return obj();
  } else if (typeof obj === "object" && obj !== null && isGenerator(obj[Symbol.iterator])) {
    return obj[Symbol.iterator]();
  } else {
    throw "Not a passive source";
  }
  function isGenerator(obj) {
    return (typeof obj === "function") && (obj.prototype.constructor.toString() === "[object Generator]")
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
