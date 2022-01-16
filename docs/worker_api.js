/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const objSystem = (function () {
  let me = {};
  let mapMessage = new Map();
  self.addEventListener("message", function(e) {
    if (e.data.id) {
      let resolve = mapMessage.get(e.data.requestId);
      if (resolve) {
        resolve(e.data.body);
      }
    }
  });
  me.sendRequest = function (message) {
    const objMessage = {};
    do {
      objMessage.requestId = "";
      for (let i = 0; i < 8; ++i) {
        objMessage.requestId += Math.floor(Math.random() * 0x100).toString(16).padStart(2, "0");
      }
    } while (mapMessage.has(objMessage.requestId));
    objMessage.body = message;
    self.postMessage(objMessage);
    return new Promise(function (resolve, reject) {
      function timeout() {
        mapMessage.delete(objMessage.requestId);
        reject(new Error("Message Timeout: " + objMessage.requestId));
      }
      mapMessage.set(objMessage.requestId, resolve);
      setTimeout(timeout, 5000);
    });
  }
  me.sendResponse = function (workerTarget, requestId) {
    workerTarget.postMessage(objMessage);
  }
  me.addButton = function () {
    let objMsg = {};
    objMsg.command = "addButton";
    let request = me.sendRequest(objMsg);
  }
  return me;
})();
Object.freeze(objSystem);
