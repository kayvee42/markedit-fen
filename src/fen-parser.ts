/**
 * FEN parser — validates and parses Forsyth-Edwards Notation strings
 * into an 8×8 board array.
 *
 * FEN format:
 *   <pieces> <active> <castling> <en passant> <halfmove> <fullmove>
 *
 * Example:
 *   rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
 */

/** Piece characters. Empty squares are null. */
export type Piece = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
export type Square = Piece | null;

/** row 0 = rank 8 (top), row 7 = rank 1 (bottom) */
export type Board = Square[][]; // 8×8

/** Parsed FEN with board and metadata. */
export interface ParsedFen {
  board: Board;
  activeColor: 'w' | 'b';
  castling: string;
  enPassant: string;
  halfmove: number;
  fullmove: number;
  fen: string; // original trimmed FEN
}

/**
 * Piece-to-Unicode map for SVG text rendering.
 * White: U+2654–U+2659, Black: U+265A–U+265F
 */
export const PIECE_UNICODE: Record<string, string> = {
  'K': '♔', // ♔ White King
  'Q': '♕', // ♕ White Queen
  'R': '♖', // ♖ White Rook
  'B': '♗', // ♗ White Bishop
  'N': '♘', // ♘ White Knight
  'P': '♙', // ♙ White Pawn
  'k': '♚', // ♚ Black King
  'q': '♛', // ♛ Black Queen
  'r': '♜', // ♜ Black Rook
  'b': '♝', // ♝ Black Bishop
  'n': '♞', // ♞ Black Knight
  'p': '♟', // ♟ Black Pawn
};

const VALID_PIECES = /^[KQRBNPkqrbnp1-8]+$/;
const VALID_COLORS = /^[wb]$/;

/**
 * Parse a FEN string. Returns null if invalid.
 */
export function parseFen(fen: string): ParsedFen | null {
  const trimmed = fen.trim();
  if (!trimmed) return null;

  const fields = trimmed.split(/\s+/);
  if (fields.length < 1) return null;

  const board = parsePieces(fields[0]);
  if (!board) return null;

  const activeColor = fields[1] ?? 'w';
  if (!VALID_COLORS.test(activeColor)) return null;

  const castling = fields[2] ?? '-';
  const enPassant = fields[3] ?? '-';
  const halfmove = parseInt(fields[4] ?? '0', 10) || 0;
  const fullmove = parseInt(fields[5] ?? '1', 10) || 1;

  return {
    board,
    activeColor: activeColor as 'w' | 'b',
    castling,
    enPassant,
    halfmove,
    fullmove,
    fen: trimmed,
  };
}

/**
 * Parse the piece placement portion of a FEN string into an 8×8 board.
 * Returns null if the rank data is malformed.
 */
function parsePieces(placement: string): Board | null {
  const ranks = placement.split('/');
  if (ranks.length !== 8) return null;

  const board: Board = [];

  for (const rank of ranks) {
    if (!VALID_PIECES.test(rank)) return null;

    const row: Square[] = [];
    for (const ch of rank) {
      if (ch >= '1' && ch <= '8') {
        const empties = parseInt(ch, 10);
        for (let i = 0; i < empties; i++) {
          row.push(null);
        }
      } else {
        row.push(ch as Piece);
      }
    }

    if (row.length !== 8) return null;
    board.push(row);
  }

  return board;
}

/**
 * Quick check: is this string probably a FEN?
 * Does not fully validate, just checks shape.
 */
export function looksLikeFen(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const fields = trimmed.split(/\s+/);
  if (fields.length < 1) return false;
  const ranks = fields[0].split('/');
  return ranks.length === 8;
}
