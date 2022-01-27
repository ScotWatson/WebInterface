const arrVettedSelfMembers = [ "indexedDB", "isSecureContext", "atob", "btoa", "clearInterval", "clearTimeout", "createImageBitmap", "fetch", "setInterval", "setTimeout", "reportError" ];

function check_object(obj, arrVettedMembers) {
  let arrNonVettedMembers = [];
  for (let member of Object.getOwnPropertyNames(obj)) {
    if (!(arrVettedMembers.includes(member))) {
      arrNonVettedMembers.push(member);
    }
  }
  let prototype = Object.getPrototypeOf(self);
  if (prototype !== null) {
    checkObject(prototype, arrVettedMembers);
  }
  return arrNonVettedMembers;
}

let arrNonVettedSelfMembers = check_object(self, arrVettedSelfMembers);
self.postMessage(arrNonVettedSelfMembers);
