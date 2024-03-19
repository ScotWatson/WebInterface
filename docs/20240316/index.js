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

Promise.all( [ loadWindow, loadErrorHandlingModule ] ).then(start, fail);

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
/*
window.addEventListener("unload", function (evt) {
  // fires when the document or a child resource is being unloaded
  // It is fired after:
  //  - beforeunload (cancelable event)
  //  - pagehide
  // Use visibilitychange instead
});
*/

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

const DEFAULT_SETTINGS = {
  
};

function start( [ evtWindow, moduleErrorHandling ] ) {
  let users;
  function createNewUser({
    username,
  }) {
    const newUserId = self.crypto.randomUUID();
    const newUser = {
      username: username,
      id: newUserId,
    };
    users.push(newUser);
    window.siteLocalStorage.set("Users", JSON.stringify(users));
    const newUserInfo = {
      settings: self.structuredClone(DEFAULT_SETTINGS),
    };
    window.siteLocalStorage.set("User:" + newUserId, JSON.stringify(newUserInfo));
  }
  const usersJSON = window.siteLocalStorage.get("Users");
  if (usersJSON === null) {
    users = [];
    createNewUser({
      username: "User",
    });
  } else {
    users = JSON.parse(usersJSON);
  }

  // Returns a CSS string for a touch element, sized in terms of a factor times the minimum size
  function touchCss({
    factor,
  }) {
    return (factor * px_per_inch * min_touch_inch) + "px";
  }
  function createEventManager({
    element,
    eventName,
  }) {
    const obj = {};
    const handlers = new Set();
    obj.addListener = function ({
      handler,
    }) {
      handlers.add(handler);
      element.addEventListener(eventName, handler);
    }
    obj.removeListener = function ({
      handler,
    }) {
      handlers.delete(handler);
      element.removeEventListener(eventName, handler);
    }
    obj.removeAllListeners = function () {
      for (const handler of handlers) {
        element.removeEventListener(eventName, handler);
      }
    }
    return obj;
  }
  function createRootSet({
    element,
  }) {
    const roots = new Set();
    const obj = {};
    obj.createRoot = function () {
      const contentRoot = document.createElement("div");
      contentRoot.style.display = "none";
      contentRoot.style.width = "100%";
      contentRoot.style.height = "100%";
      element.appendChild(contentRoot);
      roots.add(contentRoot);
      const contents = new Set();
      const objRoot = {};
      objRoot.addObject = function ({
        objectId,
        parameters,
      }) {
        const newObject = createObject({
          objectId,
          parameters,
          parent: contentRoot,
        });
        contents.add(newObject);
        return newObject;
      };
      objRoot.show = function () {
        for (const root of roots) {
          root.style.display = "none";
        }
        contentRoot.style.display = "block";
      };
      objRoot.hide = function () {
        contentRoot.style.display = "none";
      };
      objRoot.remove = function () {
        contentRoot.style.display = "none";
        for (const object of contents) {
          object.remove();
        }
      };
      return objRoot;
    };
    return obj;
  }
  function initBody() {
    document.body.style.boxSizing = "border-box";
    document.body.style.margin = "0";
    document.body.style.border = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    const bodyDiv = document.createElement("div");
    bodyDiv.style.width = "100%";
    bodyDiv.style.height = "100%";
    bodyDiv.style.boxSizing = "border-box";
    bodyDiv.style.margin = "0";
    bodyDiv.style.border = "0";
    bodyDiv.style.padding = "0";
    bodyDiv.style.overflow = "hidden";
    bodyDiv.style.backgroundColor = "#808080";
    document.body.appendChild(bodyDiv);
    function resize() {
      console.log(window.innerHeight);
      bodyDiv.style.height = window.innerHeight + "px";
    }
    window.addEventListener("resize", resize);
    resize();
    const obj = {};
    const rootSet = createRootSet({
      element: bodyDiv,
    });
    obj.createContentRoot = function () {
      return rootSet.createRoot();
    };
    obj.remove = function () {
      window.removeEventListener(resize);
      bodyDiv.remove();
    };
    return obj;
  }
  
  const OBJECT_FUNCTIONS = new Map();
  const OBJECT_LIST      = "1b86fbea-6abc-4b65-9189-d4a6033fe8bf";
  OBJECT_FUNCTIONS.set(OBJECT_LIST, createList);
  const OBJECT_TILES     = "35017865-1b42-430b-9fc3-61cece306d6d";
  OBJECT_FUNCTIONS.set(OBJECT_TILES, createTiles);
  const OBJECT_IMAGE     = "92fcd3cb-76bb-47a5-8693-31a8bbd19739";
  OBJECT_FUNCTIONS.set(OBJECT_IMAGE, createImage);
  const OBJECT_BLANK_DIV = "9db9ca53-1d3b-49a9-9d22-8b1d08177c92";
  OBJECT_FUNCTIONS.set(OBJECT_BLANK_DIV, createBlankDiv);
  const OBJECT_TEXT      = "f2666550-108e-47e3-8154-762b1acc1936";
  OBJECT_FUNCTIONS.set(OBJECT_TEXT, createText);
  function createObject({
    objectId,
    parameters,
    parent,
  }) {
    const objectConstructor = OBJECT_FUNCTIONS.get(objectId);
    if (typeof objectConstructor !== "function") {
      console.error("Object ID is not recognized: " + objectId);
    }
    const newObject = objectConstructor({
      parameters,
      parent,
    });
    return newObject;
  }
  function createBlankDiv({
    parameters,
    parent,
  }) {
    const div = document.createElement("div");
    div.style.display = "block";
    div.style.position = "absolute";
    div.style.top = parameters.top;
    div.style.left = parameters.left;
    div.style.width = parameters.width;
    div.style.height = parameters.height;
    div.style.backgroundColor = "white";
    div.style.boxSizing = "border-box";
    div.style.margin = "0px";
    div.style.border = "0px";
    div.style.padding = "0px";
    parent.appendChild(div);
    const obj = {};
    const rootSet = createRootSet({
      element: div,
    });
    const clickManager = createEventManager({
      element: div,
      eventName: "click",
    });
    obj.addClickListener = function ({
      handler,
    }) {
      clickManager.addListener({ handler });
    };
    obj.removeClickListener = function ({
      handler,
    }) {
      clickManager.removeListener({ handler });
    };
    obj.createContentRoot = function () {
      return rootSet.createRoot();
    };
    obj.remove = function () {
      clickManager.removeAllListeners();
      div.remove();
    };
    return obj;
  }
  function createImage({
    parameters,
    parent,
  }) {
    const img = document.createElement("img");
    img.src = parameters.src;
    img.style.display = "block";
    img.style.position = "absolute";
    img.style.top = parameters.top;
    img.style.left = parameters.left;
    img.style.width = parameters.width;
    img.style.height = parameters.height;
    img.style.backgroundColor = "white";
    parent.appendChild(img);
    const obj = {};
    const clickManager = createEventManager({
      element: img,
      eventName: "click",
    });
    obj.addClickListener = function ({
      handler,
    }) {
      clickManager.addListener({ handler });
    };
    obj.removeClickListener = function ({
      handler,
    }) {
      clickManager.removeListener({ handler });
    };
    obj.remove = function () {
      clickManager.removeAllListeners();
      img.remove();
    };
    obj.setSrc = function ({
      src,
    }) {
      img.src = src;
    };
    return obj;
  }
  function createText({
    parameters,
    parent,
  }) {
    const span = document.createElement("span");
    span.append(parameters.text);
    span.style.display = "block";
    span.style.verticalAlign = "center";
    span.style.textAlign = "center";
    span.style.position = "absolute";
    span.style.top = parameters.top;
    span.style.left = parameters.left;
    span.style.width = parameters.width;
    span.style.height = parameters.height;
    span.style.fontSize = (parameters.fontSizeFactor * min_text_ratio * view_dist_inch * px_per_inch) + "px";
    span.style.lineHeight = parameters.height;
    span.style.backgroundColor = "white";
    parent.appendChild(span);
    const obj = {};
    const clickManager = createEventManager({
      element: span,
      eventName: "click",
    });
    obj.addClickListener = function ({
      handler,
    }) {
      clickManager.addListener({ handler });
    };
    obj.removeClickListener = function ({
      handler,
    }) {
      clickManager.removeListener({ handler });
    };
    obj.remove = function () {
      clickManager.removeAllListeners();
      span.remove();
    };
    obj.setText = function ({
      text,
    }) {
      span.innerHTML = "";
      span.append(text);
    };
    return obj;
  }
  function createTiles({
    parameters,
    parent,
  }) {
    const div = document.createElement("div");
    div.style.display = "block";
    div.style.boxSizing = "border-box";
    div.style.position = "absolute";
    div.style.left = parameters.left;
    div.style.top = parameters.top;
    div.style.backgroundColor = "#C0C0C0";
    div.style.padding = "0px";
    div.style.border = "0px";
    div.style.margin = "0px";
    div.style.width = parameters.width;
    div.style.height = parameters.height;
    div.style.overflow = "hidden auto";
    const divItems = document.createElement("div");
    divItems.style.display = "flex";
    divItems.style.flexFlow = "row wrap";
    divItems.style.justifyContent = "space-around";
    divItems.style.boxSizing = "border-box";
    divItems.style.width = "100%";
    divItems.style.backgroundColor = "#A0A0A0";
    divItems.style.paddingLeft = touchCss({ factor: 1 });
    divItems.style.paddingRight = "0px";
    divItems.style.paddingTop = "0px";
    divItems.style.paddingBottom = "0px";
    divItems.style.border = "0px";
    divItems.style.margin = "0px";
    divItems.style.backgroundImage = "url(ScrollGutter.svg)";
    divItems.style.backgroundSize = touchCss({ factor: 1 }) + " " + touchCss({ factor: 1 });
    divItems.style.backgroundPosition = "left top";
    divItems.style.backgroundRepeat = "repeat-y";
    divItems.style.minHeight = "100%";
    div.appendChild(divItems);
    parent.appendChild(div);
    const obj = {};
    obj.addItem = function ({
      imgSrc,
      itemName,
    }) {
      const sizeFactor = 2;
      const fontsize = (px_per_inch * min_text_ratio * view_dist_inch);
      const itemSize = sizeFactor * (px_per_inch * min_touch_inch);
      const divItem = document.createElement("div");
      divItem.style.display = "flex";
      divItem.style.flexFlow = "column nowrap";
      divItem.style.justifyContent = "space-around";
      divItem.style.alignItems = "center";
      divItem.style.boxSizing = "border-box";
      divItem.style.width = itemSize + "px";
      divItem.style.height = itemSize + "px";
      divItem.style.textAlign = "center";
      divItem.style.backgroundColor = "#808080";
      const imgItem = document.createElement("img");
      imgItem.src = imgSrc;
      imgItem.style.display = "inline-block";
      imgItem.style.boxSizing = "border-box";
      imgItem.style.width = "100%";
      imgItem.style.height = (itemSize - fontsize) + "px";
      const divItemName = document.createElement("div");
      divItemName.append(itemName);
      divItemName.style.display = "table-cell";
      divItemName.style.verticalAlign = "center";
      divItemName.style.boxSizing = "border-box";
      divItemName.style.backgroundColor = "#E0E080";
      divItemName.style.fontSize = fontsize + "px";
      divItemName.style.width = "100%";
      divItemName.style.height = divItemName.style.fontSize;
      divItemName.style.userSelect = "none";
      divItemName.style.textAlign = "center";
      divItemName.style.textOverflow = "ellipsis";
      divItemName.style.whiteSpace = "nowrap";
      divItem.appendChild(imgItem);
      divItem.appendChild(divItemName);
      divItems.appendChild(divItem);
      const itemObj = {};
      const clickManager = createEventManager({
        element: divItem,
        eventName: "click",
      });
      itemObj.addClickListener = function ({
        handler,
      }) {
        clickManager.addListener({ handler });
      };
      itemObj.removeClickListener = function ({
        handler,
      }) {
        clickManager.removeListener({ handler });
      };
      itemObj.remove = function () {
        clickManager.removeAllListeners();
        divItem.remove();
      };
      return itemObj;
    };
    return obj;
  }
  function createList({
    parameters,
    parent,
  }) {
    const div = document.createElement("div");
    div.style.display = "block";
    div.style.position = "absolute";
    div.style.top = parameters.top;
    div.style.left = parameters.left;
    div.style.width = parameters.width;
    div.style.height = parameters.height;
    div.style.boxSizing = "border-box";
    div.style.backgroundColor = "#C0C0C0";
    div.style.margin = "0";
    div.style.border = "0";
    div.style.padding = "0";
    div.style.overflow = "hidden auto";
    div.setAttribute("class", "invisible-scrollbar");
    parent.appendChild(div);
    const divList = document.createElement("div");
    divList.style.display = "flex";
    divList.style.flexFlow = "column wrap";
    divList.style.justifyContent = "space-around";
    divList.style.boxSizing = "border-box";
    divList.style.backgroundColor = "#A0A0A0";
    divList.style.margin = "0";
    divList.style.border = "0";
    divList.style.paddingLeft = touchCss({ factor: 1 });
    divList.style.paddingRight = "0";
    divList.style.paddingTop = "0";
    divList.style.paddingBottom = "0";
    divList.style.backgroundImage = "url(ScrollGutter.svg)";
    divList.style.backgroundSize = touchCss({ factor: 1 }) + " " + touchCss({ factor: 1 });
    divList.style.backgroundPosition = "left top";
    divList.style.backgroundRepeat = "repeat-y";
    div.appendChild(divList);
    const obj = {};
    obj.addItem = function ({
      itemName,
    }) {
      const divItem = document.createElement("div");
      divItem.style.width = "100%";
      divItem.style.height = "50px";
      divItem.style.boxSizing = "border-box";
      divItem.style.backgroundColor = "#808080";
      divItem.style.margin = "0";
      divItem.style.border = "0";
      divItem.style.padding = "5%";
      divItem.append(itemName);
      divList.appendChild(divItem);
      const objItem = {};
      const clickManager = createEventManager({
        element: divItem,
        eventName: "click",
      });
      objItem.addClickListener = function ({
        handler,
      }) {
        clickManager.addListener({ handler });
      };
      objItem.removeClickListener = function ({
        handler,
      }) {
        clickManager.removeListener({ handler });
      };
      objItem.remove = function () {
        clickManager.removeAllListeners();
        divItem.remove();
      };
      return objItem;
    };
    return obj;
  }

  
  const main = initBody();
  const mainRoot = main.createContentRoot();
  const appHeader = mainRoot.addObject({
    objectId: OBJECT_TEXT,
    parameters: {
      top: "0px",
      left: "0px",
      width: "calc(100% - " + touchCss({ factor: 1 }) + ")",
      height: touchCss({ factor: 1 }),
      fontSizeFactor: 2,
      text: "Web Interface",
    },
  });
  const imgHamburgerMenu = mainRoot.addObject({
    objectId: OBJECT_IMAGE,
    parameters: {
      top: "0px",
      left: "(100% - " + touchCss({ factor: 1 }) + ")",
      width: touchCss({ factor: 1 }),
      height: touchCss({ factor: 1 }),
      src: "Hamburger_icon.svg",
    },
  });
  imgHamburgerMenu.addClickListener({ handler: showHamburgerMenu });
  const mainWindow = mainRoot.addObject({
    objectId: OBJECT_BLANK_DIV,
    parameters: {
      left: "0px",
      top: touchCss({ factor: 1 }),
      width: "100%",
      height: "calc(100% - " + touchCss({ factor: 1 }) + ")",
    },
  });
  const mainWindowRoot = mainWindow.createContentRoot();
  const userTiles = mainWindowRoot.addObject({
    objectId: OBJECT_TILES,
    parameters: {
      left: "0px",
      top: "0px",
      width: "100%",
      height: "100%",
    },
  });
  for (const thisUser of users) {
    userTiles.addItem({
      imgSrc: "Anonymous.webp",
      itemName: thisUser.username,
    });
  }
  mainWindowRoot.show();
  mainRoot.show();
  (function () {})();
  const hamburgerMenuRoot = mainWindow.createContentRoot();
  const menuList = hamburgerMenuRoot.addObject({
    objectId: OBJECT_LIST,
    parameters: {
      top: "0px",
      left: "0px",
      width: "100%",
      height: "100%",
    },
  });
  menuList.addItem({
    itemName: "Toggle Full Screen",
  }).addClickListener({
    handler: toggleFullscreen,
  });
  menuList.addItem({
    itemName: "Add User",
  }).addClickListener({
    handler: addUser,
  });
  menuList.addItem({
    itemName: "Calibrate Screen",
  });
  menuList.addItem({
    itemName: "Set Viewing Distance",
  });
  menuList.addItem({
    itemName: "Set Minimum Text Size",
  });
  menuList.addItem({
    itemName: "Set Minimum Touch Size",
  });
  menuList.addItem({
    itemName: "other",
  });
  menuList.addItem({
    itemName: "other",
  });
  menuList.addItem({
    itemName: "other",
  });
  menuList.addItem({
    itemName: "other",
  });
  menuList.addItem({
    itemName: "other",
  });
  menuList.addItem({
    itemName: "other",
  });
  menuList.addItem({
    itemName: "other",
  });
  function showHamburgerMenu() {
    console.log("show");
    imgHamburgerMenu.setSrc({ src: "LeftArrowIcon.png" });
    hamburgerMenuRoot.show();
    imgHamburgerMenu.addClickListener({ handler: hideHamburgerMenu });
    imgHamburgerMenu.removeClickListener({ handler: showHamburgerMenu });
  }
  function hideHamburgerMenu() {
    imgHamburgerMenu.setSrc({ src: "Hamburger_icon.svg" });
    mainWindowRoot.show();
    imgHamburgerMenu.addClickListener({ handler: showHamburgerMenu });
    imgHamburgerMenu.removeClickListener({ handler: hideHamburgerMenu });
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

  function loginScreen() {
    const inpUsername = document.createElement("input");
    const inpPassword = document.createElement("input");
    const btnLogin = document.createElement("div");
    btnLogin.innerHTML = "Login";
    btnLogin.addEventListener("click", function (evt) {
      
    });
  }
}
/*
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
function wifResizeClient() {
  clientWidth_CSS_px = window.innerWidth;
  clientHeight_CSS_px = window.innerHeight;
  clientWidth_CSS_in = clientWidth_CSS_px / 96;
  clientHeight_CSS_in = clientHeight_CSS_px / 96;
  clientWidth_CSS_mm = clientWidth_CSS_in * 25.4;
  clientHeight_CSS_mm = clientHeight_CSS_in * 25.4;
  wifRedrawChildren(document.body, clientWidth_CSS_px, clientHeight_CSS_px);
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
*/
