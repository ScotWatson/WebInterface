/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

self.currentScript.exports = (function () {
  const exports = {};
  const Common = self.importScript("https://scotwatson.github.io/WebInterface/common.js");
  const MessagingCommon = self.importScript("https://scotwatson.github.io/WebInterface/messaging-common.js");
  exports.createRemoteProcedureSocket = MessagingCommon.createRemoteProcedureSocket;
  const registeredClients = new Map();
  let unregisteredClientHandler;
  self.addEventListener("message", function (evt) {
    const thisClient = registeredClients.get(evt.source.id);
    if (thisClient) {
      for (const source of thisClient.sources) {
        source(evt.data);
      }
    } else {
      unregisteredClientHandler(evt);
    }
  });
  self.addEventListener("messageerror", console.error);
  exports.newClientMessage = Common.createSignal(function (resolve, reject) {
    unregisteredClientHandler = resolve;
  });
  exports.createClientSource = function createClientSource({
    client,
  }) {
    return {
      message: Common.createSignal(function (resolve, reject) {
        thisClient = registeredClients.get(client.id);
        if (!thisClient) {
          thisClient = {
            sources: new Set(),
          };
          registeredClients.set(client.id, thisClient);
        }
        thisClient.sources.add(resolve);
      }),
    };
  };
  exports.createClientSink = function createClientSink({
    client,
  }) {
    return {
      send: function ({
        data,
        transfer,
      }) {
        console.log(data, transfer);
        client.postMessage(data, transfer);
      },
    }
  };
  return exports;
})();
