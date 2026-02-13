/**
 * Unit tests for accessibility helpers.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  setInputAriaAttributes,
  updateExpandedState,
  setActiveDescendant,
  setListboxAttributes,
  setOptionAttributes,
  generateOptionId,
  createLiveRegion,
  announceResults,
} from '../src/utils/accessibility';

describe('accessibility helpers', () => {
  let input: HTMLInputElement;

  beforeEach(() => {
    input = document.createElement('input');
  });

  describe('setInputAriaAttributes', () => {
    it('should set combobox role and ARIA attributes on input', () => {
      setInputAriaAttributes(input, 'test-listbox');

      expect(input.getAttribute('role')).toBe('combobox');
      expect(input.getAttribute('aria-autocomplete')).toBe('list');
      expect(input.getAttribute('aria-expanded')).toBe('false');
      expect(input.getAttribute('aria-owns')).toBe('test-listbox');
      expect(input.getAttribute('aria-haspopup')).toBe('listbox');
    });

    it('should set default aria-label if none exists', () => {
      setInputAriaAttributes(input, 'test-listbox');
      expect(input.getAttribute('aria-label')).toBe('Search Thai address');
    });

    it('should preserve existing aria-label', () => {
      input.setAttribute('aria-label', 'Custom label');
      setInputAriaAttributes(input, 'test-listbox');
      expect(input.getAttribute('aria-label')).toBe('Custom label');
    });
  });

  describe('updateExpandedState', () => {
    it('should set aria-expanded to true', () => {
      updateExpandedState(input, true);
      expect(input.getAttribute('aria-expanded')).toBe('true');
    });

    it('should set aria-expanded to false', () => {
      updateExpandedState(input, false);
      expect(input.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('setActiveDescendant', () => {
    it('should set aria-activedescendant when given an ID', () => {
      setActiveDescendant(input, 'option-0');
      expect(input.getAttribute('aria-activedescendant')).toBe('option-0');
    });

    it('should remove aria-activedescendant when given null', () => {
      input.setAttribute('aria-activedescendant', 'option-0');
      setActiveDescendant(input, null);
      expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    });
  });

  describe('setListboxAttributes', () => {
    it('should set listbox role and ID on container', () => {
      const container = document.createElement('div');
      setListboxAttributes(container, 'my-listbox');

      expect(container.getAttribute('role')).toBe('listbox');
      expect(container.id).toBe('my-listbox');
      expect(container.getAttribute('aria-label')).toBe('Address suggestions');
    });
  });

  describe('setOptionAttributes', () => {
    it('should set option role and aria-selected', () => {
      const item = document.createElement('li');
      setOptionAttributes(item, 'opt-1', false);

      expect(item.getAttribute('role')).toBe('option');
      expect(item.id).toBe('opt-1');
      expect(item.getAttribute('aria-selected')).toBe('false');
    });

    it('should set aria-selected to true when active', () => {
      const item = document.createElement('li');
      setOptionAttributes(item, 'opt-2', true);
      expect(item.getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('generateOptionId', () => {
    it('should generate namespaced option IDs', () => {
      expect(generateOptionId('tac-1', 0)).toBe('tac-1-option-0');
      expect(generateOptionId('tac-1', 5)).toBe('tac-1-option-5');
    });
  });

  describe('createLiveRegion', () => {
    it('should create a visually hidden live region', () => {
      const region = createLiveRegion();

      expect(region.getAttribute('role')).toBe('status');
      expect(region.getAttribute('aria-live')).toBe('polite');
      expect(region.getAttribute('aria-atomic')).toBe('true');
      expect(region.style.position).toBe('absolute');
      expect(region.style.overflow).toBe('hidden');
    });
  });

  describe('announceResults', () => {
    it('should announce zero results', () => {
      const region = createLiveRegion();
      announceResults(region, 0);
      expect(region.textContent).toBe('No suggestions available.');
    });

    it('should announce singular result', () => {
      const region = createLiveRegion();
      announceResults(region, 1);
      expect(region.textContent).toBe(
        '1 suggestion available. Use up and down arrows to navigate.',
      );
    });

    it('should announce plural results', () => {
      const region = createLiveRegion();
      announceResults(region, 5);
      expect(region.textContent).toBe(
        '5 suggestions available. Use up and down arrows to navigate.',
      );
    });
  });
});
