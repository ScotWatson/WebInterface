/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

let myWorker = new Worker("https://scotwatson.github.io/TestWorker/worker.js");

sendMessageToWorker(myWorker, "Hello World!");

myWorker.addEventListener("message", function(e) {
  if (e.data.requestId) {
    sendResponse(myWorker, parseRequest(e.data.body));
  } else {
    console.log("Non-request message from worker: ");
  }
});

function sendResponse(worker, message) {
  worker.postMessage(message);
}

function parseRequest() {
  if (request.command) {
    switch (request.command) {
      case "addButton":
        return addButton();
      default:
        console.log("Unrecognized command");
    }
  }
}

function addButton() {
  let btn = document.createElement("div");
  btn.innerHTML = "Button";
  document.body.appendChild(btn);
  return "Button created";
}
