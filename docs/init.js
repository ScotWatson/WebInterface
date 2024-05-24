/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Intended to be included as a script tag in an HTML file

"use strict";

document.currentScript.exports = (function () {
  const exports = {};
  exports.load = new Promise(function (resolve, reject) {
    window.addEventListener("load", function (evt) {
      resolve(evt);
    });
  });
  exports.controller = new Promise(function (resolve, reject) {
    if (navigator.serviceWorker.controller !== null) {
      resolve();
      return;
    }
    navigator.serviceWorker.addEventListener("controllerchange", function (evt) {
      resolve();
      return;
    });
  });
  // Obtain initialization info
  exports.selfUrl = new URL(self.location);
  exports.serviceWorkerUrl = new URL("./sw.js", urlSelf);
  exports.serviceWorkerScopeUrl = new URL("./", urlSelf);
  // Register the service worker.
  exports.registrationPromise = window.navigator.serviceWorker.register(serviceWorkerUrl.href, {
    scope: serviceWorkerScopeUrl.href,
  });
  exports.init = function({
    latestVersion,
    siteURI
  }) {
    const requestedVersion = exports.selfUrl.searchParams.get("version");
    self._siteURI = siteURI;
    import("./common.mjs").then(function (Common) {
      window.siteSessionStorage = new Common.SiteStorage({
        uri: self._siteURI(),
        storage: window.sessionStorage,
      });
      window.siteLocalStorage = new Common.SiteStorage({
        uri: self._siteURI(),
        storage: window.localStorage,
      });
      const storedVersion = window.siteSessionStorage.get("version");
      if (requestedVersion !== null) {
        window.siteSessionStorage.set("version", requestedVersion);
        const newSearchParams = new self.URLSearchParams(exports.selfUrl.searchParams.toString());
        newSearchParams.delete("version");
        const newURL = new self.URL(exports.selfUrl.protocol + "//" + exports.selfUrl.host + exports.selfUrl.pathname + ((newSearchParams.size === 0) ? "" : "?" + newSearchParams.toString()) + exports.selfUrl.hash);
        window.history.replaceState(null, "", newURL.toString());
      } else if (storedVersion !== null) {
        window.siteSessionStorage.set("version", storedVersion);
      } else {
        window.siteSessionStorage.set("version", latestVersion);
      }
      self._version = function () {
        return window.siteSessionStorage.get("version");
      }
      const styleElem = document.createElement("link");
      styleElem.href = "./" + self._version() + "/style.css";
      styleElem.rel = "stylesheet";
      document.head.appendChild(styleElem);
      const scriptElem = document.createElement("script");
      scriptElem.src = "./" + self._version() + "/index.js";
      document.head.appendChild(scriptElem);
    });
  }
  return exports;
})();
