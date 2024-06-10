/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

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

export class ActiveSink {
  // initFunc is expected to be a function that takes three arguments (resolve, reject, return), which each are functions that take a single argument.
  // Each time resolve is called, every iterator instance resolves with a structured clone of the value passed (therefore, the value must be clonable).
  // Each time reject is called, every iterator instance resolves with the error passed.
  #inputRequest;
  #nextRequest;
  constructor(init) {
    const nextRequest = () => {
      this.#nextRequest = return new Promise((resolve, reject) => {
        this.#inputRequest = resolve;
      });
    };
    nextRequest();
    this.#parse = initFunc(
      /* dispatch */() => {
        internal.inputRequest();
        nextInput();
      },
    );
  }
  async *[Symbol.asyncIterator]() {
    try {
      let value;
      let done = false;
      while (!done) {
        await this.#nextRequest;
        done = !!this.#parse(yield);
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
        yield operation[Operations.execute](this.#state);
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

function connectPump() {
  // Create Pump
  let nextRequest = new Promise((resolve, reject) => {
    setTimeout(resolve, 100);
  });
  let inputResolve;
  let inputReject;
  let nextInput = new Promise((resolve, reject) => {
    inputResolve = resolve;
    inputReject = reject;
  });
  const intervalId = setInterval(() => {
    const { value, done } = iterator.next();
    if (done) {
      clearInterval(intervalId);
    }
    if (value !== undefined) {
      sink(value);
    }
  }, 0);
  parse();
  const obj = {
    stop() {
      clearInterval(intervalId);
    },
    async *input() {
      try {
        let value;
        let done = false;
        while (!done) {
          await nextRequest;
          done = !!inputResolve({
            value: yield,
            done: false,
          });
        }
        return value;
      } catch (e) {
        // Error has been thrown
        throw e;
      } finally {
        // Perform any cleanup
      }
    }
    async *output() {
      try {
        let value;
        let done = false;
        ({ value, done } = await nextInput;
        while (!done) {
          yield self.structuredClone(value);
          ({ value, done } = await nextInput;
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
}

{
  *[Symbol.iterator]() {
    while (true) {
      
    }
  }
}
(async () => {
  let input;
  let output;
  while (input = async iterator.next(output)) {
    output = func(input);
  }
})();
(() => {
  let input;
  let output;
  while (input = iterator.next(output)) {
    output = func(input);
  }
})();

export function pipeActiveToPassive(source, sink) {
  const sourceObj = (function () {
    if ((source === "function") && (source.constructor.name === "AsyncGenerator")) {
    
  } else if (typeof source[Symbol.asyncIterator] === "function")) {
  } else {
    throw "source is not an active source";
  }
  if (typeof sink[Symbol.iterator] !== "function") {
    throw "sink is not a passive sink.";
  }
  (async () => {
    for await (const input of source) {
      sink(input);
    }
  })();
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
