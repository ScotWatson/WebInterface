/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

self.currentScript.exports = (function () {
  const exports = {};
  const Common = self.importScript("https://scotwatson.github.io/WebInterface/common.js");
  exports.Common = Common;
  const registeredClients = new Map();
  let unregisteredClientHandler;
  self.addEventListener("message", function (evt) {
    if (evt.source === null) {
      // Should only occur on MessagePorts and DedicatedWorkers
      throw "Internal Logic Error";
    }
    switch (evt.source.constructor.name) {
      case "WindowClient":
      case "WorkerClient":
      case "ServiceWorker":
        enqueueMessage({
          origin: evt.origin,
          source: evt.source,
          data: evt.data,
        });
        break;
      default:
        // This should not occur for Service Workers
        throw "Internal Logic Error: " + evt.source.constructor.name;
    }
  });
  function enqueueMessage(evt) {
    const thisClient = registeredClients.get(evt.source.id);
    if (thisClient) {
      for (const source of thisClient.sources) {
        source(evt.data);
      }
    } else {
      unregisteredClientHandler(evt);
    }
  };
  exports.enqueueMessage = enqueueMessage;
  self.addEventListener("messageerror", console.error);
  const newClientMessageSource = async (output) => {
    unregisteredClientHandler = output.put;
  };
  exports.newClientMessage = new Common.Streams.SourceNode(newClientMessageSource);
  function ClientNode({
    client,
  }) {
    const outputSource = async (output) => {
      thisClient = registeredClients.get(client.id);
      if (!thisClient) {
        thisClient = {
          sources: new Set(),
        };
        registeredClients.set(client.id, thisClient);
      }
      thisClient.sources.add(resolve);
    };
    return {
      output: new Common.Streams.SourceNode(outputSource),
      input: new Common.Streams.SinkNode((data) => {
        Common.MessageNode.postMessage(client, data);
      }),
    };
  };
  exports.ClientNode = ClientNode;
  return exports;
})();
