/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const arrVettedSelfMembers = [];
// [ "indexedDB", "isSecureContext", "atob", "btoa", "clearInterval", "clearTimeout", "createImageBitmap", "fetch", "setInterval", "setTimeout", "reportError" ];

function check_object(obj) {
  let obj_members = Object.getOwnPropertyNames(obj);
  let prototype = Object.getPrototypeOf(obj);
  if (prototype === null) {
    return { name: obj.constructor.name, obj: obj_members };
  } else {
    let prototype_members = check_object(prototype);
    return { name: obj.constructor.name, obj: obj_members, prototype_obj: prototype_members };
  }
}

let arrNonVettedSelfMembers = check_object(self);
self.postMessage(arrNonVettedSelfMembers);

let bufRandom = new Uint8Array(32);
self.crypto.getRandomValues(bufRandom);
self.postMessage(bufRandom, [ bufRandom ] );
