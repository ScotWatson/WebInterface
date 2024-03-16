/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

// Start listening for messages from service worker
window.navigator.serviceWorker.addEventListener("message", function (evt) {
  console.log(evt.data);
});
window.navigator.serviceWorker.startMessages();

let min_touch_inch = 0.5; // minimum size of touch object (in inches)
let min_text_ratio = 0.007; // ratio of text height to viewing distance (unitless)

let px_per_inch = 96;
let view_dist_inch = 24;

const initPageTime = performance.now();

const loadErrorHandlingModule = import("https://scotwatson.github.io/Debug/20230705/ErrorLog.mjs");
loadErrorHandlingModule.then(function (module) {
  console.log(Object.getOwnPropertyNames(module));
}, fail);

const loadWindow = new Promise(function (resolve, reject) {
  window.addEventListener("load", function (evt) {
    resolve(evt);
  });
});

Promise.all( [ loadWindow, loadErrorHandlingModule ] ).then(start, fail).catch(fail);

let params = (new URL(window.location)).searchParams;
let mode = params.get("mode");
if (mode === undefined) {
  mode = "";
}

function fail(err) {
  console.log(err);
}

// Print Events
window.addEventListener("beforeprint", function (evt) {
  // fires when the associated document is about to be printed or previewed for printing
});
window.addEventListener("afterprint", function (evt) {
  // fires after the associated document has started printing or the print preview has been closed
});

// PWA Events
window.addEventListener("beforeinstallprompt", function (evt) {
  // fires on devices when a user is about to be prompted to "install" a web application
});

// Focus Events
window.addEventListener("blur", function (evt) {
  // fires when an element has lost focus
});
window.addEventListener("focus", function (evt) {
  // fires when an element has received focus
});

// Clipboard Events
window.addEventListener("copy", function (evt) {
  // fires when the user initiates a copy action through the browser's user interface
});
window.addEventListener("cut", function (evt) {
  // fired when the user has initiated a "cut" action through the browser's user interface
});
window.addEventListener("paste", function (evt) {
  // fires when the user has initiated a "paste" action through the browser's user interface
});
document.addEventListener("copy", function (evt) {
  // fires when the user initiates a copy action through the browser's user interface
});
document.addEventListener("cut", function (evt) {
  // fires when the user initiates a cut action through the browser's user interface
});
document.addEventListener("paste", function (evt) {
  // fires when the user initiates a paste action through the browser's user interface
});

// Device Orientation Events
window.addEventListener("deviceorientationabsolute", function (evt) {
  // fires when absolute device orientation changes
});

window.addEventListener("error", function (evt) {
  // fires on a Window object when a resource failed to load or couldn't be used — for example if a script has an execution error
});
window.addEventListener("gamepadconnected", function (evt) {
  // fires when the browser detects that a gamepad has been connected or the first time a button/axis of the gamepad is used
});
window.addEventListener("hashchange", function (evt) {
  // fires when the fragment identifier of the URL has changed (the part of the URL beginning with and following the # symbol)
});
window.addEventListener("languagechange", function (evt) {
  // fires at the global scope object when the user's preferred language changes
});

// Message Events
window.addEventListener("message", function (evt) {
  // fires on a Window object when the window receives a message, for example from a call to Window.postMessage() from another browsing context
});
window.addEventListener("messageerror", function (evt) {
  // fires on a Window object when it receives a message that can't be deserialized.
});

// Network Access Events
window.addEventListener("offline", function (evt) {
  // fires when the browser has lost access to the network and the value of Navigator.onLine switches to false
});
window.addEventListener("online", function (evt) {
  // fires when the browser has gained access to the network and the value of Navigator.onLine switches to true
});

window.addEventListener("pagehide", function (evt) {
  // fires when the browser hides the current page in the process of presenting a different page from the session's history
});
window.addEventListener("pageshow", function (evt) {
  // fires when the browser displays the window's document due to navigation
});

window.addEventListener("popstate", function (evt) {
  // fires when the active history entry changes while the user navigates the session history
});
window.addEventListener("storage", function (evt) {
  // fires when a storage area (localStorage) has been modified in the context of another document
});

// Debugging Events
window.addEventListener("rejectionhandled", function (evt) {
  // fires when a JavaScript Promise is rejected but after the promise rejection has been handled
});
window.addEventListener("unhandledrejection", function (evt) {
  // fires when a JavaScript Promise that has no rejection handler is rejected
});

// Page Loading Events
window.addEventListener("DOMContentLoaded", function (evt) {
  // fires when the HTML document has been completely parsed, and all deferred scripts (<script defer src="…"> and <script type="module">) have downloaded and executed
});
document.addEventListener("DOMContentLoaded", function (evt) {
  // fires when the initial HTML document has been completely loaded and parsed, without waiting for stylesheets, images, and subframes to finish loading
});
window.addEventListener("load", function (evt) {
  // fires when the whole page has loaded, including all dependent resources such as stylesheets and images
});
window.addEventListener("beforeunload", function (evt) {
  // fires when the window, the document and its resources are about to be unloaded
});
window.addEventListener("unload", function (evt) {
  // fires when the document or a child resource is being unloaded
  // It is fired after:
  //  - beforeunload (cancelable event)
  //  - pagehide
  // Use visibilitychange instead
});

document.addEventListener("fullscreenchange", function (evt) {
  // fires immediately after the browser switches into or out of fullscreen mode
});
document.addEventListener("fullscreenerror", function (evt) {
  // fires when the browser cannot switch to fullscreen mode
});

document.addEventListener("lostpointercapture", function (evt) {
  // fires when a captured pointer is released
});
document.addEventListener("pointerlockchange", function (evt) {
  // fires when the pointer is locked/unlocked
});
document.addEventListener("pointerlockerror", function (evt) {
  // fires when locking the pointer failed (for technical reasons or because the permission was denied)
});

document.addEventListener("readystatechange", function (evt) {
  // fires when the readyState attribute of a document has changed
});
document.addEventListener("scroll", function (evt) {
  // fires when the document view has been scrolled
});
document.addEventListener("selectionchange", function (evt) {
  // fires when the current Selection of a Document is changed
});
document.addEventListener("selectstart", function (evt) {
  // fires when a user starts a new selection
});
document.addEventListener("visibilitychange", function (evt) {
  // fires at the document when the contents of its tab have become visible or have been hidden
});

/*
afterscriptexecute
beforescriptexecute
mssitemodejumplistitemremoved
msthumbnailclick
*/

let user;

function start( [ evtWindow, moduleErrorHandling ] ) {
  window.addEventListener("resize", resize);
  switch (mode) {
    case "":
      user = "";
      loginScreen();
      break;
    case "standalone":
      user = "Anonymous";
      
      break;
    default:
      user = "";
      break;
  }
  document.body.style.boxSizing = "border-box";
  document.body.style.margin = "0";
  document.body.style.border = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";
  document.body.style.backgroundColor = "#808080";
  document.body.style.fontFamily = "standard";
  const btnHamburgerMenu = document.createElement("div");
  btnHamburgerMenu.style.display = "block";
  btnHamburgerMenu.style.position = "absolute";
  btnHamburgerMenu.style.top = "0px";
  btnHamburgerMenu.style.right = "0px";
  btnHamburgerMenu.style.width = (px_per_inch * min_touch_inch) + "px";
  btnHamburgerMenu.style.height = (px_per_inch * min_touch_inch) + "px";
  btnHamburgerMenu.style.backgroundColor = "white";
  btnHamburgerMenu.style.boxSizing = "border-box";
  btnHamburgerMenu.style.margin = "0px";
  btnHamburgerMenu.style.border = "1px solid black";
  btnHamburgerMenu.style.padding = "0px";
  btnHamburgerMenu.addEventListener("click", function () {
    mainHamburgerMenu();
  });
  document.body.appendChild(btnHamburgerMenu);
  const imgHamburgerMenu = document.createElement("img");
  imgHamburgerMenu.src = "Hamburger_icon.svg";
  imgHamburgerMenu.style.display = "block";
  imgHamburgerMenu.style.position = "absolute";
  imgHamburgerMenu.style.top = "0px";
  imgHamburgerMenu.style.left = "0px";
  imgHamburgerMenu.style.width = "100%";
  imgHamburgerMenu.style.height = "100%";
  imgHamburgerMenu.style.backgroundColor = "white";
  btnHamburgerMenu.appendChild(imgHamburgerMenu);
  const inpUsername = document.createElement("input");
  inpUsername.style.display = "block";
  inpUsername.style.boxSizing = "border-box";
  inpUsername.style.position = "absolute";
  inpUsername.style.left = "0px";
  inpUsername.style.top = (px_per_inch * min_touch_inch) + "px";
  inpUsername.style.width = "100%";
  inpUsername.style.height = (px_per_inch * min_touch_inch) + "px";
  inpUsername.style.padding = "0px";
  inpUsername.style.border = "5px solid black";
  inpUsername.style.margin = "0px";
  inpUsername.style.fontSize = (px_per_inch * min_text_ratio * view_dist_inch) + "px";
  inpUsername.setAttribute("placeholder", "Username");
  document.body.appendChild(inpUsername);
  const users = [ "vnfkjl iove", "oipfe jwna", "pkojij onj", "bjbh bfty", "uiunjwb nsw", "oknwn dips" ];
  const divUserScroll = document.createElement("div");
  divUserScroll.style.display = "block";
  divUserScroll.style.boxSizing = "border-box";
  divUserScroll.style.position = "absolute";
  divUserScroll.style.left = "0px";
  divUserScroll.style.top = 2 * (px_per_inch * min_touch_inch) + "px";
  divUserScroll.style.backgroundColor = "#C0C0C0";
  divUserScroll.style.padding = 0 + "px";
  divUserScroll.style.border = "0px";
  divUserScroll.style.margin = "0px";
  divUserScroll.style.width = "100%";
  divUserScroll.style.height = "100%";
  divUserScroll.style.overflow = "hidden auto";
  document.body.appendChild(divUserScroll);
  const divUsers = document.createElement("div");
  divUsers.style.display = "flex";
  divUsers.style.flexFlow = "row wrap";
  divUsers.style.justifyContent = "space-around";
  divUsers.style.boxSizing = "border-box";
  divUsers.style.width = "100%";
  divUsers.style.backgroundColor = "#A0A0A0";
  divUsers.style.paddingLeft = (px_per_inch * min_touch_inch) + "px";
  divUsers.style.paddingRight = 0 + "px";
  divUsers.style.paddingTop = 0 + "px";
  divUsers.style.paddingBottom = 0 + "px";
  divUsers.style.border = "0px";
  divUsers.style.margin = "0px";
  divUsers.style.backgroundImage = "url(ScrollGutter.svg)";
  divUsers.style.backgroundSize = (px_per_inch * min_touch_inch) + "px " + (px_per_inch * min_touch_inch) + "px";
  divUsers.style.backgroundPosition = "left top";
  divUsers.style.backgroundRepeat = "repeat-y";
  divUserScroll.appendChild(divUsers);
  for (const thisUser of users) {
    const divUser = document.createElement("div");
    divUser.style.display = "flex";
    divUser.style.flexFlow = "column nowrap";
    divUser.style.justifyContent = "space-around";
    divUser.style.alignItems = "center";
    divUser.style.boxSizing = "border-box";
    divUser.style.width = 2 * (px_per_inch * min_touch_inch) + "px";
    divUser.style.height = 2 * (px_per_inch * min_touch_inch) + "px";
    divUser.style.textAlign = "center";
    divUser.style.backgroundColor = "#808080";
    const imgUser = document.createElement("img");
    imgUser.src = "Anonymous.webp";
    imgUser.style.display = "inline-block";
    imgUser.style.boxSizing = "border-box";
    imgUser.style.width = "80%";
    imgUser.style.height = "80%";
    const divUsername = document.createElement("div");
    divUsername.innerHTML = thisUser;
    divUsername.style.display = "block";
    divUsername.style.boxSizing = "border-box";
    divUsername.style.backgroundColor = "#E0E080";
    divUsername.style.fontSize = (px_per_inch * min_text_ratio * view_dist_inch) + "px";
    divUsername.style.width = "100%";
    divUsername.style.height = "20%";
    divUsername.style.userSelect = "none";
    divUsername.style.textAlign = "center";
    divUsername.style.textOverflow = "ellipsis";
    divUsername.style.whiteSpace = "nowrap";
    divUser.appendChild(imgUser);
    divUser.appendChild(divUsername);
    divUsers.appendChild(divUser);
  }
  resize();
}

function resize() {
//  window.innerWidth + window.innerHeight;
}

function mainHamburgerMenu() {
  const divMenu = document.createElement("div");
  divMenu.style.display = "block";
  divMenu.style.position = "absolute";
  divMenu.style.left = "0";
  divMenu.style.top = "0";
  divMenu.style.width = "100%";
  divMenu.style.height = "100%";
  divMenu.style.boxSizing = "border-box";
  divMenu.style.backgroundColor = "#E0E0E0";
  document.body.appendChild(divMenu);
  const divScroll = document.createElement("div");
  divScroll.style.display = "block";
  divScroll.style.position = "absolute";
  divScroll.style.top = (px_per_inch * min_touch_inch) + "px";
  divScroll.style.width = "100%";
  divScroll.style.height = "calc(100% - " + (px_per_inch * min_touch_inch) + "px)";
  divScroll.style.boxSizing = "border-box";
  divScroll.style.backgroundColor = "#C0C0C0";
  divScroll.style.margin = "0";
  divScroll.style.border = "0";
  divScroll.style.padding = "0";
  divScroll.style.overflow = "hidden auto";
  divScroll.setAttribute("class", "invisible-scrollbar");
  divMenu.appendChild(divScroll);
  const divList = document.createElement("div");
  divList.style.display = "flex";
  divList.style.flexFlow = "column wrap";
  divList.style.justifyContent = "space-around";
  divList.style.boxSizing = "border-box";
  divList.style.backgroundColor = "#A0A0A0";
  divList.style.margin = "0";
  divList.style.border = "0";
  divList.style.paddingLeft = (px_per_inch * min_touch_inch) + "px";
  divList.style.paddingRight = "0";
  divList.style.paddingTop = "0";
  divList.style.paddingBottom = "0";
  divList.style.backgroundImage = "url(ScrollGutter.svg)";
  divList.style.backgroundSize = (px_per_inch * min_touch_inch) + "px " + (px_per_inch * min_touch_inch) + "px";
  divList.style.backgroundPosition = "left top";
  divList.style.backgroundRepeat = "repeat-y";
  divScroll.appendChild(divList);
  const items = [
    {
      caption: "Toggle Full Screen",
      action: toggleFullscreen,
    },
    {
      caption: "Add User",
      action: addUser,
    },
    {
      caption: "Calibrate Screen",
      action: addUser,
    },
    {
      caption: "Set Viewing Distance",
      action: addUser,
    },
    {
      caption: "Set Minimum Text Size",
      action: addUser,
    },
    {
      caption: "Set Minimum Touch Size",
      action: addUser,
    },
    {
      caption: "other",
      action: addUser,
    },
    {
      caption: "other",
      action: addUser,
    },
    {
      caption: "other",
      action: addUser,
    },
    {
      caption: "other",
      action: addUser,
    },
    {
      caption: "other",
      action: addUser,
    },
    {
      caption: "other",
      action: addUser,
    },
    {
      caption: "other",
      action: addUser,
    },
    {
      caption: "other",
      action: addUser,
    },
  ];
  const btnCancel = document.createElement("div");
  btnCancel.style.display = "block";
  btnCancel.style.position = "absolute";
  btnCancel.style.top = "0";
  btnCancel.style.right = "0";
  btnCancel.style.width = (px_per_inch * min_touch_inch) + "px";
  btnCancel.style.height = (px_per_inch * min_touch_inch) + "px";
  btnCancel.style.boxSizing = "border-box";
  btnCancel.style.backgroundColor = "#00E0E0";
  btnCancel.style.margin = "0";
  btnCancel.style.border = "0";
  btnCancel.style.padding = "0";
  btnCancel.addEventListener("click", function (evt) {
    divMenu.remove();
  });
  divMenu.appendChild(btnCancel);
  const imgCancel = document.createElement("img");
  imgCancel.src = "LeftArrowIcon.png"
  imgCancel.style.width = "100%";
  imgCancel.style.height = "100%";
  imgCancel.style.boxSizing = "border-box";
  imgCancel.style.margin = "0";
  imgCancel.style.border = "0";
  imgCancel.style.padding = "0";
  btnCancel.appendChild(imgCancel);
  for (const item of items) {
    const btnItem = document.createElement("div");
    btnItem.style.width = "100%";
    btnItem.style.height = "50px";
    btnItem.style.boxSizing = "border-box";
    btnItem.style.backgroundColor = "#808080";
    btnItem.style.margin = "0";
    btnItem.style.border = "0";
    btnItem.style.padding = "5%";
    btnItem.appendChild(document.createTextNode(item.caption));
    btnItem.addEventListener("click", function (evt) {
      divMenu.remove();
      item.action();
    });
    divList.appendChild(btnItem);
  }
  function toggleFullscreen() {
    if (document.fullscreenElement === null) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  function addUser() {
  }
}

function loginScreen() {
  const inpUsername = document.createElement("input");
  const inpPassword = document.createElement("input");
  const btnLogin = document.createElement("div");
  btnLogin.innerHTML = "Login";
  btnLogin.addEventListener("click", function (evt) {
    
  });
  const btnLoginAnonymous = document.createElement("div");
  btnLoginAnonymous.innerHTML = "Login as Anonymous";
  btnLoginAnonymous.addEventListener("click", function (evt) {
    
  });
}


let clientWidth_CSS_px;
let clientHeight_CSS_px;
let clientWidth_CSS_in;
let clientHeight_CSS_in;
let clientWidth_CSS_mm;
let clientHeight_CSS_mm;

class User {
  constructor(objParams) {
    if (typeof objParams.username !== "string") {
      throw new Error("Invalid Username");
    }
    this.username = objParams.username;
    if ((typeof objParams.authentication !== "object") || (objParams.authentication === null)) {
      throw new Error("Invalid Authentication");
    }
    switch (objParams.authentication.type) {
      case "password":
        if (!(objParams.authentication.hash instanceof ArrayBuffer)) {
          throw new Error("Invalid Hash");
        }
        if (objParams.authentication.hash.byteLength != 32) {
          throw new Error("Invalid Hash");
        }
      default:
        throw new Error("Invalid Authentication Type");
    }
  }
  save() {
    let ret = {};
    ret.username = this.username;
  }
  login() {
  }
  logout () {
  }
}

let MapUsers = new Map();

function AddUser(objParams) {
  if (typeof objParams.username !== "string") {
    throw new Error("Invalid Username");
  }
  wifMapUsers.set(objParams.username, new wifUser(objParams));
}
function RemoveUser(username) {
  if (typeof username !== "string") {
    throw new Error("Invalid Username");
  }
  wifMapUsers.delete(username);
}

function wifCreateFullClientDiv() {
  let div = document.createElement();
  div.style.display = "block";
  div.style.position = "absolute";
  div.style.left = "0px";
  div.style.top = "0px";
  div.style.width = clientWidth_CSS_px + "px";
  div.style.height = clientHeight_CSS_px + "px";
  divCalibration.redraw = function (width, height) {
    redrawChildren(divCalibration, width, height);
  };
  document.body.appendChild(div);
  return div;
}

let units = "IP";

let CSS_multiplier = 1;
/*
window.addEventListener("load", function (evt) {
  document.body.style.overflow = "none";
  wifResizeClient();
  startCalibrationX();
});
*/
class wifSelectorList extends HTMLElement {
  constructor(objParams) {
    if (!(objParams.options instanceof Array)) {
      throw new Error('Invalid options');
    }
    super();
    const thisShadow = this.attachShadow({mode: 'open'});
    const style = document.createElement('style');
    const divTop = document.createElement('div');
    divTop.style.display = 'block';
    divTop.style.position = 'absolute';
    divTop.style.left = 0 + 'px';
    divTop.style.top = 0 + 'px';
    divTop.style.width = 0 + 'px';
    divTop.style.height = 0 + 'px';
    divTop.style.overflowX = 'hidden';
    divTop.style.overflowY = 'scroll';
    const divList = document.createElement('div');
    let divItem;
    for (let option of objParams.options) {
      divItem = document.createElement('div');
      divItem.style.display = 'block';
      divItem.style.position = 'absolute';
      divItem.style.left = 0 + 'px';
      divItem.style.top = 0 + 'px';
      divItem.style.width = 0 + 'px';
      divItem.style.height = 0 + 'px';
    }
  }
}

// customElements.define('wif-SelectorList', wifSelectorList);

function wifShowUsers() {
  const divMain = wifCreateFullClientDiv();
  
}
/*
window.addEventListener("resize", wifResizeClient);
*/
function wifResizeClient() {
  clientWidth_CSS_px = window.innerWidth;
  clientHeight_CSS_px = window.innerHeight;
  clientWidth_CSS_in = clientWidth_CSS_px / 96;
  clientHeight_CSS_in = clientHeight_CSS_px / 96;
  clientWidth_CSS_mm = clientWidth_CSS_in * 25.4;
  clientHeight_CSS_mm = clientHeight_CSS_in * 25.4;
  wifRedrawChildren(document.body, clientWidth_CSS_px, clientHeight_CSS_px);
}

function wifRedrawChildren(parent, width, height) {
  for (let child of parent.children) {
    if (child.redraw) {
      child.redraw(width, height);
    }
  }
}

function startCalibrationX() {
  let curr_calX_CSS_px = clientWidth_CSS_px * 0.80;
  const divCalibration = wifCreateFullClientDiv();
  const divCalLine = wifCreateDiv(divCalibration);
  const divTarget = wifCreateDiv(divCalibration);
  const divCancel = wifCreateDiv(divCalibration);
  const divSelect = wifCreateDiv(divCalibration);
  wifResizeClient();
  window.addEventListener("resize", updateTarget);
  // calibration interface
  divCalibration.style.backgroundColor = "#FFFFFF";

  divCalLine.style.display = "block";
  divCalLine.style.position = "absolute";
  divCalLine.style.left = (clientWidth_CSS_px * 0.10) + "px";
  divCalLine.style.top = (clientHeight_CSS_px * 0.10) + "px";
  divCalLine.style.height = 4 + "px";
  divCalLine.style.backgroundColor = "black";
  divCalibration.appendChild(divCalLine);
  divTarget.style.display = "block";
  divTarget.style.position = "absolute";
  divTarget.style.left = (clientWidth_CSS_px * 0.50) + "px";
  divTarget.style.top = (clientHeight_CSS_px * 0.50) + "px";
  divTarget.style.width = (clientWidth_CSS_px * 0.25) + "px";
  divTarget.style.height = (clientHeight_CSS_px * 0.25) + "px";
  divCalibration.appendChild(divTarget);
  divCancel.style.display = "block";
  divCancel.style.position = "absolute";
  divCancel.appendChild(document.createTextNode("Cancel"));
  divCancel.redraw = function (width, height) {
    divCancel.style.left = 0 + "px";
    divCancel.style.top = 0 + "px";
    divCancel.style.width = (width / 2) + "px";
    divCancel.style.height = (height * 0.1) + "px";
  }
  divCancel.addEventListener("click", function () {
    divCalibration.remove();
  });
  divCalibration.appendChild(divCancel);
  divSelect.style.display = "block";
  divSelect.style.position = "absolute";
  divSelect.appendChild(document.createTextNode("Select"));
  divSelect.redraw = function (width, height) {
    divSelect.style.left = (width / 2) + "px";
    divSelect.style.top = 0 + "px";
    divSelect.style.width = (width / 2) + "px";
    divSelect.style.height = (height * 0.1) + "px";
  };
  divSelect.addEventListener("click", function () {
  });
  divCalibration.appendChild(divSelect);

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
    divCalLine.style.width = curr_calX_CSS_px + "px";
  }
  
  let calX_dist_ratio;

  function handleTouch(evt) {
    let curr_dist_CSS_px;
    evt.preventDefault();
    switch (evt.touches.length) {
      case 2:
        curr_dist_CSS_px = Math.abs(evt.touches[1].clientX - evt.touches[0].clientX);
        console.log("calX_dist_ratio: " + calX_dist_ratio);
        if (!calX_dist_ratio) {
          console.log("Change Ratio");
          console.log(curr_calX_CSS_px, curr_dist_CSS_px);
          calX_dist_ratio = curr_calX_CSS_px / curr_dist_CSS_px;
          console.log("new calX_dist_ratio: " + calX_dist_ratio);
        }
        curr_calX_CSS_px = curr_dist_CSS_px * calX_dist_ratio;
        break;
      default:
        calX_dist_ratio = undefined;
        break;
    }
    console.log(curr_dist_CSS_px, curr_calX_CSS_px, calX_dist_ratio);
    divCalLine.style.width = curr_calX_CSS_px + "px";
    return false;
  }
}
/*
// Register service worker to control making site work offline
let myServiceWorkerRegistration;
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then((registration) => {
    myServiceWorkerRegistration = registration;
  });
}
*/
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


  function windowLoad() {
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
  }
/*
  window.addEventListener("resize", resize);
*/

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
