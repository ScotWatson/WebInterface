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

class ServiceWorker extends EventSource {
  #scriptURL;
  #state;
  #scope;
  constructor({
    serviceWorker,
    scope,
  }) {
    super();
    this.input = new Common.Streams.SinkNode((data) => {
      MessageNode.postMessage(serviceWorker, data);
    });
    serviceWorker.addEventListener("statechange", (evt) => { this.dispatchEvent(evt); });
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

const controllerSource = new Streams.SourceNode((resolve, reject) => {
  self.navigator.serviceWorker.addEventListener("message", resolve);
});
const controllerSink = new Streams.SinkNode((data) => {
  MessageNode.postMessage(self.navigator.serviceWorker.controller, data);
});
