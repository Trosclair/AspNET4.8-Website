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
    HoldPiece;
    NextPiece;
    Score;
    ClearedLines;
    IsPlaying;
    Actions;
    HasHeldPiece;
    constructor() {
        this.Reset();
    }
    Play() {
        this.IsPlaying = true;
    }
    Lose() {
        this.IsPlaying = false;
    }
    Reset() {
        this.Board = new Piece[WidthOfBoard][HeightOfBoard];
        this.CurrentPiece = Piece.GetRandomPiece();
        this.NextPiece = Piece.GetRandomPiece();
        this.HoldPiece = null;
        this.Score = 0;
        this.ClearedLines = 0;
        this.IsPlaying = false;
        this.Actions = [];
        this.HasHeldPiece = false;
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
    HasCollided(gameState, x, y, currentRotation) {
        let result = false;
        const fn = function (x, y) {
            if (x < 0 || x >= WidthOfBoard || y < 0 || y >= HeightOfBoard || gameState.Board[x][y] == null)
                result = true;
        };
        GameState.ApplyFunctionToEachBlockInAPiece(gameState.CurrentPiece, x, y, currentRotation, fn);
        return result;
    }
    MoveRight(gameState) {
        return this.Move(gameState, this.X + 1, this.Y);
    }
    MoveLeft(gameState) {
        return this.Move(gameState, this.X - 1, this.Y);
    }
    MoveDown(gameState) {
        return this.Move(gameState, this.X, this.Y - 1);
    }
    RotateClockwise(gameState) {
        let newRotation = (gameState.CurrentPiece.CurrentRotation + 1) % gameState.CurrentPiece.Rotation.length;
        if (!this.HasCollided(gameState, gameState.CurrentPiece.X, gameState.CurrentPiece.Y, newRotation))
            gameState.CurrentPiece.CurrentRotation = newRotation;
    }
    RotateCounterClockwise(gameState) {
        let newRotation = (gameState.CurrentPiece.CurrentRotation + 3) % gameState.CurrentPiece.Rotation.length;
        if (!this.HasCollided(gameState, gameState.CurrentPiece.X, gameState.CurrentPiece.Y, newRotation))
            gameState.CurrentPiece.CurrentRotation = newRotation;
    }
    Drop(gameState, isHoldingDown) {
        if (isHoldingDown)
            gameState.Score += 10;
        if (!this.MoveDown(gameState))
            this.AfterDrop(gameState);
    }
    HardDrop(gameState) {
        while (this.MoveDown)
            gameState.Score += 10;
        gameState.Score += 10;
        this.AfterDrop(gameState);
    }
    AfterDrop(gameState) {
        this.CommitPieceToBoard(gameState);
        this.RemoveLines(gameState);
        gameState.CurrentPiece = gameState.NextPiece;
        gameState.NextPiece = Piece.GetRandomPiece();
        gameState.Actions = [];
        gameState.HasHeldPiece = false;
        if (this.HasCollided(gameState, gameState.CurrentPiece.X, gameState.CurrentPiece.Y, gameState.CurrentPiece.CurrentRotation))
            gameState.Lose();
    }
    RemoveLines(gameState) {
        let n = 0;
        for (let y = HeightOfBoard; y > 0; --y) {
            let isLineComplete = true;
            for (let x = 0; x < WidthOfBoard; x++)
                if (gameState.Board[x][y] == null)
                    isLineComplete = false;
            if (isLineComplete) {
                this.RemoveLine(gameState, y);
                y++;
                n++;
            }
        }
        if (n > 0) {
            gameState.ClearedLines += n;
            gameState.Score += Math.pow(2, n - 1) * 100;
        }
    }
    RemoveLine(gameState, n) {
        for (let y = n; y >= 0; --y)
            for (let x = 0; x < WidthOfBoard; x++)
                gameState.Board[x][y] = (y == 0) ? null : gameState.Board[x][y - 1];
    }
    CommitPieceToBoard(gameState) {
        const fn = function (x, y) { gameState.Board[x][y] = gameState.CurrentPiece; };
        GameState.ApplyFunctionToEachBlockInAPiece(gameState.CurrentPiece, gameState.CurrentPiece.X, gameState.CurrentPiece.Y, gameState.CurrentPiece.CurrentRotation, fn);
    }
    Move(gameState, x, y) {
        if (!this.HasCollided(gameState, x, y, gameState.CurrentPiece.CurrentRotation)) {
            gameState.CurrentPiece.X = x;
            gameState.CurrentPiece.Y = y;
            return true;
        }
        return false;
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
//# sourceMappingURL=Pieces.js.map