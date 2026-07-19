/**
 * SVG chess board renderer.
 * Generates an inline <svg> element from a parsed FEN position.
 * Uses SVG <rect> for squares and <text> for Unicode pieces,
 * which bypasses Safari's emoji rendering path for chess characters.
 */

import { parseFen, PIECE_UNICODE, type ParsedFen } from './fen-parser';

export type Orient = 'white' | 'black' | 'active' | 'opponent';

/** Options parsed from the fenced code info string (e.g. "fen float-left size=300 orient=active") */
export interface RenderOptions {
  float: 'left' | 'right' | 'none';
  size: number;
  coords: boolean;
  orient: Orient;
}

export const DEFAULT_OPTIONS: RenderOptions = {
  float: 'none',
  size: 400,
  coords: false,
  orient: 'white',
};

/** Classic chess board colors (Lichess palette) */
const LIGHT_SQUARE = '#f0d9b5';
const DARK_SQUARE = '#b58863';
const COORD_COLOR = '#555';

/**
 * Parse display options from the code block info string.
 * Example: "fen float-left size=300 coords orient=active"
 */
export function parseOptions(infoString: string): RenderOptions {
  const opts = { ...DEFAULT_OPTIONS };
  const tokens = infoString.split(/\s+/).slice(1); // skip "fen"

  for (const token of tokens) {
    switch (token) {
      case 'float-left':  opts.float = 'left';  break;
      case 'float-right': opts.float = 'right'; break;
      case 'float-none':  opts.float = 'none';  break;
      case 'coords':      opts.coords = true;   break;
      default: {
        const sm = token.match(/^size=(\d+)$/);
        if (sm) {
          const s = parseInt(sm[1], 10);
          if (s >= 200 && s <= 800) opts.size = s;
          break;
        }
        const om = token.match(/^orient=(white|black|active|opponent)$/);
        if (om) {
          opts.orient = om[1] as Orient;
        }
        break;
      }
    }
  }

  return opts;
}

/**
 * Generate an SVG chess board from a FEN string.
 * Returns an HTML <figure> element containing the SVG board and a <figcaption>.
 */
export function renderBoard(fen: string, opts?: RenderOptions): HTMLElement | null {
  const parsed = parseFen(fen);
  if (!parsed) return null;

  return renderBoardFromParsed(parsed, opts ?? DEFAULT_OPTIONS);
}

/**
 * Generate an SVG chess board string from a FEN string.
 * Returns the raw SVG markup, or null if the FEN is invalid.
 * Use this when you need the SVG without a wrapper element.
 */
export function renderBoardSVG(fen: string, opts?: RenderOptions): string | null {
  const parsed = parseFen(fen);
  if (!parsed) return null;
  return generateBoardSVG(parsed, opts ?? DEFAULT_OPTIONS);
}

/**
 * Generate raw SVG markup for a chess board from a parsed FEN.
 * No wrapper element — just the <svg>...</svg> string.
 */
export function generateBoardSVG(parsed: ParsedFen, opts: RenderOptions): string {
  const { board, activeColor } = parsed;
  const { size, coords } = opts;

  // Resolve orientation to a boolean flip
  const flip = orientToFlip(opts.orient, activeColor);

  const sq = Math.floor(size / 8);
  const fontSize = Math.floor(sq * 0.72);
  const coordFontSize = Math.max(9, Math.floor(sq * 0.2));

  // Board layout:
  //   row 0 = rank 8 (black's home, top), row 7 = rank 1 (white's home, bottom)
  //   Standard (white at bottom): rows 0→7 top-to-bottom, cols 0→7 left-to-right
  //   Flipped (black at bottom): rows 7→0 top-to-bottom, cols 7→0 left-to-right
  const rows = flip ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = flip ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const fileLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  // Padding for coordinates (rank labels at top, file labels at bottom)
  const padTop = coords ? coordFontSize + 4 : 0;
  const padLeft = coords ? coordFontSize + 4 : 0;
  const padBottom = coords ? coordFontSize + 4 : 0;

  const totalW = size + padLeft;
  const totalH = size + padTop + padBottom;

  let svg = `<svg viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `<g transform="translate(${padLeft}, ${padTop})">\n`;

  // Draw squares and pieces
  for (let displayRow = 0; displayRow < 8; displayRow++) {
    const boardRow = rows[displayRow];
    for (let displayCol = 0; displayCol < 8; displayCol++) {
      const boardCol = cols[displayCol];

      const isLight = (displayRow + displayCol) % 2 === 0;
      const fill = isLight ? LIGHT_SQUARE : DARK_SQUARE;

      const x = displayCol * sq;
      const y = displayRow * sq;

      svg += `  <rect x="${x}" y="${y}" width="${sq}" height="${sq}" fill="${fill}" />\n`;

      const piece = board[boardRow][boardCol];
      if (piece) {
        const unicode = PIECE_UNICODE[piece];
        const cx = x + sq / 2;
        const cy = y + sq / 2 + fontSize * 0.35;
        svg += `  <text x="${cx}" y="${cy}" text-anchor="middle" font-size="${fontSize}" font-family="system-ui, -apple-system, sans-serif">${unicode}</text>\n`;
      }
    }
  }

  svg += `</g>\n`;

  // Coordinates
  if (coords) {
    const fileOrder = flip ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const rankOrderLabels = flip
      ? ['1', '2', '3', '4', '5', '6', '7', '8']
      : ['8', '7', '6', '5', '4', '3', '2', '1'];

    for (let i = 0; i < 8; i++) {
      const fileIdx = fileOrder[i];
      const x = padLeft + i * sq + sq / 2;
      const y = padTop + size + coordFontSize + 2;
      svg += `  <text x="${x}" y="${y}" text-anchor="middle" font-size="${coordFontSize}" fill="${COORD_COLOR}" font-family="system-ui, -apple-system, sans-serif">${fileLabels[fileIdx]}</text>\n`;
    }

    for (let i = 0; i < 8; i++) {
      const x = padLeft - 3;
      const y = padTop + i * sq + sq / 2 + coordFontSize * 0.35;
      svg += `  <text x="${x}" y="${y}" text-anchor="end" font-size="${coordFontSize}" fill="${COORD_COLOR}" font-family="system-ui, -apple-system, sans-serif">${rankOrderLabels[i]}</text>\n`;
    }
  }

  svg += '</svg>';
  return svg;
}

/**
 * Render from an already-parsed FEN with explicit options.
 * Wraps the SVG in a <figure> element with a <figcaption> for the preview pane.
 */
export function renderBoardFromParsed(
  parsed: ParsedFen,
  opts: RenderOptions,
): HTMLElement {
  const { fen } = parsed;

  const svg = generateBoardSVG(parsed, opts);

  // Compute total width for max-width CSS (needed for the figure wrapper).
  // SVG width = size + padLeft (file labels) + optional padding.
  const coordFontSize = Math.max(9, Math.floor(Math.floor(opts.size / 8) * 0.2));
  const padLeft = opts.coords ? coordFontSize + 4 : 0;
  const totalW = opts.size + padLeft;

  // Build the figure element
  const figure = document.createElement('figure');
  figure.className = 'fen-board';

  // Float style
  switch (opts.float) {
    case 'left':
      figure.style.cssText = `float:left;margin:0 1em 0.5em 0;max-width:${totalW}px;`;
      break;
    case 'right':
      figure.style.cssText = `float:right;margin:0 0 0.5em 1em;max-width:${totalW}px;`;
      break;
    default:
      figure.style.cssText = `display:block;margin:1em auto;max-width:${totalW}px;`;
      break;
  }

  figure.innerHTML = svg;

  // Caption with FEN string
  const figcaption = document.createElement('figcaption');
  figcaption.className = 'fen-caption';
  figcaption.innerHTML = `<code>${escapeHtml(fen)}</code>`;
  figure.appendChild(figcaption);

  return figure;
}

/**
 * Resolve the orient option to a boolean flip.
 */
function orientToFlip(orient: Orient, activeColor: string): boolean {
  switch (orient) {
    case 'white':    return false;             // white always at bottom
    case 'black':    return true;              // black always at bottom
    case 'active':   return activeColor === 'b'; // side to move at bottom
    case 'opponent': return activeColor === 'w'; // opposite of side to move at bottom
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
