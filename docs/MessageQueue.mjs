/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Once a port message queue is enabled, it cannot be disabled, per 9.4.2 of the HTML Specification.
// Windows and Workers have their port message queue enabled automatically at the start of execution.
// The global scope of Windows and Workers follows the MessagePort structure, therefore they can be passed as the messagePort argument to the constructor. By using the non-module version at the beginning of Window and worker scripts, messages can be queued until the script is ready.
// This script acts as an intermediate message queue.

export default class MessageQueue extends EventTarget {
  #enabled;
  #messageEvts;
  #messagePort;
  constructor(messagePort) {
    super();
    this.#enabled = false;
    this.#messageEvts = [];
    this.#messagePort = messagePort;
    const routeMessageEvent = (evt) => {
      const thisEvt = new evt.constructor("message", {
        data: evt.data,
        origin: evt.origin,
        lastEventId: evt.lastEventId,
        source: evt.source,
        ports: evt.ports,
      });
      if (this.#enabled) {
        this.dispatchEvent(thisEvt);
      } else {
        this.#messageEvts.push(thisEvt);
      }
    };
    const routeMessageErrorEvent = (evt) => {
      const thisEvt = new evt.constructor('messageerror', {
        error: evt.error,
        message: evt.message,
        lineno: evt.lineno,
        filename: evt.filename,
      });
      if (this.#enabled) {
        this.dispatchEvent(thisEvt);
      } else {
        this.#messageEvts.push(thisEvt);
      }
    };
    this.#messagePort.addEventListener("message", routeMessageEvent);
    this.#messagePort.addEventListener("messageerror", routeMessageErrorEvent);
  }
  postMessage(...args) {
    this.#messagePort.postMessage.call(this.#messagePort, ...args);
  }
  start() {
    this.#enabled = true;
    for (const messageEvt of this.#messageEvts) {
      // Using setTimeout to place each event on its own task in the event loop to prevent blocking
      setTimeout(() => { this.dispatchEvent(messageEvt); }, 0);
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
