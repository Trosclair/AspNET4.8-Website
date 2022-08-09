import * as Pieces from "./Pieces"

if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimationFrame = function (callback: FrameRequestCallback) { return window.setTimeout(callback, 1); }  
}

// ASCII codes for the controls
enum KEY {
    ESC = 27,
    SPACE = 32,
    ROTATECLOCKWISE = 75,
    ROTATECOUNTERCLOCKWISE = 74,
    HARDDROP = 87,
    HOLD = 69,
    LEFT = 65,
    RIGHT = 68,
    DOWN = 83
}

const boardCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
const ctx: CanvasRenderingContext2D = boardCanvas.getContext('2d');
const upcomingCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('upcoming');
const uctx: CanvasRenderingContext2D = upcomingCanvas.getContext('2d');
const holdCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('hold');
const hctx: CanvasRenderingContext2D = holdCanvas.getContext('2d');
const widthAndHeightOfPreviewWindowInBlocks: number = 5;
const WidthOfBoard: number = 10;
const HeightOfBoard: number = 20;

let GameState: Pieces.GameState = new Pieces.GameState();
let BlockPixelSizeX = boardCanvas.width / WidthOfBoard; // pixel size of a single tetris block
let BlockPixelSizeY = boardCanvas.height / HeightOfBoard; // (ditto)
let dropTime: number = 0;

function Run() {
    document.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('resize', onWindowResize, false);

    let lastTime: number;
    let nowTime: number = lastTime = Date.now();

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

function AutoDrop(tickTime: number) {
    if (GameState.IsPlaying) {
        dropTime += tickTime;
        if (dropTime > GameState.DropTimeStep) {
            dropTime -= GameState.DropTimeStep;
            GameState.Drop(false);
        }
    }
}

function onWindowResize(event: any) {
    boardCanvas.width = boardCanvas.clientWidth;  // set boardCanvas logical size equal to its physical size
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
    ctx.save();
    ctx.lineWidth = 1;
    ctx.translate(0.5, 0.5); // for crisp 1px black lines


    ctx.restore();
}

//---------------------------------------------------------------------------//
// Re-draw the court html element.                                           //
// This function also redraws the piece and it's shadow.                     //
//---------------------------------------------------------------------------//
function DrawBoard() {
    ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
    if (GameState.IsPlaying) {
        drawPiece(ctx, current.type, current.dir, current.x, calculateDropShadowYCoordinate(), 'gray');             // Draw the Shadow
        drawPiece(ctx, current.type, current.dir, current.x, current.y, current.type.color);
    }
    let block;
    for (let y = 0; y < heightOfBoard; y++) {
        for (let x = 0; x < widthOfBoard; x++) {
            if (block = isBlockPositionFilled(x, y))
                drawBlock(ctx, x, y, block.color);
        }
    }
    ctx.strokeRect(0, 0, widthOfBoard * blockPixelSizeX - 1, heightOfBoard * blockPixelSizeY - 1); // court boundary
    willRefreshCourt = false;
}

//---------------------------------------------------------------------------//
// Re-draw the next box html element.                                        //
//---------------------------------------------------------------------------//
function DrawNext() {
    if (willRefreshNext) {
        var padding = (widthHeightOfPreviewAndHold - next.type.size) / 2; // half-arsed attempt at centering next piece display
        uctx.save();
        uctx.translate(0.5, 0.5);
        uctx.clearRect(0, 0, widthHeightOfPreviewAndHold * blockPixelSizeX, widthHeightOfPreviewAndHold * blockPixelSizeY);
        drawPiece(uctx, next.type, next.dir, padding, padding, next.type.color);
        uctx.strokeStyle = 'black';
        uctx.strokeRect(0, 0, widthHeightOfPreviewAndHold * blockPixelSizeX - 1, widthHeightOfPreviewAndHold * blockPixelSizeY - 1);
        uctx.restore();
        willRefreshNext = false;
    }
}

//---------------------------------------------------------------------------//
// Re-draw the hold box html element                                         //
//---------------------------------------------------------------------------//
function DrawHold() {
    if (willRefreshHold) {
        hctx.save();
        hctx.translate(0.5, 0.5);
        hctx.clearRect(0, 0, widthHeightOfPreviewAndHold * blockPixelSizeX - 1, widthHeightOfPreviewAndHold * blockPixelSizeY - 1);
        if (hold != null) {
            var padding = (widthHeightOfPreviewAndHold - hold.type.size) / 2; // half-arsed attempt at centering next piece display
            drawPiece(hctx, hold.type, hold.dir, padding, padding, hold.type.color);
        }
        hctx.strokeStyle = 'black';
        hctx.strokeRect(0, 0, widthHeightOfPreviewAndHold * blockPixelSizeX - 1, widthHeightOfPreviewAndHold * blockPixelSizeY - 1);
        hctx.restore();
        willRefreshHold = true;
    }
}

//---------------------------------------------------------------------------//
// Re-draw the score html element.                                           //
//---------------------------------------------------------------------------//
function DrawScore() {
    html('score', ("00000" + Math.floor(GameState.Score)).slice(-5));
}

//---------------------------------------------------------------------------//
// Re-draw the row counter html element.                                     //
//---------------------------------------------------------------------------//
function DrawRows() {
    html('rows', GameState.GetLinesCleared);
}

//---------------------------------------------------------------------------//
// Loop through all four blocks of the given piece and draw them.            //
//---------------------------------------------------------------------------//
function DrawPiece(ctx, type, dir, x, y, color) {
    Pieces.GameState.ApplyFunctionToEachBlockInAPiece(type, x, y, dir, function (x, y) {
        DrawBlock(ctx, x, y, color);
    });
}

//---------------------------------------------------------------------------//
// Draw the block at the given co-ordinates.                                 //
//---------------------------------------------------------------------------//
function DrawBlock(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BlockPixelSizeX, y * BlockPixelSizeY, BlockPixelSizeX, BlockPixelSizeY);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x * BlockPixelSizeX, y * BlockPixelSizeY, BlockPixelSizeX, BlockPixelSizeY)
}

//---------------------------------------------------------------------------//
// Run the game!                                                             //
//---------------------------------------------------------------------------//
Run();