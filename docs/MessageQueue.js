/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Once a port message queue is enabled, it cannot be disabled, per 9.4.2 of the HTML Specification.
// Windows and Workers have their port message queue enabled automatically at the start of execution.
// The global scope of Windows and Workers follows the MessagePort structure, therefore they can be passed as the messagePort argument to the constructor. By using the non-module version at the beginning of Window and worker scripts, messages can be queued until the script is ready.
// This script acts as an intermediate message queue.

"use strict";

(self.document === undefined ? self : self.document).currentScript.exports = (function () {
  const exports = {};
  class MessageQueue extends EventTarget {
    #enabled;
    #messageEvts;
    #messagePort;
    constructor(messagePort) {
      super();
      this.#enabled = false;
      this.#messageEvts = [];
      this.#messagePort = messagePort;
      const routeEvent = (evt) => {
        console.log(this);
        if (typeof this === "object" && this !== null) {
          for (const x in this) {
            console.log(x, this[x]);
          }
        }
        if (this.#enabled) {
          this.dispatchEvent(evt);
        } else {
          this.#messageEvts.push(evt);
        }
      };
      this.#messagePort.addEventListener("message", routeEvent);
      this.#messagePort.addEventListener("messageerror", routeEvent);
    }
    postMessage(...args) {
      messagePort.postMessage.call(messagePort, ...args);
    }
    start() {
      this.#enabled = true;
      for (const messageEvt of this.#messageEvts) {
        // Using setTimeout to place each event on its own task in the event loop to prevent blocking
        setTimeout(() => this.dispatchEvent(messageEvt), 0);
      }
      this.#messageEvts = [];
    }
    stop() {
      this.#enabled = false;
    }
    get isEnabled() {
      return this.#enabled;
    }
  }
  exports.default = MessageQueue;
  return exports;
})();
