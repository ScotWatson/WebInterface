/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export const DEFAULT_SETTINGS = {
  px_per_inch: 96,
  min_touch_inch: 0.5,
  min_text_ratio: 0.007,
  view_dist_inch: 24,
  handedness: "right",
};

let settings = structuredClone(DEFAULT_SETTINGS);

export function restoreDefaults() {
  setSettings(DEFAULT_SETTINGS);
}
export function setSettings(newSettings) {
  settings = structuredClone(newSettings);
  normalizeSettings(settings);
}
export function getSettings() {
  return structuredClone(settings);
}
function normalizeSettings(thisSettings) {
  for (const property in DEFAULT_SETTINGS) {
    if (thisSettings[property] === undefined) {
      DEFAULT_SETTINGS[property] = thisSettings[property];
    }
  }
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

const OBJECT_FUNCTIONS = new Map();
export const OBJECT_LIST        = "1b86fbea-6abc-4b65-9189-d4a6033fe8bf";
OBJECT_FUNCTIONS.set(OBJECT_LIST, createList);
export const OBJECT_TILES       = "35017865-1b42-430b-9fc3-61cece306d6d";
OBJECT_FUNCTIONS.set(OBJECT_TILES, createTiles);
export const OBJECT_TEXT_PROMPT = "56422341-140a-4195-8ae6-9d4d73391753";
OBJECT_FUNCTIONS.set(OBJECT_TEXT_PROMPT, createTextPrompt);
export const OBJECT_IMAGE       = "92fcd3cb-76bb-47a5-8693-31a8bbd19739";
OBJECT_FUNCTIONS.set(OBJECT_IMAGE, createImage);
export const OBJECT_LAYOUT      = "9db9ca53-1d3b-49a9-9d22-8b1d08177c92";
OBJECT_FUNCTIONS.set(OBJECT_LAYOUT, createLayout);
export const OBJECT_TEXT        = "f2666550-108e-47e3-8154-762b1acc1936";
OBJECT_FUNCTIONS.set(OBJECT_TEXT, createText);
function createObject({
  objectId,
  parameters,
}) {
  const objectConstructor = OBJECT_FUNCTIONS.get(objectId);
  if (typeof objectConstructor !== "function") {
    console.error("Object ID is not recognized: " + objectId);
  }
  return objectConstructor({
    parameters,
  });
}
// There can only be at most one at a time
// It is the only object without a parent
export function createBodyObject({
  parameters,
}) {
  const object = {}
  const element = document.createElement("div");
  let content = null;
  const shadowDOM = document.body.attachShadow({ mode: "closed" });
  shadowDOM.appendChild(element);
  function resize() {
    element.style.height = window.innerHeight + "px";
  }
  window.addEventListener("resize", resize);
  object.refresh = function () {
    document.body.style.boxSizing = "border-box";
    document.body.style.margin = "0px";
    document.body.style.border = "0px";
    document.body.style.padding = "0px";
    document.body.style.overflow = "hidden";
    element.style.width = "100%";
    element.style.height = window.innerHeight + "px";
    element.style.boxSizing = "border-box";
    element.style.margin = "0px";
    element.style.border = "0px";
    element.style.padding = "0px";
    element.style.overflow = "hidden";
    element.style.backgroundColor = "#808080";
  };
  object.refresh();
  resize();
  function create({
    objectId,
    parameters,
  }) {
    const retVal = createObject({
      objectId,
      parameters,
    });
    retVal.object.detach = function () {
      retVal.rootElement.remove();
      content = null;
    };
    retVal.object.attach = function () {
      const prevObject = content;
      if (prevObject) {
        prevObject.detach();
      }
      retVal.object.refresh();
      element.appendChild(retVal.rootElement);
      content = retVal.object;
    };
    return retVal.object;
  };
  object.createAttached = function ({
    objectId,
    parameters,
  }) {
    const obj = create({
      objectId,
      parameters,
    });
    obj.attach();
    return obj;
  };
  object.createDetached = function ({
    objectId,
    parameters,
  }) {
    const obj = create({
      objectId,
      parameters,
    });
    return obj;
  };
  object.delete = function () {
    if (content) {
      content.delete();
    }
  };
  return object;
}
const LAYOUT_STYLES = new Map();
export const LAYOUT_BREADCRUMBS  = "63bd0889-7788-45f7-84eb-812892624667";
LAYOUT_STYLES.set(LAYOUT_BREADCRUMBS, function ({
  rootElement,
  parameters,
}) {
  rootElement.style.gridTemplateColumns = "25fr " + touchCss({ factor: 1 }) + " 25fr 50fr";
  rootElement.style.gridTemplateRows = "100%";
  rootElement.style.gridTemplateAreas = "\"main button penultimate ultimate\"";
});
export const LAYOUT_HORIZ_3SPLIT  = "a6a0af4f-330d-44fd-be70-684a3f0af2f3";
LAYOUT_STYLES.set(LAYOUT_HORIZ_3SPLIT, function ({
  rootElement,
  parameters,
}) {
  rootElement.style.gridTemplateColumns = "33fr 34fr 33fr";
  rootElement.style.gridTemplateRows = "100%";
  rootElement.style.gridTemplateAreas = "\"left center right\"";
});
export const LAYOUT_HORIZ_2SPLIT  = "bcfa0a8b-a146-4e58-b581-b26c37c9dd2f";
LAYOUT_STYLES.set(LAYOUT_HORIZ_2SPLIT, function ({
  rootElement,
  parameters,
}) {
  rootElement.style.gridTemplateColumns = "50fr 50fr";
  rootElement.style.gridTemplateRows = "100%";
  rootElement.style.gridTemplateAreas = "\"left right\"";
});
export const LAYOUT_HEADER      = "dd13d7bd-7a0d-41bc-965d-f70a02d97e35";
LAYOUT_STYLES.set(LAYOUT_HEADER, function ({
  rootElement,
  parameters,
}) {
  rootElement.style.gridTemplateColumns = "100%";
  rootElement.style.gridTemplateRows = touchCss({ factor: 1 }) + " 100fr";
  rootElement.style.gridTemplateAreas = "\"header\"\n\"body\"";
});
export const LAYOUT_SIDE_TOUCH  = "ec3456ab-f5ef-47d5-8456-db86f3d3d5b1";
LAYOUT_STYLES.set(LAYOUT_SIDE_TOUCH, function ({
  rootElement,
  parameters,
}) {
  if (parameters.handed === "right") {
    rootElement.style.gridTemplateColumns = "100fr " + touchCss({ factor: 1 });
    rootElement.style.gridTemplateRows = "100%";
    rootElement.style.gridTemplateAreas = "\"main touch\"";
  } else if (parameters.handed === "left") {
    rootElement.style.gridTemplateColumns = touchCss({ factor: 1 }) + " 100fr";
    rootElement.style.gridTemplateRows = "100%";
    rootElement.style.gridTemplateAreas = "\"touch main\"";
  }
});
function createLayout({
  parameters,
}) {
  const object = {};
  const rootElement = document.createElement("div");
  const contents = new Map();
  object.refresh = function () {
    rootElement.style.display = "grid";
    const styleFunc = LAYOUT_STYLES.get(parameters.layoutId);
    const layoutParameters = structuredClone(parameters);
    delete layoutParameters.layoutId;
    if (typeof styleFunc === "function") {
      styleFunc({
        rootElement,
        layoutParameters,
      });
    }
    rootElement.style.width = "100%";
    rootElement.style.height = "100%";
    rootElement.style.backgroundColor = "white";
    rootElement.style.boxSizing = "border-box";
    rootElement.style.margin = "0px";
    rootElement.style.border = "0px";
    rootElement.style.padding = "0px";
    for (const object of contents) {
      object.refresh();
    }
  };
  object.refresh();
   function create({
    area,
    objectId,
    parameters,
  }) {
    const retVal = createObject({
      objectId,
      parameters,
    });
    retVal.object.detach = function () {
      retVal.rootElement.remove();
      contents.delete(area);
    };
    retVal.object.attach = function () {
      const prevObject = contents.get(area);
      if (prevObject) {
        prevObject.detach();
      }
      retVal.object.refresh();
      retVal.rootElement.style.gridArea = area;
      rootElement.appendChild(retVal.rootElement);
      contents.set(area, retVal.object);
    };
    return retVal.object;
  };
  object.createAttached = function ({
    area,
    objectId,
    parameters,
  }) {
    const obj = create({
      area,
      objectId,
      parameters,
    });
    obj.attach();
    return obj;
  };
  object.createDetached = function ({
    area,
    objectId,
    parameters,
  }) {
    const obj = create({
      area,
      objectId,
      parameters,
    });
    return obj;
  };
  object.delete = function () {
    for (const object of contents) {
      object.delete();
    }
    object.detach();
  };
  return {
    object,
    rootElement,
  };
}
function createImage({
  parameters,
}) {
  const object = {};
  const rootElement = document.createElement("img");
  object.refresh = function () {
    rootElement.src = parameters.src;
    rootElement.style.display = "block";
    rootElement.style.width = "100%";
    rootElement.style.height = "100%";
    rootElement.style.backgroundColor = "white";
  };
  object.refresh();
  const clickManager = createEventManager({
    element: rootElement,
    eventName: "click",
  });
  object.addClickListener = function ({
    handler,
  }) {
    clickManager.addListener({ handler });
  };
  object.removeClickListener = function ({
    handler,
  }) {
    clickManager.removeListener({ handler });
  };
  object.delete = function () {
    clickManager.removeAllListeners();
    object.detach();
  };
  object.setSrc = function ({
    src,
  }) {
    rootElement.src = src;
  };
  return {
    object,
    rootElement,
  };
}
function createText({
  parameters,
}) {
  const object = {};
  const rootElement = document.createElement("span");
  rootElement.append(parameters.text);
  object.refresh = function () {
    rootElement.style.display = "flex";
    rootElement.style.justifyContent = "center";
    rootElement.style.alignItems = "center";
    rootElement.style.width = "100%";
    rootElement.style.height = "100%";
    rootElement.style.fontSize = (parameters.fontSizeFactor * settings.min_text_ratio * settings.view_dist_inch * settings.px_per_inch) + "px";
    rootElement.style.lineHeight = "100%";
    rootElement.style.backgroundColor = "white";
  };
  object.refresh();
  const clickManager = createEventManager({
    element: rootElement,
    eventName: "click",
  });
  object.addClickListener = function ({
    handler,
  }) {
    clickManager.addListener({ handler });
  };
  object.removeClickListener = function ({
    handler,
  }) {
    clickManager.removeListener({ handler });
  };
  object.delete = function () {
    clickManager.removeAllListeners();
    rootElement.innerHTML = "";
    object.detach();
  };
  object.setText = function ({
    text,
  }) {
    rootElement.innerHTML = "";
    rootElement.append(text);
  };
  return {
    object,
    rootElement,
  };
}
function createTiles({
  parameters,
}) {
  const object = {};
  const rootElement = document.createElement("div");
  const divItems = document.createElement("div");
  object.refresh = function () {
    rootElement.style.display = "block";
    rootElement.style.boxSizing = "border-box";
    rootElement.style.backgroundColor = "#C0C0C0";
    rootElement.style.padding = "0px";
    rootElement.style.border = "0px";
    rootElement.style.margin = "0px";
    rootElement.style.width = "100%";
    rootElement.style.height = "100%";
    rootElement.style.overflow = "hidden auto";
    divItems.style.display = "flex";
    divItems.style.flexFlow = "row wrap";
    divItems.style.justifyContent = "space-around";
    divItems.style.boxSizing = "border-box";
    divItems.style.width = "100%";
    divItems.style.backgroundColor = "#A0A0A0";
    divItems.style.paddingLeft = "0px";
    divItems.style.paddingRight = touchCss({ factor: 1 });
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
  object.refresh();
  rootElement.appendChild(divItems);
  object.addItem = function ({
    imgSrc,
    itemName,
  }) {
    const sizeFactor = 2;
    const fontsize = (settings.px_per_inch * settings.min_text_ratio * settings.view_dist_inch);
    const itemSize = sizeFactor * (settings.px_per_inch * settings.min_touch_inch);
    const itemObj = {};
    const divItem = document.createElement("div");
    const imgItem = document.createElement("img");
    const divItemName = document.createElement("div");
    divItems.appendChild(divItem);
    divItem.appendChild(imgItem);
    divItem.appendChild(divItemName);
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
      imgItem.style.aspectRatio = "1";
      imgItem.style.width = "100%";
      imgItem.style.height = (itemSize - fontsize) + "px";
      divItemName.style.display = "block";
      divItemName.style.verticalAlign = "center";
      divItemName.style.boxSizing = "border-box";
      divItemName.style.backgroundColor = "#E0E080";
      divItemName.style.fontSize = fontsize + "px";
      divItemName.style.width = "100%";
      divItemName.style.height = divItemName.style.fontSize;
      divItemName.style.lineHeight = divItemName.style.fontSize;
      divItemName.style.userSelect = "none";
      divItemName.style.textAlign = "center";
      divItemName.style.textOverflow = "ellipsis";
      divItemName.style.whiteSpace = "nowrap";
    };
    itemObj.refresh();
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
  return {
    object,
    rootElement,
  };
}
function createList({
  parameters,
}) {
  const object = {};
  const rootElement = document.createElement("div");
  const divList = document.createElement("div");
  object.refresh = function () {
    rootElement.style.display = "block";
    rootElement.style.width = "100%";
    rootElement.style.height = "100%";
    rootElement.style.boxSizing = "border-box";
    rootElement.style.backgroundColor = "#C0C0C0";
    rootElement.style.margin = "0px";
    rootElement.style.border = "0px";
    rootElement.style.padding = "0px";
    rootElement.style.overflow = "hidden auto";
    rootElement.setAttribute("class", "invisible-scrollbar");
    divList.style.display = "flex";
    divList.style.flexFlow = "column wrap";
    divList.style.justifyContent = "space-around";
    divList.style.boxSizing = "border-box";
    divList.style.backgroundColor = "#A0A0A0";
    divList.style.margin = "0px";
    divList.style.border = "0px";
    divList.style.paddingLeft = "0px";
    divList.style.paddingRight = touchCss({ factor: 1 });
    divList.style.paddingTop = "0px";
    divList.style.paddingBottom = "0px";
    divList.style.backgroundImage = "url(ScrollGutter.svg)";
    divList.style.backgroundSize = touchCss({ factor: 1 }) + " " + touchCss({ factor: 1 });
    divList.style.backgroundPosition = "right top";
    divList.style.backgroundRepeat = "repeat-y";
  };
  object.refresh();
  rootElement.appendChild(divList);
  object.addItem = function ({
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
  return {
    object,
    rootElement,
  };
}
function createTextPrompt({
  parameters,
}) {
  const object = {};
  const rootElement = document.createElement("span");
  const label = document.createElement("label");
  rootElement.appendChild(label);
  label.append(parameters.prompt);
  const input = document.createElement("input");
  input.type = "text";
  rootElement.appendChild(input);
  object.refresh = function () {
    rootElement.style.display = "flex";
    rootElement.style.justifyContent = "center";
    rootElement.style.alignItems = "center";
    rootElement.style.width = "100%";
    rootElement.style.height = "100%";
    rootElement.style.fontSize = (parameters.fontSizeFactor * settings.min_text_ratio * settings.view_dist_inch * settings.px_per_inch) + "px";
    rootElement.style.backgroundColor = "white";
    label.style.display = "flex";
    label.style.justifyContent = "center";
    label.style.alignItems = "center";
    label.style.width = "100%";
    label.style.height = "100%";
    label.style.fontSize = (parameters.fontSizeFactor * settings.min_text_ratio * settings.view_dist_inch * settings.px_per_inch) + "px";
    label.style.backgroundColor = "white";
    input.style.display = "flex";
    input.style.justifyContent = "center";
    input.style.alignItems = "center";
    input.style.width = "100%";
    input.style.height = "100%";
    input.style.fontSize = (parameters.fontSizeFactor * settings.min_text_ratio * settings.view_dist_inch * settings.px_per_inch) + "px";
    input.style.backgroundColor = "white";
  };
  object.refresh();
  const inputManager = createEventManager({
    element: rootElement,
    eventName: "input",
  });
  object.addInputListener = function ({
    handler,
  }) {
    inputManager.addListener({ handler });
  };
  object.removeInputListener = function ({
    handler,
  }) {
    inputManager.removeListener({ handler });
  };
  object.delete = function () {
    inputManager.removeAllListeners();
    rootElement.innerHTML = "";
    object.detach();
  };
  object.getText = function ({
  }) {
    return input.value;
  };
  return {
    object,
    rootElement,
  };
}
