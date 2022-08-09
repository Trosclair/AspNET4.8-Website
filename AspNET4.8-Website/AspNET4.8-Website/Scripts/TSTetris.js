import * as Pieces from "./Pieces";
if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimationFrame = function (callback) { return window.setTimeout(callback, 1); };
}
// ASCII codes for the controls
var Key;
(function (Key) {
    Key[Key["ESC"] = 27] = "ESC";
    Key[Key["SPACE"] = 32] = "SPACE";
    Key[Key["ROTATERIGHT"] = 75] = "ROTATERIGHT";
    Key[Key["ROTATELEFT"] = 74] = "ROTATELEFT";
    Key[Key["HARDDROP"] = 87] = "HARDDROP";
    Key[Key["HOLD"] = 69] = "HOLD";
    Key[Key["LEFT"] = 65] = "LEFT";
    Key[Key["RIGHT"] = 68] = "RIGHT";
    Key[Key["DOWN"] = 83] = "DOWN";
})(Key || (Key = {}));
const boardCanvas = document.getElementById('canvas');
const ctx = boardCanvas.getContext('2d');
const upcomingCanvas = document.getElementById('upcoming');
const uctx = boardCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold');
const hctx = boardCanvas.getContext('2d');
const widthAndHeightOfPreviewWindowInBlocks = 5;
let GameState = new Pieces.GameState();
//# sourceMappingURL=TSTetris.js.map