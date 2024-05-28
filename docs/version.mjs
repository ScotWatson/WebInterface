/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import default as SiteStorage from "https://scotwatson.github.io/WebInterface/SiteStorage.mjs"

const selfUrl = new URL(self.location);

export function getVersionBaseUrl({
  latestVersion,
  siteURI
}) {
  const requestedVersion = selfUrl.searchParams.get("version");
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
    const newURL = new self.URL(selfUrl.protocol + "//" + selfUrl.host + selfUrl.pathname + ((newSearchParams.size === 0) ? "" : "?" + newSearchParams.toString()) + selfUrl.hash);
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
