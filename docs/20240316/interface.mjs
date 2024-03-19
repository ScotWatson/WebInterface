/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export const DEFAULT_SETTINGS = {
  px_per_inch: 96,
  min_touch_inch: 0.5,
  min_text_ratio: 0.007,
  view_dist_inch: 24,
};

let settings = structuredClone(DEFAULT_SETTINGS);

export const BODY = {};
const bodyDiv = document.createElement("div");
const bodyRootSet = createRootSet({
  element: bodyDiv,
});
BODY.refresh = function () {
  document.body.style.boxSizing = "border-box";
  document.body.style.margin = "0";
  document.body.style.border = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";
  bodyDiv.style.width = "100%";
  bodyDiv.style.height = "100%";
  bodyDiv.style.boxSizing = "border-box";
  bodyDiv.style.margin = "0";
  bodyDiv.style.border = "0";
  bodyDiv.style.padding = "0";
  bodyDiv.style.overflow = "hidden";
  bodyDiv.style.backgroundColor = "#808080";
  bodyRootSet.refresh();
};
BODY.refresh();
document.body.appendChild(bodyDiv);
window.addEventListener("resize", resize);
resize();
function resize() {
  bodyDiv.style.height = window.innerHeight + "px";
}
BODY.createContentRoot = function () {
  return bodyRootSet.createRoot();
};

export function restoreDefaults() {
  setSettings(DEFAULT_SETTINGS);
}
export function setSettings() {
  settings = structuredClone(DEFAULT_SETTINGS);
  BODY.refresh();
}
export function getSettings() {
  return structuredClone(settings);
}

// Returns a CSS string for a touch element, sized in terms of a factor times the minimum size
export function touchCss({
  factor,
}) {
  return (factor * settings.px_per_inch * settings.min_touch_inch) + "px";
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
  obj.refresh = function () {
    for (const root of roots) {
      root.refresh();
    }
  }
  obj.createRoot = function () {
    const contentRoot = document.createElement("div");
    contentRoot.style.display = "none";
    contentRoot.style.width = "100%";
    contentRoot.style.height = "100%";
    element.appendChild(contentRoot);
    roots.add(contentRoot);
    const contents = new Set();
    const objRoot = {};
    objRoot.refresh = function () {
      for (const obj of contents) {
        obj.refresh();
      }
    };
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
      roots.delete(objRoot);
    };
    return objRoot;
  };
  return obj;
}

const OBJECT_FUNCTIONS = new Map();
export const OBJECT_LIST      = "1b86fbea-6abc-4b65-9189-d4a6033fe8bf";
OBJECT_FUNCTIONS.set(OBJECT_LIST, createList);
export const OBJECT_TILES     = "35017865-1b42-430b-9fc3-61cece306d6d";
OBJECT_FUNCTIONS.set(OBJECT_TILES, createTiles);
export const OBJECT_IMAGE     = "92fcd3cb-76bb-47a5-8693-31a8bbd19739";
OBJECT_FUNCTIONS.set(OBJECT_IMAGE, createImage);
export const OBJECT_BLANK_DIV = "9db9ca53-1d3b-49a9-9d22-8b1d08177c92";
OBJECT_FUNCTIONS.set(OBJECT_BLANK_DIV, createBlankDiv);
export const OBJECT_TEXT      = "f2666550-108e-47e3-8154-762b1acc1936";
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
  const obj = {};
  const div = document.createElement("div");
  obj.refresh = function () {
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
  };
  obj.refresh();
  parent.appendChild(div);
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
  const obj = {};
  const img = document.createElement("img");
  obj.refresh = function () {
    img.src = parameters.src;
    img.style.display = "block";
    img.style.position = "absolute";
    img.style.top = parameters.top;
    img.style.left = parameters.left;
    img.style.width = parameters.width;
    img.style.height = parameters.height;
    img.style.backgroundColor = "white";
  };
  obj.refresh();
  parent.appendChild(img);
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
  const obj = {};
  const span = document.createElement("span");
  span.append(parameters.text);
  obj.refresh = function () {
    span.style.display = "block";
    span.style.verticalAlign = "center";
    span.style.textAlign = "center";
    span.style.position = "absolute";
    span.style.top = parameters.top;
    span.style.left = parameters.left;
    span.style.width = parameters.width;
    span.style.height = parameters.height;
    span.style.fontSize = (parameters.fontSizeFactor * settings.min_text_ratio * settings.view_dist_inch * settings.px_per_inch) + "px";
    span.style.lineHeight = parameters.height;
    span.style.backgroundColor = "white";
  };
  obj.refresh();
  parent.appendChild(span);
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
  const divItems = document.createElement("div");
  obj.refresh = function () {
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
    divItems.style.backgroundPosition = "right top";
    divItems.style.backgroundRepeat = "repeat-y";
    divItems.style.minHeight = "100%";
  };
  obj.refresh();
  div.appendChild(divItems);
  parent.appendChild(div);
  const obj = {};
  obj.addItem = function ({
    imgSrc,
    itemName,
  }) {
    const itemObj = {};
    const sizeFactor = 2;
    const fontsize = (settings.px_per_inch * settings.min_text_ratio * settings.view_dist_inch);
    const itemSize = sizeFactor * (settings.px_per_inch * settings.min_touch_inch);
    const divItem = document.createElement("div");
    const imgItem = document.createElement("img");
    const divItemName = document.createElement("div");
    divItemName.append(itemName);
    itemObj.refresh = function () {
      divItem.style.display = "flex";
      divItem.style.flexFlow = "column nowrap";
      divItem.style.justifyContent = "space-around";
      divItem.style.alignItems = "center";
      divItem.style.boxSizing = "border-box";
      divItem.style.width = itemSize + "px";
      divItem.style.height = itemSize + "px";
      divItem.style.textAlign = "center";
      divItem.style.backgroundColor = "#808080";
      imgItem.src = imgSrc;
      imgItem.style.display = "inline-block";
      imgItem.style.boxSizing = "border-box";
      imgItem.style.width = "100%";
      imgItem.style.height = (itemSize - fontsize) + "px";
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
    };
    obj.refresh();
    divItem.appendChild(imgItem);
    divItem.appendChild(divItemName);
    divItems.appendChild(divItem);
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
  const obj = {};
  const div = document.createElement("div");
  const divList = document.createElement("div");
  obj.refresh = function () {
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
    divList.style.backgroundPosition = "right top";
    divList.style.backgroundRepeat = "repeat-y";
  };
  obj.refresh();
  div.appendChild(divList);
  parent.appendChild(div);
  obj.addItem = function ({
    itemName,
  }) {
    const objItem = {};
    const divItem = document.createElement("div");
    objItem.refresh = function () {
      divItem.style.width = "100%";
      divItem.style.height = "50px";
      divItem.style.boxSizing = "border-box";
      divItem.style.backgroundColor = "#808080";
      divItem.style.margin = "0";
      divItem.style.border = "0";
      divItem.style.padding = "5%";
    };
    objItem.refresh();
    divItem.append(itemName);
    divList.appendChild(divItem);
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
