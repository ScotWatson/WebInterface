/*
(c) 2024 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export * as Streams from "https://scotwatson.github.io/WebInterface/streams.mjs";
export { default as RemoteProcedureSocket } from "https://scotwatson.github.io/WebInterface/RemoteProcedureSocket.mjs";

export async function base64Decode(str) {
  return await (new self.Blob([ self.atob(str) ])).arrayBuffer();
};
export function base64Encode(view) {
  let rawString = "";
  for (const byte of view) {
    rawString += String.fromCharCode(byte);
  }
  return self.btoa(rawString);
};
