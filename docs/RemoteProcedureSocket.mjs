/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export default function RemoteProcedureSocket({
  messageSource,
  messageSink,
  timeout, // in ms
}) {
  const packetIds = new Map();
  const responseFunctions = new Map();
  this.register = ({
    functionName,
    handlerFunc,
  }) => {
    responseFunctions.set(functionName, handlerFunc);
  };
  this.unregister = ({
    functionName,
  }) => {
    responseFunctions.delete(functionName);
  };
  // returns a promise, so acts as an async function
  this.call = ({
    functionName,
    args,
    transferable,
  }) => {
    const packetId = self.crypto.randomUUID();
    const requesting = new Promise(function (resolve, reject) {
      packetIds.set(packetId, { resolve, reject });
      if (timeout) {
        self.setTimeout(rejectOnTimeout, timeout);
        function rejectOnTimeout() {
          reject("Request Timed Out: " + packetId);
        }
      }
      messageSink.send({
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
  (async function () {
    for await (const data of messageSource.message) {
      if (!data || !data.packetId) {
        // This is not a packet message
        continue;
      }
      switch (data.action) {
        case "request": {
          requestHandler(data);
        }
          break;
        case "response": {
          responseHandler(data);
        }
          break;
        case "error": {
          errorHandler(data);
        }
          break;
        default:
          messageSink.send({
            data: {
              packetId: data.packetId,
              action: "error",
              error: "Invalid Packet",
            },
          });
      }
    }
  })();
  async function requestHandler(data) {
    const thisFunction = responseFunctions.get(data.functionName);
    if (data.timeout) {
      if (Date.now() > data.timeout) {
        // ignore packet if expired
        return;
      }
    }
    if (typeof thisFunction !== "function") {
      messageSink.send({
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
      messageSink.send({
        data: {
          packetId: data.packetId,
          action: "response",
          value: ret,
        },
        transferable: data.args.transferable,
      });
    } catch (e) {
      messageSink.send({
        data: {
          packetId: data.packetId,
          action: "error",
          error: e.message,
        },
      });
    }
  }
  function responseHandler(data) {
    const functions = packetIds.get(data.packetId);
    if (functions !== undefined) {
      functions.resolve(data.value);
      packetIds.delete(data.packetId);
    }
  };
  function errorHandler(data) {
    const functions = packetIds.get(data.packetId);
    if (functions !== undefined) {
      functions.reject(data.reason);
      packetIds.delete(data.packetId);
    }
  };
}