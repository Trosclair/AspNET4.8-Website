import * as Pieces from "./Pieces";
if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimationFrame = function (callback) { return window.setTimeout(callback, 1); };
}
// ASCII codes for the controls
var KEY;
(function (KEY) {
    KEY[KEY["ESC"] = 27] = "ESC";
    KEY[KEY["SPACE"] = 32] = "SPACE";
    KEY[KEY["ROTATECLOCKWISE"] = 75] = "ROTATECLOCKWISE";
    KEY[KEY["ROTATECOUNTERCLOCKWISE"] = 74] = "ROTATECOUNTERCLOCKWISE";
    KEY[KEY["HARDDROP"] = 87] = "HARDDROP";
    KEY[KEY["HOLD"] = 69] = "HOLD";
    KEY[KEY["LEFT"] = 65] = "LEFT";
    KEY[KEY["RIGHT"] = 68] = "RIGHT";
    KEY[KEY["DOWN"] = 83] = "DOWN";
})(KEY || (KEY = {}));
const boardCanvas = document.getElementById('canvas');
const ctx = boardCanvas.getContext('2d');
const upcomingCanvas = document.getElementById('upcoming');
const uctx = upcomingCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold');
const hctx = holdCanvas.getContext('2d');
const widthAndHeightOfPreviewWindowInBlocks = 5;
const WidthOfBoard = 10;
const HeightOfBoard = 20;
let GameState = new Pieces.GameState();
let BlockPixelSizeX = boardCanvas.width / WidthOfBoard; // pixel size of a single tetris block
let BlockPixelSizeY = boardCanvas.height / HeightOfBoard; // (ditto)
let dropTime = 0;
function Run() {
    document.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('resize', onWindowResize, false);
    let lastTime;
    let nowTime = lastTime = Date.now();
    function update() {
        nowTime = Date.now();
        AutoDrop(Math.min(1, (nowTime - lastTime) / 1000.0));
        UpdateUI();
        lastTime = nowTime;
        requestAnimationFrame(update);
    }
    onWindowResize(null);
    update();
}
function AutoDrop(tickTime) {
    if (GameState.IsPlaying) {
        dropTime += tickTime;
        if (dropTime > GameState.DropTimeStep) {
            dropTime -= GameState.DropTimeStep;
            GameState.Drop(false);
        }
    }
}
function onWindowResize(event) {
    boardCanvas.width = boardCanvas.clientWidth; // set boardCanvas logical size equal to its physical size
    boardCanvas.height = boardCanvas.clientHeight; // (ditto)
    upcomingCanvas.width = upcomingCanvas.clientWidth;
    upcomingCanvas.height = upcomingCanvas.clientHeight;
    holdCanvas.width = holdCanvas.clientWidth;
    holdCanvas.height = holdCanvas.clientHeight;
    BlockPixelSizeX = boardCanvas.width / WidthOfBoard; // pixel size of a single tetris block
    BlockPixelSizeY = boardCanvas.height / HeightOfBoard; // (ditto)
}
function onKeyDown(ev) {
    if (GameState.IsPlaying) {
        let handled = true;
        switch (ev.keyCode) {
            case KEY.LEFT:
                GameState.MoveLeft();
                break;
            case KEY.RIGHT:
                GameState.MoveRight();
                break;
            case KEY.ROTATECLOCKWISE:
                GameState.RotateClockwise();
                break;
            case KEY.ROTATECOUNTERCLOCKWISE:
                GameState.RotateCounterClockwise();
                break;
            case KEY.DOWN:
                GameState.Drop(true);
                break;
            case KEY.HARDDROP:
                GameState.HardDrop();
                break;
            case KEY.HOLD:
                GameState.HoldPiece();
                break;
            case KEY.ESC:
                GameState.Lose();
                break;
            default:
                handled = false;
        }
        if (handled)
            ev.preventDefault(); // prevent arrow keys from scrolling the page (supported in IE9+ and all other browsers)
    }
    else if (ev.keyCode == KEY.SPACE) {
        GameState.Play();
        ev.preventDefault();
    }
}
function UpdateUI() {
}
//# sourceMappingURL=TSTetris.js.map