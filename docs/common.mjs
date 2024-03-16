export async function base64Decode(str) {
  return await (new self.Blob([ self.atob(str) ])).arrayBuffer();
}
export async function base64Encode(view) {
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
  getItem(key) {
    if (key === "") {
      throw "empty string is not allowed";
    }
    const prefix = this.#storage.getItem(this.#uri);
    return this.#storage.getItem(prefix + key);
  }
  setItem(key, item) {
    if (key === "") {
      throw "empty string is not allowed";
    }
    const prefix = this.#storage.getItem(this.#uri);
    this.#storage.setItem(prefix + key, item);
  }
  removeItem(key) {
    if (key === "") {
      throw "empty string is not allowed";
    }
    const prefix = this.#storage.getItem(this.#uri);
    this.#storage.removeItem(prefix + key);
  }
}
