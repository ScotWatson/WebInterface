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

export class ActiveSource {
  // function init is expected to be a function that takes three arguments (resolve, reject, return), which each are functions that take a single argument.
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
          done: false,
        });
        nextInput();
      },
      /* reject */(error) => {
        internal.inputReject(error);
        nextInput();
      },
      /* return */(value) => {
        internal.inputResolve({
          value: value,
          done: true,
        });
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
        yield self.structuredClone(value);
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
    super((resolve, reject, return) => {
      this.#resolve = resolve;
      this.#reject = reject;
      this.#return = return;
    });
    this.#source = source;
  }
  cycle() {
    const value = this.#source();
    if (value === undefined) {
      return(value);
    } else {
      resolve(value);
    }
  }
}

export class Pipe {
  #source;
  #sink;
  constructor(activeSource, passiveSink) {
    const source = getActiveSource(activeSource);
    const sink = getPassiveSink(passiveSink);
    this.#source = source;
    this.#sink = sink;
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
    let state = operation[Operations.initialize]();
    let flushing = false;
    if ((Operations.initialize in operation) && (typeof operation[Operations.initialize] === "function")) {
      state = operation[Operations.initialize]();
    } else {
      state = {};
    }
    super(() => {
      flushOutput = () => {
        const output = operation[Operations.flush](state);
        if ((output === null) || (output === undefined)) {
          // The operation takes no input, therefore information not available at this time is equivalent to no more information available.
          return undefined;
        }
        return output;
      }
      normalOutput = () => {
        const output = operation[Operations.execute](state);
        if ((output === null) || (output === undefined)) {
          // The operation takes no input, therefore information not available at this time is equivalent to no more information available.
          flushing = true;
          return flushOutput();
        }
        return output;
      };
      if (flushing) {
        flushOutput();
      } else {
        normalOutput();
      }
    });
  }
}

class OperationSink extends Sink {
  constructor(operation) {
    let state = operation[Operations.initialize]();
    let flushing = false;
    if ((Operations.initialize in operation) && (typeof operation[Operations.initialize] === "function")) {
      state = operation[Operations.initialize]();
    } else {
      state = {};
    }
    super((input) => {
      flushOutput = () => {
        const output = operation[Operations.flush](state, input);
        if ((output === null) || (output === undefined)) {
          return undefined;
        }
        return output;
      }
      normalOutput = () => {
        const output = operation[Operations.execute](state, input);
        if ((output === null) || (output === undefined)) {
          flushing = true;
          return flushOutput();
        }
        return output;
      };
      if (flushing) {
        flushOutput();
      } else {
        normalOutput();
      }
    });
  }
}

export class OperationTransform {
  #source;
  #operation;
  #state;
  constructor(passiveSource, operation) {
    this.#source = getPassiveSource(passiveSource);
    this.#operation = operation;
    if (Operations.initialize in operation) {
      this.#state = operation[Operations.initialize]();
    } else {
      this.#state = {};
    }
  }
  *[Symbol.iterator]() {
    let output;
    while (true) {
      while (output === undefined) {
        const item = this.#source.next();
        output = operation[Operations.execute](item.value, this.#state);
      }
      yield output;
    }
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
