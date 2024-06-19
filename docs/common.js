/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

(self.document === undefined ? self : self.document).currentScript.exports = (function () {
  const exports = {};
  // async Iterable Iterator
  exports.base64Decode =  async function base64Decode(str) {
    return await (new self.Blob([ self.atob(str) ])).arrayBuffer();
  };
  exports.base64Encode = function base64Encode(view) {
    let rawString = "";
    for (const byte of view) {
      rawString += String.fromCharCode(byte);
    }
    return self.btoa(rawString);
  };
  // SiteStorage does not provide security, all variables are still accessible through the underlying storage object
  // If using SiteStorage, do not manipulate keys that start with an underscore or match RFC3986 syntax.
  exports.SiteStorage = class SiteStorage {
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
  return exports;
})();
