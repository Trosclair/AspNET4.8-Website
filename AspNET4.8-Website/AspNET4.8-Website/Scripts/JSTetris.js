//-------------------------------------------------------------------------
// base helper methods
//-------------------------------------------------------------------------

function get(id) { return document.getElementById(id); }
function hide(id) { get(id).style.visibility = 'collapse'; }
function show(id) { get(id).style.visibility = 'visible'; }
function html(id, html) { get(id).innerHTML = html; }

function timestamp() { return new Date().getTime(); }
function random(min, max) { return (min + (Math.random() * (max - min))); }
function randomChoice(choices) { return choices[Math.round(random(0, choices.length - 1))]; }

if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback, element) {
            window.setTimeout(callback, 1);
        }
}

//---------------------------------------------------------------------------//
// Game constants                                                            //
//---------------------------------------------------------------------------//

const KEY = { // ASCII codes for the controls
        ESC: 27,
        SPACE: 32,
        ROTATERIGHT: 75,
        ROTATELEFT: 74,
        HARDDROP: 87,
        HOLD: 69,
        LEFT: 65,
        RIGHT: 68,
        DOWN: 83
    },
    DIR = {
        RIGHT: 0,
        DOWN: 1,
        LEFT: 2,
        ROTATERIGHT: 3,
        ROTATELEFT: 4,
        HARDDROP: 5,
        HOLD: 6,
    },
    boardCanvas = get('canvas'),
    ctx = boardCanvas.getContext('2d'),
    upcomingCanvas = get('upcoming'),
    uctx = upcomingCanvas.getContext('2d'),
    holdCanvas = get('hold'),
    hctx = holdCanvas.getContext('2d'),
    speed = { start: 0.6, decrement: 0.005, min: 0.1 }, // how long before piece drops by 1 row (seconds)
    widthOfBoard = 10,                                  // width of tetris court (in blocks)
    heightOfBoard = 20,                                 // height of tetris court (in blocks)
    widthHeightOfPreviewAndHold = 5,                    // width/height of upcoming preview (in blocks)
    numberOfRotationsOnEachPiece = 4;                   // each piece gets 4 different rotation possibilities.

//---------------------------------------------------------------------------//
// game variables (initialized during reset)                                 //
//---------------------------------------------------------------------------//
let blockPixelSizeX, blockPixelSizeY,                   // pixel size of a single tetris block
    blocks,                                             // 2 dimensional array (widthOfBoard*heightOfBoard) representing tetris court - either empty block or occupied by a 'piece'
    actions,                                            // queue of user actions (inputs)
    playing,                                            // true|false - game is in progress
    dt,                                                 // time since starting this game
    current,                                            // the current piece
    shadow,                                             // piece shadow
    next,                                               // the next piece
    hold,                                               // held piece
    score,                                              // the current score
    rows,                                               // number of completed rows in the current game
    step,                                               // how long before current piece drops by 1 row
    hasHeldPiece,                                       // Player can only hold a piece once during a inbetween each piece drop.
    willRefreshCourt = false,                           // Set to true to refresh the court html element
    willRefreshRows = false,                            // Set to true to refresh the row counter html element
    willRefreshHold = false,                            // Set to true to refresh the hold piece html element
    willRefreshNext = false,                            // Set to true to refresh the next piece html element
    willRefreshScore = false;                           // Set to true to refresh the score counter html element

//---------------------------------------------------------------------------//
// Tetris pieces                                                             //
//                                                                           //
// blocks: each element represents a rotation of the piece (0, 90, 180, 270) //
//         each element is a 16 bit integer where the 16 bits represent      //
//         a 4x4 set of blocks, e.g. j.blocks[0] = 0x44C0                    //
//                                                                           //
//             0100 = 0x4 << 12 =0x4000                                      //
//             0100 = 0x4 << 8 = 0x0400                                      //
//             1100 = 0xC << 4 = 0x00C0                                      //
//             0000 = 0x0 << 0 = 0x0000                                      //
//                               ------                                      //
//                               0x44C0                                      //
//                                                                           //
//---------------------------------------------------------------------------//

const i = { size: 4, blocks: [0x00F0, 0x2222, 0x00F0, 0x2222], color: 'cyan' };
const j = { size: 3, blocks: [0x44C0, 0x8E00, 0x6440, 0x0E20], color: 'blue' };
const l = { size: 3, blocks: [0x4460, 0x0E80, 0xC440, 0x2E00], color: 'orange' };
const u = { size: 2, blocks: [0xCC00, 0xCC00, 0xCC00, 0xCC00], color: 'yellow' };
const s = { size: 3, blocks: [0x06C0, 0x4620, 0x06C0, 0x4620], color: 'green' };
const t = { size: 3, blocks: [0x0E40, 0x4C40, 0x4E00, 0x4640], color: 'purple' };
const z = { size: 3, blocks: [0x0C60, 0x2640, 0x0C60, 0x2640], color: 'red' };

//---------------------------------------------------------------------------//
// do the bit manipulation and iterate through each                          //
// occupied block (x,y) for a given piece                                    //
//---------------------------------------------------------------------------//
function applyFunctionToEachBlockInAPiece(type, x, y, dir, fn) {
    for (let i = 0; i < 16; i++) {
        if (type.blocks[dir] & (0x8000 >> i))
            fn(x + (i % 4), y + ((i / 4)|0))
    }
}

//---------------------------------------------------------------------------//
// check if a piece can fit into a position in the grid                      //
//---------------------------------------------------------------------------//
function isCollision(type, x, y, dir) {
    let result = false
    applyFunctionToEachBlockInAPiece(type, x, y, dir, function (x, y) {
        if ((x < 0) || (x >= widthOfBoard) || (y < 0) || (y >= heightOfBoard) || isBlockPositionFilled(x, y))
            result = true;
    });
    return result;
}

//---------------------------------------------------------------------------//
// start with an instance of each piece and                                  //
// pick randomly until the 'bag is empty'                                    //
//---------------------------------------------------------------------------//
let pieces = [];
function randomPiece() {
    if (pieces.length == 0)
        pieces = [i, j, l, u, s, t, z];
    let type = pieces.splice(random(0, pieces.length - 1), 1)[0];
    return { type: type, dir: 0, x: 4, y: 0 };
}


//---------------------------------------------------------------------------//
// GAME LOOP                                                                 //
//---------------------------------------------------------------------------//

function run() {

    addEvents(); // attach keydown and resize events

    let last = now = timestamp();
    function frame() {
        now = timestamp();
        updatePieceAutoDropAndUserInput(Math.min(1, (now - last) / 1000.0)); // using requestAnimationFrame have to be able to handle large delta's caused when it 'hibernates' in a background or non-visible tab
        draw();
        last = now;
        requestAnimationFrame(frame, boardCanvas);
    }

    onWindowResize(); // setup all our sizing information
    reset();  // reset the per-game variables
    frame();  // start the first frame

}

function addEvents() {
    document.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('resize', onWindowResize, false);
}


function onWindowResize(event) {
    boardCanvas.width = boardCanvas.clientWidth;  // set boardCanvas logical size equal to its physical size
    boardCanvas.height = boardCanvas.clientHeight; // (ditto)
    upcomingCanvas.width = upcomingCanvas.clientWidth;
    upcomingCanvas.height = upcomingCanvas.clientHeight;
    holdCanvas.width = holdCanvas.clientWidth;
    holdCanvas.height = holdCanvas.clientHeight;
    blockPixelSizeX = boardCanvas.width / widthOfBoard; // pixel size of a single tetris block
    blockPixelSizeY = boardCanvas.height / heightOfBoard; // (ditto)
    willRefreshCourt = true;
    willRefreshNext = true;
    willRefreshHold = true;
    hold = null;
}

function onKeyDown(ev) {
    if (playing) {
        let handled = true;
        switch (ev.keyCode) {
            case KEY.LEFT: actions.push(DIR.LEFT); break;
            case KEY.RIGHT: actions.push(DIR.RIGHT); break;
            case KEY.ROTATERIGHT: actions.push(DIR.ROTATERIGHT); break;
            case KEY.ROTATELEFT: actions.push(DIR.ROTATELEFT); break;
            case KEY.DOWN: actions.push(DIR.DOWN); break;
            case KEY.HARDDROP: actions.push(DIR.HARDDROP); break;
            case KEY.HOLD: actions.push(DIR.HOLD); break;
            case KEY.ESC: lose(); break;
            default:
                handled = false;
        }
        if (handled)
            ev.preventDefault(); // prevent arrow keys from scrolling the page (supported in IE9+ and all other browsers)
    }
    else if (ev.keyCode == KEY.SPACE) {
        play();
        ev.preventDefault();
    }
}

//---------------------------------------------------------------------------//
// GAME LOGIC                                                                //
//---------------------------------------------------------------------------//

function play() { hide('start'); reset(); playing = true; }
function lose() { show('start'); willRefreshScore = true; playing = false; }

function addScore(n) { score = score + n; willRefreshScore = true; }
function setRows(n) { rows = n; step = Math.max(speed.min, speed.start - (speed.decrement * rows)); willRefreshRows = true; }
function isBlockPositionFilled(x, y) { return (blocks && blocks[x] ? blocks[x][y] : null); }
function setBlock(x, y, type) { blocks[x] = blocks[x] || []; blocks[x][y] = type; willRefreshCourt = true; }
function clearActions() { actions = []; }
function setCurrentPiece(piece) { current = piece || randomPiece(); willRefreshCourt = true; }
function setNextPiece(piece) { next = piece || randomPiece(); willRefreshNext = true; }

//---------------------------------------------------------------------------//
// Add a new piece to the board.                                             //
//---------------------------------------------------------------------------//
function reset() {
    dt = 0;
    clearActions();
    blocks = [];
    setRows(0);
    score = 0;
    willRefreshCourt = true;
    willRefreshScore = true;
    setCurrentPiece(next);
    setNextPiece();
    hold = null;
}

//---------------------------------------------------------------------------//
// Drop the piece down if a sufficient amount of time has passed and update  //
// user input.                                                               //
//---------------------------------------------------------------------------//
function updatePieceAutoDropAndUserInput(idt) {
    if (playing) {
        handleUserInput(actions.shift());
        dt = dt + idt;
        if (dt > step) {
            dt = dt - step;
            drop(false);
        }
    }
}

//---------------------------------------------------------------------------//
// handle user buffered user action.                                         //
//---------------------------------------------------------------------------//
function handleUserInput(action) {
    switch (action) {
        case DIR.LEFT: move(DIR.LEFT); break;
        case DIR.RIGHT: move(DIR.RIGHT); break;
        case DIR.ROTATERIGHT: rotateClockwise(); break;
        case DIR.ROTATELEFT: rotateCounterClockwise(); break;
        case DIR.DOWN: drop(true); break;
        case DIR.HARDDROP: hardDrop(); break;
        case DIR.HOLD: holdPiece(); break;
    }
}

//---------------------------------------------------------------------------//
// Move piece left, right, or down given buffered user input.                //
//---------------------------------------------------------------------------//
function move(dir) {
    let x = current.x, y = current.y;
    switch (dir) {
        case DIR.RIGHT: x = x + 1; break;
        case DIR.LEFT: x = x - 1; break;
        case DIR.DOWN: y = y + 1; break;
    }
    if (!isCollision(current.type, x, y, current.dir)) {
        current.x = x;
        current.y = y;
        willRefreshCourt = true;
        return true;
    }
    else {
        return false;
    }
}

//---------------------------------------------------------------------------//
// Calculate the y position for the drop shadow                              //
//---------------------------------------------------------------------------//
function calculateDropShadowYCoordinate() {
    let y = current.y;
    while (!isCollision(current.type, current.x, y, current.dir))
        y = y + 1;
    return y - 1;
}

//---------------------------------------------------------------------------//
// Rotate a piece clockwise                                                  //
//---------------------------------------------------------------------------//
function rotateClockwise() {
    let newdir = (current.dir + 1) % numberOfRotationsOnEachPiece;
    if (!isCollision(current.type, current.x, current.y, newdir)) {
        current.dir = newdir;
        willRefreshCourt = true;
    }
}

//---------------------------------------------------------------------------//
// Rotate a piece counter clockwise                                          //
//---------------------------------------------------------------------------//
function rotateCounterClockwise() {
    let newdir = (current.dir + 3) % numberOfRotationsOnEachPiece;
    if (!isCollision(current.type, current.x, current.y, newdir)) {
        current.dir = newdir;
        willRefreshCourt = true;
    }
}

//---------------------------------------------------------------------------//
// Move the piece down 1 block. if holding down add some score to reward     //
// risky play                                                                //
//---------------------------------------------------------------------------//
function drop(isHoldingDown) {
    if (isHoldingDown)
        addScore(10);

    if (!move(DIR.DOWN)) {
        afterDrop();
    }
}

//---------------------------------------------------------------------------//
// Drop the piece down until it collides with another piece.                 //
//---------------------------------------------------------------------------//
function hardDrop() {
    while (move(DIR.DOWN)) {
        addScore(10);
    }
    addScore(10);
    afterDrop();
}

//---------------------------------------------------------------------------//
// The current piece has tried to move down and collided with either         //
// the bottom of the board or another piece. either way lock it in and       //
// setup for the next piece                                                  //
//---------------------------------------------------------------------------//
function afterDrop() {
    dropPiece();
    removeLines();
    setCurrentPiece(next);
    setNextPiece(randomPiece());
    clearActions();
    hasHeldPiece = false;
    if (isCollision(current.type, current.x, current.y, current.dir)) {
        lose();
    }
}

//---------------------------------------------------------------------------//
// Add current piece to the hold box and either generate a new or swap       //
// with the hold box if the hold box already has one                         //
//---------------------------------------------------------------------------//
function holdPiece() {
    if (!hasHeldPiece) {
        hasHeldPiece = true;
        willRefreshHold = true;

        if (hold == null) {
            hold = current;
            setCurrentPiece(next);
            setNextPiece(randomPiece());
        }
        else {
            let tempHold = hold;
            hold = current;
            current = tempHold;
        }

        hold.x = 4;
        hold.y = 0;
        willRefreshCourt = true;
    }
}

//---------------------------------------------------------------------------//
// Add a new piece to the board.                                             //
//---------------------------------------------------------------------------//
function dropPiece() {
    applyFunctionToEachBlockInAPiece(current.type, current.x, current.y, current.dir, function (x, y) {
        setBlock(x, y, current.type);
    });
}

//---------------------------------------------------------------------------//
// Remove lines from the board while counting them and updating the score    //
//---------------------------------------------------------------------------//
function removeLines() {
    let n = 0;
    for (let y = heightOfBoard; y > 0; --y) {
        let complete = true;
        for (let x = 0; x < widthOfBoard; ++x) {
            if (!isBlockPositionFilled(x, y))
                complete = false;
        }
        if (complete) {
            removeLine(y);
            y = y + 1; // recheck same line
            n++;
        }
    }
    if (n > 0) {
        setRows(n + rows);
        addScore(100 * Math.pow(2, n - 1)); // 1: 100, 2: 200, 3: 400, 4: 800
    }
}

//---------------------------------------------------------------------------//
// Remove line from the board                                                //
//---------------------------------------------------------------------------//
function removeLine(n) {
    for (let y = n; y >= 0; --y) {
        for (let x = 0; x < widthOfBoard; ++x)
            setBlock(x, y, (y == 0) ? null : isBlockPositionFilled(x, y - 1));
    }
}

//---------------------------------------------------------------------------//
// RENDERING                                                                 //
//---------------------------------------------------------------------------//


//---------------------------------------------------------------------------//
// Main draw function                                                        //
//---------------------------------------------------------------------------//
function draw() {
    ctx.save();
    ctx.lineWidth = 1;
    ctx.translate(0.5, 0.5); // for crisp 1px black lines
    drawCourt();
    drawRows();
    drawNext();
    drawHold();
    drawScore();
    ctx.restore();
}

//---------------------------------------------------------------------------//
// Re-draw the court html element.                                           //
// This function also redraws the piece and it's shadow.                     //
//---------------------------------------------------------------------------//
function drawCourt() {
    if (willRefreshCourt) {
        ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
        if (playing) {
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
}

//---------------------------------------------------------------------------//
// Re-draw the next box html element.                                        //
//---------------------------------------------------------------------------//
function drawNext() {
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
function drawHold() {
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
function drawScore() {
    if (willRefreshScore) {
        html('score', ("00000" + Math.floor(score)).slice(-5));
        willRefreshScore = false;
    }
}

//---------------------------------------------------------------------------//
// Re-draw the row counter html element.                                     //
//---------------------------------------------------------------------------//
function drawRows() {
    if (willRefreshRows) {
        html('rows', rows);
        willRefreshRows = false;
    }
}

//---------------------------------------------------------------------------//
// Loop through all four blocks of the given piece and draw them.            //
//---------------------------------------------------------------------------//
function drawPiece(ctx, type, dir, x, y, color) {
    applyFunctionToEachBlockInAPiece(type, x, y, dir, function (x, y) {
        drawBlock(ctx, x, y, color);
    });
}

//---------------------------------------------------------------------------//
// Draw the block at the given co-ordinates.                                 //
//---------------------------------------------------------------------------//
function drawBlock(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * blockPixelSizeX, y * blockPixelSizeY, blockPixelSizeX, blockPixelSizeY);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x * blockPixelSizeX, y * blockPixelSizeY, blockPixelSizeX, blockPixelSizeY)
}

//---------------------------------------------------------------------------//
// Run the game!                                                             //
//---------------------------------------------------------------------------//
run();