/**
 * @module utils/keyboard
 * Keyboard navigation handler for the autocomplete suggestions list.
 *
 * Maps keyboard events to semantic actions (next, prev, select, close)
 * that the autocomplete core can respond to.
 */

import type { KeyboardAction } from '../types';

/** Map of key names to their corresponding autocomplete actions. */
const KEY_ACTION_MAP: Record<string, KeyboardAction> = {
  ArrowDown: 'next',
  ArrowUp: 'prev',
  Enter: 'select',
  Escape: 'close',
};

/**
 * Resolves a keyboard event to an autocomplete action.
 *
 * @param event - The keyboard event from the input element.
 * @returns The corresponding action, or `null` if the key is not handled.
 *
 * @example
 * ```ts
 * input.addEventListener('keydown', (e) => {
 *   const action = resolveKeyboardAction(e);
 *   if (action) {
 *     e.preventDefault();
 *     handleAction(action);
 *   }
 * });
 * ```
 */
export function resolveKeyboardAction(event: KeyboardEvent): KeyboardAction | null {
  return KEY_ACTION_MAP[event.key] ?? null;
}

/**
 * Calculates the next active index when navigating the suggestions list.
 * Wraps around: going past the last item returns to -1 (no selection),
 * and going before -1 wraps to the last item.
 *
 * @param currentIndex - The currently active index (-1 means no selection).
 * @param totalItems - Total number of items in the list.
 * @param direction - Navigation direction: 'next' (down) or 'prev' (up).
 * @returns The new active index.
 */
export function getNextIndex(
  currentIndex: number,
  totalItems: number,
  direction: 'next' | 'prev',
): number {
  if (totalItems === 0) return -1;

  if (direction === 'next') {
    // -1 -> 0 -> 1 -> ... -> totalItems-1 -> -1 (wrap)
    return currentIndex >= totalItems - 1 ? -1 : currentIndex + 1;
  }

  // 'prev': -1 -> totalItems-1 -> totalItems-2 -> ... -> 0 -> -1 (wrap)
  return currentIndex <= -1 ? totalItems - 1 : currentIndex - 1;
}
