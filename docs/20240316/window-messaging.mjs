/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// As of the latest revision of this file, W3C "Service Workers" is a W3C Candidate Recommendation Draft, last published 12 July 2022
// https://www.w3.org/TR/2022/CRD-service-workers-20220712/
// W3C "Service Workers" also has an Editor's Draft, published 30 April 2024
// https://w3c.github.io/ServiceWorker/
// According to section 4.1.3 of W3C "Service Workers", ServiceWorkerGlobalScope.serviceWorker is supposed to get the ServiceWorker object. On Firefox, this property is missing.
// According to section 4.1.3 of W3C "Service Workers", ServiceWorkerGlobalScope.serviceWorker is supposed to get the ServiceWorker object. On Firefox, this property is missing.
// Together, on Firefox, this makes it impossible for service workers to message each other (& themselves). Therefore, they cannot keeps themselves from terminating.
// However, message events received from a Window do prevent the service worker from terminating.

import * as Common from "https://scotwatson.github.io/WebInterface/common.mjs";
import * as MessagingSocket from "https://scotwatson.github.io/WebInterface/message-socket.mjs";

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
  console.log("window message handler:", evt);
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
}

export function enqueueMessage(info) {
  if (trustedOrigins.has(info.origin)) {
    trustedOriginHandler(info);
  } else {
    untrustedOriginHandler(info);
  }
}

export forWindowOrigin = function ({
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
    send({
      data,
      transfer,
    }) {
      window.postMessage(data, origin, transfer);
    },
  };
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

export function forServiceWorker({
  worker,
}) {
  return {
    message: Common.createSignal(function (resolve, reject) {
      // Messages cannot be received directly from ServiceWorkers
      reject();
    }),
    send: function ({
      data,
      transfer,
    }) {
      serviceWorker.postMessage(data, transfer);
    },
  };
}

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

const serviceWorkerHeartbeats = new Map();
export function setServiceWorkerHeartbeat({
  serviceWorker,
  interval, // in ms
}) {
  let intervalID = serviceWorkerHeartbeats.get(serviceWorker);
  if (intervalID) {
    clearInterval(intervalID);
    serviceWorkerHeartbeats.remove(serviceWorker);
  }
  if (interval !== 0) {
    intervalID = setInterval(() => {
      serviceWorker.postMessage("heartbeat");
    }, interval);
    serviceWorkerHeartbeats.set(serviceWorker, intervalID);
  }
}

export const controllerchange = Common.createSignal((resolve, reject) => {
  navigator.serviceWorker.addEventListener("controllerchange", (evt) => {
    resolve({
      serviceWorker: self.navigator.serviceWorker.controller,
      messageSource: controllerSource,
      messageSink: createMessageSinkForServiceWorker(self.navigator.serviceWorker.controller),
    });
  });
  if (navigator.serviceWorker.controller !== null) {
    resolve({
      serviceWorker: self.navigator.serviceWorker.controller,
      messageSource: controllerSource,
      messageSink: createMessageSinkForServiceWorker(self.navigator.serviceWorker.controller),
    });
  }
});
