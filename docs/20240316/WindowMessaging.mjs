/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const Common = await import("https://scotwatson.github.io/WebInterface/common.mjs");

window.addEventListener("message", messageHandler);
const trustedOrigins = new Set();
export function addTrustedOrigin(origin) {
  trustedOrigins.add(origin);
}
export function removeTrustedOrigin(origin) {
  trustedOrigins.delete(origin);
}
export function isTrustedOrigin(origin) {
  return trustedOrigins.has(origin);
}
let trustedOriginHandler;
export const trustedOrigin = Common.createSignal(function (resolve, reject) {
  trustedOriginHandler = resolve;
});
let untrustedOriginHandler;
export const untrustedOrigin = Common.createSignal(function (resolve, reject) {
  untrustedOriginHandler = resolve;
});

function messageHandler(evt) {
  if (evt.source === null) {
    // Should only occur on MessagePorts and Workers
    throw "Internal Logic Error";
  }
  switch (evt.source.constructor.name) {
    case "Window":
    case "WindowProxy":
      enqueueWindowMessage({
        origin: evt.origin,
        source: evt.source,
        data: evt.data,
      });
      break;
    default:
      // This should not occur for Windows
      throw "Internal Logic Error";
  }
}

export function enqueueWindowMessage(info) {
  if (trustedOrigins.has(info.origin)) {
    trustedOriginHandler(info);
  } else {
    untrustedOriginHandler(info);
  }
}

export const serviceWorkerMessageSource = (function () {
  const obj = {};
  obj.message = Common.createSignal(function (resolve, reject) {
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
  return {
    message: Common.createSignal(async function (resolve, reject) {
      for await (const info of trustedOrigin) {
        if ((info.source === window) && (info.origin === origin)) {
          resolve(info.data);
        }
      }
    }),
  };
}

export function createMessageSinkForWindowOrigin({
  window,
  origin,
}) {
  const obj = {};
  obj.send = function ({
    data,
    transfer,
  }) {
    window.postMessage(data, origin, transfer);
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

export function createRemoteProcedureSocket({
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
      if (!data || !data.id || !data.action) {
        messageSink.send({
          data: {
            id: data.id,
            action: "error",
            error: "Invalid Message",
          },
        });
        continue;
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
              id: data.id,
              action: "error",
              error: "Invalid Message",
            },
          });
      }
    }
  })();
  async function requestHandler(data) {
    const thisFunction = responseFunctions.get(data.functionName);
    if (typeof thisFunction !== "function") {
      messageSink.send({
        data: {
          id: data.id,
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
          id: data.id,
          action: "response",
          value: ret,
        },
        transferable: data.args.transferable,
      });
    } catch (e) {
      messageSink.send({
        data: {
          id: data.id,
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
      messageIds.delete(data.id);
    }
  };
  function errorHandler(data) {
    const functions = messageIds.get(data.id);
    if (functions !== undefined) {
      functions.reject(data.reason);
      messageIds.delete(data.id);
    }
  };
  return obj;
}
