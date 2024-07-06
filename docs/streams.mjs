/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import * as Errors from "https://scotwatson.github.io/WebInterface/errors.mjs";

// A source is an iterable, an iterator, or a function; it takes no parameters and returns the next value.
// A sink is a function; it takes one parameter and returns undefined.
// Use ActiveSource when the values are arriving via callback (e.g. event listeners)
// Use SourceNode when the source is a function.

function conformsToIteratorInterface(obj) {
  return (typeof obj === "object" && obj !== null && typeof obj.next === "function");
}

function isIterator(obj) {
  return obj instanceof __IteratorPrototype__.constructor;
}

function isNamedArguments(obj) {
  return (typeof obj === "object" && obj !== null && obj.constructor.name === "Object");
}

// Conforms to the async iterable protocol
// Takes an async function to provide the signal. An output object is provided. The output object has a trigger function.
// No abort functions are provided (return, throw), as it is impossible to stop the underlying signal
export class Signal {
  // Accepts an asynchronous function "source":
  //   Accepts one argument object "output":
  //     put: a function that takes one argument "value"
  // Each time output.put is called, every iterator instance resolves with (a structured clone of) the value passed (therefore, the value must be clonable).
  // Errors thrown from source results in rejection of SourceNode[Symbol.asyncIterator](options).next
  #outputResolve;
  #outputReject;
  #nextOutput;
  constructor(args) {
    const source = (() => {
      if (isNamedArguments(args)) {
        if (!(source in args)) {
          throw Errors.createError({
            message: "source is a required argument.",
            functionName: "Signal.constructor",
            inputArgs: args,
          });
        }
        return args.source;
      } else if (typeof args === "function") {
        return args;
      } else {
        throw Errors.createError({
          message: "Invalid args",
          functionName: "Signal.constructor",
          inputArgs: args,
        });
      }
    })();
    this.#nextOutput = new Promise((resolve, reject) => {
      this.#outputResolve = resolve;
      this.#outputReject = reject;
    });
    const output = {
      trigger: () => {
        const thisResolve = this.#outputResolve;
        this.#nextOutput = new Promise((resolve, reject) => {
          this.#outputResolve = resolve;
          this.#outputReject = reject;
        });
        thisResolve();
      },
    };
    this[Symbol.asyncIterator] = async function*(options) {
      if (!options) {
        options = {};
      }
      await this.#nextOutput;
      while (true) {
        yield;
        await this.#nextOutput;
      }
    };
    const process = (async () => {
      try {
        await source(output);
      } catch (e) {
        this.#outputReject(e);
        throw e;
      }
    })();
    this.then = process.then.bind(process);
    this.catch = process.catch.bind(process);
  }
};

// A signal that can be externally triggered
export class ManualSignal extends Signal {
  #cycleResolve;
  #cycleReject;
  constructor() {
    let processing = true;
    super(async (output) => {
      while (processing) {
        await (new Promise((resolve, reject) => {
          this.#cycleResolve = resolve;
          this.#cycleReject = reject;
        })).then(() => {
          output.trigger();
        });
      }
    });
    this.trigger = () => {
      this.#cycleResolve();
    }
    this.return = () => {
      processing = false;
      this.#cycleResolve();
    }
    this.throw = () => {
      this.#cycleReject();
    }
  }
}

export class Wire {
  constructor(args, arg2) {
    const { signal, func } = (() => {
      if (isNamedArguments(args)) {
        // args is a named arguments object
        if (!("signal" in args)) {
          throw Errors.createError({
            message: "source is a required argument.",
            functionName: "Wire.constructor",
            inputArgs: args,
          });
        }
        if (!("func" in args)) {
          throw Errors.createError({
            message: "func is a required argument.",
            functionName: "Wire.constructor",
            inputArgs: args,
          });
        }
        return {
          signal: args.signal,
          func: args.func,
        };
      } else {
        if (arg2 === "undefined") {
          throw Errors.createError({
            message: "func is a required argument.",
            functionName: "Wire.constructor",
            inputArgs: args,
          });
        }
        return {
          signal: args,
          func: arg2,
        };
      }
    })();
    if (typeof signal !== "object") {
      throw Errors.createError({
        message: "signal must be an object.",
        functionName: "Wire.constructor",
        inputArgs: args,
      });
    }
    if (Symbol.asyncIterator in signal) {
      throw Errors.createError({
        message: "signal must be an async iterable.",
        functionName: "Wire.constructor",
        inputArgs: args,
      });
    }
    if (typeof func !== "function") {
      throw Errors.createError({
        message: "func must be an object.",
        functionName: "Wire.constructor",
        inputArgs: args,
      });
    }
    const connection = signal[Symbol.asyncIterator]();
    const process = (async () => {
      let data;
      do {
        result = await connection.next();
        func();
      } while (!result.done);
    })();
    // These two functions make the pipe act as a promise
    this.then = process.then.bind(process);
    this.catch = process.catch.bind(process);
    // These two functions make the promise abortable
    this.return = connection.return.bind(connection);
    this.throw = connection.throw.bind(connection);
  }
}

// Conforms to the async iterable protocol, therefore it is an active source
// No abort functions (return, throw) provided, as it is not possible to stop the underlying source
export class SourceNode {
  // Accepts an asynchronous function "source":
  //   Accepts one argument object "output":
  //     put: a function that takes one argument "value"
  // Each time output.put is called, every iterator instance resolves with (a structured clone of) the value passed (therefore, the value must be clonable).
  // Errors thrown from source results in rejection of SourceNode[Symbol.asyncIterator](options).next
  #outputResolve;
  #outputReject;
  #nextOutput;
  #processing;
  constructor(args) {
    const source = (() => {
      if (isNamedArguments(args)) {
        if (!(source in args)) {
          throw Errors.createError({
            message: "source is a required argument.",
            functionName: "SourceNode.constructor",
            inputArgs: args,
          });
        }
        return args.source;
      } else if (typeof args == "function") {
        return args;
      } else {
        throw Errors.createError({
          message: "Invalid args",
          functionName: "SourceNode.constructor",
          inputArgs: args,
        });
      }
    })();
    this.#nextOutput = new Promise((resolve, reject) => {
      this.#outputResolve = resolve;
      this.#outputReject = reject;
    });
    const output = {
      put: (val) => {
        const thisResolve = this.#outputResolve;
        this.#nextOutput = new Promise((resolve, reject) => {
          this.#outputResolve = resolve;
          this.#outputReject = reject;
        });
        thisResolve(val);
      },
    };
    this[Symbol.asyncIterator] = async function*(options) {
      if (!options) {
        options = {};
      }
      let value = await this.#nextOutput;
      if (!options.noCopy) {
        while (this.#processing) {
          yield self.structuredClone(value);
          value = await this.#nextOutput;
        }
      } else {
        while (this.#processing) {
          yield value;
          value = await this.#nextOutput;
        }
      }
      return;
    }
    const process = (async () => {
      try {
        this.#processing = true;
        return await source(output);
      } catch (e) {
        this.#outputReject(e);
        throw e;
      }
    })();
    process.then(() => {
      this.#processing = false;
      this.#outputResolve();
    });
    this.then = process.then.bind(process);
    this.catch = process.catch.bind(process);
  }
};

export class FunctionSourceNode extends SourceNode {
  #cycleResolve;
  #cycleReject;
  constructor(args) {
    if (typeof args !== "function") {
      throw Errors.createError({
        message: "func must be a function.",
        functionName: "FunctionSourceNode.constructor",
        inputArgs: args,
      });
    }
    const sourceFunc = args;
    super(async (output) => {
      let processing = true;
      while (processing) {
        await (new Promise((resolve, reject) => {
          this.#cycleResolve = resolve;
          this.#cycleReject = reject;
        })).then((val) => {
          if (val === undefined) {
            processing = false;
          } else {
            output.put(val);
          }
        });
      }
    });
    this.cycle = () => {
      const val = sourceFunc();
      this.#cycleResolve(val);
    }
    this.return = () => {
      this.#cycleResolve(undefined);
    };
    this.throw = (e) => {
      this.#cycleReject(e);
    }
  }
}

export class IteratorSourceNode extends SourceNode {
  #cycleResolve;
  #cycleReject;
  constructor(args) {
    if (typeof args.next !== "function") {
      throw Errors.createError({
        message: "args must be an iterator.",
        functionName: "IteratorSourceNode.constructor",
        inputArgs: args,
      });
    }
    const sourceIter = args;
    super(async (output) => {
      let processing = true;
      while (processing) {
        await (new Promise((resolve, reject) => {
          this.#cycleResolve = resolve;
          this.#cycleReject = reject;
        })).then((value) => {
          if (value === undefined) {
            processing = false;
          } else {
            output.put(value);
          }
        }, Promise.reject);
      }
    });
    this.cycle = () => {
      const result = sourceIter();
      if (result.done) {
        this.#cycleResolve(undefined);
      } else {
        this.#cycleResolve(result.value);
      }
    }
    this.return = () => {
      this.#cycleResolve(undefined);
    };
    this.throw = (e) => {
      this.#cycleReject(e);
    }
  }
}

export class SinkNode {
  #validCallback;
  constructor(args) {
    const internalCallback = (() => {
      if (typeof args === "function") {
        return args;
      } else if (isNamedArguments(args)) {
        // args is a named arguments object
        if (!(sink in args)) {
          throw Errors.createError({
            message: "sink is a required argument.",
            functionName: "SinkNode.constructor",
            inputArgs: args,
          });
        }
        if (typeof args.sink !== "function") {
          throw Errors.createError({
            message: "sink is not a valid sink.",
            functionName: "SinkNode.constructor",
            inputArgs: args,
          });
        }
        return args.sink;
      } else {
        throw Errors.createError({
          message: "Invalid Args",
          functionName: "SinkNode.constructor",
          inputArgs: args,
        });
      }
    })();
    Object.defineProperty(this, "callback", {
      get() {
        if (this.locked) {
          throw Errors.createError({
            message: "sink is locked",
            functionName: "SinkNode.constructor",
            inputArgs: args,
          });
        }
        const thisCallback = (obj) => {
          // Check to ensure the callback has not been invalidated
          if (thisCallback !== this.#validCallback) {
            throw Errors.createError({
              message: "Attempt to send data to invalidated callback.",
              functionName: "SinkNode.constructor",
              inputArgs: args,
            });
          }
          // The return value from the internal callback is ignored.
          if (obj === undefined) {
            // If undefined is received, there is no more input
            this.unlock();
          } else if (obj !== null) {
            internalCallback(obj);
          }
          // The sink always returns undefined.
        };
        this.#validCallback = thisCallback;
        return thisCallback;
      },
    });
    Object.defineProperty(this, "locked", {
      get() {
        return !!this.#validCallback;
      },
    });
    this.unlock = () => {
      this.#validCallback = undefined;
    }
  }
}

export class Pipe {
  constructor(args, arg2) {
    const { source, sink, noCopy } = (() => {
      if (isNamedArguments(args)) {
        // args is a named arguments object
        if (!("source" in args)) {
          throw Errors.createError({
            message: "source is a required parameter.",
            functionName: "Pipe.constructor",
            inputArgs: args,
          });
        }
        if (!("sink" in args)) {
          throw Errors.createError({
            message: "sink is a required parameter.",
            functionName: "Pipe.constructor",
            inputArgs: args,
          });
        }
        return {
          source: args.source,
          sink: args.sink,
          noCopy: !!args.noCopy,
        };
      } else {
        if (arg2 === "undefined") {
          throw Errors.createError({
            message: "sink is a required parameter.",
            functionName: "Pipe.constructor",
            inputArgs: args,
          });
        }
        return {
          source: args,
          sink: arg2,
          noCopy: !!args.noCopy,
        };
      }
    })();
    if (typeof source !== "object") {
      throw Errors.createError({
        message: "source must be an object.",
        functionName: "Pipe.constructor",
        inputArgs: args,
      });
    }
    if (!(Symbol.asyncIterator in source)) {
      throw Errors.createError({
        message: "source must be an async iterable.",
        functionName: "Pipe.constructor",
        inputArgs: args,
      });
    }
    if (typeof sink !== "object") {
      throw Errors.createError({
        message: "sink must be an object.",
        functionName: "Pipe.constructor",
        inputArgs: args,
      });
    }
    if (!("callback" in sink)) {
      throw Errors.createError({
        message: "sink must provide a callback.",
        functionName: "Pipe.constructor",
        inputArgs: args,
      });
    }
    const connection = source[Symbol.asyncIterator]({
      noCopy,
    });
    function fetchData() {
      return connection.next().then(({ value, done }) => {
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
      throw Errors.createError({
        message: "sink.callback must be invocable.",
        functionName: "Pipe.constructor",
        inputArgs: args,
      });
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
    this.then = process.then.bind(process);
    this.catch = process.catch.bind(process);
    // These two functions make the promise abortable
    this.return = connection.return.bind(connection);
    this.throw = connection.throw.bind(connection);
  }
}

export function combineTransforms(transforms) {
  if (!(Symbol.iterator in transforms)) {
    throw Errors.createError({
      message: "transforms must be iterable",
      functionName: "combineTransforms",
      inputArgs: transforms,
    });
  }
  let ret = identityTransform;
  for (const transform of transforms) {
    ret = combinePair(ret, transform);
  }
  return ret;
  function combinePair(transform1, transform2) {
    return async (input, output) => {
      let cycleResolve;
      const output1 = {
        put: async (val) => {
          if (val !== undefined) {
            cycleResolve(val);
          }
        },
      };
      const input2 = {
        get: async () => {
          return await new Promise((resolve, _) => {
            cycleResolve = resolve;
          });
        },
      };
      await Promise.all([ transform1(input, output1).then(() => { cycleResolve(undefined); }), transform2(input2, output) ]);
    };
  }
};

export const identityTransform = async (input, output) => {
  while (true) {
    await output.put(await input.get());
  }
};

export class TransformNode {
  #cycleResolve;
  #cycleReject;
  constructor(args) {
    if (!isNamedArguments(args)) {
      throw Errors.createError({
        message: "Invalid arguments",
        functionName: "TransformNode.constructor",
        inputArgs: transforms,
      });
    }
    const buffer = [];
    const transform = (() => {
      if (!(transform in args)) {
        return identityTransform;
      } else {
        if (typeof args.transform !== "function") {
          throw Errors.createError({
            message: "transform must be a valid transform.",
            functionName: "TransformNode.constructor",
            inputArgs: transforms,
          });
        }
        return args.transform;
      }
    })();
    const input = {
      get: async () => {
        do {
          await new Promise((resolve, reject) => {
            this.#cycleResolve = resolve;
            this.#cycleReject = reject;
          });
        } while (buffer.length === 0);
        return buffer.shift();
      },
    };
    // This function must be called repeatedly to drive the transform
    this.cycle = () => {
      this.#cycleResolve();
    }
    // (obj !== undefined) && (obj !== null) guaranteed
    this.input = new SinkNode((obj) => { buffer.push(obj); });
    this.output = new SourceNode(async (output) => { return await transform(input, output); });
    this.throw = () => {
      this.#cycleReject();
    };
    Object.defineProperty(this, "used", {
      get() {
        return buffer.length;
      },
    });
  }
}

// synchronously evaluates a transform, taking values from a source and sending the output to a sink
export function transformSource(source, transform) {
  if (typeof source !== "function") {
    throw Errors.createError({
      message: "source must be a function.",
      functionName: "transformSource",
      inputArgs: transforms,
    });
  }
  if (typeof transform !== "function") {
    throw Errors.createError({
      message: "transform must be a function.",
      functionName: "transformSource",
      inputArgs: transforms,
    });
  }
  return async (output) => {
    let cycleResolve;
    let cycleReject;
    let outputResolve;
    let outputReject;
    const sourceOutput = {
      put: async (value) => {
        const nextCycle = new Promise((resolve, reject) => {
          cycleResolve = resolve;
          cycleReject = reject;
        });
        outputResolve(value);
        await nextCycle;
      },
    };
    const input = {
      get: async () => {
        const nextOutput = new Promise((resolve, reject) => {
          outputResolve = resolve;
          outputReject = reject;
        });
        cycleResolve(value);
        await nextOutput;
      },
    };
    return Promise.all([ source(sourceOutput), transform(input, output) ]);
  };
}

// synchronously evaluates a transform, taking values from a source and sending the output to a sink
export function syncEvaluate(source, transform, sink) {
  if (typeof source !== "function") {
    throw Errors.createError({
      message: "source must be a function.",
      functionName: "syncEvaluate",
      inputArgs: transforms,
    });
  }
  if (typeof transform !== "function") {
    throw Errors.createError({
      message: "transform must be a function.",
      functionName: "syncEvaluate",
      inputArgs: transforms,
    });
  }
  if (typeof sink !== "function") {
    throw Errors.createError({
      message: "sink must be a function.",
      functionName: "syncEvaluate",
      inputArgs: transforms,
    });
  }
  const input = {
    get: () => {
      return source();
    },
  };
  const output = {
    put: (value) => {
      sink(value);
    },
  };
  transform(input, output);
}

export class BinaryTransform {
  constructor() {
    this.trigger = () => {
      
    };
  }
}

export class BinarySplitter {
  #buffer;
  #head;
  constructor(maxByteLength) {
    this.#buffer = null;
    this.#head = 0;
    this.setCapacity = (byteLength) => {
      this.#buffer = new ArrayBuffer(byteLength);
    };
    this.getBuffer = (byteLength) => {
      if (this.#buffer) {
        if (this.#head + byteLength > this.#buffer.byteLength) {
          
        }
      } else {
        this.#buffer = new ArrayBuffer(byteLength);
        this.#head = 0;
      }
      return new Uint8Array(this.#buffer, this.#head, byteLength);
    };
    this[Symbol.asyncIterator] = async function*() {
      
    };
  }
}

export class BinaryBuffer {
  #buffer;
  #head;
  #tail;
  #reserve;
  constructor() {
    this.#buffer = new ArrayBuffer(1);
    this.#head = 0;
    this.#tail = 0;
    this.#reserve = 0;
    this.enqueue = (byteLength) => {
      this.#head += this.#reserve;
      this.#reserve = byteLength;
      if (this.#head + byteLength > this.#buffer.byteLength) {
        let newLength = this.#buffer.byteLength * 2;
        while (this.#head + byteLength > newLength) {
          newLength *= 2;
        }
        const oldBuffer = this.#buffer;
        this.#buffer = new ArrayBuffer(newLength);
        (new Uint8Array(this.#buffer)).set(new Uint8Array(oldBuffer));
      }
      return new Uint8Array(this.#head, byteLength);
    };
    this.dequeue = (byteLength) => {
      if (this.#tail + byteLength > this.#head) {
        throw Error("Insufficient buffer");
      }
      if (2 * this.#tail > this.#buffer.byteLength) {
        const newLength = 2 * (this.#buffer.byteLength - this.#tail);
        const oldBuffer = this.#buffer;
        this.#buffer = new ArrayBuffer(newLength);
        (new Uint8Array(this.#buffer)).set(new Uint8Array(oldBuffer, this.#tail));
        this.#head -= this.#tail;
        this.#tail = 0;
      }
      const start = this.#tail;
      this.#tail += byteLength;
      return new Uint8Array(start, byteLength);
    };
  }
}
