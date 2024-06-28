/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export function addShortcutIcon() {
  const link = document.createElement("link");
  link.rel = "shortcut icon";
  link.href = "./favicon.ico";
  link.type = "image/x-icon";
  document.head.appendChild(link);
}
export function addIcon() {
  const link = document.createElement("link");
  link.rel = "icon";
  link.href = "./favicon.ico";
  link.type = "image/x-icon";
  document.head.appendChild(link);
}
// Adds a stylesheet
export function addStyleSheet(url) {
  const style = document.createElement("link");
  style.href = url;
  style.rel = "stylesheet";
}
// Blocks HTML parsing until script is fetched and parsed
export function addSyncScript(url) {
  const script = document.createElement("script");
  script.src = url;
  document.head.appendChild(script);
  return {
    url,
    loading: new Promise(function (resolve, reject) {
      script.addEventListener("load", load);
      script.addEventListener("error", error);
      function load(evt) {
        script.removeEventListener("load", load);
        script.removeEventListener("error", error);
        resolve(script);
      }
      function error(evt) {
        script.removeEventListener("load", load);
        script.removeEventListener("error", error);
        reject(evt);
      }
    }),
  };
}
// Fetches script with blocking HTML parser
export function addScript({
  url,  // location of script
  defer,  // does script execution wait until after HTML is parsed
  asModule,  // is script executed as a module
}) {
  const script = document.createElement("script");
  script.src = url;
  if (asModule) {
    script.type = "module";
    if (!defer) {
      script.async = "true";
    }
  } else {
    script.defer = !!defer;
  }
  document.head.appendChild(script);
  return {
    url,
    loading: new Promise(function (resolve, reject) {
      script.addEventListener("load", load);
      script.addEventListener("error", error);
      function load(evt) {
        script.removeEventListener("load", load);
        script.removeEventListener("error", error);
        resolve(script);
      }
      function error(evt) {
        script.removeEventListener("load", load);
        script.removeEventListener("error", error);
        reject(evt);
      }
    }),
  };
}
// Resolves once the DOM is fully parsed
export const interactive = new Promise((resolve, reject) => {
  if ((document.readyState === "interactive") || (document.readyState === "complete")) {
    resolve();
  }
  document.addEventListener("readystatechange", function (evt) {
    if (document.readyState === "interactive") {
      resolve();
    }
  });
});
