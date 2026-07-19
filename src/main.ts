/**
 * MarkEdit-fen — Chess board rendering for FEN code blocks in MarkEdit.
 *
 * Watches the MarkEdit-preview pane for rendered FEN code blocks and
 * replaces them with SVG chess boards. Requires MarkEdit-preview.
 *
 * Usage in Markdown:
 *   ```fen
 *   rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
 *   ```
 *
 * Options (in the info string):
 *   ```fen float-left size=300 coords orient=black
 *   ```
 */

import { MarkEdit } from 'markedit-api';
import { setupPreviewHook } from './preview-hook';

// Prevent double initialization
if (!(window as any).__markeditFenInitialized__) {
  (window as any).__markeditFenInitialized__ = true;

  MarkEdit.onAppReady(() => {
    setupPreviewHook();
  });
}
