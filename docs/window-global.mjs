/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// As of the latest revision of this file, W3C "Service Workers" is a W3C Candidate Recommendation Draft, last published 12 July 2022
// https://www.w3.org/TR/2022/CRD-service-workers-20220712/
// W3C "Service Workers" also has an Editor's Draft, published 30 April 2024
// https://w3c.github.io/ServiceWorker/
// According to section 4.1.3 of W3C "Service Workers", ServiceWorkerGlobalScope.serviceWorker is supposed to get the ServiceWorker object. On Firefox, this property is missing.
// According to section 4.1.3 of W3C "Service Workers", ServiceWorkerGlobalScope.registration.installing, ServiceWorkerGlobalScope.registration.waiting, & ServiceWorkerGlobalScope.registration.active is supposed to get the installing, waiting, & active ServiceWorker objects. On Firefox, these property are null.
// Together, on Firefox, this makes it impossible for service workers to message each other (& themselves). Therefore, they cannot keeps themselves from terminating.
// However, message events received from a Window do prevent the service worker from terminating.

export * as Common from "https://scotwatson.github.io/WebInterface/common.mjs";
export { default as SiteStorage } from "https://scotwatson.github.io/WebInterface/SiteStorage.mjs";

function postMessage(messagePort, origin, data) {
  const transfer = getTransfer(data);
  messagePort.postMessage(data, origin, transfer);
  function getTransfer(data) {
    const transfer = [];
    if ((typeof data === "object") && Object.has(data, "_transfer") && Object.has(data._transfer, Symbol.iterator)) {
      transfer.push(...data._transfer);
      delete data._transfer;
      for (const prop of data) {
        transfer.push(...getTransfer(data[prop]));
      }
    }
    return transfer;
  }
}

export const loadWindow = new Promise(function (resolve, reject) {
  window.addEventListener("load", function (evt) {
    resolve(evt);
  });
});

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
export const trustedOrigin = new Streams.SourceNode((resolve, reject) => {
  trustedOriginHandler = resolve;
});
let untrustedOriginHandler;
export const untrustedOrigin = new Streams.SourceNode((resolve, reject) => {
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

export function forWindowOrigin({
  window,
  origin,
}) {
  return {
    output: new Streams.SourceNode(async (resolve, reject) => {
      for await (const info of trustedOrigin) {
        if ((info.source === window) && (info.origin === origin)) {
          resolve(info.data);
        }
      }
    }),
    input: new Streams.SinkNode((data) => {
      postMessage(window, origin, data);
    }),
  };
}

export function MessageSocketforServiceWorker({
  serviceWorker,
}) {
  return {
    output: new Streams.SourceNode((resolve, reject) => {
      // Messages cannot be received directly from ServiceWorkers
      reject();
    }),
    input: new Streams.SinkNode((data) => {
      MessageSocket.postMessage(serviceWorker, data);
    }),
  };
}

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

export let controller = null;

const controllerSource = new Streams.SourceNode((resolve, reject) => {
  window.navigator.serviceWorker.addEventListener("message", function (evt) {
    resolve(evt.data);
  });
  window.navigator.serviceWorker.addEventListener("messageerror", function (evt) {
    reject(evt);
  });
});

export const controllerchange = new Streams.SourceNode((resolve, reject) => {
  window.navigator.serviceWorker.addEventListener("controllerchange", (evt) => {
    newController();
    resolve();
  });
  if (window.navigator.serviceWorker.controller !== null) {
    newController();
    resolve();
  }
  function newController() {
    controller = {
      serviceWorker: window.navigator.serviceWorker.controller,
      output: controllerSource,
      input: new Streams.SinkNode((data) => {
        MessageSocket.postMessage(window.navigator.serviceWorker.controller, data);
      }),
    };
  }
});
