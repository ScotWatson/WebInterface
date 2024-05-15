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
  obj[Symbol.asyncIterator] = obj.next;
  initFunc(resolve, reject);
  delete resolve;
  delete reject;
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

window.addEventListener("message", messageHandler);
const sourceHandlers = new Map();
let unknownSourceHandler;
let unknownSourceSignal = createSignal(function (resolve, reject) {
  unknownSourceMessage = resolve;
});

unknownSourceSignal.next().then(function () {
  throw "Received message from unrecognized source";
});

function messageReceiver(evt) {
  if (sourceHandlers.has(evt.source)) {
    const thisHandler = sourceHandlers.get(evt.source);
    thisHandler(evt.data);
  } else {
    unknownSourceHandler(evt);
  }
}

export const serviceWorkerMessageReceiver = (function () {
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

export function createMessageReceiver({
  source,
}) {
  const obj = {};
  obj.receiveSignal = createSignal(function (resolve, reject) {
    sourceHandlers.set(evt.source, resolve);
  });
  return obj;
}

export function createWindowMessageSender({
  window,
  origin,
}) {
  const obj = {};
  obj.send = function ({
    data,
    transferable,
  ) {
    window.postMessage(data, origin, transferable);
  };
  return obj;
}

export function createWorkerMessageSender({
  worker,
}) {
  const obj = {};
  obj.send = function ({
    data,
    transferable,
  ) {
    worker.postMessage(data, transferable);
  };
  return obj;
}

export createRemoteCallManager({
  messageSender,
  messageReceiver,
}) {
  const messageIds = new Map();
  // returns a promise, so acts as an async function
  function call({
    functionName,
    args,
    transferable,
  }) {
    return new Promise(function (resolve, reject) {
      const messageId = self.crypto.randomUUID();
      messageIds.set(messageId, { resolve, reject });
      messageSender.send({
        data: {
          id: messageId,
          action: "request",
          functionName: functionName,
          args: args,
        },
        transferable: transferable,
      });
    });
  }
  messageReceiver.receive.next().then(function (data) {
    switch (data.action) {
      case "response": {
        responseHandler(data);
      }
        break;
      case "error": {
        errorHandler(data);
      }
        break;
      default:
        throw "Invalid Response";
    }
  });
  function responseHandler(data) {
    const functions = messageIds.get(data.id);
    if (functions !== undefined) {
      functions.resolve(data.response);
    }
  };
  function errorHandler(data) {
    const functions = messageIds.get(data.id);
    if (functions !== undefined) {
      functions.reject(data.error);
    }
  };
}
