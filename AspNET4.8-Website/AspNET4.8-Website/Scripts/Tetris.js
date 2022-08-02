﻿//-------------------------------------------------------------------------
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

//-------------------------------------------------------------------------
// game constants
//-------------------------------------------------------------------------

var KEY = {
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
        MIN: 0,
        MAX: 3
    },
    boardCanvas = get('canvas'),
    ctx = boardCanvas.getContext('2d'),
    upcomingCanvas = get('upcoming'),
    uctx = upcomingCanvas.getContext('2d'),
    holdCanvas = get('hold'),
    hctx = holdCanvas.getContext('2d'),
    speed = { start: 0.6, decrement: 0.005, min: 0.1 }, // how long before piece drops by 1 row (seconds)
    widthOfBoard = 10, // width of tetris court (in blocks)
    heightOfBoard = 20, // height of tetris court (in blocks)
    widthHeightOfPreviewAndHold = 5,  // width/height of upcoming preview (in blocks)
    numberOfRotationsOnEachPiece = 4;
//-------------------------------------------------------------------------
// game variables (initialized during reset)
//-------------------------------------------------------------------------

var blockPixelSizeX, blockPixelSizeY,        // pixel size of a single tetris block
    blocks,        // 2 dimensional array (widthOfBoard*heightOfBoard) representing tetris court - either empty block or occupied by a 'piece'
    actions,       // queue of user actions (inputs)
    playing,       // true|false - game is in progress
    dt,            // time since starting this game
    current,       // the current piece
    next,          // the next piece
    hold,          // held piece
    score,         // the current score
    vscore,        // the currently displayed score (it catches up to score in small chunks - like a spinning slot machine)
    rows,          // number of completed rows in the current game
    step,          // how long before current piece drops by 1 row
    hasHeldPiece;

//-------------------------------------------------------------------------
// tetris pieces
//
// blocks: each element represents a rotation of the piece (0, 90, 180, 270)
//         each element is a 16 bit integer where the 16 bits represent
//         a 4x4 set of blocks, e.g. j.blocks[0] = 0x44C0
//
//             0100 = 0x4 << 12 =0x4000
//             0100 = 0x4 << 8 = 0x0400
//             1100 = 0xC << 4 = 0x00C0
//             0000 = 0x0 << 0 = 0x0000
//                               ------
//                               0x44C0
//
//-------------------------------------------------------------------------

var i = { size: 4, blocks: [0x00F0, 0x2222, 0x00F0, 0x2222], color: 'cyan' };
var j = { size: 3, blocks: [0x44C0, 0x8E00, 0x6440, 0x0E20], color: 'blue' };
var l = { size: 3, blocks: [0x4460, 0x0E80, 0xC440, 0x2E00], color: 'orange' };
var u = { size: 2, blocks: [0xCC00, 0xCC00, 0xCC00, 0xCC00], color: 'yellow' };
var s = { size: 3, blocks: [0x06C0, 0x4620, 0x06C0, 0x4620], color: 'green' };
var t = { size: 3, blocks: [0x0E40, 0x4C40, 0x4E00, 0x4640], color: 'purple' };
var z = { size: 3, blocks: [0x0C60, 0x2640, 0x0C60, 0x2640], color: 'red' };

//------------------------------------------------
// do the bit manipulation and iterate through each
// occupied block (x,y) for a given piece
//------------------------------------------------
function eachblock(type, x, y, dir, fn) {
    var bit, row = 0, col = 0, blocks = type.blocks[dir];
    for (bit = 0x8000; bit > 0; bit = bit >> 1) {
        if (blocks & bit) {
            fn(x + col, y + row);
        }
        if (++col === 4) {
            col = 0;
            ++row;
        }
    }
}

//-----------------------------------------------------
// check if a piece can fit into a position in the grid
//-----------------------------------------------------
function occupied(type, x, y, dir) {
    var result = false
    eachblock(type, x, y, dir, function (x, y) {
        if ((x < 0) || (x >= widthOfBoard) || (y < 0) || (y >= heightOfBoard) || getBlock(x, y))
            result = true;
    });
    return result;
}

//-----------------------------------------
// start with 4 instances of each piece and
// pick randomly until the 'bag is empty'
//-----------------------------------------
var pieces = [];
function randomPiece() {
    if (pieces.length == 0)
        pieces = [i, j, l, u, s, t, z];
    var type = pieces.splice(random(0, pieces.length - 1), 1)[0];
    return { type: type, dir: DIR.ROTATERIGHT, x: 4, y: 0 };
}


//-------------------------------------------------------------------------
// GAME LOOP
//-------------------------------------------------------------------------

function run() {

    addEvents(); // attach keydown and resize events

    var last = now = timestamp();
    function frame() {
        now = timestamp();
        update(Math.min(1, (now - last) / 1000.0)); // using requestAnimationFrame have to be able to handle large delta's caused when it 'hibernates' in a background or non-visible tab
        draw();
        last = now;
        requestAnimationFrame(frame, boardCanvas);
    }

    resize(); // setup all our sizing information
    reset();  // reset the per-game variables
    frame();  // start the first frame

}

function addEvents() {
    document.addEventListener('keydown', keydown, false);
    window.addEventListener('resize', resize, false);
}

function resize(event) {
    boardCanvas.width = boardCanvas.clientWidth;  // set boardCanvas logical size equal to its physical size
    boardCanvas.height = boardCanvas.clientHeight; // (ditto)
    upcomingCanvas.width = upcomingCanvas.clientWidth;
    upcomingCanvas.height = upcomingCanvas.clientHeight;
    holdCanvas.width = holdCanvas.clientWidth;
    holdCanvas.height = holdCanvas.clientHeight;
    blockPixelSizeX = boardCanvas.width / widthOfBoard; // pixel size of a single tetris block
    blockPixelSizeY = boardCanvas.height / heightOfBoard; // (ditto)
    needsRefresh.court = true;
    needsRefresh.next = true;
    needsRefresh.hold = true;
    hold = null;
}

function keydown(ev) {
    var handled = false;
    if (playing) {
        switch (ev.keyCode) {
            case KEY.LEFT: actions.push(DIR.LEFT); handled = true; break;
            case KEY.RIGHT: actions.push(DIR.RIGHT); handled = true; break;
            case KEY.ROTATERIGHT: actions.push(DIR.ROTATERIGHT); handled = true; break;
            case KEY.ROTATELEFT: actions.push(DIR.ROTATELEFT); handled = true; break;
            case KEY.DOWN: actions.push(DIR.DOWN); handled = true; break;
            case KEY.HARDDROP: actions.push(DIR.HARDDROP); handled = true; break;
            case KEY.HOLD: actions.push(DIR.HOLD); handled = true; break;
            case KEY.ESC: lose(); handled = true; break;
        }
    }
    else if (ev.keyCode == KEY.SPACE) {
        play();
        handled = true;
    }
    if (handled)
        ev.preventDefault(); // prevent arrow keys from scrolling the page (supported in IE9+ and all other browsers)
}

//-------------------------------------------------------------------------
// GAME LOGIC
//-------------------------------------------------------------------------

function play() { hide('start'); reset(); playing = true; }
function lose() { show('start'); setVisualScore(); playing = false; }

function setVisualScore(n) { vscore = n || score; needsRefresh.score = true; }
function setScore(n) { score = n; setVisualScore(n); }
function addScore(n) { score = score + n; }
function setRows(n) { rows = n; step = Math.max(speed.min, speed.start - (speed.decrement * rows)); needsRefresh.rows = true; }
function addRows(n) { setRows(rows + n); }
function getBlock(x, y) { return (blocks && blocks[x] ? blocks[x][y] : null); }
function setBlock(x, y, type) { blocks[x] = blocks[x] || []; blocks[x][y] = type; needsRefresh.court = true; }
function clearBlocks() { blocks = []; needsRefresh.court = true; }
function clearActions() { actions = []; }
function setCurrentPiece(piece) { current = piece || randomPiece(); needsRefresh.court = true; }
function setNextPiece(piece) { next = piece || randomPiece(); needsRefresh.next = true; }

function reset() {
    dt = 0;
    clearActions();
    clearBlocks();
    setRows(0);
    setScore(0);
    setCurrentPiece(next);
    setNextPiece();
    hold = null;
}

function update(idt) {
    if (playing) {
        if (vscore < score)
            setVisualScore(vscore + 1);
        handle(actions.shift());
        dt = dt + idt;
        if (dt > step) {
            dt = dt - step;
            drop();
        }
    }
}

function handle(action) {
    switch (action) {
        case DIR.LEFT: move(DIR.LEFT); break;
        case DIR.RIGHT: move(DIR.RIGHT); break;
        case DIR.ROTATERIGHT: rotateRight(); break;
        case DIR.ROTATELEFT: rotateLeft(); break;
        case DIR.DOWN: drop(); break;
        case DIR.HARDDROP: hardDrop(); break;
        case DIR.HOLD: holdPiece(); break;
    }
}

function move(dir) {
    var x = current.x, y = current.y;
    switch (dir) {
        case DIR.RIGHT: x = x + 1; break;
        case DIR.LEFT: x = x - 1; break;
        case DIR.DOWN: y = y + 1; break;
    }
    if (!occupied(current.type, x, y, current.dir)) {
        current.x = x;
        current.y = y;
        needsRefresh.court = true;
        return true;
    }
    else {
        return false;
    }
}

function rotateRight() {
    var newdir = (current.dir + 1) % numberOfRotationsOnEachPiece;
    if (!occupied(current.type, current.x, current.y, newdir)) {
        current.dir = newdir;
        needsRefresh.court = true;
    }
}

function rotateLeft() {
    var newdir = (current.dir + 3) % numberOfRotationsOnEachPiece;
    if (!occupied(current.type, current.x, current.y, newdir)) {
        current.dir = newdir;
        needsRefresh.court = true;
    }
}

function drop() {
    if (!move(DIR.DOWN)) {
        afterDrop();
    }
}

function hardDrop() {
    while (move(DIR.DOWN)) {
        addScore(10);
    }
    afterDrop();
}

function afterDrop() {
    addScore(10);
    dropPiece();
    removeLines();
    setCurrentPiece(next);
    setNextPiece(randomPiece());
    clearActions();
    hasHeldPiece = false;
    if (occupied(current.type, current.x, current.y, current.dir)) {
        lose();
    }
}

function holdPiece() {
    if (!hasHeldPiece) {
        hasHeldPiece = true;
        needsRefresh.hold = true;

        if (hold == null) {
            hold = current;
            setCurrentPiece(next);
            setNextPiece(randomPiece());
        }
        else {
            var tempHold = hold;
            hold = current;
            current = tempHold;
        }

        hold.x = 4;
        hold.y = 0;
        needsRefresh.court = true;
    }
}

function dropPiece() {
    eachblock(current.type, current.x, current.y, current.dir, function (x, y) {
        setBlock(x, y, current.type);
    });
}

function removeLines() {
    var x, y, complete, n = 0;
    for (y = heightOfBoard; y > 0; --y) {
        complete = true;
        for (x = 0; x < widthOfBoard; ++x) {
            if (!getBlock(x, y))
                complete = false;
        }
        if (complete) {
            removeLine(y);
            y = y + 1; // recheck same line
            n++;
        }
    }
    if (n > 0) {
        addRows(n);
        addScore(100 * Math.pow(2, n - 1)); // 1: 100, 2: 200, 3: 400, 4: 800
    }
}

function removeLine(n) {
    var x, y;
    for (y = n; y >= 0; --y) {
        for (x = 0; x < widthOfBoard; ++x)
            setBlock(x, y, (y == 0) ? null : getBlock(x, y - 1));
    }
}

//-------------------------------------------------------------------------
// RENDERING
//-------------------------------------------------------------------------

var needsRefresh = {};

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

function drawCourt() {
    if (needsRefresh.court) {
        ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
        if (playing) {
            drawPiece(ctx, current.type, current.x, current.y, current.dir);
        }
        var x, y, block;
        for (y = 0; y < heightOfBoard; y++) {
            for (x = 0; x < widthOfBoard; x++) {
                if (block = getBlock(x, y))
                    drawBlock(ctx, x, y, block.color);
            }
        }
        ctx.strokeRect(0, 0, widthOfBoard * blockPixelSizeX - 1, heightOfBoard * blockPixelSizeY - 1); // court boundary
        needsRefresh.court = false;
    }
}

function drawNext() {
    if (needsRefresh.next) {
        var padding = (widthHeightOfPreviewAndHold - next.type.size) / 2; // half-arsed attempt at centering next piece display
        uctx.save();
        uctx.translate(0.5, 0.5);
        uctx.clearRect(0, 0, widthHeightOfPreviewAndHold * blockPixelSizeX, widthHeightOfPreviewAndHold * blockPixelSizeY);
        drawPiece(uctx, next.type, padding, padding, next.dir);
        uctx.strokeStyle = 'black';
        uctx.strokeRect(0, 0, widthHeightOfPreviewAndHold * blockPixelSizeX - 1, widthHeightOfPreviewAndHold * blockPixelSizeY - 1);
        uctx.restore();
        needsRefresh.next = false;
    }
}

function drawHold() {
    if (needsRefresh.hold) {
        hctx.save();
        hctx.translate(0.5, 0.5);
        hctx.clearRect(0, 0, widthHeightOfPreviewAndHold * blockPixelSizeX - 1, widthHeightOfPreviewAndHold * blockPixelSizeY - 1);
        if (hold != null) {
            var padding = (widthHeightOfPreviewAndHold - hold.type.size) / 2; // half-arsed attempt at centering next piece display
            drawPiece(hctx, hold.type, padding, padding, hold.dir);
        }
        hctx.strokeStyle = 'black';
        hctx.strokeRect(0, 0, widthHeightOfPreviewAndHold * blockPixelSizeX - 1, widthHeightOfPreviewAndHold * blockPixelSizeY - 1);
        hctx.restore();
        needsRefresh.hold = true;
    }
}

function drawScore() {
    if (needsRefresh.score) {
        html('score', ("00000" + Math.floor(vscore)).slice(-5));
        needsRefresh.score = false;
    }
}

function drawRows() {
    if (needsRefresh.rows) {
        html('rows', rows);
        needsRefresh.rows = false;
    }
}

function drawPiece(ctx, type, x, y, dir) {
    eachblock(type, x, y, dir, function (x, y) {
        drawBlock(ctx, x, y, type.color);
    });
}

function drawBlock(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * blockPixelSizeX, y * blockPixelSizeY, blockPixelSizeX, blockPixelSizeY);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x * blockPixelSizeX, y * blockPixelSizeY, blockPixelSizeX, blockPixelSizeY)
}

//-------------------------------------------------------------------------
// FINALLY, lets run the game
//-------------------------------------------------------------------------

run();