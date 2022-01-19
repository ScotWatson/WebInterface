/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

let mapFileHashes = new Map();

ArrayBuffer.prototype.equal = function (other) {
  if (this.byteLength !== other.byteLength) {
    return false;
  }
  const thisArray = new Uint8Array(this);
  const otherArray = new Uint8Array(other);
  for (let i = 0; i < thisArray.byteLength; ++i) {
    if (thisArray[i] !== otherArray[i]) {
      return false;
    }
  }
  return true;
}

// Check once every 10 seconds
setInterval(checkIndexJS, 10000);
function checkIndexJS() {
  checkForUpdate("index.js").then(prompt);
  function prompt(result) {
    console.log(result);
    if (result) {
      prompt_for_reload();
    }
  }
}

function prompt_for_reload() {
  let divWindow = document.createElement("div");
  divWindow.style.display = "block";
  divWindow.style.position = "absolute";
  divWindow.style.left = 50 + "px";
  divWindow.style.top = 50 + "px";
  divWindow.style.width = 200 + "px";
  divWindow.style.height = 200 + "px";
  divWindow.style.backgroundColor = "#808080";
  let divPrompt = document.createElement("div");
  divPrompt.style.display = "block";
  divPrompt.style.position = "absolute";
  divPrompt.style.left = 0 + "px";
  divPrompt.style.top = 0 + "px";
  divPrompt.style.width = 200 + "px";
  divPrompt.style.height = 50 + "px";
  divPrompt.appendChild(document.createTextNode("index.js has changed.  Do you want to reload the page?"));
  divWindow.appendChild(divPrompt);
  let divBtnYes = document.createElement("div");
  divBtnYes.style.display = "block";
  divBtnYes.style.position = "absolute";
  divBtnYes.style.left = 25 + "px";
  divBtnYes.style.top = 100 + "px";
  divBtnYes.style.width = 50 + "px";
  divBtnYes.style.height = 50 + "px";
  divBtnYes.style.backgroundColor = "#C0C0C0";
  divBtnYes.appendChild(document.createTextNode("Yes"));
  divWindow.appendChild(divBtnYes);
  let divBtnNo = document.createElement("div");
  divBtnNo.style.display = "block";
  divBtnNo.style.position = "absolute";
  divBtnNo.style.left = 125 + "px";
  divBtnNo.style.top = 100 + "px";
  divBtnNo.style.width = 50 + "px";
  divBtnNo.style.height = 50 + "px";
  divBtnNo.style.backgroundColor = "#C0C0C0";
  divBtnNo.appendChild(document.createTextNode("No"));
  divWindow.appendChild(divBtnNo);
  divBtnYes.addEventListener("click", function () {
    window.location.reload();
    return false;
  });
  divBtnNo.addEventListener("click", function () {
    divWindow.remove();
  });
  document.body.appendChild(divWindow);
}
function clickFactory(thisValue) {
  return function () {
    const a = document.createElement("a");
    const thisBlob = new Blob( [ thisValue ] );
    a.href = URL.createObjectURL(thisBlob);
    a.download = "index.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
function checkForUpdate(url) {
  let thisValue;
  return fetch(url, {cache: "reload"}).then(getHash).then(compareHash);
  function getHash(response) {
    let fullBody = [];
    console.log(response);
    return response.arrayBuffer().then(hashValue);
    /*
    let reader = response.body.getReader();
    return readAll(reader).then(hashValue);
    function readAll(reader) {
      let thisPart = reader.read();
      if (thisPart.done) {
        return [];
      } else {
        return readAll(reader).then(function (arrBody) {
          fullBody.unshift(thisPart.value);
        });
      }
    }
    function collect(arrBody) {
      return (new Blob(arrBody)).arrayBuffer();
    }
    */
    function hashValue(input) {
      thisValue = input /*.value*/;
      return crypto.subtle.digest("SHA-256", thisValue);
    }
  }
  function compareHash(hash) {
    let oldHash = mapFileHashes.get(url)
    console.log(new Date(), new Uint8Array(hash), new Uint8Array(oldHash));
    mapFileHashes.set(url, hash);
    if (oldHash) {
      if (!(oldHash.equal(hash))) {
        let btnSave = document.createElement("button");
        btnSave.innerHTML = "Save";
        document.body.appendChild(btnSave);
        btnSave.addEventListener("click", clickFactory(thisValue));
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}

let divScreenSize;
let divScreenAvailWidth;
let divScreenAvailHeight;
let divClientWidth;
let divClientHeight;
let divInnerWidth;
let divInnerHeight;
let divScrollWidth;
let divScrollHeight;

window.addEventListener("load", function () {
  divScreenSize = document.createElement("div");
  document.body.appendChild(divScreenSize);
  divScreenAvailWidth = document.createElement("div");
  document.body.appendChild(divScreenAvailWidth);
  divScreenAvailHeight = document.createElement("div");
  document.body.appendChild(divScreenAvailHeight);
  divClientWidth = document.createElement("div");
  document.body.appendChild(divClientWidth);
  divClientHeight = document.createElement("div");
  document.body.appendChild(divClientHeight);
  divInnerWidth = document.createElement("div");
  document.body.appendChild(divInnerWidth);
  divInnerHeight = document.createElement("div");
  document.body.appendChild(divInnerHeight);
  divScrollWidth = document.createElement("div");
  document.body.appendChild(divScrollWidth);
  divScrollHeight = document.createElement("div");
  document.body.appendChild(divScrollHeight);
  resize();
});

window.addEventListener("resize", resize);

function resize() {
  divScreenSize.innerHTML = "screen size = " + screen.width + " x " + screen.height;
  divScreenAvailWidth.innerHTML = "screen.availWidth = " + screen.availWidth;
  divScreenAvailHeight.innerHTML = "screen.availHeight = " + screen.availHeight;
  divClientWidth.innerHTML = "document.documentElement.clientWidth = " + document.documentElement.clientWidth;
  divClientHeight.innerHTML = "document.documentElement.clientHeight = " + document.documentElement.clientHeight;
  divInnerWidth.innerHTML = "window.innerWidth = " + window.innerWidth;
  divInnerHeight.innerHTML = "window.innerHeight = " + window.innerHeight;
  divScrollWidth.innerHTML = "document.body.scrollWidth = " + document.body.scrollWidth;
  divScrollHeight.innerHTML = "document.body.scrollHeight = " + document.body.scrollHeight;
}

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
