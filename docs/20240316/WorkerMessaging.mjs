/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const MessagingCommon = (function () {
  importScripts("https://scotwatson.github.io/WebInterface/20240316/MessagingCommon.js");
  return export;
})();

export const createRemoteProcedureSocket = MessagingCommon.createRemoteProcedureSocket;

const parentSource = Common.createSignal(function (resolve, reject) {
  self.addEventListener("message", resolve);
  self.addEventListener("messageerror", reject);
});

const parentSink = {
  send: function ({
    data,
    transfer,
  }) {
    self.postMessage(data, transfer);
  },
}
