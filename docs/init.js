/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Intended to be included as the first script tag in an HTML file
// Provides functions useful for initializing a web page

"use strict";

(self.document === undefined ? self : self.document).currentScript.exports = (function () {
  const exports = {};
  function addShortcutIcon() {
    const link = document.createElement("link");
    link.rel = "shortcut icon";
    link.href = "./favicon.ico";
    link.type = "image/x-icon";
    document.head.appendChild(link);
  }
  exports.addShortcutIcon = addShortcutIcon;
  function addIcon() {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = "./favicon.ico";
    link.type = "image/x-icon";
    document.head.appendChild(link);
  }
  exports.addIcon = addIcon;
  // Adds a stylesheet
  function addStyleSheet(url) {
    const style = document.createElement("link");
    style.href = url;
    style.rel = "stylesheet";
  }
  exports.addStyleSheet = addStyleSheet;
  // Blocks HTML parsing until script is fetched and parsed
  function addSyncScript(url) {
    const script = document.createElement("script");
    script.src = url;
    document.head.appendChild(script);
    return {
      url,
      loading: new Promise(function (resolve, reject) {
        script.addEventListener("load", load);
        script.addEventListener("error", error);
        function load(evt) {
          script.removeEventListener("load", load);
          script.removeEventListener("error", error);
          resolve(script);
        }
        function error(evt) {
          script.removeEventListener("load", load);
          script.removeEventListener("error", error);
          reject(evt);
        }
      }),
    };
  }
  exports.addSyncScript = addSyncScript;
  // Fetches script with blocking HTML parser
  function addScript({
    url,  // location of script
    defer,  // does script execution wait until after HTML is parsed
    asModule,  // is script executed as a module
  }) {
    const script = document.createElement("script");
    script.src = url;
    if (asModule) {
      script.type = "module";
      if (!defer) {
        script.async = "true";
      }
    } else {
      script.defer = !!defer;
    }
    document.head.appendChild(script);
    return {
      url,
      loading: new Promise(function (resolve, reject) {
        script.addEventListener("load", load);
        script.addEventListener("error", error);
        function load(evt) {
          script.removeEventListener("load", load);
          script.removeEventListener("error", error);
          resolve(script);
        }
        function error(evt) {
          script.removeEventListener("load", load);
          script.removeEventListener("error", error);
          reject(evt);
        }
      }),
    };
  }
  exports.addScript = addScript;
  // Resolves once the DOM is fully parsed
  exports.interactive = new Promise(function (resolve, reject) {
    if ((document.readyState === "interactive") || (document.readyState === "complete")) {
      resolve(evt);
    }
    document.addEventListener("readystatechange", function (evt) {
      if (document.readyState === "interactive") {
        resolve(evt);
      }
    });
  });
  // Resolves once the DOM is fully parsed and all scripts have finish execution
  exports.contentLoaded = new Promise(function (resolve, reject) {
    if ((document.readyState === "loaded") || (document.readyState === "complete")) {
      resolve(evt);
    }
    document.addEventListener("DOMContentLoaded", function (evt) {
      resolve(evt);
    });
    // This is a fallback in case the browser does not support readyState === "loaded" and the promise is created between the end of script execution and the loading all resources.
    window.addEventListener("load", function (evt) {
      resolve(evt);
    });
  });
  // Resolves once all resources have been fully loaded
  exports.load = new Promise(function (resolve, reject) {
    if (document.readyState === "complete") {
      resolve(evt);
    }
    window.addEventListener("load", function (evt) {
      resolve(evt);
    });
  });
  // Resolves once the page is under the control of a ServiceWorker
  exports.controller = new Promise(function (resolve, reject) {
    if (self.navigator.serviceWorker.controller !== null) {
      resolve();
      return;
    }
    self.navigator.serviceWorker.addEventListener("controllerchange", function (evt) {
      resolve();
      return;
    });
  });
  // Obtain initialization info
  exports.selfUrl = self.location;
  // Async function: Register the service worker.
  function registerServiceWorker({
    url,
    scope,
  }) {
    const registering = self.navigator.serviceWorker.register(url, { scope });
    registering.then((registration) => {
      const channel = new MessageChannel();
      registration.installing.portMessage(channel.port2, [ channel.port2 ]);
      return {
        registration,
        port: channel.port1,
      };
    });
  }
  exports.registerServiceWorker = registerServiceWorker;
  return exports;
})();
