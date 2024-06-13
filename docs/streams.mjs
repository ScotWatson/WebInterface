/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// An active source is implemented as an async iterator
// A passive source is implemented as an iterator
// A passive sink is implemeted as a function that takes a single parameter and returns undefined
// There is no implemetation of an active sink. Active sinks are given a queue of their own and get implemented as passive sinks

export class ActiveSource {
  // function init is expected to be a function that takes three arguments (resolve, reject, return), which each are functions that take a single argument.
  // Each time resolve is called, every iterator instance resolves with a structured clone of the value passed (therefore, the value must be clonable).
  // Each time reject is called, every iterator instance resolves with the error passed.
  #inputResolve;
  #inputReject;
  #nextInput;
  constructor(init) {
    const nextInput = () => {
      this.#nextInput = return new Promise((resolve, reject) => {
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

class OperationSource {  // Passive Source
  #state;
  constructor(operation) {
    if (typeof operation[Operations.initialize] === "function") {
      this.#state = operation[Operations.initialize]();
    }
  }
  *[Symbol.iterator]() {
    try {
      while (!done) {
        const output = operation[Operations.execute](this.#state);
        if (output === undefined) {
          return;
        }
        yield output;
      }
      return value;
    } catch (e) {
      // Error has been thrown
      throw e;
    } finally {
      // Perform any cleanup
    }
  }
}

class OperationSink {  // Passive Sink
  constructor(operation) {
    
  }
}

function waitResolve(value, ms) {
  return new Promise((resolve) => { setTimeout(() => { resolve(value); }, ms); });
}

export class TransformOperation {
  constructor(operation) {
    
  }
}
export class SourceTransform {
  constructor(passiveSource) {
    
  }
}
export class SourcePump {
  #source;
  constructor(passiveSource) {
    this.#source = getPassiveSource(passiveSource);
    
    setInterval(() => {
      const forward = this.#source.next();
      send(forward.value);
    }, 100);
  }
  async *[Symbol.asyncIterator]() {
    
  }
}
export class Pipe {
  #source;
  #sink;
  constructor(activeSource, passiveSink) {
    this.#source = getActiveSource(activeSource);
    this.#sink = getPassiveSink(passiveSink);
    this.done = (async () => {
      forward = await this.#source();
      while (!forward.done) {
        this.#sink(forward.value);
        forward = await this.#source();
      }
    })();
  }
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
  if (typeof obj !== "function") {
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
