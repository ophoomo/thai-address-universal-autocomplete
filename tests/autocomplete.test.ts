/**
 * Integration tests for the headless autocomplete core engine.
 *
 * Uses happy-dom for a realistic DOM environment. Tests simulate:
 * - Typing into the input field
 * - Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
 * - Mouse selection
 * - ARIA attribute management
 * - Programmatic API (search, open, close, destroy)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initAutocomplete } from '../src/core/autocomplete';
import type {
  AutocompleteOptions,
  ThaiAddressSuggestion,
  AutocompleteInstance,
} from '../src/types';

// --- Test fixtures ---
const SUGGESTIONS: ThaiAddressSuggestion[] = [
  {
    province: 'กรุงเทพมหานคร',
    district: 'คลองสาน',
    sub_district: 'คลองต้นไทร',
    postal_code: '10600',
  },
  {
    province: 'กรุงเทพมหานคร',
    district: 'คลองสาน',
    sub_district: 'คลองสาน',
    postal_code: '10600',
  },
  {
    province: 'กรุงเทพมหานคร',
    district: 'บางรัก',
    sub_district: 'สีลม',
    postal_code: '10500',
  },
];

function createMockSource(results: ThaiAddressSuggestion[] = SUGGESTIONS) {
  return vi.fn().mockResolvedValue(results);
}

function createInput(): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'text';
  document.body.appendChild(input);
  return input;
}

function createOptions(overrides?: Partial<AutocompleteOptions>): AutocompleteOptions {
  return {
    source: createMockSource(),
    onSelect: vi.fn(),
    debounceMs: 0, // Disable debounce for test predictability
    ...overrides,
  };
}

// Helper to trigger input event
function typeInto(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

// Helper to trigger keydown
function pressKey(input: HTMLInputElement, key: string): void {
  input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('initAutocomplete', () => {
  let input: HTMLInputElement;
  let ac: AutocompleteInstance;

  beforeEach(() => {
    vi.useFakeTimers();
    input = createInput();
  });

  afterEach(() => {
    ac?.destroy();
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should throw if input is not an HTMLInputElement', () => {
      const div = document.createElement('div');
      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initAutocomplete(div as any, createOptions()),
      ).toThrow('initAutocomplete: first argument must be an HTMLInputElement');
    });

    it('should wrap input in a root container', () => {
      ac = initAutocomplete(input, createOptions());
      const root = input.parentElement;
      expect(root?.classList.contains('tac-root')).toBe(true);
    });

    it('should set ARIA attributes on input', () => {
      ac = initAutocomplete(input, createOptions());

      expect(input.getAttribute('role')).toBe('combobox');
      expect(input.getAttribute('aria-autocomplete')).toBe('list');
      expect(input.getAttribute('aria-expanded')).toBe('false');
      expect(input.getAttribute('aria-haspopup')).toBe('listbox');
    });

    it('should create a dropdown with listbox role', () => {
      ac = initAutocomplete(input, createOptions());
      const root = input.parentElement!;
      const dropdown = root.querySelector('[role="listbox"]');

      expect(dropdown).not.toBeNull();
      expect(dropdown?.classList.contains('tac-dropdown--hidden')).toBe(true);
    });
  });

  describe('search and display', () => {
    it('should call source and show suggestions on input', async () => {
      const source = createMockSource();
      ac = initAutocomplete(input, createOptions({ source }));

      typeInto(input, 'กรุง');
      await vi.advanceTimersByTimeAsync(10);

      expect(source).toHaveBeenCalledWith('กรุง');

      const state = ac.getState();
      expect(state.isOpen).toBe(true);
      expect(state.suggestions).toHaveLength(3);
    });

    it('should not search when query is shorter than minLength', async () => {
      const source = createMockSource();
      ac = initAutocomplete(input, createOptions({ source, minLength: 3 }));

      typeInto(input, 'กร');
      await vi.advanceTimersByTimeAsync(10);

      expect(source).not.toHaveBeenCalled();
      expect(ac.getState().isOpen).toBe(false);
    });

    it('should close dropdown when source returns empty results', async () => {
      const source = createMockSource([]);
      ac = initAutocomplete(input, createOptions({ source }));

      typeInto(input, 'xyz');
      await vi.advanceTimersByTimeAsync(10);

      expect(ac.getState().isOpen).toBe(false);
    });

    it('should limit results to maxResults', async () => {
      const manyResults = Array.from({ length: 50 }, (_, i) => ({
        province: `Province ${i}`,
        district: `District ${i}`,
        sub_district: `SubDistrict ${i}`,
        postal_code: `${10000 + i}`,
      }));
      const source = createMockSource(manyResults);
      ac = initAutocomplete(input, createOptions({ source, maxResults: 5 }));

      typeInto(input, 'test');
      await vi.advanceTimersByTimeAsync(10);

      expect(ac.getState().suggestions).toHaveLength(5);
    });

    it('should render suggestion items in the dropdown', async () => {
      ac = initAutocomplete(input, createOptions());

      typeInto(input, 'กรุง');
      await vi.advanceTimersByTimeAsync(10);

      const root = input.parentElement!;
      const options = root.querySelectorAll('[role="option"]');
      expect(options).toHaveLength(3);
    });
  });

  describe('keyboard navigation', () => {
    beforeEach(async () => {
      ac = initAutocomplete(input, createOptions());
      typeInto(input, 'กรุง');
      await vi.advanceTimersByTimeAsync(10);
    });

    it('should navigate down with ArrowDown', () => {
      pressKey(input, 'ArrowDown');
      expect(ac.getState().activeIndex).toBe(0);

      pressKey(input, 'ArrowDown');
      expect(ac.getState().activeIndex).toBe(1);
    });

    it('should navigate up with ArrowUp', () => {
      pressKey(input, 'ArrowUp');
      expect(ac.getState().activeIndex).toBe(2); // wraps to last

      pressKey(input, 'ArrowUp');
      expect(ac.getState().activeIndex).toBe(1);
    });

    it('should wrap around on ArrowDown past last item', () => {
      pressKey(input, 'ArrowDown'); // 0
      pressKey(input, 'ArrowDown'); // 1
      pressKey(input, 'ArrowDown'); // 2
      pressKey(input, 'ArrowDown'); // -1 (wrap)
      expect(ac.getState().activeIndex).toBe(-1);
    });

    it('should select active item on Enter', () => {
      const onSelect = vi.fn();
      ac.updateOptions({ onSelect });

      pressKey(input, 'ArrowDown'); // 0
      pressKey(input, 'Enter');

      expect(onSelect).toHaveBeenCalledWith(SUGGESTIONS[0]);
      expect(ac.getState().isOpen).toBe(false);
    });

    it('should not select if no item is active on Enter', () => {
      const onSelect = vi.fn();
      ac.updateOptions({ onSelect });

      pressKey(input, 'Enter');
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('should close dropdown on Escape', () => {
      pressKey(input, 'Escape');
      expect(ac.getState().isOpen).toBe(false);
    });

    it('should update aria-activedescendant on navigation', () => {
      pressKey(input, 'ArrowDown');
      expect(input.getAttribute('aria-activedescendant')).toContain('option-0');

      pressKey(input, 'ArrowDown');
      expect(input.getAttribute('aria-activedescendant')).toContain('option-1');
    });

    it('should update aria-expanded when dropdown opens/closes', () => {
      expect(input.getAttribute('aria-expanded')).toBe('true');

      pressKey(input, 'Escape');
      expect(input.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('programmatic API', () => {
    it('should search programmatically', async () => {
      const source = createMockSource();
      ac = initAutocomplete(input, createOptions({ source }));

      await ac.search('กรุง');

      expect(source).toHaveBeenCalledWith('กรุง');
      expect(ac.getState().isOpen).toBe(true);
      expect(input.value).toBe('กรุง');
    });

    it('should close programmatically', async () => {
      ac = initAutocomplete(input, createOptions());
      typeInto(input, 'กรุง');
      await vi.advanceTimersByTimeAsync(10);

      ac.close();
      expect(ac.getState().isOpen).toBe(false);
    });

    it('should open programmatically when suggestions exist', async () => {
      ac = initAutocomplete(input, createOptions());
      typeInto(input, 'กรุง');
      await vi.advanceTimersByTimeAsync(10);

      ac.close();
      ac.open();
      expect(ac.getState().isOpen).toBe(true);
    });

    it('should not open when no suggestions exist', () => {
      ac = initAutocomplete(input, createOptions());
      ac.open();
      expect(ac.getState().isOpen).toBe(false);
    });

    it('should return a state snapshot from getState', async () => {
      ac = initAutocomplete(input, createOptions());
      typeInto(input, 'กรุง');
      await vi.advanceTimersByTimeAsync(10);

      const state = ac.getState();
      expect(state.isOpen).toBe(true);
      expect(state.suggestions).toHaveLength(3);
      expect(state.activeIndex).toBe(-1);
      expect(state.query).toBe('กรุง');
    });
  });

  describe('custom rendering', () => {
    it('should use custom renderItem when provided', async () => {
      const renderItem = vi.fn((item: ThaiAddressSuggestion, isActive: boolean) => {
        const el = document.createElement('div');
        el.textContent = item.province;
        el.className = isActive ? 'active' : '';
        return el;
      });

      ac = initAutocomplete(input, createOptions({ renderItem }));
      typeInto(input, 'กรุง');
      await vi.advanceTimersByTimeAsync(10);

      expect(renderItem).toHaveBeenCalledTimes(3);
      expect(renderItem).toHaveBeenCalledWith(SUGGESTIONS[0], false);
    });

    it('should use custom renderContainer when provided', async () => {
      const renderContainer = vi.fn((children: HTMLElement[]) => {
        const div = document.createElement('div');
        div.className = 'custom-container';
        children.forEach((child) => div.appendChild(child));
        return div;
      });

      ac = initAutocomplete(input, createOptions({ renderContainer }));
      typeInto(input, 'กรุง');
      await vi.advanceTimersByTimeAsync(10);

      expect(renderContainer).toHaveBeenCalledTimes(1);
      const root = input.parentElement!;
      expect(root.querySelector('.custom-container')).not.toBeNull();
    });

    it('should use custom classNames', async () => {
      ac = initAutocomplete(
        input,
        createOptions({
          classNames: {
            root: 'my-root',
            dropdown: 'my-dropdown',
            item: 'my-item',
          },
        }),
      );

      const root = input.parentElement!;
      expect(root.classList.contains('my-root')).toBe(true);

      typeInto(input, 'กรุง');
      await vi.advanceTimersByTimeAsync(10);

      const dropdown = root.querySelector('.my-dropdown');
      expect(dropdown).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('should remove event listeners and DOM elements on destroy', async () => {
      const source = createMockSource();
      ac = initAutocomplete(input, createOptions({ source }));

      ac.destroy();

      // Input should no longer have ARIA attributes
      expect(input.getAttribute('role')).toBeNull();
      expect(input.getAttribute('aria-autocomplete')).toBeNull();

      // Typing should not trigger source
      typeInto(input, 'test');
      await vi.advanceTimersByTimeAsync(10);
      expect(source).not.toHaveBeenCalled();
    });

    it('should restore input to its original parent on destroy', () => {
      ac = initAutocomplete(input, createOptions());

      ac.destroy();
      expect(input.parentElement).toBe(document.body);
    });
  });

  describe('document click to close', () => {
    it('should close dropdown when clicking outside', async () => {
      ac = initAutocomplete(input, createOptions());
      typeInto(input, 'กรุง');
      await vi.advanceTimersByTimeAsync(10);

      expect(ac.getState().isOpen).toBe(true);

      // Click outside
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(ac.getState().isOpen).toBe(false);
    });
  });
});
