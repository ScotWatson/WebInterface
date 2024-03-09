"use strict";
self.base64Decode = async function base64Decode(str) {
  return await (new self.Blob([ self.atob(str) ])).arrayBuffer();
}
self.base64Encode = async function base64Encode(view) {
  return self.btoa(await (new self.Blob([ view ])).text());
}
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
      prefix = "_" + self.base64Encode(view);
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
    const prefix = this.#storage.getItem(uri);
    return this.#storage.getItem(prefix + key);
  }
  setItem(key, item) {
    if (key === "") {
      throw "empty string is not allowed";
    }
    const prefix = this.#storage.getItem(uri);
    this.#storage.setItem(prefix + key, item);
  }
  removeItem(key) {
    if (key === "") {
      throw "empty string is not allowed";
    }
    const prefix = this.#storage.getItem(uri);
    this.#storage.removeItem(prefix + key);
  }
}
self.init = function init({
  latestVersion,
  siteURI
}) {
  const selfURL = new URL(window.location);
  const requestedVersion = selfURL.searchParams.get("version");
  self._siteURI = siteURL;
  window.siteSessionStorage = new SiteStorage({
    uri: self._siteURI(),
    storage: window.sessionStorage,
  });
  window.siteLocalStorage = new SiteStorage({
    uri: self._siteURI(),
    storage: window.localStorage,
  });
  const storedVersion = window.siteSessionStorage.getItem("version");
  if (requestedVersion !== null) {
    window.siteSessionStorage.setItem("version", requestedVersion);
    const newSearchParams = new URLSearchParams(selfURL.searchParams.toString());
    newSearchParams.delete("version");
    const newURL = new URL(selfURL.protocol + "//" + selfURL.host + selfURL.pathname + ((newSearchParams.size === 0) ? "" : "?" + newSearchParams.toString()) + selfURL.hash);
    window.history.replaceState(null, "", newURL.toString());
  } else if (storedVersion !== null) {
    window.siteSessionStorage.setItem("version", storedVersion);
  } else {
    window.siteSessionStorage.setItem("version", latestVersion);
  }
  self._version = function () {
    return window.siteSessionStorage.getItem("version");
  }
  const scriptElem = document.createElement("script");
  scriptElem.src = "./" + self._version() + "/editor.js";
  document.head.appendChild(scriptElem);
}
