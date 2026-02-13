/**
 * @module core/autocomplete
 * Headless autocomplete engine — the heart of the library.
 *
 * This module attaches to any `HTMLInputElement` and manages:
 * - Debounced search queries against a pluggable data source
 * - Dropdown lifecycle (open/close, render, destroy)
 * - Keyboard navigation (ArrowUp/Down, Enter, Escape)
 * - ARIA accessibility attributes following WAI-ARIA Combobox pattern
 * - Custom rendering via user-provided `renderItem` / `renderContainer`
 *
 * The engine is framework-agnostic: it operates on raw DOM elements and
 * delegates all data fetching and rendering to caller-supplied functions.
 */

import type {
  AutocompleteOptions,
  AutocompleteInstance,
  AutocompleteState,
  ThaiAddressSuggestion,
  ClassNames,
} from '../types';
import { debounce } from '../utils/debounce';
import { resolveKeyboardAction, getNextIndex } from '../utils/keyboard';
import {
  setInputAriaAttributes,
  updateExpandedState,
  setActiveDescendant,
  setListboxAttributes,
  setOptionAttributes,
  generateOptionId,
  createLiveRegion,
  announceResults,
} from '../utils/accessibility';

/** Default CSS class names used when none are provided. */
const DEFAULT_CLASS_NAMES: Required<ClassNames> = {
  root: 'tac-root',
  input: 'tac-input',
  dropdown: 'tac-dropdown',
  item: 'tac-item',
  itemActive: 'tac-item--active',
  dropdownHidden: 'tac-dropdown--hidden',
};

/** Counter for generating unique IDs across multiple autocomplete instances. */
let instanceCounter = 0;

/**
 * Initializes a headless autocomplete widget on the given input element.
 *
 * The function attaches event listeners, creates the dropdown container,
 * and manages all state internally. It returns an `AutocompleteInstance`
 * with methods for programmatic control and teardown.
 *
 * @param input - The HTML input element to enhance with autocomplete.
 * @param options - Configuration options including the data source and callbacks.
 * @returns An `AutocompleteInstance` for programmatic control.
 * @throws {Error} If `input` is not an HTMLInputElement.
 *
 * @example
 * ```ts
 * import { initAutocomplete, createProvinceSource } from 'thai-address-autocomplete';
 *
 * const ac = initAutocomplete(document.getElementById('province-input')!, {
 *   source: createProvinceSource(),
 *   onSelect: (item) => {
 *     console.log('Selected:', item.province, item.district);
 *   },
 * });
 *
 * // Later: clean up
 * ac.destroy();
 * ```
 */
export function initAutocomplete(
  input: HTMLInputElement,
  options: AutocompleteOptions,
): AutocompleteInstance {
  // --- Validation ---
  if (!(input instanceof HTMLInputElement)) {
    throw new Error(
      'initAutocomplete: first argument must be an HTMLInputElement. ' +
        `Received: ${typeof input}`,
    );
  }

  // --- Instance setup ---
  const instanceId = `tac-${++instanceCounter}`;
  const listboxId = `${instanceId}-listbox`;
  let opts = { ...options };
  const classes = resolveClassNames(opts.classNames);
  const debounceMs = opts.debounceMs ?? 200;
  const minLength = opts.minLength ?? 1;
  const maxResults = opts.maxResults ?? 20;

  // --- State ---
  const state: AutocompleteState = {
    isOpen: false,
    suggestions: [],
    activeIndex: -1,
    query: '',
  };

  // --- DOM Setup ---
  const dropdown = createDropdown(classes, listboxId);
  const liveRegion = createLiveRegion();

  // Wrap input and dropdown in a root container for positioning
  const root = document.createElement('div');
  root.className = classes.root;
  root.style.position = 'relative';
  input.parentNode?.insertBefore(root, input);
  root.appendChild(input);
  root.appendChild(dropdown);
  root.appendChild(liveRegion);

  // Set ARIA attributes on input
  input.classList.add(classes.input);
  setInputAriaAttributes(input, listboxId);

  // --- Debounced search handler ---
  const debouncedSearch = debounce(async (query: string) => {
    if (query.length < minLength) {
      closeDropdown();
      return;
    }

    try {
      let results = await opts.source(query);
      if (results.length > maxResults) {
        results = results.slice(0, maxResults);
      }
      state.suggestions = results;
      state.activeIndex = -1;
      state.query = query;

      if (results.length > 0) {
        renderSuggestions();
        openDropdown();
      } else {
        closeDropdown();
      }
      announceResults(liveRegion, results.length);
    } catch {
      closeDropdown();
    }
  }, debounceMs);

  // --- Event Handlers ---
  function onInput(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    state.query = value;
    debouncedSearch(value);
  }

  function onKeyDown(e: KeyboardEvent): void {
    const action = resolveKeyboardAction(e);
    if (!action) return;
    if (!state.isOpen && action !== 'close') return;

    e.preventDefault();

    switch (action) {
      case 'next':
      case 'prev':
        state.activeIndex = getNextIndex(state.activeIndex, state.suggestions.length, action);
        updateActiveHighlight();
        updateActiveDescendant();
        break;

      case 'select':
        if (state.activeIndex >= 0 && state.activeIndex < state.suggestions.length) {
          selectItem(state.suggestions[state.activeIndex]);
        }
        break;

      case 'close':
        closeDropdown();
        break;
    }
  }

  function onFocus(): void {
    // Re-open if there are cached suggestions
    if (state.suggestions.length > 0 && state.query.length >= minLength) {
      renderSuggestions();
      openDropdown();
    }
  }

  function onDocumentClick(e: MouseEvent): void {
    // Close dropdown when clicking outside the root container
    if (!root.contains(e.target as Node)) {
      closeDropdown();
    }
  }

  // --- Attach listeners ---
  input.addEventListener('input', onInput);
  input.addEventListener('keydown', onKeyDown);
  input.addEventListener('focus', onFocus);
  document.addEventListener('click', onDocumentClick);

  // --- Core functions ---
  function openDropdown(): void {
    state.isOpen = true;
    dropdown.classList.remove(classes.dropdownHidden);
    updateExpandedState(input, true);
  }

  function closeDropdown(): void {
    state.isOpen = false;
    state.activeIndex = -1;
    dropdown.classList.add(classes.dropdownHidden);
    updateExpandedState(input, false);
    setActiveDescendant(input, null);
  }

  function selectItem(item: ThaiAddressSuggestion): void {
    closeDropdown();
    opts.onSelect(item);
  }

  function updateActiveDescendant(): void {
    if (state.activeIndex >= 0) {
      setActiveDescendant(input, generateOptionId(instanceId, state.activeIndex));
    } else {
      setActiveDescendant(input, null);
    }
  }

  /** Tracks the currently rendered item elements for in-place active state updates. */
  let renderedItems: HTMLElement[] = [];

  /**
   * Updates the active/highlighted state on already-rendered items
   * without rebuilding the DOM. This prevents element detachment
   * issues when hovering (mouseenter) triggers during a click.
   */
  function updateActiveHighlight(): void {
    renderedItems.forEach((itemEl, index) => {
      const isActive = index === state.activeIndex;
      setOptionAttributes(itemEl, generateOptionId(instanceId, index), isActive);
      if (isActive) {
        itemEl.classList.add(classes.itemActive);
        itemEl.style.backgroundColor = '#e8f0fe';
      } else {
        itemEl.classList.remove(classes.itemActive);
        itemEl.style.backgroundColor = '';
      }
    });
  }

  function renderSuggestions(): void {
    // Build individual item elements
    const itemElements = state.suggestions.map((suggestion, index) => {
      const isActive = index === state.activeIndex;
      const itemEl = opts.renderItem
        ? opts.renderItem(suggestion, isActive)
        : defaultRenderItem(suggestion, isActive, classes);

      // Set ARIA option attributes
      setOptionAttributes(itemEl, generateOptionId(instanceId, index), isActive);

      // Toggle active class
      if (isActive) {
        itemEl.classList.add(classes.itemActive);
      } else {
        itemEl.classList.remove(classes.itemActive);
      }

      // Click handler for mouse selection
      itemEl.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent input blur
        selectItem(suggestion);
      });

      // Hover to highlight — update in-place instead of full re-render
      itemEl.addEventListener('mouseenter', () => {
        state.activeIndex = index;
        updateActiveHighlight();
        updateActiveDescendant();
      });

      return itemEl;
    });

    // Store references for in-place updates
    renderedItems = itemElements;

    // Build the container (or use custom renderer)
    const containerContent = opts.renderContainer
      ? opts.renderContainer(itemElements)
      : defaultRenderContainer(itemElements);

    // Replace dropdown contents
    dropdown.innerHTML = '';
    if (containerContent !== dropdown) {
      dropdown.appendChild(containerContent);
    }
  }

  // --- Public API ---
  const instance: AutocompleteInstance = {
    destroy() {
      input.removeEventListener('input', onInput);
      input.removeEventListener('keydown', onKeyDown);
      input.removeEventListener('focus', onFocus);
      document.removeEventListener('click', onDocumentClick);
      debouncedSearch.cancel();

      // Restore DOM: move input out of root wrapper, then remove root
      root.parentNode?.insertBefore(input, root);
      root.remove();

      // Clean up ARIA attributes
      input.removeAttribute('role');
      input.removeAttribute('aria-autocomplete');
      input.removeAttribute('aria-expanded');
      input.removeAttribute('aria-owns');
      input.removeAttribute('aria-haspopup');
      input.removeAttribute('aria-activedescendant');
      input.classList.remove(classes.input);
    },

    open() {
      if (state.suggestions.length > 0) {
        renderSuggestions();
        openDropdown();
      }
    },

    close() {
      closeDropdown();
    },

    async search(query: string) {
      input.value = query;
      state.query = query;
      // Bypass debounce for programmatic searches
      debouncedSearch.cancel();

      if (query.length < minLength) {
        closeDropdown();
        return;
      }

      let results = await opts.source(query);
      if (results.length > maxResults) {
        results = results.slice(0, maxResults);
      }
      state.suggestions = results;
      state.activeIndex = -1;

      if (results.length > 0) {
        renderSuggestions();
        openDropdown();
      } else {
        closeDropdown();
      }
      announceResults(liveRegion, results.length);
    },

    getState() {
      return { ...state, suggestions: [...state.suggestions] };
    },

    updateOptions(newOpts: Partial<AutocompleteOptions>) {
      opts = { ...opts, ...newOpts };
    },
  };

  return instance;
}

// --- Default renderers ---

/**
 * Default item renderer that creates a `<li>` showing all address fields.
 */
function defaultRenderItem(
  item: ThaiAddressSuggestion,
  isActive: boolean,
  classes: Required<ClassNames>,
): HTMLElement {
  const li = document.createElement('li');
  li.className = isActive ? `${classes.item} ${classes.itemActive}` : classes.item;
  li.textContent = `${item.sub_district}, ${item.district}, ${item.province} ${item.postal_code}`;
  li.style.cursor = 'pointer';
  li.style.padding = '8px 12px';
  if (isActive) {
    li.style.backgroundColor = '#e8f0fe';
  }
  return li;
}

/**
 * Default container renderer that creates a styled `<ul>`.
 */
function defaultRenderContainer(children: HTMLElement[]): HTMLElement {
  const ul = document.createElement('ul');
  ul.style.listStyle = 'none';
  ul.style.margin = '0';
  ul.style.padding = '0';
  ul.style.maxHeight = '300px';
  ul.style.overflowY = 'auto';
  ul.style.border = '1px solid #ccc';
  ul.style.borderTop = 'none';
  ul.style.backgroundColor = '#fff';
  for (const child of children) {
    ul.appendChild(child);
  }
  return ul;
}

/**
 * Creates the dropdown wrapper element with proper class and initial hidden state.
 */
function createDropdown(classes: Required<ClassNames>, listboxId: string): HTMLElement {
  const dropdown = document.createElement('div');
  dropdown.className = `${classes.dropdown} ${classes.dropdownHidden}`;
  setListboxAttributes(dropdown, listboxId);
  // Position absolutely below the input
  Object.assign(dropdown.style, {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    zIndex: '1000',
  });
  return dropdown;
}

/**
 * Merges user-provided class names with defaults.
 */
function resolveClassNames(custom?: ClassNames): Required<ClassNames> {
  return { ...DEFAULT_CLASS_NAMES, ...custom };
}
