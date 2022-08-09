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
class GameState {
    Board;
    CurrentPiece;
    HoldPiece;
    NextPiece;
    Score;
    ClearedLines;
    IsPlaying;
    Actions;
    constructor() {
        this.Board = new Piece[WidthOfBoard][HeightOfBoard];
        this.CurrentPiece = Piece.GetRandomPiece();
        this.NextPiece = Piece.GetRandomPiece();
        this.HoldPiece = null;
        this.Score = 0;
        this.ClearedLines = 0;
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
        const x = this.X + 1;
        const y = this.Y;
        if (!this.HasCollided(gameState, x, y, gameState.CurrentPiece.CurrentRotation)) {
            gameState.CurrentPiece.X = x;
            return true;
        }
        return false;
    }
}
class I extends Piece {
    constructor() {
        super(4, [0x00F0, 0x2222, 0x00F0, 0x2222], 'cyan');
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
        super(2, [0xCC00, 0xCC00, 0xCC00, 0xCC00], 'yellow');
    }
}
class S extends Piece {
    constructor() {
        super(3, [0x06C0, 0x4620, 0x06C0, 0x4620], 'green');
    }
}
class T extends Piece {
    constructor() {
        super(3, [0x0E40, 0x4C40, 0x4E00, 0x4640], 'purple');
    }
}
class Z extends Piece {
    constructor() {
        super(3, [0x0C60, 0x2640, 0x0C60, 0x2640], 'red');
    }
}
//# sourceMappingURL=Pieces.js.map