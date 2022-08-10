
if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimationFrame = function (callback: FrameRequestCallback) { return window.setTimeout(callback, 1); }  
}

const boardCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
const ctx: CanvasRenderingContext2D | null = boardCanvas.getContext('2d');
const upcomingCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('upcoming');
const uctx: CanvasRenderingContext2D | null = upcomingCanvas.getContext('2d');
const holdCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('hold');
const hctx: CanvasRenderingContext2D | null = holdCanvas.getContext('2d');
const widthAndHeightOfPreviewWindowInBlocks: number = 5;
const WidthOfBoard: number = 10;
const HeightOfBoard: number = 20;

enum Direction {
    RIGHT = 0,
    DOWN = 1,
    LEFT = 2,
    ROTATERIGHT = 3,
    ROTATELEFT = 4,
    HARDDROP = 5,
    HOLD = 6,
}

class GameState {
    public Board: Piece[][];
    public CurrentPiece: Piece;
    public HeldPiece: Piece | null;
    public NextPiece: Piece;
    public Score: number = 0;
    public IsPlaying: boolean;
    public HasHeldPiece: boolean;
    public Level: number;
    public DropTimeStep: number;
    private ClearedLines: number;

    constructor() {
        this.Reset();
    }

    private Reset() {
        this.Board = [];
        for (let i: number = 0; i < WidthOfBoard; i++) {
            this.Board[i] = [];
            for (let j: number = 0; j < HeightOfBoard; j++)
                this.Board[i][j] = null;
        }
        this.CurrentPiece = Piece.GetRandomPiece();
        this.NextPiece = Piece.GetRandomPiece();
        this.HeldPiece = null;
        this.Score = 0;
        this.ClearedLines = 0;
        this.IsPlaying = false;
        this.HasHeldPiece = false;
        this.Level = 0;
        this.DropTimeStep = 0.6;
    }

    public Play() {
        this.Reset();
        this.IsPlaying = true;
    }

    public Lose() {
        this.IsPlaying = false;
    }

    public SetClearedLines(numberOfClearedLines: number) {
        this.ClearedLines += numberOfClearedLines;
        this.Level = (this.ClearedLines / 10) | 0;
        this.DropTimeStep = Math.max(0.1, 0.6 - (.050 * this.Level));
    }

    public GetLinesCleared(): number {
        return this.ClearedLines;
    }

    public HoldPiece() {
        if (!this.HasHeldPiece) {
            this.HasHeldPiece = true;

            if (this.HeldPiece == null) {
                this.HeldPiece = this.CurrentPiece;
                this.CurrentPiece = this.NextPiece;
                this.NextPiece = Piece.GetRandomPiece();
            }
            else {
                const tempHold = this.HeldPiece;
                this.HeldPiece = this.CurrentPiece;
                this.CurrentPiece = tempHold;
            }

            this.HeldPiece.X = 4;
            this.HeldPiece.Y = 0;
        }
    }

    public GetCurrentPieceShadowY() {
        let y = this.CurrentPiece.Y;
        while (!this.HasCollided(this.CurrentPiece.X, y, this.CurrentPiece.CurrentRotation))
            y = y + 1;
        return y - 1;
    }

    private HasCollided(x: number, y: number, currentRotation: number): boolean {
        let result: boolean = false;
        let board: Piece[][] | null[][] = this.Board;
        const fn = function (x: number, y: number) {
            if (x < 0 || x >= WidthOfBoard || y < 0 || y >= HeightOfBoard || board[x][y] != null)
                result = true;
        }
        GameState.ApplyFunctionToEachBlockInAPiece(this.CurrentPiece, x, y, currentRotation, fn);
        return result;
    }

    public MoveRight(): boolean {
        return this.Move(this.CurrentPiece.X + 1, this.CurrentPiece.Y);
    }

    public MoveLeft(): boolean {
        return this.Move(this.CurrentPiece.X - 1, this.CurrentPiece.Y);
    }

    public MoveDown(): boolean {
        return this.Move(this.CurrentPiece.X, this.CurrentPiece.Y + 1);
    }

    public RotateClockwise() {
        let newRotation: number = (this.CurrentPiece.CurrentRotation + 1) % this.CurrentPiece.Rotation.length;
        if (!this.HasCollided(this.CurrentPiece.X, this.CurrentPiece.Y, newRotation))
            this.CurrentPiece.CurrentRotation = newRotation;
    }

    public RotateCounterClockwise() {
        let newRotation: number = (this.CurrentPiece.CurrentRotation + 3) % this.CurrentPiece.Rotation.length;
        if (!this.HasCollided(this.CurrentPiece.X, this.CurrentPiece.Y, newRotation))
            this.CurrentPiece.CurrentRotation = newRotation;
    }

    public Drop(isHoldingDown: boolean) {
        if (isHoldingDown)
            this.Score += 10;

        if (!this.MoveDown())
            this.AfterDrop();
    }

    public HardDrop() {
        while (this.MoveDown())
            this.Score += 10;
        this.Score += 10;
        this.AfterDrop();
    }

    private AfterDrop() {
        this.CommitPieceToBoard();
        this.RemoveLines();
        this.CurrentPiece = this.NextPiece;
        this.NextPiece = Piece.GetRandomPiece();
        this.HasHeldPiece = false;
        if (this.HasCollided(this.CurrentPiece.X, this.CurrentPiece.Y, this.CurrentPiece.CurrentRotation))
            this.Lose();
    }

    private RemoveLines() {
        let n: number = 0;
        for (let y: number = HeightOfBoard; y > 0; --y) {
            let isLineComplete: boolean = true;
            for (let x: number = 0; x < WidthOfBoard; x++)
                if (this.Board[x][y] == null)
                    isLineComplete = false;
            if (isLineComplete) {
                this.RemoveLine(y);
                y++
                n++;
            }
        }
        if (n > 0) {
            this.SetClearedLines(n);
            this.Score += Math.pow(2, n - 1) * 100;
        }
    }

    private RemoveLine(n: number) {
        for (let y: number = n; y >= 0; --y)
            for (let x: number = 0; x < WidthOfBoard; x++)
                this.Board[x][y] = (y == 0) ? null : this.Board[x][y - 1];
    }

    private CommitPieceToBoard() {
        let board: Piece[][] | null[][] = this.Board;
        let currentPiece: Piece = this.CurrentPiece;
        const fn = function (x: number, y: number) { board[x][y] = currentPiece; }
        GameState.ApplyFunctionToEachBlockInAPiece(this.CurrentPiece, this.CurrentPiece.X, this.CurrentPiece.Y, this.CurrentPiece.CurrentRotation, fn)
    }

    private Move(x: number, y: number): boolean {
        if (!this.HasCollided(x, y, this.CurrentPiece.CurrentRotation)) {
            this.CurrentPiece.X = x;
            this.CurrentPiece.Y = y;
            return true;
        }
        return false;
    }

    public static ApplyFunctionToEachBlockInAPiece(piece: Piece, x: number, y: number, currentRotation: number, fn: (x: number, y: number) => void) {
        for (let i: number = 0; i < 16; i++)
            if (piece.Rotation[currentRotation] & (0x8000 >> i))
                fn(x + (i % 4), y + ((i / 4) | 0));
    }
}

abstract class Piece {
    private static GetRandom = function (): number { return Math.floor(Math.random() * 7); }

    public Size: number;
    public Rotation: number[];
    public Color: string;
    public X: number;
    public Y: number;
    public CurrentRotation: number;

    public constructor(size: number, blocks: number[], color: string) {
        this.Size = size;
        this.Rotation = blocks;
        this.Color = color;
        this.CurrentRotation = 0;
        this.X = 4;
        this.Y = 0;
    }

    public static GetRandomPiece = function (): Piece {
        switch (Piece.GetRandom()) {
            case 0:
                return new S();
            case 1:
                return new I();
            case 2:
                return new J();
            case 3:
                return new L();
            case 4:
                return new U();
            case 5:
                return new Z();
            case 6:
                return new T();
            default:
                return new I();
        }
    }
}

class I extends Piece {
    constructor() {
        super(4, [0x00F0, 0x2222], 'cyan');
    }
}

class J extends Piece {
    constructor() {
        super(3, [0x44C0, 0x8E00, 0x6440, 0x0E20], 'blue');
    }
}

class L extends Piece {
    constructor() {
        super(3, [0x4460, 0x0E80, 0xC440, 0x2E00], 'orange');
    }
}

class U extends Piece {
    constructor() {
        super(2, [0xCC00], 'yellow');
    }
}

class S extends Piece {
    constructor() {
        super(3, [0x06C0, 0x4620], 'green');
    }
}

class T extends Piece {
    constructor() {
        super(3, [0x0E40, 0x4C40, 0x4E00, 0x4640], 'purple');
    }
}

class Z extends Piece {
    constructor() {
        super(3, [0x0C60, 0x2640], 'red');
    }
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

let State: GameState = new GameState();
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
    if (State.IsPlaying) {
        dropTime += tickTime;
        if (dropTime > State.DropTimeStep) {
            dropTime -= State.DropTimeStep;
            State.Drop(false);
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
    if (State.IsPlaying) {
        let handled = true;
        switch (ev.keyCode) {
            case KEY.LEFT:
                State.MoveLeft();
                break;
            case KEY.RIGHT:
                State.MoveRight();
                break;
            case KEY.ROTATECLOCKWISE:
                State.RotateClockwise();
                break;
            case KEY.ROTATECOUNTERCLOCKWISE:
                State.RotateCounterClockwise();
                break;
            case KEY.DOWN:
                State.Drop(true);
                break;
            case KEY.HARDDROP:
                State.HardDrop();
                break;
            case KEY.HOLD:
                State.HoldPiece();
                break;
            case KEY.ESC:
                State.Lose();
                break;
            default:
                handled = false;
        }
        if (handled)
            ev.preventDefault(); // prevent arrow keys from scrolling the page (supported in IE9+ and all other browsers)
    }
    else if (ev.keyCode == KEY.SPACE) {
        State.Play();
        ev.preventDefault();
    }
}

function UpdateUI() {
    if (ctx != null) {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.translate(0.5, 0.5); // for crisp 1px black lines
        DrawBoard();
        DrawRows();
        DrawNext();
        DrawHold();
        DrawScore();
        ctx.restore();
    }
}

//---------------------------------------------------------------------------//
// Re-draw the court html element.                                           //
// This function also redraws the piece and it's shadow.                     //
//---------------------------------------------------------------------------//
function DrawBoard() {
    if (ctx != null) {
        ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
        if (State.IsPlaying) {
            DrawPiece(ctx, State.CurrentPiece, State.CurrentPiece.CurrentRotation, State.CurrentPiece.X, State.GetCurrentPieceShadowY(), 'gray');             // Draw the Shadow
            DrawPiece(ctx, State.CurrentPiece, State.CurrentPiece.CurrentRotation, State.CurrentPiece.X, State.CurrentPiece.Y, State.CurrentPiece.Color);
        }
        for (let y = 0; y < HeightOfBoard; y++) {
            for (let x = 0; x < WidthOfBoard; x++) {
                const piece: Piece | null = State.Board[x][y];
                if (piece != null)
                    DrawBlock(ctx, x, y, piece.Color);
            }
        }
        ctx.strokeRect(0, 0, WidthOfBoard * BlockPixelSizeX - 1, HeightOfBoard * BlockPixelSizeY - 1); // court boundary
    }
}

//---------------------------------------------------------------------------//
// Re-draw the next box html element.                                        //
//---------------------------------------------------------------------------//
function DrawNext() {
    if (uctx != null) {
        var padding = (widthAndHeightOfPreviewWindowInBlocks - State.NextPiece.Size) / 2; // half-arsed attempt at centering next piece display
        uctx.save();
        uctx.translate(0.5, 0.5);
        uctx.clearRect(0, 0, widthAndHeightOfPreviewWindowInBlocks * BlockPixelSizeX, widthAndHeightOfPreviewWindowInBlocks * BlockPixelSizeY);
        DrawPiece(uctx, State.NextPiece, State.NextPiece.CurrentRotation, padding, padding, State.NextPiece.Color);
        uctx.strokeStyle = 'black';
        uctx.strokeRect(0, 0, widthAndHeightOfPreviewWindowInBlocks * BlockPixelSizeX - 1, widthAndHeightOfPreviewWindowInBlocks * BlockPixelSizeY - 1);
        uctx.restore();
    }
}

//---------------------------------------------------------------------------//
// Re-draw the hold box html element                                         //
//---------------------------------------------------------------------------//
function DrawHold() {
    if (hctx != null) {
        hctx.save();
        hctx.translate(0.5, 0.5);
        hctx.clearRect(0, 0, widthAndHeightOfPreviewWindowInBlocks * BlockPixelSizeX - 1, widthAndHeightOfPreviewWindowInBlocks * BlockPixelSizeY - 1);
        if (State.HeldPiece != null) {
            var padding = (widthAndHeightOfPreviewWindowInBlocks - State.HeldPiece.Size) / 2; // half-arsed attempt at centering next piece display
            DrawPiece(hctx, State.HeldPiece, State.HeldPiece.CurrentRotation, padding, padding, State.HeldPiece.Color);
        }
        hctx.strokeStyle = 'black';
        hctx.strokeRect(0, 0, widthAndHeightOfPreviewWindowInBlocks * BlockPixelSizeX - 1, widthAndHeightOfPreviewWindowInBlocks * BlockPixelSizeY - 1);
        hctx.restore();
    }
}

//---------------------------------------------------------------------------//
// Re-draw the score html element.                                           //
//---------------------------------------------------------------------------//
function DrawScore() {
    let score: HTMLElement | null = document.getElementById('score');
    if (score != null)
        score.innerHTML = ("00000" + Math.floor(State.Score)).slice(-5).toString();
}

//---------------------------------------------------------------------------//
// Re-draw the row counter html element.                                     //
//---------------------------------------------------------------------------//
function DrawRows() {
    let rows: HTMLElement | null = document.getElementById('rows');
    if (rows != null)
        rows.innerHTML = State.GetLinesCleared().toString();
}

//---------------------------------------------------------------------------//
// Loop through all four blocks of the given piece and draw them.            //
//---------------------------------------------------------------------------//
function DrawPiece(ctx, type, dir, x, y, color) {
    GameState.ApplyFunctionToEachBlockInAPiece(type, x, y, dir, function (x, y) {
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