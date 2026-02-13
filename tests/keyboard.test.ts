/**
 * Unit tests for keyboard navigation utilities.
 */

import { describe, it, expect } from 'vitest';
import { resolveKeyboardAction, getNextIndex } from '../src/utils/keyboard';

describe('resolveKeyboardAction', () => {
  it('should return "next" for ArrowDown', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    expect(resolveKeyboardAction(event)).toBe('next');
  });

  it('should return "prev" for ArrowUp', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    expect(resolveKeyboardAction(event)).toBe('prev');
  });

  it('should return "select" for Enter', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    expect(resolveKeyboardAction(event)).toBe('select');
  });

  it('should return "close" for Escape', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    expect(resolveKeyboardAction(event)).toBe('close');
  });

  it('should return null for unhandled keys', () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    expect(resolveKeyboardAction(event)).toBeNull();
  });

  it('should return null for printable characters', () => {
    const event = new KeyboardEvent('keydown', { key: 'a' });
    expect(resolveKeyboardAction(event)).toBeNull();
  });
});

describe('getNextIndex', () => {
  it('should return -1 when there are no items', () => {
    expect(getNextIndex(0, 0, 'next')).toBe(-1);
    expect(getNextIndex(-1, 0, 'prev')).toBe(-1);
  });

  it('should move from -1 to 0 on "next"', () => {
    expect(getNextIndex(-1, 5, 'next')).toBe(0);
  });

  it('should move forward on "next"', () => {
    expect(getNextIndex(0, 5, 'next')).toBe(1);
    expect(getNextIndex(2, 5, 'next')).toBe(3);
  });

  it('should wrap to -1 when going past the last item on "next"', () => {
    expect(getNextIndex(4, 5, 'next')).toBe(-1);
  });

  it('should move from -1 to last item on "prev"', () => {
    expect(getNextIndex(-1, 5, 'prev')).toBe(4);
  });

  it('should move backward on "prev"', () => {
    expect(getNextIndex(3, 5, 'prev')).toBe(2);
    expect(getNextIndex(1, 5, 'prev')).toBe(0);
  });

  it('should wrap to -1 when going before 0 on "prev"', () => {
    expect(getNextIndex(0, 5, 'prev')).toBe(-1);
  });

  it('should handle single-item list', () => {
    expect(getNextIndex(-1, 1, 'next')).toBe(0);
    expect(getNextIndex(0, 1, 'next')).toBe(-1);
    expect(getNextIndex(-1, 1, 'prev')).toBe(0);
    expect(getNextIndex(0, 1, 'prev')).toBe(-1);
  });
});
