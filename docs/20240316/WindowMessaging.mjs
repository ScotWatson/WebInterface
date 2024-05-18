/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// async Iterable Iterator
function createSignal(initFunc) {
  const obj = {};
  let resolveArray = [];
  let rejectArray = [];
  let resolve = function (value, done) {
    for (const resolve of resolveArray) {
      resolve({
        value: value,
        done: !!done,
      });
    }
    resolveArray = [];
    rejectArray = [];
  };
  let reject = function (error) {
    for (const reject of rejectArray) {
      reject({
        value: value,
        done: true,
      });
    }
    resolveArray = [];
    rejectArray = [];
  };
  obj.next = function () {
    return new Promise(function (resolve, reject) {
      resolveArray.push(resolve);
      rejectArray.push(reject);
    });
  };
  obj[Symbol.asyncIterator] = function () {
    return obj;
  };
  initFunc(resolve, reject);
  resolve = null;
  reject = null;
  return obj;
}

function AbortablePromise(promiseFunction, abortFunction) {
  const ret = new Promise(function (resolve, reject) {
    promiseFunction(resolve, reject);
  });
  ret.resolve = function (value) {};
  ret.reject = function (reason) {};
  ret.then = function (onFulfilled, onReject) {};
  ret.catch = function (onReject) {};
  return ret;
}

window.addEventListener("message", messageReceiver);
const windowHandlers = new Map();
let unknownSourceHandler;
export const unregisteredSource = createSignal(function (resolve, reject) {
  unknownSourceHandler = resolve;
});

function messageReceiver(evt) {
  console.log(evt);
  if (evt.source === null) {
    console.log(evt);
  }
  if (evt.source.constructor.name === "ServiceWorker") {
    console.log(evt);
  }
  if (evt.source.constructor.name === "WindowProxy") {
    console.log(evt);
  }
  const thisWindow = windowHandlers.get(evt.source);
  if (thisWindow !== undefined) {
    const thisHandler = thisWindow.originHandlers.get(evt.origin);
    if (thisHandler !== undefined) {
      thisHandler(evt.data);
    } else {
      unknownSourceHandler(evt);
    }
  } else {
    unknownSourceHandler(evt);
  }
}

export const serviceWorkerMessageSource = (function () {
  const obj = {};
  obj.message = createSignal(function (resolve, reject) {
    window.navigator.serviceWorker.addEventListener("message", function (evt) {
      resolve(evt);
    });
    window.navigator.serviceWorker.addEventListener("messageerror", function (evt) {
      reject(evt);
    });
  });
  return obj;
})();

export function createMessageSourceForWindowOrigin({
  window,
  origin,
}) {
  const obj = {};
  obj.message = createSignal(function (resolve, reject) {
    let thisWindow = windowHandlers.get(window);
    if (thisWindow === undefined) {
      thisWindow = {
        originHandlers: new Map(),
      };
      windowHandlers.set(window, thisWindow);
    }
    thisWindow.originHandlers.set(origin, resolve);
  });
  return obj;
}

export function createMessageSinkForWindowOrigin({
  window,
  origin,
}) {
  const obj = {};
  obj.send = function ({
    data,
    transferable,
  }) {
    console.log(data, origin, transferable);
    window.postMessage(data, origin, transferable);
  };
  return obj;
}

export function createMessageSinkForWorker({
  worker,
}) {
  const obj = {};
  obj.send = function ({
    data,
    transferable,
  }) {
    worker.postMessage(data, transferable);
  };
  return obj;
}

export function createRemoteCallManager({
  messageSource,
  messageSink,
}) {
  const obj = {};
  const messageIds = new Map();
  const responseFunctions = new Map();
  obj.register = function ({
    functionName,
    handlerFunc,
  }) {
    responseFunctions.set(functionName, handlerFunc);
  };
  obj.unregister = function ({
    functionName,
  }) {
    responseFunctions.delete(functionName);
  };
  // returns a promise, so acts as an async function
  obj.call = function ({
    functionName,
    args,
    transferable,
  }) {
    return new Promise(function (resolve, reject) {
      const messageId = self.crypto.randomUUID();
      messageIds.set(messageId, { resolve, reject });
      messageSink.send({
        data: {
          id: messageId,
          action: "request",
          functionName: functionName,
          args: args,
        },
        transferable: transferable,
      });
    });
  };
  (async function () {
    for await (const data of messageSource.message) {
      if (!data || !data.messageId || !data.action) {
        messageSink.send({
          data: {
            id: data.messageId,
            action: "error",
            error: "Invalid Message",
          },
        });
      }
      switch (data.action) {
        case "request": {
          requestHandler(data);
        }
          break;
        case "response": {
          responseHandler(data);
        }
          break;
        case "error": {
          errorHandler(data);
        }
          break;
        default:
          messageSink.send({
            data: {
              id: data.messageId,
              action: "error",
              error: "Invalid Message",
            },
          });
      }
    }
  })();
  async function requestHandler(data) {
    console.log(data);
    const thisFunction = responseFunctions.get(data.functionName);
    if (typeof thisFunction !== "function") {
      messageSink.send({
        data: {
          id: data.messageId,
          action: "error",
          reason: "Unregistered function: " + data.functionName,
        },
      });
      return;
    }
    try {
      data.args.transferable = [];
      const ret = await thisFunction(data.args);
      messageSink.send({
        data: {
          id: data.messageId,
          action: "response",
          value: ret,
        },
        transferable: data.args.transferable,
      });
    } catch (e) {
      messageSink.send({
        data: {
          id: data.messageId,
          action: "error",
          error: e,
        },
      });
    }
  }
  function responseHandler(data) {
    const functions = messageIds.get(data.id);
    if (functions !== undefined) {
      functions.resolve(data.value);
    }
  };
  function errorHandler(data) {
    const functions = messageIds.get(data.id);
    if (functions !== undefined) {
      functions.reject(data.reason);
    }
  };
  return obj;
}
