/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

(self.document === undefined ? self : self.document).currentScript.exports = (() => {
  const exports = {};
  exports.MessageNode = self.importScript("https://scotwatson.github.io/WebInterface/message-node.js");
  exports.Streams = self.importScript("https://scotwatson.github.io/WebInterface/streams.js");
  exports.RemoteProcedureSocket = self.importScript("https://scotwatson.github.io/WebInterface/RemoteProcedureSocket.js").default;
  exports.base64Decode =  async function base64Decode(str) {
    return await (new self.Blob([ self.atob(str) ])).arrayBuffer();
  };
  exports.base64Encode = function base64Encode(view) {
    let rawString = "";
    for (const byte of view) {
      rawString += String.fromCharCode(byte);
    }
    return self.btoa(rawString);
  };
  return exports;
})();
