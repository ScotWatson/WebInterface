/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import * as Streams from "https://scotwatson.github.io/WebInterface/streams.mjs";

export default class RemoteProcedureSocket {
  #packetIds;
  #responseFunctions;
  #resolve;
  #reject;
  #timeout;
  constructor({
    timeout, // in ms
  }) {
    this.#timeout = timeout;
    this.#packetIds = new Map();
    this.#responseFunctions = new Map();
    this.input = new Streams.SinkNode((data) => {
      if (!data || !data.packetId) {
        // This is not a packet message
        return;
      }
      switch (data.action) {
        case "request": {
          this.#requestHandler(data);
        }
          break;
        case "response": {
          this.#responseHandler(data);
        }
          break;
        case "error": {
          this.#errorHandler(data);
        }
          break;
        default: {
          this.#resolve({
            data: {
              packetId: data.packetId,
              action: "error",
              error: "Invalid Packet",
            },
          });
        }
      }
    });
    this.output = new Streams.SourceNode((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
  }
  register({
    functionName,
    handlerFunc,
  }) {
    this.#responseFunctions.set(functionName, handlerFunc);
  }
  unregister({
    functionName,
  }) {
    this.#responseFunctions.delete(functionName);
  }
  // returns a promise, so acts as an async function
  call({
    functionName,
    args,
    transferable,
  }) {
    const packetId = self.crypto.randomUUID();
    const requesting = new Promise(function (resolve, reject) {
      packetIds.set(packetId, { resolve, reject });
      if (this.#timeout) {
        self.setTimeout(rejectOnTimeout, this.#timeout);
        function rejectOnTimeout() {
          reject("Request Timed Out: " + packetId);
        }
      }
      this.#resolve({
        data: {
          packetId: packetId,
          action: "request",
          functionName: functionName,
          args: args,
          timeout: Date.now() + timeout,
        },
        transferable: transferable,
      });
    });
    requesting.packetId = packetId;
    return requesting;
  };
  async #requestHandler(data) {
    const thisFunction = responseFunctions.get(data.functionName);
    if (data.timeout) {
      if (Date.now() > data.timeout) {
        // ignore packet if expired
        return;
      }
    }
    if (typeof thisFunction !== "function") {
      this.#resolve({
        data: {
          packetId: data.packetId,
          action: "error",
          reason: "Unregistered function: " + data.functionName,
        },
      });
      return;
    }
    try {
      if (typeof data.args !== "object") {
        data.args = { default: data.args };
      }
      data.args.transferable = [];
      const ret = await thisFunction(data.args);
      this.#resolve({
        data: {
          packetId: data.packetId,
          action: "response",
          value: ret,
        },
        transferable: data.args.transferable,
      });
    } catch (e) {
      this.#resolve({
        data: {
          packetId: data.packetId,
          action: "error",
          error: e.message,
        },
      });
    }
  }
  #responseHandler(data) {
    const functions = packetIds.get(data.packetId);
    if (functions !== undefined) {
      functions.resolve(data.value);
      packetIds.delete(data.packetId);
    }
  }
  #errorHandler(data) {
    const functions = packetIds.get(data.packetId);
    if (functions !== undefined) {
      functions.reject(data.reason);
      packetIds.delete(data.packetId);
    }
  }
}
