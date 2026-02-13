/**
 * @module utils/accessibility
 * ARIA accessibility helpers for the autocomplete widget.
 *
 * Ensures the autocomplete follows WAI-ARIA 1.2 Combobox pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 */

/**
 * Configures the input element with the required ARIA attributes
 * for an autocomplete combobox.
 *
 * @param input - The input element to configure.
 * @param listboxId - The ID of the listbox (dropdown) element.
 */
export function setInputAriaAttributes(input: HTMLElement, listboxId: string): void {
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-owns', listboxId);
  input.setAttribute('aria-haspopup', 'listbox');
  if (!input.getAttribute('aria-label')) {
    input.setAttribute('aria-label', 'Search Thai address');
  }
}

/**
 * Updates the `aria-expanded` attribute on the input to reflect
 * whether the suggestions dropdown is open.
 *
 * @param input - The input element.
 * @param isOpen - Whether the dropdown is currently visible.
 */
export function updateExpandedState(input: HTMLElement, isOpen: boolean): void {
  input.setAttribute('aria-expanded', String(isOpen));
}

/**
 * Sets `aria-activedescendant` on the input to point to the currently
 * highlighted suggestion item, enabling screen readers to announce it.
 *
 * @param input - The input element.
 * @param activeItemId - The ID of the active item, or `null` to clear.
 */
export function setActiveDescendant(input: HTMLElement, activeItemId: string | null): void {
  if (activeItemId) {
    input.setAttribute('aria-activedescendant', activeItemId);
  } else {
    input.removeAttribute('aria-activedescendant');
  }
}

/**
 * Configures the dropdown container with the required listbox role and ID.
 *
 * @param container - The dropdown container element.
 * @param listboxId - The unique ID for this listbox.
 */
export function setListboxAttributes(container: HTMLElement, listboxId: string): void {
  container.setAttribute('role', 'listbox');
  container.id = listboxId;
  container.setAttribute('aria-label', 'Address suggestions');
}

/**
 * Configures an individual suggestion item with the option role.
 *
 * @param item - The suggestion item element.
 * @param id - The unique ID for this option.
 * @param isActive - Whether this item is currently highlighted.
 */
export function setOptionAttributes(item: HTMLElement, id: string, isActive: boolean): void {
  item.setAttribute('role', 'option');
  item.id = id;
  item.setAttribute('aria-selected', String(isActive));
}

/**
 * Generates a unique ID for a suggestion option element.
 *
 * @param prefix - A prefix to namespace the ID (avoids collisions with multiple instances).
 * @param index - The index of the item in the suggestions list.
 * @returns A unique string ID.
 */
export function generateOptionId(prefix: string, index: number): string {
  return `${prefix}-option-${index}`;
}

/**
 * Creates a visually-hidden live region for announcing suggestion counts
 * to screen reader users.
 *
 * @returns The live region element (must be appended to the DOM).
 */
export function createLiveRegion(): HTMLElement {
  const region = document.createElement('div');
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');
  // Visually hidden but accessible to screen readers
  Object.assign(region.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  });
  return region;
}

/**
 * Announces the number of available suggestions to screen reader users.
 *
 * @param liveRegion - The live region element created by `createLiveRegion`.
 * @param count - The number of suggestions currently displayed.
 */
export function announceResults(liveRegion: HTMLElement, count: number): void {
  if (count === 0) {
    liveRegion.textContent = 'No suggestions available.';
  } else {
    liveRegion.textContent = `${count} suggestion${count === 1 ? '' : 's'} available. Use up and down arrows to navigate.`;
  }
}
