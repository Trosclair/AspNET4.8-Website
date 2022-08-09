if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimationFrame = function (callback) { return window.setTimeout(callback, 1); };
}
// ASCII codes for the controls
const Key = {
    ESC: 27,
    SPACE: 32,
    ROTATERIGHT: 75,
    ROTATELEFT: 74,
    HARDDROP: 87,
    HOLD: 69,
    LEFT: 65,
    RIGHT: 68,
    DOWN: 83
};
const Direction = {
    RIGHT: 0,
    DOWN: 1,
    LEFT: 2,
    ROTATERIGHT: 3,
    ROTATELEFT: 4,
    HARDDROP: 5,
    HOLD: 6,
};
const boardCanvas = document.getElementById('canvas');
const ctx = boardCanvas.getContext('2d');
const upcomingCanvas = document.getElementById('upcoming');
const uctx = boardCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold');
const hctx = boardCanvas.getContext('2d');
const widthOfBoard = 10;
const heightOfBoard = 20;
const widthAndHeightOfPreviewWindowInBlocks = 5;
const numberOfRotationOnEachPiece = 4;
class Piece {
    Size;
    Blocks;
    Color;
    X;
    Y;
    CurrentRotation;
    constructor(size, blocks, color) {
        this.Size = size;
        this.Blocks = blocks;
        this.Color = color;
        this.CurrentRotation = 0;
        this.X = 4;
        this.Y = 0;
    }
}
const I = new Piece(4, [0x00F0, 0x2222, 0x00F0, 0x2222], 'cyan');
const J = new Piece(3, [0x44C0, 0x8E00, 0x6440, 0x0E20], 'blue');
const L = new Piece(3, [0x4460, 0x0E80, 0xC440, 0x2E00], 'orange');
const U = new Piece(2, [0xCC00, 0xCC00, 0xCC00, 0xCC00], 'yellow');
const S = new Piece(3, [0x06C0, 0x4620, 0x06C0, 0x4620], 'green');
const T = new Piece(3, [0x0E40, 0x4C40, 0x4E00, 0x4640], 'purple');
const Z = new Piece(3, [0x0C60, 0x2640, 0x0C60, 0x2640], 'red');
//# sourceMappingURL=TSTetris.js.map