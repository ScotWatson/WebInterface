/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Provides useful non-standard extensions to the browser "window" api (main thread)

class wifRawStringEncoder {
  constructor() {
  }
  encode(text) {
    if (typeof text !== "string") {
      throw new Error("Invalid argument, must be string");
    }
    let retView = new UInt8Array(text.length);
    let i = 0;
    for (let char of text) {
      retView[i] = char.charCodeAt(0);
      ++i;
    }
    return retView.buffer;
  }
}
class wifRawStringDecoder {
  constructor() {
  }
  decode(buffer) {
    if (!(buffer instanceof ArrayBuffer)) {
      throw new Error("Invalid argument, must be ArrayBuffer");
    }
    let ret = "";
    for (let byte of buffer) {
      ret += String.fromCharCode(byte);
    }
    return ret;
  }
}
class wifBase64Encoder {
  constructor() {
  }
  encode(text) {
    if (typeof text !== "string") {
      throw new Error("Invalid argument, must be string");
    }
    const encoder = new wifRawStringEncoder();
    try {
      return encoder.encode(atob(text));
    } catch (err) {
      throw new Error("Invalid input");
    }
  }
}
class wifBase64Decoder {
  constructor() {
  }
  decode(buffer) {
    if (!(buffer instanceof ArrayBuffer)) {
      throw new Error("Invalid argument, must be ArrayBuffer");
    }
    const decoder = new wifRawStringDecoder();
    try {
      return btoa(decoder.decode(buffer));
    } catch (err) {
      throw new Error("Invalid input");
    }
  }
}
