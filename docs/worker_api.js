/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function delete_member(obj, member) {
  if (obj.hasOwnProperty(member)) {
    return (delete obj[member]);
  } else {
    let prototype = Object.getPrototypeOf(obj);
    if (prototype === null) {
      return false;
    }
    delete_member(prototype, member);
  }
}
// self.indexedDB.databases gives access to all databases on the current domain.  This is a security risk.
if (!(delete_member(self.indexedDB, "databases"))) {
  self.close();
}
const objSystem = (function () {
  let me = {};
  let mapMessage = new Map();
  self.addEventListener("message", function(e) {
    if (e.data) {
      if (e.data.requestId) {
        console.warn("This worker is unable to handle requests");
      } else if (e.data.responseId) {
        let resolve = mapMessage.get(e.data.responseId);
        mapMessage.delete(e.data.responseId);
        if (resolve) {
          resolve(e.data.body);
        }
      } else {
        console.warn("Non-request/response message from main script");
      }
    } else {
      console.warn("Null message from main script");
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
    mapMessage.set(objMessage.requestId, resolve);
    return new Promise(function (resolve, reject) {
      function timeout() {
        mapMessage.delete(objMessage.requestId);
        reject(new Error("Message Timeout: " + JSON.stringify(objMessage)));
      }
      setTimeout(timeout, 5000);
    });
  }
  me.sendResponse = function (workerTarget, requestId, message) {
    let objMessage = {};
    objMessage.responseId = requestId;
    objMessage.body = message;
    workerTarget.postMessage(objMessage);
  }
  me.addButton = function () {
    let objMsg = {};
    objMsg.command = "add_UI_element";
    objMsg.args = {
      type: "button",
    };
    return me.sendRequest(objMsg);
  }
  return me;
})();
Object.freeze(objSystem);
