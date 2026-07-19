# MarkEdit-fen Test Document

Open this file in MarkEdit to test the chess board extension.
Each ` ```fen ` block should render as an SVG chess board.

---

## Starting Position

```fen
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
```

## Sicilian Defense (Najdorf)

```fen
rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 7
```

## Small Board (size=200)

```fen size=200
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
```

## Large Board with Coordinates (size=500 coords)

```fen size=500 coords
r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4
```

## Flipped — Black's Perspective (orient=black)

```fen orient=black coords
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
```

## Orientation: Active Side at Bottom (orient=active)

```fen orient=active coords
rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2
```

## Endgame — White to Move

```fen coords
8/8/8/8/5k2/8/3K4/8 w - - 0 1
```

## Endgame — Black to Move (orient=active)

```fen orient=active coords
8/8/8/8/5k2/8/3K4/8 b - - 0 1
```

## Invalid FEN — Should Show Error

```fen
this is not valid fen at all
```

## Empty Board

```fen
8/8/8/8/8/8/8/8 w - - 0 1
```

## Regular Code Block — Should NOT Be Replaced

```python
def hello():
    print("This is a Python block, not FEN")
```

## Wrap-up

That covers: starting position, mid-game, sizing, coordinates, orient,
invalid FEN error state, empty board, and non-fen blocks.
