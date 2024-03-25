/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// only one manager should be created per message port
function RemoteCallManager({
  messageSender,
  messageReceiver,
}) {
  const messageIds = new Map();
  // returns a promise, so acts as an async function
  function call({
    functionName,
    args,
    transferable,
  }) {
    return new Promise(function (resolve, reject) {
      const messageId = self.crypto.randomUUID();
      messageIds.set(messageId, { resolve, reject });
      messageSender.send({
        action: "request",
        data: {
          id: messageId,
          functionName: functionName,
          args: args,
        },
        transferable: transferable,
      });
    });
  }
  messageReceiver.setHandler({
    action: "response",
    handler: responseHandler,
  });
  function responseHandler(data) {
    const functions = messageIds.get(data.id);
    if (functions !== undefined) {
      functions.resolve(data.response);
    }
  };
  messageReceiver.setHandler({
    action: "error",
    handler: errorHandler,
  });
  function errorHandler(data) {
    const functions = messageIds.get(data.id);
    if (functions !== undefined) {
      functions.reject(data.error);
    }
  };
}

function createMessageSenderForWindow({
  window,
  expectedUrl,
}) {
  const obj = {};
  obj.send = function ({
    action,
    args,
    transferable,
  }) {
    window.postMessage({ action, args }, expectedUrl, transferable);
  };
}
function createMessageSenderForWorker({
  worker,
}) {
  const obj = {};
  obj.send = function ({
    action,
    args,
    transferable,
  }) {
    worker.postMessage({
      action: action,
      args: args,
    }, transferable);
  };
}
function createMessageSenderForSharedWorker({
  sharedWorker,
}) {
  const obj = {};
  obj.send = function ({
    action,
    args,
    transferable,
  }) {
    sharedWorker.postMessage({
      action: action,
      args: args,
    }, transferable);
  };
}
// Only applicable for window
function createMessageSenderForServiceWorker({
  sharedWorker,
}) {
  const obj = {};
  obj.send = function ({
    action,
    args,
    transferable,
  }) {
    serviceWorker.postMessage({
      action: action,
      args: args,
    }, transferable);
  };
}
// 
function createMessageSenderForClient({
  client,
}) {
  const obj = {};
  obj.send = function ({
    action,
    args,
    transferable,
  }) {
    client.postMessage({
      action: action,
      args: args,
    }, transferable);
  };
}
// only one receiver
function createMessageReceiver() {
  let obj = {};
  const sources = new Map();
  const newSourceHandlers = new Set();
  obj.createSource({
    source,
  }) {
    let objSource = sources.get(source);
    if (objSource !== undefined) {
      return objSource;
    }
    objSource = {};
    sources.set(source, objSource);
    const handlers = new Map();
    objSource.command = function ({
      action,
      data,
      transferable,
    }) {
      self.postMessage({
        action: action,
        data: data,
      }, transferable);
    };
    // only one handler per action
    objSource.setHandler = function ({
      action,
      handler,
    }) {
      handlers.set(action, handler);
    };
    objSource.remove = function () {
      sources.delete(source);
    };
    objSource._message = function ({
      evt,
    }) {
      const handler = handlers.get(evt.data.action);
      handler(evt.data.data);
    };
  }
  obj.addNewSourceHandler = function ({
    handler,
  }) {
    newSourceHandlers.add(handler);
  };
  self.addEventListener("message", function (evt) {
    if (sources.has(evt.source)) {
      const thisSource = sources.get(evt.source);
      if ((typeof evt.data === "object") && (evt.data !== null) && (typeof evt.data.action === "string")) {
        thisSource._message(evt);
      } else {
        console.warn(evt.data);
      }
    } else {
      // new source
    }
  });
  return obj;
}

function createServiceWorkerReceiver() {
  let obj = {};
  // Start listening for messages from service worker
  const handlers = new Map();
  // only one handler per action
  obj.setHandler = function ({
    action,
    handler,
  }) {
    handlers.set(action, handler);
  };
  window.navigator.serviceWorker.addEventListener("message", function (evt) {
    if ((typeof evt.data === "object") && (evt.data !== null) && (typeof evt.data.action === "string")) {
      const handler = handlers.get(evt.data.action);
      handler(evt.data.data);
    } else {
      console.warn(evt.data);
    }
  });
  window.navigator.serviceWorker.startMessages();
  return obj;
}
