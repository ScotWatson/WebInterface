/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import * as Streams from "https://scotwatson.github.io/WebInterface/streams.mjs";

export function forMessagePort(messagePort) {
  return {
    output: new Streams.SourceNode((resolve, reject) => {
      messagePort.addEventListener("message", (evt) => resolve(evt.data) );
    }),
    input: new Streams.SinkNode((data) => {
      postMessage(messagePort, data);
    }),
  };
}

export function postMessage(messagePort, data) {
  const transfer = getTransfer(data);
  messagePort.postMessage(data, transfer);
  function getTransfer(data) {
    const transfer = [];
    if ((typeof data === "object") && (data !== null)) {
      if (Object.hasOwn(data, "_transfer") && (typeof data._transfer === "object") && (data._transfer !== null) && Object.hasOwn(data._transfer, Symbol.iterator)) {
        transfer.push(...data._transfer);
      }
      for (const prop of data) {
        transfer.push(...getTransfer(data[prop]));
      }
    }
    return transfer;
  }
}
