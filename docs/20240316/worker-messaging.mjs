/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const Common = await import("https://scotwatson.github.io/WebInterface/common.mjs");
const MessagingCommon = await import("https://scotwatson.github.io/WebInterface/messaging-common.mjs");

export const createRemoteProcedureSocket = MessagingCommon.createRemoteProcedureSocket;

export const parentSource = {
  message: Common.createSignal(function (resolve, reject) {
    self.addEventListener("message", function (evt) {
      resolve(evt.data);
    });
    self.addEventListener("messageerror", reject);
  }),
};

export const parentSink = {
  send: function ({
    data,
    transfer,
  }) {
    self.postMessage(data, transfer);
  },
}
