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

export class GameState {
    public Board: Piece[][];
    public CurrentPiece: Piece;
    public HeldPiece: Piece;
    public NextPiece: Piece;
    public Score: number;
    public IsPlaying: boolean;
    public HasHeldPiece: boolean;
    public Level: number;
    public DropTimeStep: number;
    private ClearedLines: number;

    constructor() {
        this.Reset();
    }

    public Play() {
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


    private HasCollided(x: number, y: number, currentRotation: number): boolean {
        let result: boolean = false;
        const fn = function (x: number, y: number) {
            if (x < 0 || x >= WidthOfBoard || y < 0 || y >= HeightOfBoard || this.Board[x][y] == null)
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
        return this.Move(this.CurrentPiece.X, this.CurrentPiece.Y - 1);
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
        while (this.MoveDown)
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
        const fn = function (x: number, y: number) { this.Board[x][y] = this.CurrentPiece; }
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

    private Reset() {
        this.Board = new Piece[WidthOfBoard][HeightOfBoard];
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