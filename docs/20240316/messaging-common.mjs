/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVpacketIdED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const Common = await import("https://scotwatson.github.io/WebInterface/common.mjs");

export function createRemoteProcedureSocket({
  messageSource,
  messageSink,
}) {
  const obj = {};
  const messagepacketIds = new Map();
  const responseFunctions = new Map();
  obj.register = function ({
    functionName,
    handlerFunc,
  }) {
    responseFunctions.set(functionName, handlerFunc);
  };
  obj.unregister = function ({
    functionName,
  }) {
    responseFunctions.delete(functionName);
  };
  // returns a promise, so acts as an async function
  obj.call = function ({
    functionName,
    args,
    transferable,
  }) {
    return new Promise(function (resolve, reject) {
      const messagepacketId = self.crypto.randomUUpacketId();
      messagepacketIds.set(messagepacketId, { resolve, reject });
      messageSink.send({
        data: {
          packetId: messagepacketId,
          action: "request",
          functionName: functionName,
          args: args,
        },
        transferable: transferable,
      });
    });
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
          error: e,
        },
      });
    }
  }
  function responseHandler(data) {
    const functions = messagepacketIds.get(data.packetId);
    if (functions !== undefined) {
      functions.resolve(data.value);
      messagepacketIds.delete(data.packetId);
    }
  };
  function errorHandler(data) {
    const functions = messagepacketIds.get(data.packetId);
    if (functions !== undefined) {
      functions.reject(data.reason);
      messagepacketIds.delete(data.packetId);
    }
  };
  return obj;
}
