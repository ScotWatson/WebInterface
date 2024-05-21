/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

importScripts("https://scotwatson.github.io/WebInterface/common.js");

const Messaging = {};
const registeredClients = new Map();
let unregisteredClientHandler;

self.addEventListener("message", function (evt) {
  const thisClient = registeredClients.get(evt.source);
  if (thisClient) {
    for (const source of thisClient.sources) {
      source(evt);
    }
  } else {
    unregisteredClientHandler(evt);
  }
});
self.addEventListener("messageerror", console.error);

const newClientMessage = Common.createSignal(function (resolve, reject) {
  unregisteredClientHandler = resolve;
}),

Messaging.createClientSource = function createClientSource({
  client,
}) {
  return {
    message: Common.createSignal(function (resolve, reject) {
      registeredClients.set(client, resolve);
    }),
  };
};

Messaging.createClientSink = function createClientSink({
  client,
}) {
  return {
    send: function ({
      data,
      transfer,
    }) {
      client.postMessage(data, transfer);
    },
  }
};
