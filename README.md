# MarkEdit-fen

Chess board rendering for FEN code blocks in [MarkEdit](https://github.com/MarkEdit-app/MarkEdit).

Requires [MarkEdit-preview](https://github.com/MarkEdit-app/MarkEdit-preview). Drop a FEN string in a fenced code block, open the preview pane, and the code block is replaced with an SVG chess board.

```fen
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
```

## Install

### Option 1: Download the pre-built file

1. Install [MarkEdit-preview](https://github.com/MarkEdit-app/MarkEdit-preview) if you haven't already
2. Grab `markedit-fen.js` from the [latest release](https://github.com/kayvee42/markedit-fen/releases)
3. Move it to `~/Library/Containers/app.cyan.markedit/Data/Documents/scripts/`
4. Restart MarkEdit

### Option 2: Build from source

```bash
git clone https://github.com/kayvee42/markedit-fen.git
cd markedit-fen
npm install
npm run build
# → auto-deployed to ~/Library/Containers/app.cyan.markedit/Data/Documents/scripts/
```

Restart MarkEdit.

## Usage

````markdown
```fen
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
```
````

Open the preview pane (Cmd+P). The FEN code block is replaced with a chess board.

### Options

Add options after `fen` in the info string:

````markdown
```fen size=300 coords orient=black
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
```
````

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `size=N` | 200–800 | 400 | Board width in pixels |
| `coords` | flag | off | Show rank (1–8) and file (a–h) labels |
| `orient=white` | white | ✓ | White at bottom |
| `orient=black` | — | | Black at bottom |
| `orient=active` | — | | Side to move at bottom |
| `orient=opponent` | — | | Opposite side at bottom |
| `float-left` | flag | off | Board floats left, text wraps right |
| `float-right` | flag | off | Board floats right, text wraps left |

## How it works

When MarkEdit-preview renders the preview pane, MarkEdit-fen uses a `MutationObserver` to find `.language-fen` code blocks in the rendered HTML and swaps them for inline SVG chess boards. FEN parsing and SVG generation are self-contained — zero runtime dependencies.

## License

MIT
