/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// async Iterable Iterator
export function createSignal(initFunc) {
  const obj = {};
  let resolveArray = [];
  let rejectArray = [];
  let resolve = function (value, done) {
    for (const resolve of resolveArray) {
      resolve({
        value: value,
        done: !!done,
      });
    }
    resolveArray = [];
    rejectArray = [];
  };
  let reject = function (error) {
    for (const reject of rejectArray) {
      reject({
        value: value,
        done: true,
      });
    }
    resolveArray = [];
    rejectArray = [];
  };
  obj.next = function () {
    return new Promise(function (resolve, reject) {
      resolveArray.push(resolve);
      rejectArray.push(reject);
    });
  };
  obj[Symbol.asyncIterator] = function () {
    return obj;
  };
  initFunc(resolve, reject);
  resolve = null;
  reject = null;
  return obj;
}

export function AbortablePromise({
  initFunc,
  abortFunc,
}) {
  let resolveFunc;
  let rejectFunc;
  const ret = new Promise(function (resolve, reject) {
    resolveFunc = resolve;
    rejectFunc = reject;
    initFunc(resolve, reject);
  });
  ret.resolve = function (value) {
    abortFunc();
    resolveFunc(value);
  };
  ret.reject = function (reason) {
    abortFunc();
    rejectFunc(reason);
  };
  return ret;
}

export async function base64Decode(str) {
  return await (new self.Blob([ self.atob(str) ])).arrayBuffer();
}
export function base64Encode(view) {
  let rawString = "";
  for (const byte of view) {
    rawString += String.fromCharCode(byte);
  }
  return self.btoa(rawString);
}
// SiteStorage does not provide security, all variables are still accessible through the underlying storage object
// If using SiteStorage, do not manipulate keys that start with an underscore or match RFC3986 syntax.
export class SiteStorage {
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
}
