/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Must be included as a classic script tag in an HTML file
// Provides functions useful for initializing a web page

"use strict";

window.document.currentScript.exports = (function () {
  const exports = {};

  // Message Queue for messages sent to the window
  exports.windowMessages = new MessageQueue(self);

  // Message Queue for messages from controller service worker
  exports.controllerMessages = new MessageQueue(self.navigator.serviceWorker);

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
  exports.controller = async function *() {
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
  exports.controller.first = exports.controller.next();

  // Obtain initialization info
  exports.selfUrl = new URL(self.location);
  
  return exports;
})();
