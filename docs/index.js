/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

let clientWidth_CSS_px;
let clientHeight_CSS_px;
let clientWidth_CSS_in;
let clientHeight_CSS_in;
let clientWidth_CSS_mm;
let clientHeight_CSS_mm;

let units = "IP";

let CSS_multiplier = 1;

window.addEventListener("load", function (evt) {
  document.body.style.overflow = "none";
  startCalibrationX();
});

window.addEventListener("resize", resizeClient);

function resizeClient() {
  clientWidth_CSS_px = window.innerWidth;
  clientHeight_CSS_px = window.innerHeight;
  clientWidth_CSS_in = clientWidth_CSS_px / 96;
  clientHeight_CSS_in = clientHeight_CSS_px / 96;
  clientWidth_CSS_mm = clientWidth_CSS_in * 25.4;
  clientHeight_CSS_mm = clientHeight_CSS_in * 25.4;
  redrawChildren(document.body, clientWidth_CSS_px, clientHeight_CSS_px);
}

function redrawChildren(parent, width, height) {
  for (let child of parent.children) {
    if (child.redraw) {
      child.redraw(clientWidth_CSS_px, clientHeight_CSS_px);
    }
  }
}

function startCalibrationX() {
  let curr_dist_CSS_px;
  let init_dist_CSS_px;
  let curr_calX_CSS_px = clientWidth_CSS_px * 0.80;
  let init_calX_CSS_px = curr_calX_CSS_px;
  const divCalibration = document.createElement("div");
  const divCalLine = document.createElement("div");
  const divTarget = document.createElement("div");

  resizeClient();
  
  // calibration interface
  divCalibration.style.display = "block";
  divCalibration.style.position = "absolute";
  divCalibration.style.left = "0px";
  divCalibration.style.top = "0px";
  divCalibration.style.width = clientWidth_CSS_px + "px";
  divCalibration.style.height = clientHeight_CSS_px + "px";
  divCalibration.style.backgroundColor = "#FFFFFF";
  divCalibration.redraw = function (width, height) {
    updateTarget();
    redrawChildren(divCalibration, width, height);
  };
  divCalLine.style.display = "block";
  divCalLine.style.position = "absolute";
  divCalLine.style.left = (clientWidth_CSS_px * 0.10) + "px";
  divCalLine.style.top = (clientHeight_CSS_px * 0.10) + "px";
  divCalLine.style.width = curr_calX_CSS_px + "px";
  divCalLine.style.height = 4 + "px";
  divCalibration.appendChild(divCalLine);
  divTarget.style.display = "block";
  divTarget.style.position = "absolute";
  divTarget.style.left = (clientWidth_CSS_px * 0.50) + "px";
  divTarget.style.top = (clientHeight_CSS_px * 0.50) + "px";
  divTarget.style.width = (clientWidth_CSS_px * 0.25) + "px";
  divTarget.style.height = (clientHeight_CSS_px * 0.25) + "px";
  divCalibration.appendChild(divTarget);
  divCalibration.addEventListener("touchstart", handleTouch);
  divCalibration.addEventListener("touchmove", handleTouch);
  divCalibration.addEventListener("touchend", handleTouch);
  document.body.appendChild(divCalibration);
  divCalibration.redraw();
  
  function updateTarget() {
    let numTarget;
    let strTarget;
    switch (units) {
      case "SI":
        numTarget = Math.floor((clientHeight_CSS_mm * 0.80) / 10) * 10;
        strTarget = numTarget + "mm";
        break;
      case "IP":
        numTarget = Math.floor(clientHeight_CSS_in * 0.80);
        strTarget = numTarget + "in";
        break;
      default:
        units = "IP";
        numTarget = Math.floor(clientHeight_CSS_in * 0.80);
        strTarget = numTarget + "in";
        break;
    }
    divTarget.innerHTML = "";
    divTarget.appendChild(document.createTextNode(strTarget));
    if (numTarget === 0) {
      divCalibration.style.backgroundColor = "#808080";
      divCalLine.style.display = "none";
    } else {
      divCalibration.style.backgroundColor = "#FFFFFF";
      divCalLine.style.display = "block";
    }
  }

  function handleTouch(evt) {
    switch (evt.touches.length) {
      case 2:
        if (curr_dist_CSS_px) {
          curr_dist_CSS_px = Math.abs(evt.touches[1].clientX - evt.touches[0].clientX);
        } else {
          curr_dist_CSS_px = Math.abs(evt.touches[1].clientX - evt.touches[0].clientX);
          init_dist_CSS_px = curr_dist_CSS_px;
          init_calX_CSS_px = curr_calX_CSS_px;
        }
        curr_calX_CSS_px = init_calX_CSS_px * (curr_dist_CSS_px / init_dist_CSS_px);
        break;
      default:
        curr_dist_CSS_px = undefined;
        break;
    }
  }
  let divCancel = document.createElement("div");
  divCancel.style.display = "block";
  divCancel.style.position = "absolute";
  divCancel.redraw = function (width, height) {
    divCancel.style.left = 0 + "px";
    divCancel.style.top = 0 + "px";
    divCancel.style.width = (width / 2) + "px";
    divCancel.style.height = (height * 0.1) + "px";
  }
  divCalibration.appendChild(divCancel);
  divCancel.addEventListener("click", function () {
    divCalibration.remove();
  });
  let divSelect = document.createElement("div");
  divSelect.style.display = "block";
  divSelect.style.position = "absolute";
  divSelect.appendChild(document.createTextNode("Select"));
  divSelect.redraw = function (height, width) {
    divSelect.style.left = (width / 2) + "px";
    divSelect.style.top = 0 + "px";
    divSelect.style.width = (width / 2) + "px";
    divSelect.style.height = (height * 0.1) + "px";
  };
  divSelect.addEventListener("click", function () {
  });
  divCalibration.appendChild(divSelect);
}

// Register service worker to control making site work offline
let myServiceWorkerRegistration;
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then((registration) => {
    myServiceWorkerRegistration = registration;
  });
}

function remainder() {
  let mapFileHashes = new Map();

  let myCheck = new Worker("worker_check.js");
  myCheck.addEventListener("message", function (e) {
    console.log(e);
  });

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

  // let reader = response.body.getReader();
  // return arrayBufferFromStream(reader);


  function arrayBufferFromStream(reader) {
    return readAll(reader).then(collect);
    function readAll(reader) {
      function processChunk(thisChunk) {
        function addChunk(arrBody) {
          arrBody.unshift(thisChunk.value);
          return arrBody;
        }
        if (thisChunk.done) {
          return [];
        } else {
          return readAll(reader).then(addChunk);
        }
      }
      return reader.read().then(processChunk);
    }
    function collect(arrBody) {
      return (new Blob(arrBody)).arrayBuffer();
    }
  }

  // Check once every 10 seconds
  setInterval(checkIndexJS, 10000);
  function checkIndexJS() {
    checkForUpdate("index.js").then(prompt);
    function prompt(result) {
      if (result) {
        prompt_for_reload();
      }
    }
  }

  function prompt_for_reload() {
    // check for notification permission
    if (Notification.permission === "granted") {
      let myNotification = myServiceWorkerRegistration.showNotification("New Version", {
        dir: "auto",
        lang: "en-US",
        badge: "/WebInterface/icon.png",
        body: "index.js has changed.  Do you want to reload the page?",
        tag: "New index.js Version",
        icon: "/WebInterface/reload.png",
        image: "/WebInterface/icon.png",
        data: "",
        vibrate: [200, 100, 100],
        renotify: false,
        requireInteraction: false,
        actions: [
          {
            action: "Reload",
            title: "Yes",
            icon: "/WebInterface/reload.png",
          },
          {
            action: "Dismiss",
            title: "No",
            icon: "/WebInterface/icon.png",
          },
        ],
        silent: false,
      });
      /*
      let myNotification = new Notification("New Version", {
        dir: "auto",
        lang: "en-US",
        badge: "/WebInterface/icon.png",
        body: "index.js has changed.  Do you want to reload the page?",
        tag: "New index.js Version",
        icon: "/WebInterface/icon.png",
        image: "/WebInterface/icon.png",
        data: "",
        vibrate: [200, 100, 100],
        renotify: false,
        requireInteraction: false,
        silent: false,
      });
      */
      myNotification.addEventListener("click", function (evt) {
        switch (evt.action) {
          case "Reload":
            window.location.reload();
            return false;
          case "Dismiss":
            evt.target.close();
            break;
          default:
            alert("unknown action");
            break;
        }
      });
    } else {
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
      function getArrayBuffer() {
        return response.arrayBuffer();
      }
      return getArrayBuffer().then(hashValue);
      function hashValue(input) {
        thisValue = input;
        return crypto.subtle.digest("SHA-256", thisValue);
      }
    }
    function compareHash(hash) {
      let oldHash = mapFileHashes.get(url)
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
    // Create button to start sending notifications
    if ("Notification" in window) {
      let btnStartNotifications = document.createElement("button");
      btnStartNotifications.innerHTML = "Start Notifications";
      btnStartNotifications.addEventListener("click", function () {
        Notification.requestPermission().then(function(result) {
          console.log(result);
        });
      });
      document.body.appendChild(btnStartNotifications);
    }

    let btnTriggerPrompt = document.createElement("button");
    btnTriggerPrompt.innerHTML = "Trigger Prompt";
    btnTriggerPrompt.addEventListener("click", function () {
      prompt_for_reload();
    });
    document.body.appendChild(btnTriggerPrompt);


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

  window.addEventListener("message", function (e) {
    console.log(e);
  });

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
}
