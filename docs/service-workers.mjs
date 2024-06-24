/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import * as Common from "https://scotwatson.github.io/WebInterface/common.mjs";

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
export async function hasInstallingWorker(scope) {
  const registration = await self.navigator.serviceWorker.getRegistration(scope);
  return (registration && registration.installing);
}

// Async function: Returns boolean
export async function hasWaitingWorker(scope) {
  const registration = await self.navigator.serviceWorker.getRegistration(scope);
  return (registration && registration.waiting);
}

// Async function: Returns boolean
export async function hasActiveWorker(scope) {
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
export async function getActiveWorker(scope) {
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

// Async function: Returns undefined
export async function unregister(scope) {
  const registration = self.navigator.serviceWorker.getRegistration(scope);
  if (registration) {
    registration.unregister();
  }
}

// Returns boolean
export function hasController() {
  return !!self.navigator.serviceWorker.controller;
}

class ServiceWorker {
  #scriptURL;
  #state;
  #scope;
  constructor({
    serviceWorker,
    scope,
  }) {
    this.input = new Common.Streams.SinkNode((data) => {
      Common.MessageNode.postMessage(serviceWorker, data);
    });
    serviceWorker.addEventListener("statechange", () => { this.#state = serviceWorker.state; });
    this.#scriptURL = serviceWorker.scriptURL;
    this.#scope = serviceWorker.scope;
  }
  get scriptURL() {
    return this.#scriptURL;
  }
  get state() {
    return this.#state;
  }
  get scope() {
    return this.#scope;
  }
}

export class ServiceWorkerCommands extends Global.Common.Streams.SourceNode {
  #resolve;
  #reject;
  constructor() {
    let thisResolve;
    let thisReject;
    super((resolve, reject) => {
      thisResolve = resolve;
      thisReject = reject;
    });
    this.#resolve = thisResolve;
    this.#reject = thisReject;
  }
  openPort() {
    const messageChannel = new MessageChannel();
    messageChannel.port1._transfer = messageChannel.port1;
    const messageNode = Global.Common.MessageNode.forMessagePort(messageChannel.port2);
    messageChannel.port2.start();
    this.#resolve(messageChannel.port1);
    return messageNode;
  }
  skipWaiting() {
    this.#resolve("skipWaiting");
  }
  claimClients() {
    this.#resolve("claimClients");
  }
}
