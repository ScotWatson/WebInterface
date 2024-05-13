/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

window.addEventListener("message", messageHandler);
const sourceHandlers = new Map();
let unknownSourceHandler = function () {
  throw "Received message from unrecognized source";
}
window.navigator.serviceWorker.addEventListener("message", function (evt) {
  
});

triggerObj = {
  trigger: function (obj) {
    
  },
  executeOnTrigger: function () {
    
  },
};

function createSignal({
  triggerObj,
}) {
  const obj = {};
  let callback;
  obj.next = function () {
    return new Promise(function (resolve, reject) {
      triggerObj.execute = function (value) {
        resolve();
      }
    });
  }
  return obj;
}
function AbortablePromise(promiseFunction, abortFunction) {
  const ret = new Promise(function (resolve, reject) {
    promiseFunction(resolve, reject);
  });
  ret.resolve = function (value) {};
  ret.reject = function (reason) {};
  ret.then = function (onFulfilled, onReject) {};
  ret.catch = function (onReject) {};
  return ret;
}

export const serviceWorkerMessageReceiver = (function () {
  const obj = {};
  
  obj.
  return obj;
})();

function messageReceiver(evt) {
  if (sources.has(evt.source)) {
    const thisSource = sourceHandlers.get(evt.source);
    thisSource._message(evt.data);
  } else {
    unknownSourceHandler(evt);
  }
}

export function createWindowMessageSender({
  destination,
  origin,
}) {
  const obj = {};
  return obj;
}

export function createMessageReceiver({
  source,
}) {
  const obj = {};
  return obj;
}

export function setUnknownSourceHandler({
  handler,
}) {
  unknownSourceHandler = handler;
}
