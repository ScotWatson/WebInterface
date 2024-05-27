/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

(self.document === undefined ? self : self.document).currentScript.exports = (function () {
  const exports = {};
  // SiteStorage does not provide security, all variables are still accessible through the underlying storage object
  // If using SiteStorage, do not manipulate keys that start with an underscore or match RFC3986 syntax.
  class SiteStorage {
    #uri;
    #storage;
    constructor(args) {
      const { uri, storage } = args;
      this.#uri = (new self.URL(uri)).toString();
      this.#storage = storage;
      let prefix = this.#storage.getItem(uri);
      while (prefix === null) {
        const view = new Uint8Array(12);
        self.crypto.getRandomValues(view);
        // 17-char prefix
        prefix = "_" + base64Encode(view);
        // unlikely, but check to make sure
        if (this.#storage.getItem(prefix) !== null) {
          prefix = null;
        }
      }
      this.#storage.setItem(prefix, uri);
      this.#storage.setItem(uri, prefix);
    }
    get(key) {
      if (key === "") {
        throw "empty string is not allowed";
      }
      const prefix = this.#storage.getItem(this.#uri);
      return this.#storage.getItem(prefix + key);
    }
    set(key, item) {
      if (key === "") {
        throw "empty string is not allowed";
      }
      const prefix = this.#storage.getItem(this.#uri);
      this.#storage.setItem(prefix + key, item);
    }
    remove(key) {
      if (key === "") {
        throw "empty string is not allowed";
      }
      const prefix = this.#storage.getItem(this.#uri);
      this.#storage.removeItem(prefix + key);
    }
  };
  exports.SiteStorage = SiteStorage;
  exports.init = function({
    latestVersion,
    siteURI
  }) {
    const requestedVersion = exports.selfUrl.searchParams.get("version");
    self._siteURI = siteURI;
    window.siteSessionStorage = new SiteStorage({
      uri: self._siteURI(),
      storage: window.sessionStorage,
    });
    window.siteLocalStorage = new SiteStorage({
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
    return "./" + self._version() + "/";
  }
  return exports;
});
