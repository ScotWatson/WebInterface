/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

(self.document === undefined ? self : self.document).currentScript.exports = (function () {
  const exports = {};
  const Streams = self.importScript("https://scotwatson.github.io/WebInterface/streams.js");
  exports.default = class RemoteProcedureSocket {
    #packetIds;
    #responseFunctions;
    #resolve;
    #reject;
    constructor({
    }) {
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
              packetId: data.packetId,
              action: "error",
              error: "Invalid Packet",
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
      const requesting = new Promise((resolve, reject) => {
        this.#packetIds.set(packetId, { resolve, reject });
        this.#resolve({
          packetId: packetId,
          action: "request",
          functionName: functionName,
          args: args,
          _transfer: transferable,
        });
      });
      requesting.packetId = packetId;
      return requesting;
    };
    async #requestHandler(data) {
      const thisFunction = this.#responseFunctions.get(data.functionName);
      if (typeof thisFunction !== "function") {
        this.#resolve({
          packetId: data.packetId,
          action: "error",
          reason: "Unregistered function: " + data.functionName,
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
          packetId: data.packetId,
          action: "response",
          value: ret,
          _transfer: data.args.transferable,
        });
      } catch (e) {
        this.#resolve({
          packetId: data.packetId,
          action: "error",
          error: e.message,
        });
      }
    }
    #responseHandler(data) {
      const functions = this.#packetIds.get(data.packetId);
      if (functions !== undefined) {
        functions.resolve(data.value);
        this.#packetIds.delete(data.packetId);
      }
    }
    #errorHandler(data) {
      const functions = this.#packetIds.get(data.packetId);
      if (functions !== undefined) {
        functions.reject(data.reason);
        this.#packetIds.delete(data.packetId);
      }
    }
  };
  return exports;
})();
