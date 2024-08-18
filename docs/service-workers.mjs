/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import * as Streams from "https://scotwatson.github.io/WebInterface/streams.mjs";
import * as MessageNode from "https://scotwatson.github.io/WebInterface/message-node.mjs";

// Async function: Register the service worker.
export async function installNew({
  url,
  scope,
}) {
  const oldRegistration = await self.navigator.serviceWorker.getRegistration(scope);
  const registration = await self.navigator.serviceWorker.register(url, { scope });
  if (oldRegistration === registration) {
    console.log("Duplicate registration for scope " + scope);
  } else {
    console.log("New registration for scope " + scope);
  }
  return new ServiceWorker({
    serviceWorker: registration.installing,
    scope,
  });
}

// Async function: Returns boolean
export async function hasRegistration(scope) {
  const registration = await self.navigator.serviceWorker.getRegistration(scope);
  return !!registration;
}

// Async function: Returns boolean
export async function hasInstalling(scope) {
  const registration = await self.navigator.serviceWorker.getRegistration(scope);
  return (registration && registration.installing);
}

// Async function: Returns boolean
export async function hasWaiting(scope) {
  const registration = await self.navigator.serviceWorker.getRegistration(scope);
  return (registration && registration.waiting);
}

// Async function: Returns boolean
export async function hasActive(scope) {
  const registration = await self.navigator.serviceWorker.getRegistration(scope);
  return (registration && registration.active);
}

// Async function: Returns Service Worker (use only if not obtainable via "installNew")
export async function getInstalling(scope) {
  const registration = await self.navigator.serviceWorker.getRegistration(scope);
  if (registration && registration.installing) {
    return new ServiceWorker({
      serviceWorker: registration.installing,
      scope,
    });
  } else {
    return null;
  }
}

// Async function: Returns Service Worker (use only if not obtainable via "installNew")
export async function getWaiting(scope) {
  const registration = await self.navigator.serviceWorker.getRegistration(scope);
  if (registration && registration.waiting) {
    return new ServiceWorker({
      serviceWorker: registration.waiting,
      scope,
    });
  } else {
    return null;
  }
}

// Async function: Returns Service Worker (use only if not obtainable via "installNew")
export async function getActive(scope) {
  const registration = await self.navigator.serviceWorker.getRegistration(scope);
  if (registration && registration.active) {
    return new ServiceWorker({
      serviceWorker: registration.active,
      scope,
    });
  } else {
    return null;
  }
}

// Async function: Returns Service Worker (use only if not obtainable via "installNew")
export async function getNewest(scope) {
  const registration = await self.navigator.serviceWorker.getRegistration(scope);
  if (registration && registration.installing) {
    return new ServiceWorker({
      serviceWorker: registration.installing,
      scope,
    });
  if (registration && registration.waiting) {
    return new ServiceWorker({
      serviceWorker: registration.waiting,
      scope,
    });
  if (registration && registration.active) {
    return new ServiceWorker({
      serviceWorker: registration.active,
      scope,
    });
  } else {
    return null;
  }
}

// Async function: Returns undefined
export async function unregister(scope) {
  const registration = await self.navigator.serviceWorker.getRegistration(scope);
  if (registration) {
    registration.unregister();
  }
}

// Async function: Returns undefined
export async function update(scope) {
  const registration = await self.navigator.serviceWorker.getRegistration(scope);
  if (registration) {
    registration.update();
  }
}

// Returns boolean
export function hasController() {
  return !!self.navigator.serviceWorker.controller;
}

class ServiceWorker {
  #serviceWorker;
  #scope;
  constructor({
    serviceWorker,
    scope,
  }) {
    this.input = (data) => {
      MessageNode.postMessage(serviceWorker, data);
    };
    this.installed = new Promise((resolve, reject) => {
      function watchForInstalled() {
        if (serviceWorker.state === "installed") {
          serviceWorker.removeEventListener("statechange", watchForInstalled);
          resolve();
        }
      }
      if ((serviceWorker.state === "installed") || (serviceWorker.state === "activating") || (serviceWorker.state === "activated")) {
        resolve();
      } else {
        serviceWorker.addEventListener("statechange", watchForInstalled);
      }
    });
    this.activating = new Promise((resolve, reject) => {
      function watchForActivating() {
        if (serviceWorker.state === "activating") {
          serviceWorker.removeEventListener("statechange", watchForActivating);
          resolve();
        }
      }
      if ((serviceWorker.state === "activating") || (serviceWorker.state === "activated")) {
        resolve();
      } else {
        serviceWorker.addEventListener("statechange", watchForActivating);
      }
    });
    this.activated = new Promise((resolve, reject) => {
      function watchForActivated() {
        if (serviceWorker.state === "activated") {
          serviceWorker.removeEventListener("statechange", watchForActivated);
          resolve();
        }
      }
      if (serviceWorker.state === "activated") {
        resolve();
      } else {
        serviceWorker.addEventListener("statechange", watchForActivated);
      }
    });
    this.redundant = new Promise((resolve, reject) => {
      function watchForRedundant() {
        if (serviceWorker.state === "redundant") {
          serviceWorker.removeEventListener("statechange", watchForRedundant);
          resolve();
        }
      }
      if (serviceWorker.state === "redundant") {
        resolve();
      } else {
        serviceWorker.addEventListener("statechange", watchForRedundant);
      }
    });
    this.#serviceWorker = serviceWorker;
    this.#scope = scope;
  }
  get scriptURL() {
    return this.#serviceWorker.scriptURL;
  }
  get state() {
    return this.#serviceWorker.state;
  }
  get scope() {
    return this.#scope;
  }
}

export const controllerInput = (data) => {
  MessageNode.postMessage(self.navigator.serviceWorker.controller, data);
};

// Resolves when under the control of a ServiceWorker
export const controller = async function *() {
  if (self.navigator.serviceWorker.controller !== null) {
    yield;
  }
  let nextController;
  self.navigator.serviceWorker.addEventListener("controllerchange", (evt) => {
    nextController();
  });
  while (true) {
    await new Promise((resolve, _) => {
      nextController = resolve;
    });
    yield;
  }
}
controller.first = controller.next();

export async function attemptController() {
  const newestWorker = ServiceWorkers.getNewest();
  let newestWorkerInstalled = false;
  newestWorker.installed.then(() => {
    newestWorkerInstalled = true;
  });
  // Once a service worker has started activating, it cannot fail.
  // Send "claimClients" command to make the active worker the controller.
  // This overrides the default Ctrl-R behavior.
  newestWorker.activating.then(() => {
    newestWorker.input("claimClients");
  });
  return await Promise.race([
    controller.next().then(() => {
      // controller installed
    }), newestWorker.redundant.then(() => {
      if (!newestWorkerInstalled) {
        throw Error("Failed to install controller.");
      }
    })
  ]);
}
