"use strict";
const moduleCommon = import("./common.mjs");

self.init = function init({
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
    const storedVersion = window.siteSessionStorage.getItem("version");
    if (requestedVersion !== null) {
      window.siteSessionStorage.setItem("version", requestedVersion);
      const newSearchParams = new self.URLSearchParams(selfURL.searchParams.toString());
      newSearchParams.delete("version");
      const newURL = new self.URL(selfURL.protocol + "//" + selfURL.host + selfURL.pathname + ((newSearchParams.size === 0) ? "" : "?" + newSearchParams.toString()) + selfURL.hash);
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
  });
}
