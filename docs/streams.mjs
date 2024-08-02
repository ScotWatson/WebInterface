/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import * as Errors from "https://scotwatson.github.io/WebInterface/errors.mjs";

// Any async iterable is a source node.
// Any function is a sink node.
// A SourceNode is a source node. It is constructed from an underlying source, which is an invocation of an async function.
// The underlying source is created by invoking the async function with a single parameter:
//   output: an object with the following properties:
//     put: a function that is to be invoked with a single parameter
//       Sends the parameter, resolves when next output is requested
// A TransformNode is a source node. It has an "input" property that is a sink node. It is constructed from an underlying transform, which is an invocation of an async function.
// The underlying transform is created by invoking the async function with two parameters:
//   input: an object with the following properties:
//     get: a function that is to be invoked with no parameters
//       Returns the next input, resolves when the next input is available
//   output: an object with the following properties:
//     put: a function that is to be invoked with a single parameter
//       Sends the parameter, resolves when next output is requested
// A SinkNode is constructed from a function. It is used to ensure the function only has at most one source.
// A Pipe requires a source node and a sink node.

function conformsToIteratorInterface(obj) {
  return (typeof obj === "object" && obj !== null && typeof obj.next === "function");
}

function isIterator(obj) {
  return obj instanceof __IteratorPrototype__.constructor;
}

function isNamedArguments(obj) {
  return (typeof obj === "object" && obj !== null && obj.constructor.name === "Object");
}

export class Signal {
  #promise;
  #resolve;
  constructor(init) {
    this.#promise = new Promise((resolve, _) => {
      this.#resolve = resolve;
    });
    const resolve = () => {
      this.#resolve();
      this.#promise = new Promise((resolve, _) => {
        this.#resolve = resolve;
      });
    }
    init(resolve);
  }
  then(onFulfilled, onRejected) {
    return this.#promise.then(onFulfilled, onRejected);
  }
};

function abortablePromise() {
  let abortResolve;
  let abortReject;
  const promise = new Promise((resolve, reject) => {
    abortResolve = resolve;
    abortReject = reject;
  });
  promise.return = abortResolve;
  promise.throw = abortReject;
  return cancel;
}

function wireSignal(signal, func) {
  const abort = abortablePromise();
  const ret = (async () => {
    let value = await Promise.race([ signal, abort ]);
    while (value === undefined) {
      func();
      value = await Promise.race([ signal, abort ]);
    }
    return value;
  })();
  // Do not pass undefined; it will not abort
  ret.return = (value) => {
    if (value !== undefined) {
      cancel.return(value);
    }
  };
  ret.throw = cancel.throw;
  return ret;
}

// Conforms to the async iterable protocol, therefore it is an active source
// No abort functions (return, throw) provided, as it is not possible to stop the underlying source
export class SourceNode {
  // Accepts an asynchronous function "source".
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
      return value;
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
    process.then((value) => {
      this.#processing = false;
      this.#outputResolve(value);
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
    if (typeof sink !== "function") {
      throw Errors.createError({
        message: "sink must be an object.",
        functionName: "Pipe.constructor",
        inputArgs: args,
      });
    }
    const connection = source[Symbol.asyncIterator]({
      noCopy,
    });
    const process = (async () => {
      let data;
      let result = await connection.next();
      while (!result.done) {
        sink(result.value);
        result = await connection.next();
      };
      return result.value;
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
  constructor(bufferSize) {
    this.#buffer = new ArrayBuffer(bufferSize);
    this.#head = 0;
    this.#tail = 0;
    this.#reserve = 0;
    this.enqueue = (byteLength) => {
      this.#head += this.#reserve;
      this.#reserve = byteLength;
      if (this.#head + byteLength > this.#buffer.byteLength) {
        // Enlarge buffer
        let newLength = this.#buffer.byteLength * 2;
        while (this.#head + byteLength > newLength) {
          newLength *= 2;
        }
        const oldBuffer = this.#buffer;
        this.#buffer = new ArrayBuffer(newLength);
        (new Uint8Array(this.#buffer)).set(new Uint8Array(oldBuffer));
        // Send signal to indicate buffer was enlarged
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
