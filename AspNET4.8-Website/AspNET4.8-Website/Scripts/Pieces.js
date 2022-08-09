const WidthOfBoard = 10;
const HeightOfBoard = 20;
var Direction;
(function (Direction) {
    Direction[Direction["RIGHT"] = 0] = "RIGHT";
    Direction[Direction["DOWN"] = 1] = "DOWN";
    Direction[Direction["LEFT"] = 2] = "LEFT";
    Direction[Direction["ROTATERIGHT"] = 3] = "ROTATERIGHT";
    Direction[Direction["ROTATELEFT"] = 4] = "ROTATELEFT";
    Direction[Direction["HARDDROP"] = 5] = "HARDDROP";
    Direction[Direction["HOLD"] = 6] = "HOLD";
})(Direction || (Direction = {}));
export class GameState {
    Board;
    CurrentPiece;
    HeldPiece;
    NextPiece;
    Score;
    IsPlaying;
    HasHeldPiece;
    Level;
    DropTimeStep;
    ClearedLines;
    constructor() {
        this.Reset();
    }
    Play() {
        this.IsPlaying = true;
    }
    Lose() {
        this.IsPlaying = false;
    }
    SetClearedLines(numberOfClearedLines) {
        this.ClearedLines += numberOfClearedLines;
        this.Level = (this.ClearedLines / 10) | 0;
        this.DropTimeStep = Math.max(0.1, 0.6 - (.050 * this.Level));
    }
    GetLinesCleared() {
        return this.ClearedLines;
    }
    HoldPiece() {
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
    HasCollided(x, y, currentRotation) {
        let result = false;
        const fn = function (x, y) {
            if (x < 0 || x >= WidthOfBoard || y < 0 || y >= HeightOfBoard || this.Board[x][y] == null)
                result = true;
        };
        GameState.ApplyFunctionToEachBlockInAPiece(this.CurrentPiece, x, y, currentRotation, fn);
        return result;
    }
    MoveRight() {
        return this.Move(this.CurrentPiece.X + 1, this.CurrentPiece.Y);
    }
    MoveLeft() {
        return this.Move(this.CurrentPiece.X - 1, this.CurrentPiece.Y);
    }
    MoveDown() {
        return this.Move(this.CurrentPiece.X, this.CurrentPiece.Y - 1);
    }
    RotateClockwise() {
        let newRotation = (this.CurrentPiece.CurrentRotation + 1) % this.CurrentPiece.Rotation.length;
        if (!this.HasCollided(this.CurrentPiece.X, this.CurrentPiece.Y, newRotation))
            this.CurrentPiece.CurrentRotation = newRotation;
    }
    RotateCounterClockwise() {
        let newRotation = (this.CurrentPiece.CurrentRotation + 3) % this.CurrentPiece.Rotation.length;
        if (!this.HasCollided(this.CurrentPiece.X, this.CurrentPiece.Y, newRotation))
            this.CurrentPiece.CurrentRotation = newRotation;
    }
    Drop(isHoldingDown) {
        if (isHoldingDown)
            this.Score += 10;
        if (!this.MoveDown())
            this.AfterDrop();
    }
    HardDrop() {
        while (this.MoveDown)
            this.Score += 10;
        this.Score += 10;
        this.AfterDrop();
    }
    AfterDrop() {
        this.CommitPieceToBoard();
        this.RemoveLines();
        this.CurrentPiece = this.NextPiece;
        this.NextPiece = Piece.GetRandomPiece();
        this.HasHeldPiece = false;
        if (this.HasCollided(this.CurrentPiece.X, this.CurrentPiece.Y, this.CurrentPiece.CurrentRotation))
            this.Lose();
    }
    RemoveLines() {
        let n = 0;
        for (let y = HeightOfBoard; y > 0; --y) {
            let isLineComplete = true;
            for (let x = 0; x < WidthOfBoard; x++)
                if (this.Board[x][y] == null)
                    isLineComplete = false;
            if (isLineComplete) {
                this.RemoveLine(y);
                y++;
                n++;
            }
        }
        if (n > 0) {
            this.SetClearedLines(n);
            this.Score += Math.pow(2, n - 1) * 100;
        }
    }
    RemoveLine(n) {
        for (let y = n; y >= 0; --y)
            for (let x = 0; x < WidthOfBoard; x++)
                this.Board[x][y] = (y == 0) ? null : this.Board[x][y - 1];
    }
    CommitPieceToBoard() {
        const fn = function (x, y) { this.Board[x][y] = this.CurrentPiece; };
        GameState.ApplyFunctionToEachBlockInAPiece(this.CurrentPiece, this.CurrentPiece.X, this.CurrentPiece.Y, this.CurrentPiece.CurrentRotation, fn);
    }
    Move(x, y) {
        if (!this.HasCollided(x, y, this.CurrentPiece.CurrentRotation)) {
            this.CurrentPiece.X = x;
            this.CurrentPiece.Y = y;
            return true;
        }
        return false;
    }
    Reset() {
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
    static ApplyFunctionToEachBlockInAPiece(piece, x, y, currentRotation, fn) {
        for (let i = 0; i < 16; i++)
            if (piece.Rotation[currentRotation] & (0x8000 >> i))
                fn(x + (i % 4), y + ((i / 4) | 0));
    }
}
class Piece {
    static GetRandom = function () { return Math.floor(Math.random() * 7); };
    Size;
    Rotation;
    Color;
    X;
    Y;
    CurrentRotation;
    constructor(size, blocks, color) {
        this.Size = size;
        this.Rotation = blocks;
        this.Color = color;
        this.CurrentRotation = 0;
        this.X = 4;
        this.Y = 0;
    }
    static GetRandomPiece = function () {
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
    };
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
//# sourceMappingURL=Pieces.js.map