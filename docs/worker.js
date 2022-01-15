self.addEventListener("message", function(e) {
  alert("Message from index.js:" + e.data);
  postMessage("Hello to you, too!");
}
