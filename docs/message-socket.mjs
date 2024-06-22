/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import * as Streams from "https://scotwatson.github.io/WebInterface/streams.mjs";
import MessageQueue from "https://scotwatson.github.io/WebInterface/MessageQueue.mjs";

function forMessagePort(messagePort) {
  const queue = new MessageQueue(messagePort);
  messagePort.start();
  return {
    output: new Streams.ActiveSource(function (resolve, reject) {
      messagePort.addEventListener("message", (evt) => resolve(evt.data) );
    }),
    input: new Sink((data) {
      if ((typeof data === "object") && Object.has(data, "_transfer")) {
        const transfer = data._transfer;
        delete data._transfer;
        messagePort.postMessage(data, transfer);
      } else {
        messagePort.postMessage(data);
      }
    }),
    start() {
      queue.start();
    },
    stop() {
      queue.stop();
    },
  };
}
