import * as Pieces from "./Pieces"

if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimationFrame = function (callback: FrameRequestCallback) { return window.setTimeout(callback, 1); }  
}

// ASCII codes for the controls
enum Key {
    ESC = 27,
    SPACE = 32,
    ROTATERIGHT = 75,
    ROTATELEFT = 74,
    HARDDROP = 87,
    HOLD = 69,
    LEFT = 65,
    RIGHT = 68,
    DOWN = 83
}

const boardCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
const ctx: CanvasRenderingContext2D = boardCanvas.getContext('2d');
const upcomingCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('upcoming');
const uctx: CanvasRenderingContext2D = boardCanvas.getContext('2d');
const holdCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('hold');
const hctx: CanvasRenderingContext2D = boardCanvas.getContext('2d');
const widthAndHeightOfPreviewWindowInBlocks: number = 5;



