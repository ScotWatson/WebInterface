// (c) 2022 Scot Watson  All Rights Reserved
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: This path is hardcoded, as the service worker cannot access window.location
const pathname = "/hello-world/";

function projectFile(filename) {
  return pathname + filename;
}

function selfInstall(e) {
  console.log("sw.js: Start Installing");
  function addCaches(cache) {
    console.log("sw.js: Start Adding Caches");
    cache.addAll([
      projectFile(""),
      projectFile("index.html"),
      projectFile("index.js"),
      projectFile("style.css"),
    ])
    console.log("sw.js: End Adding Caches");
  }
  e.waitUntil(caches.open("store").then(addCaches));
  console.log("sw.js: End Installing");
}

function selfFetch(e) {
  console.log("sw.js: Start Handling Fethch");
  function sendResponse(response) {
    return response || fetch(e.request);
  }
  e.respondWith(caches.match(e.request).then(sendResponse));
  console.log("sw.js: End Handling Fethch");
}

self.addEventListener("install", selfInstall);
self.addEventListener("fetch", selfFetch);
