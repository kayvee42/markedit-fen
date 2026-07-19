/**
 * Preview hook — watches the MarkEdit preview pane for rendered HTML
 * and transforms FEN code blocks into chess boards.
 *
 * Uses a MutationObserver on the preview pane's DOM. When the preview
 * extension sets innerHTML after a render, we find `.language-fen`
 * elements and swap them out for rendered SVG chess boards.
 *
 * Options (float, size, coords, orient) are extracted from the original
 * markdown source by finding the ```fen info string.
 */

import { MarkEdit } from 'markedit-api';
import { renderBoard, parseOptions, DEFAULT_OPTIONS, type RenderOptions } from './renderer';

let observer: MutationObserver | null = null;
let previewPane: Element | null = null;

/** A FEN block found in the source markdown. */
interface FenBlock {
  fen: string;
  opts: RenderOptions;
}

/**
 * Set up the preview hook. Call this after MarkEdit is ready.
 * Looks for the preview pane element (created by MarkEdit-preview).
 */
export function setupPreviewHook(): void {
  previewPane = document.querySelector('.markdown-body');

  if (!previewPane) {
    // Preview pane not found. The preview extension might load later,
    // or the user might not have it installed. Poll briefly.
    let attempts = 0;
    const poll = setInterval(() => {
      previewPane = document.querySelector('.markdown-body');
      if (previewPane) {
        clearInterval(poll);
        startObserving();
      } else if (++attempts > 20) {
        clearInterval(poll);
      }
    }, 500);
    return;
  }

  startObserving();
}

function startObserving(): void {
  if (!previewPane) return;

  transformFenBlocks();

  observer = new MutationObserver(() => {
    transformFenBlocks();
  });

  observer.observe(previewPane, {
    childList: true,
    subtree: true,
  });
}

/**
 * Find all FEN code blocks in the preview pane and replace them
 * with rendered chess boards.
 */
function transformFenBlocks(): void {
  if (!previewPane) return;

  const blocks = previewPane.querySelectorAll('pre code.language-fen');
  if (blocks.length === 0) return;

  // Get options from the original markdown source
  const fenBlocks = extractFenBlocksFromSource();

  blocks.forEach((block, index) => {
    if (block.closest('.fen-board')) return;

    const fen = block.textContent?.trim();
    if (!fen) return;

    // Match this DOM block to a source block by FEN content (or by index)
    const srcBlock = fenBlocks.find(b => b.fen === fen) ?? fenBlocks[index];
    const opts = srcBlock?.opts ?? DEFAULT_OPTIONS;

    const figure = renderBoard(fen, opts);
    if (!figure) return;

    const pre = block.closest('pre');
    if (pre) {
      pre.replaceWith(figure);
    }
  });
}

/**
 * Scan the raw markdown source for ```fen blocks and return
 * each block's FEN content and parsed options.
 */
function extractFenBlocksFromSource(): FenBlock[] {
  const blocks: FenBlock[] = [];

  try {
    const markdown = MarkEdit.editorAPI.getText();
    if (!markdown) return blocks;

    // Match fenced code blocks with language "fen"
    // Group 1: info string (e.g. "fen float-left size=300")
    // Group 2: code block content (one or more lines)
    const regex = /```(fen\b[^\n]*)\n([\s\S]*?)```/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(markdown)) !== null) {
      const infoString = match[1];
      const content = match[2].trim();

      const opts = parseOptions(infoString);

      // Take the first meaningful line as the FEN
      // (skip blank lines and comment lines starting with #)
      const fenLine = content
        .split('\n')
        .map(l => l.trim())
        .find(l => l && !l.startsWith('#')) ?? content;

      blocks.push({ fen: fenLine, opts });
    }
  } catch {
    // If we can't read the source, fall back to defaults
  }

  return blocks;
}

/**
 * Tear down the observer.
 */
export function teardownPreviewHook(): void {
  observer?.disconnect();
  observer = null;
  previewPane = null;
}
