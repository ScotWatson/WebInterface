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

const initPageTime = performance.now();

const loadErrorHandlingModule = import("https://scotwatson.github.io/Debug/20230705/ErrorLog.mjs");

const loadInterface = loadWindow.then(function () {
  return import("./interface.mjs");
});

Promise.all( [ loadInterface, loadErrorHandlingModule ] ).then(start, fail);

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

const types = new Map();
types.set("ArrayBuffer", {
  serializer: serializerArrayBuffer,
  deserializer: deserializerArrayBuffer,
});
types.set("Uint8Array", {
  serializer: serializerUint8Array,
  deserializer: deserializerUint8Array,
});
function serialize(obj) {
  serializer(obj);
  return JSON.serialize(obj);
}
function serializer(obj) {
  let ret = {};
  ret._types = {};
  for (const propertyName in obj) {
    switch (typeof obj[propertyName]) {
      case "object": {
        if (obj.constructor.name === "Object") {
          obj[propertyName] = serializer(obj[propertyName]);
        } else {
          const functions = types.get(obj.constructor.name);
          if (serializerFunction === undefined) {
            throw "Unrecognized Type";
          }
          ret._types[propertyName] = obj.constructor.name;
          ret[propertyName] = functions.serializer(obj);
        }
      }
        break;
      case "number":
      case "array":
      case "date":
      case "string": {
        return obj;
      }
        break;
      default: {
        throw "Unrecognized Type";
      }
        break;
    };
  }
  return ret;
}
function deserialize(str) {
  const obj = JSON.parse(str);
  deserializer(obj);
  return obj;
}
function deserializer(obj) {
  for (const propertyName in obj) {
    if (typeof obj[propertyName] === "object") {
      if (obj[propertyName].constructor.name === "Object") {
        deserializer(obj[propertyName]);
      }
    }
  }
  if ((typeof obj._types === "object") && (obj._types !== null)) {
    for (const propertyName in obj._types) {
      const functions = types.get(obj._types[propertyName]);
      if (functions === undefined) {
        console.warn(obj._types + "is not a recognized type.");
      } else {
        obj[propertyName] = functions.deserializer(obj[propertyName]);
      }
    }
    delete obj._types;
  }
}
function serializerArrayBuffer(obj) {
  return base64Encode(obj);
}
function deserializerArrayBuffer(str) {
  return base64Decode(str);
}
function serializerUint8Array(obj) {
  return base64Encode(obj.buffer);
}
function deserializerUint8Array(str) {
  return new Uint8Array(base64Decode(str));
}

function start( [ Interface, moduleErrorHandling ] ) {
  const users = new Map();
  try {
    Interface.setSettings(Interface.DEFAULT_SETTINGS);
    const usersJSON = window.siteLocalStorage.get("Users");
    if (usersJSON === null) {
      createNewUser({
        username: "User",
      });
    } else {
      const usersArray = JSON.parse(usersJSON);
      for (const userId of usersArray) {
        const jsonUser = window.siteLocalStorage.get("User:" + userId);
        if (jsonUser === null) {
          console.warn(userId + "has no info.");
        } else {
          users.set(userId, JSON.parse(jsonUser));
        }
      }
    }
    const BODY = Interface.createBodyObject({
      parameters: {},
    });
    displayMain(BODY);
  } catch (e) {
    console.error(e);
  }
  function saveUsers() {
    const usersArray = Array.from(users.keys());
    window.siteLocalStorage.set("Users", JSON.stringify(usersArray));
    for (const user of users.values()) {
      window.siteLocalStorage.set("User:" + user.id, serialize(getUserObject(user.id)));
    }
  }
  function saveUser(user) {
    window.siteLocalStorage.set("User:" + user.id, serialize(user));
  }

  let activeUserId;
  // Returns user id
  function createNewUser({
    username,
  }) {}
  // Returns undefined
  function deleteUser({
    userId,
  }) {}
  // Returns authentication object
  function getUserAuthentication({
    userId,
  }) {}
  // Returns undefined. If user is logged in, sets the authentication object. If user is not logged in, does nothing.
  function setUserAuthentication({
    userId,
    newAuthenticationInfo,
  }) {}
  // If user is logged in, returns info object. If user is not logged in, returns null.
  function getUserInfo({
    userId,
  }) {}
  // Returns undefined. If user is logged in, sets the user info. If user is not logged in, does nothing.
  function setUserInfo({
    userId,
  }) {}
  // Returns undefined
  function loginUser({
    userId,
    authenticationInfo,
  }) {}
  // Returns undefined
  function logoutUser({
    userId,
  }) {}
  // Returns undefined
  function getUserObject({
    userId,
  }) {}

  
  function addNewUser({
    username,
  }) {
    activeUserId = createNewUser({
      username,
    });
    const usersArray = Array.from(users.keys());
    const newUserId = self.crypto.randomUUID();
    usersArray.push(newUserId);
    window.siteLocalStorage.set("Users", JSON.stringify(usersArray));
    const newUser = {
      username: username,
      id: newUserId,
      authentication: null,
      data: {
        settings: self.structuredClone(Interface.DEFAULT_SETTINGS),
      },
    };
    users.set(newUserId, newUser);
    window.siteLocalStorage.set("User:" + newUserId, JSON.stringify(newUser));
  }
  function displayMain(parentElement) {
    const appLayout = parentElement.createAttached({
      objectId: Interface.OBJECT_LAYOUT,
      parameters: {
        layoutId: Interface.LAYOUT_HEADER,
      },
    });
    const appHeader = appLayout.createAttached({
      area: "header",
      objectId: Interface.OBJECT_LAYOUT,
      parameters: {
        layoutId: Interface.LAYOUT_SIDE_TOUCH,
      },
    });
    const appTitle = appHeader.createAttached({
      area: "main",
      objectId: Interface.OBJECT_TEXT,
      parameters: {
        fontSizeFactor: 2,
        text: "Web Interface",
      },
    });
    const imgHamburgerMenu = appHeader.createAttached({
      area: "touch",
      objectId: Interface.OBJECT_IMAGE,
      parameters: {
        src: "Hamburger_icon.svg",
      },
    });
    imgHamburgerMenu.addClickListener({ handler: showHamburgerMenu });
    const userTiles = appLayout.createAttached({
      area: "body",
      objectId: Interface.OBJECT_TILES,
      parameters: {
      },
    });
    for (const thisUser of users.values()) {
      userTiles.addItem({
        imgSrc: "Anonymous.webp",
        itemName: thisUser.username,
      }).addClickListener({
        handler: function () {
          displayLogin({
            parentObject: appLayout,
            area: "body",
            user: thisUser
          });
        },
      });
    }
    const hamburgerMenuList = appLayout.createDetached({
      area: "body",
      objectId: Interface.OBJECT_LIST,
      parameters: {
      },
    });
    hamburgerMenuList.addItem({
      itemName: "Toggle Full Screen",
    }).addClickListener({
      handler: toggleFullscreen,
    });
    hamburgerMenuList.addItem({
      itemName: "Add User",
    }).addClickListener({
      handler: addUser,
    });
    hamburgerMenuList.addItem({
      itemName: "Calibrate Screen",
    });
    hamburgerMenuList.addItem({
      itemName: "Set Viewing Distance",
    });
    hamburgerMenuList.addItem({
      itemName: "Set Minimum Text Size",
    });
    hamburgerMenuList.addItem({
      itemName: "Set Minimum Touch Size",
    });
  }
  function displayUserSecurity({
    parentObject,
    area,
    user,
  }) {
    const prevScreen = parentObject.getObject({
      area: area,
    });
    const securityScreen = parentObject.createDetached({
      area: area,
      objectId: Interface.OBJECT_LAYOUT,
      parameters: {
        layoutId: Interface.LAYOUT_HEADER,
      },
    });
    securityScreen.createAttached({
      area: "header",
      objectId: Interface.OBJECT_TEXT,
      parameters: {
        text: thisUser.username,
      },
    });
    const securityItems = securityScreen.createAttached({
      area: "body",
      objectId: Interface.OBJECT_TILES,
      parameters: {
      },
    });
    securityItems.addTile({
      imgSrc: "Anonymous.webp",
      itemName: "Password",
    }).addClickListener({
      handler: function () {
        displaySetPassword({
          parentObject,
          area,
          user,
        });
      },
    });
  }
  function displaySetPassword({
    parentObject,
    area,
    user,
  }) {
    const prevScreen = parentObject.getObject({
      area: area,
    });
    const passwordScreen = parentObject.createDetached({
      area: area,
      objectId: Interface.OBJECT_LAYOUT,
      parameters: {
        layoutId: Interface.LAYOUT_HEADER,
      },
    });
    const passwordEntry = passwordScreen.createAttached({
      area: "header",
      objectId: Interface.OBJECT_TEXT_PROMPT,
      parameters: {
        prompt: "Password",
      },
    });
    const buttons = passwordScreen.createAttached({
      area: "body",
      objectId: Interface.OBJECT_LAYOUT,
      parameters: {
        layoutId: Interface.LAYOUT_HORIZ_2SPLIT,
      },
    });
    buttons.createAttached({
      area: "left",
      objectId: Interface.OBJECT_TEXT,
      parameters: {
        text: "Login",
      },
    }).addClickListener({
      handler: setPassword,
    });
    buttons.createAttached({
      area: "right",
      objectId: Interface.OBJECT_TEXT,
      parameters: {
        text: "Cancel",
      },
    }).addClickListener({
      handler: function () {
        prevScreen.attach();
      },
    });
    loginScreen.attach();
    function setPassword() {
      user.authentication = {};
      const password = passwordEntry.getText();
      user.authentication.salt = new UInt8Array(6);
      const saltedPasswordBuffer = new Blob([ password, user.authentication.salt ], { type: "text/plain" }).arrayBuffer();
      user.authentication.passwordHash = self.crypto.subtle.digest("SHA-256", saltedPasswordBuffer);
    }
    function saveUser() {
      const userDataBlob = serialize(user.userdata);
      const userDataIv = new UInt8Array(16);
      self.crypto.getRandomValues(userDataIv);
      const key = self.crypto.subtle.importKey("raw", passwordHash, "AES-256", false, [ "encrypt" ]);
      const userDataEncrypted = self.crypto.subtle.encrypt({
        name: "AES-256",
        iv: userDataIv,
      }, key, userDataBlob);
      const passwordBuffer = new Blob([ password ], { type: "text/plain" }).arrayBuffer();
      const passwordHash = self.crypto.subtle.digest("SHA-256", password);
      displayUserHome({
        parentObject: appLayout,
        area: "body",
        user: thisUser,
      });
    }
  }
  function displayPasswordLogin({
    parentObject,
    area,
    user,
  }) {
    const prevScreen = parentObject.getObject({
      area: area,
    });
    const loginScreen = parentObject.createDetached({
      area: area,
      objectId: Interface.OBJECT_LAYOUT,
      parameters: {
        layoutId: Interface.LAYOUT_HEADER,
      },
    });
    loginScreen.createAttached({
      area: "header",
      objectId: Interface.OBJECT_TEXT,
      parameters: {
        text: thisUser.username,
      },
    });
    const userEntry = loginScreen.createAttached({
      area: "body",
      objectId: Interface.OBJECT_LAYOUT,
      parameters: {
        layoutId: Interface.LAYOUT_HEADER,
      },
    });
    const passwordEntry = userEntry.createAttached({
      area: "header",
      objectId: Interface.OBJECT_TEXT_PROMPT,
      parameters: {
        prompt: "Password",
      },
    });
    const buttons = userEntry.createAttached({
      area: "body",
      objectId: Interface.OBJECT_LAYOUT,
      parameters: {
        layoutId: Interface.LAYOUT_HORIZ_2SPLIT,
      },
    });
    buttons.createAttached({
      area: "left",
      objectId: Interface.OBJECT_TEXT,
      parameters: {
        text: "Login",
      },
    }).addClickListener({
      handler: checkPassword,
    });
    buttons.createAttached({
      area: "right",
      objectId: Interface.OBJECT_TEXT,
      parameters: {
        text: "Cancel",
      },
    }).addClickListener({
      handler: function () {
        prevScreen.attach();
      },
    });
    loginScreen.attach();
    function checkPassword() {
      const password = passwordEntry.getText();
      const saltedPasswordBuffer = new Blob([ password, user.authentication.salt ], { type: "text/plain" }).arrayBuffer();
      const saltedHash = self.crypto.subtle.digest("SHA-256", saltedPasswordBuffer);
      const length = saltedHash.byteLength;
      let match = true;
      for (let i = 0; i < length; ++i) {
        if (user.authentication.passwordHash[i] !== saltedHash[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        const userDataBlob = new Blob([ base64Decode(user.data) ]);
        const userDataIv = userDataBlob.slice(16);
        const userDataEncrypted = userDataBlob.slice(0, 16);
        const passwordBuffer = new Blob([ password ], { type: "text/plain" }).arrayBuffer();
        const passwordHash = self.crypto.subtle.digest("SHA-256", password);
        const key = self.crypto.subtle.importKey("raw", passwordHash, "AES-256", false, [ "decrypt" ]);
        userdata = self.crypto.subtle.decrypt({
          name: "AES-256",
          iv: userDataIv,
        }, key, userDataEncrypted);
        displayUserHome({
          parentObject: appLayout,
          area: "body",
          user: thisUser,
        });
      } else {
        window.alert("Incorrect password.");
      }
    }
  }
  function displayLogin({
    parentObject,
    area,
    user,
  }) {
    if ((typeof user.authentication !== "object") || (user.authentication === null)) {
      displayUserHome({
        parentObject: parentObject,
        area: area,
        user: user,
      });
    }
    switch (user.authentication.type) {
      case "password": {
        displayPasswordLogin({
          parentObject: parentObject,
          area: area,
          user: user,
        });
      }
        break;
      default: {
        window.alert("Authentication type not recognized.");
      }
    };
  }
  function displayUserHome({
    parentObject,
    area,
    user,
  }) {
    Interface.setSettings(user.userdata.settings);
    BODY.refresh();
    const mainScreen = parentObject.createAttached({
      area: area,
      objectId: Interface.OBJECT_LAYOUT,
      parameters: {
        layoutId: LAYOUT_HEADER,
      },
    });
    mainScreen.createAttached({
      area: "header",
      objectId: Interface.OBJECT_TEXT,
      parameters: {
        text: user.username,
      },
    });
    mainScreen.createAttached({
      area: "body",
      objectId: Interface.OBJECT_TILES,
      parameters: {
      },
    });
    mainScreen.addItem({
      imgSrc: "Hamburger_icon.svg",
      itemName: "Apps",
    });
    mainScreen.addItem({
      imgSrc: "Hamburger_icon.svg",
      itemName: "Settings",
    });
  }
  function showHamburgerMenu() {
    imgHamburgerMenu.setSrc({ src: "LeftArrowIcon.png" });
    hamburgerMenuList.attach();
    imgHamburgerMenu.addClickListener({ handler: hideHamburgerMenu });
    imgHamburgerMenu.removeClickListener({ handler: showHamburgerMenu });
  }
  function hideHamburgerMenu() {
    imgHamburgerMenu.setSrc({ src: "Hamburger_icon.svg" });
    userTiles.attach();
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
