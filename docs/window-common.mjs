/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import * as Common from "https://scotwatson.github.io/WebInterface/common.js";

export const loadWindow = new Promise(function (resolve, reject) {
  window.addEventListener("load", function (evt) {
    resolve(evt);
  });
});

export function init({
  latestVersion,
  siteURI
}) {
  const selfURL = new URL(window.location);
  const requestedVersion = selfURL.searchParams.get("version");
  self._siteURI = siteURI;
  moduleCommon.then(function (Common) {
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
      const newSearchParams = new self.URLSearchParams(selfURL.searchParams.toString());
      newSearchParams.delete("version");
      const newURL = new self.URL(selfURL.protocol + "//" + selfURL.host + selfURL.pathname + ((newSearchParams.size === 0) ? "" : "?" + newSearchParams.toString()) + selfURL.hash);
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
