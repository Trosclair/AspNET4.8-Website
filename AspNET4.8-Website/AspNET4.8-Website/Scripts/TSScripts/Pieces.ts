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
    public HoldPiece: Piece;
    public NextPiece: Piece;
    public Score: number;
    public ClearedLines: number;
    public IsPlaying: boolean;
    public Actions: Direction[];
    public HasHeldPiece: boolean;

    constructor() {
        this.Reset();
    }

    public Play() {
        this.IsPlaying = true;
    }

    public Lose() {
        this.IsPlaying = false;
    }

    private Reset() {
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

    private HasCollided(gameState: GameState, x: number, y: number, currentRotation: number): boolean {
        let result: boolean = false;
        const fn = function (x: number, y: number) {
            if (x < 0 || x >= WidthOfBoard || y < 0 || y >= HeightOfBoard || gameState.Board[x][y] == null)
                result = true;
        }
        GameState.ApplyFunctionToEachBlockInAPiece(gameState.CurrentPiece, x, y, currentRotation, fn);
        return result;
    }

    public MoveRight(gameState: GameState): boolean {
        return this.Move(gameState, this.X + 1, this.Y);
    }

    public MoveLeft(gameState: GameState): boolean {
        return this.Move(gameState, this.X - 1, this.Y);
    }

    public MoveDown(gameState: GameState): boolean {
        return this.Move(gameState, this.X, this.Y - 1);
    }

    public RotateClockwise(gameState: GameState) {
        let newRotation: number = (gameState.CurrentPiece.CurrentRotation + 1) % gameState.CurrentPiece.Rotation.length;
        if (!this.HasCollided(gameState, gameState.CurrentPiece.X, gameState.CurrentPiece.Y, newRotation))
            gameState.CurrentPiece.CurrentRotation = newRotation;
    }

    public RotateCounterClockwise(gameState: GameState) {
        let newRotation: number = (gameState.CurrentPiece.CurrentRotation + 3) % gameState.CurrentPiece.Rotation.length;
        if (!this.HasCollided(gameState, gameState.CurrentPiece.X, gameState.CurrentPiece.Y, newRotation))
            gameState.CurrentPiece.CurrentRotation = newRotation;
    }

    public Drop(gameState: GameState, isHoldingDown: boolean) {
        if (isHoldingDown)
            gameState.Score += 10;

        if (!this.MoveDown(gameState))
            this.AfterDrop(gameState);
    }

    public HardDrop(gameState: GameState) {
        while (this.MoveDown)
            gameState.Score += 10;
        gameState.Score += 10;
        this.AfterDrop(gameState);
    }

    private AfterDrop(gameState: GameState) {
        this.CommitPieceToBoard(gameState);
        this.RemoveLines(gameState);
        gameState.CurrentPiece = gameState.NextPiece;
        gameState.NextPiece = Piece.GetRandomPiece();
        gameState.Actions = [];
        gameState.HasHeldPiece = false;
        if (this.HasCollided(gameState, gameState.CurrentPiece.X, gameState.CurrentPiece.Y, gameState.CurrentPiece.CurrentRotation))
            gameState.Lose();
    }

    private RemoveLines(gameState: GameState) {
        let n: number = 0;
        for (let y: number = HeightOfBoard; y > 0; --y) {
            let isLineComplete: boolean = true;
            for (let x: number = 0; x < WidthOfBoard; x++)
                if (gameState.Board[x][y] == null)
                    isLineComplete = false;
            if (isLineComplete) {
                this.RemoveLine(gameState, y);
                y++
                n++;
            }
        }
        if (n > 0) {
            gameState.ClearedLines += n;
            gameState.Score += Math.pow(2, n - 1) * 100;
        }
    }

    private RemoveLine(gameState: GameState, n: number) {
        for (let y: number = n; y >= 0; --y)
            for (let x: number = 0; x < WidthOfBoard; x++)
                gameState.Board[x][y] = (y == 0) ? null : gameState.Board[x][y - 1];
    }

    private CommitPieceToBoard(gameState: GameState) {
        const fn = function (x: number, y: number) { gameState.Board[x][y] = gameState.CurrentPiece; }
        GameState.ApplyFunctionToEachBlockInAPiece(gameState.CurrentPiece, gameState.CurrentPiece.X, gameState.CurrentPiece.Y, gameState.CurrentPiece.CurrentRotation, fn)
    }

    private Move(gameState: GameState, x: number, y: number): boolean {
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