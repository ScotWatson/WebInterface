/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const Common = await import("https://scotwatson.github.io/WebInterface/common.mjs");
const MessagingCommon = await import("https://scotwatson.github.io/WebInterface/messaging-common.mjs");

export const createRemoteProcedureSocket = MessagingCommon.createRemoteProcedureSocket;

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

export function messageHandler(evt) {
  if (evt.source === null) {
    // Should only occur on MessagePorts and Workers
    throw "Internal Logic Error";
  }
  switch (evt.source.constructor.name) {
    case "Window":
    case "WindowProxy":
      enqueueMessage({
        origin: evt.origin,
        source: evt.source,
        data: evt.data,
      });
      break;
    default:
      // This should not occur for Windows
      throw "Internal Logic Error";
  }
});

export function enqueueMessage(info) {
  if (trustedOrigins.has(info.origin)) {
    trustedOriginHandler(info);
  } else {
    untrustedOriginHandler(info);
  }
}

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

export function createMessageSourceForWorker({
  worker,
}) {
  const obj = {};
  obj.message = Common.createSignal(function (resolve, reject) {
    worker.addEventListener("message", function (evt) {
      resolve(evt.data);
    });
    worker.addEventListener("messageerror", reject);
  });
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

const controller = Common.createSignal(function (resolve, reject) {
  if (navigator.serviceWorker.controller !== null) {
    resolve();
    return;
  }
  navigator.serviceWorker.addEventListener("controllerchange", function (evt) {
    resolve();
    return;
  });
});

let currentController = null;
(async function () {
  for await (const x of controller) {
    currentController = x;
  }
})();

export const controllerSource = {
  message: Common.createSignal(function (resolve, reject) {
    window.navigator.serviceWorker.addEventListener("message", function (evt) {
      resolve(evt.data);
    });
    window.navigator.serviceWorker.addEventListener("messageerror", function (evt) {
      reject(evt);
    });
  }),
};
export const controllerSink = {
  send: function ({
    data,
    transferable,
  }) {
    navigator.serviceWorker.controller?.postMessage(data, transferable);
  },
};
