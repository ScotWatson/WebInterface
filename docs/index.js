/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function Task(url) {
  const that = this;
  let mapMessage = new Map();
  let myWorker = new Worker(url);
  myWorker.addEventListener("message", message_handler);
  myWorker.addEventListener("messageerror", message_error_handler);
  function message_handler(e) {
    if (e.data) {
      if (e.data.requestId) {
        if (e.data.body) {
          that.sendResponse(e.data.requestId, parseRequest(e.data.body));
        } else {
          console.warn("Request message from worker without body: " + JSON.stringify(e.data));
        }
      } else if (e.data.responseId) {
        console.warn("Response message from worker: " + JSON.stringify(e.data));
      } else {
        console.warn("Non-request/response message from worker: " + JSON.stringify(e.data));
      }
    } else {
      console.warn("Null message from worker");
    }
  }
  function message_error_handler(e) {
    console.error(e);
  }
  this.sendRequest = function (message) {
    const objMessage = {};
    do {
      objMessage.requestId = "";
      for (let i = 0; i < 8; ++i) {
        objMessage.requestId += Math.floor(Math.random() * 0x100).toString(16).padStart(2, "0");
      }
    } while (mapMessage.has(objMessage.requestId));
    objMessage.body = message;
    myWorker.postMessage(objMessage);
    return new Promise(function (resolve, reject) {
      function timeout() {
        mapMessage.delete(objMessage.requestId);
        reject(new Error("Message Timeout: " + JSON.stringify(objMessage)));
      }
      mapMessage.set(objMessage.requestId, resolve);
      setTimeout(timeout, 5000);
    });
  }
  this.sendResponse = function (requestId, message) {
    myWorker.postMessage({
      responseId: requestId,
      body: message,
    });
  }
}

let myTask = new Task("https://scotwatson.github.io/TestWorker/worker.js")
let UI_elements = new Map();
let commands = new Map();
commands.set("add_UI_element", add_UI_element);

function parseRequest(request) {
  if (request.command) {
    const command_function = commands.get(request.command);
    if (command_function) {
      return command_function(request.args);
    } else {
      return unrecognized_command(request.command, request.args);
    }
  } else if (request.log) {
    console.log(request.log);
    return {
    };
  } else {
    return {
      error: "Unrecognized Request",
    };
  }
}

function get_UI_element_Id() {
  let UI_element_Id;
  do {
    UI_element_Id = "";
    for (let i = 0; i < 8; ++i) {
      UI_element_Id += Math.floor(Math.random() * 0x100).toString(16).padStart(2, "0");
    }
  } while (UI_elements.has(UI_element_Id));
  return UI_element_Id;
}

function add_UI_element(args) {
  let btn = document.createElement("div");
  btn.style.display = "block";
  btn.style.position = "absolute";
  btn.style.left = 200 + "px";
  btn.style.top = 200 + "px";
  btn.style.width = 100 + "px";
  btn.style.height = 100 + "px";
  btn.style.backgroundColor = "blue";
  btn.innerHTML = args.text;
  document.body.appendChild(btn);
  const id = get_UI_element_Id();
  UI_elements.set(id, btn);
  return {
    id: id,
  };
}

function unrecognized_command(command, args) {
  console.warn("Unrecognized command: " + command + ", " + JSON.stringify(args));
  return {
    error: "Unrecognized command",
  };
}
