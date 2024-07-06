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

import * as Common from "https://scotwatson.github.io/WebInterface/common.mjs";

export * as Resources from "https://scotwatson.github.io/WebInterface/resources.mjs"
export * as ServiceWorkers from "https://scotwatson.github.io/WebInterface/service-workers.mjs"
export * as Common from "https://scotwatson.github.io/WebInterface/common.mjs";
export { default as SiteStorage } from "https://scotwatson.github.io/WebInterface/SiteStorage.mjs";


function postMessage(messagePort, origin, data) {
  const transfer = getTransfer(data);
  messagePort.postMessage(data, origin, transfer);
  function getTransfer(data) {
    const transfer = [];
    if ((typeof data === "object") && (data !== null)) {
      if (Object.hasOwn(data, "_transfer") && (typeof data._transfer === "object") && (data._transfer !== null) && Object.hasOwn(data._transfer, Symbol.iterator)) {
        transfer.push(...data._transfer);
      }
      for (const prop in data) {
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
const trustedOriginSource = async (output) => {
  await new Promise((resolve, reject) => {
    trustedOriginHandler = output.put;
  });
}
export const trustedOrigin = new Common.Streams.SourceNode(trustedOriginSource);
let untrustedOriginHandler;
const untrustedOriginSource = async (output) => {
  await new Promise((resolve, reject) => {
    untrustedOriginHandler = output.put;
  });
}
export const untrustedOrigin = new Common.Streams.SourceNode(untrustedOriginSource);

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
}

export function enqueueMessage(info) {
  if (trustedOrigins.has(info.origin)) {
    trustedOriginHandler(info);
  } else {
    untrustedOriginHandler(info);
  }
}

export function MessageNodeforWindowOrigin({
  window,
  origin,
}) {
  const outputSource = async (output) => {
    for await (const info of trustedOrigin[Symbol.asyncIterator]({ noCopy: true })) {
      if ((info.source === window) && (info.origin === origin)) {
        output.put(info.data);
      }
    }
  };
  return {
    output: new Common.Streams.SourceNode(),
    input: new Common.Streams.SinkNode((data) => {
      postMessage(window, origin, data);
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

const controllerSource = async (output) => {
  await new Promise((resolve, reject) => {
    window.navigator.serviceWorker.addEventListener("message", function (evt) {
      if (evt.data === undefined) {
        resolve();
      } else {
        output.put(evt.data);
      }
    });
    window.navigator.serviceWorker.addEventListener("messageerror", function (evt) {
      reject(evt);
    });
  });
});
export const controllerSourceNode = new Common.Streams.SourceNode(controllerSource);

const controllerchangeSource = async (output) => {
  await new Promise((resolve, reject) => {
    window.navigator.serviceWorker.addEventListener("controllerchange", (evt) => {
      newController();
      output.put();
    });
    if (window.navigator.serviceWorker.controller !== null) {
      newController();
      output.put();
    }
    function newController() {
      controller = {
        serviceWorker: window.navigator.serviceWorker.controller,
        output: controllerSourceNode,
        input: new Common.Streams.SinkNode((data) => {
          Common.MessageNode.postMessage(window.navigator.serviceWorker.controller, data);
        }),
      };
    }
  });
});
export const controllerchange = new Common.Streams.SourceNode(controllerchangeSource);
