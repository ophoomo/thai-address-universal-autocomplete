/**
 * @module utils/debounce
 * Debounce utility to limit the rate of function invocations.
 *
 * Used by the autocomplete core to prevent excessive search API calls
 * while the user is still typing.
 */

/**
 * Creates a debounced version of the given function.
 * The debounced function delays invoking `fn` until after `delayMs`
 * milliseconds have elapsed since the last invocation.
 *
 * @param fn - The function to debounce.
 * @param delayMs - The delay in milliseconds.
 * @returns A debounced wrapper with a `cancel` method for cleanup.
 *
 * @example
 * ```ts
 * const debouncedSearch = debounce((q: string) => search(q), 200);
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
 * // Cancel pending invocation on cleanup:
 * debouncedSearch.cancel();
 * ```
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delayMs: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, delayMs);
  };

  debounced.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}
