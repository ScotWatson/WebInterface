/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

(self.document === undefined ? self : self.document).currentScript.exports = (function () {
  const exports = {};
  const Streams = self.importScript("https://scotwatson.github.io/WebInterface/streams.js");
  exports.default = class RPCNode {
    #callIds;
    #verbFunctions;
    #outputResolve;
    #outputReject;
    constructor({
    }) {
      this.#callIds = new Map();
      this.#verbFunctions = new Map();
      let nonCallResolve;
      const nonCallSource = async (output) => {
        await new Promise((resolve, reject) => {
          nonCallResolve = output.put;
        });
      };
      this.nonCall = new Streams.SourceNode(nonCallSource);
      const outputSource = async (output) => {
        await new Promise((resolve, reject) => {
          this.#outputResolve = output.put;
          this.#outputReject = reject;
        });
      };
      this.output = new Streams.SourceNode(outputSource);
      const requestHandler = async (data) => {
        const thisFunction = this.#verbFunctions.get(data.verb);
        if (typeof thisFunction !== "function") {
          this.#outputResolve({
            callId: data.callId,
            response: "error",
            reason: "Unregistered verb: " + data.verb,
          });
          return;
        }
        try {
          const ret = await thisFunction(data.args);
          this.#outputResolve({
            callId: data.callId,
            response: "ok",
            value: ret,
          });
        } catch (e) {
          this.#outputResolve({
            callId: data.callId,
            response: "error",
            reason: e.message,
          });
        }
      }
      const responseOkHandler = (data) => {
        console.log("responseOk", data);
        const functions = this.#callIds.get(data.callId);
        if (functions !== undefined) {
          functions.resolve(data.value);
          this.#callIds.delete(data.callId);
        }
      }
      const responseErrorHandler = (data) => {
        console.log("responseError", data);
        const functions = this.#callIds.get(data.callId);
        if (functions !== undefined) {
          functions.reject(data.reason);
          this.#callIds.delete(data.callId);
        }
      }
      const parseInput = (data) => {
        if ((typeof data !== "object") || (data === null) || !("callId" in data)) {
          nonCallResolve(data);
          return;
        }
        if (typeof data.verb === "string") {
          requestHandler(data);
        } else if (typeof data.response === "string") {
          switch (data.response) {
            case "ok": {
              responseOkHandler(data);
            }
              break;
            case "error": {
              responseErrorHandler(data);
            }
              break;
            default: {
              this.#outputResolve({
                callId: data.callId,
                response: "error",
                reason: "Invalid Response",
              });
            }
          };
        } else {
          this.#outputResolve({
            callId: data.callId,
            response: "error",
            reason: "Invalid Message: " + JSON.stringify(data),
          });
        }
      }
      this.input = new Streams.SinkNode(parseInput);
    }
    register({
      verb,
      handlerFunc,
    }) {
      console.log("register", verb);
      this.#verbFunctions.set(verb, handlerFunc);
    }
    unregister({
      verb,
    }) {
      this.#verbFunctions.delete(verb);
    }
    // returns a promise, so acts as an async function
    call({
      verb,
      args,
    }) {
      console.log("call", verb);
      if (!verb) {
        throw "Invalid Verb";
      }
      const callId = self.crypto.randomUUID();
      const requesting = new Promise((resolve, reject) => {
        this.#callIds.set(callId, { resolve, reject });
        this.#outputResolve({
          callId,
          verb,
          args,
        });
      });
      requesting.callId = callId;
      return requesting;
    }
  };
  return exports;
})();
