/**
 * React integration example for thai-address-autocomplete.
 *
 * This component wraps the headless autocomplete engine in a React component
 * that accepts render callbacks for full customization.
 *
 * Usage:
 * ```tsx
 * import { ThaiAddressAutocomplete } from './ThaiAddressAutocomplete';
 * import { createProvinceSource } from 'thai-address-autocomplete';
 *
 * function App() {
 *   return (
 *     <ThaiAddressAutocomplete
 *       source={createProvinceSource({ maxResults: 10 })}
 *       onSelect={(item) => console.log('Selected:', item)}
 *       placeholder="Search province..."
 *     />
 *   );
 * }
 * ```
 */

import React, { useEffect, useRef, useCallback } from 'react';

// Import types — in production, import from 'thai-address-autocomplete'
import type {
  ThaiAddressSuggestion,
  SourceFn,
  RenderItemFn,
  RenderContainerFn,
  ClassNames,
  AutocompleteInstance,
} from '../../src/types';

// Import core — in production, import from 'thai-address-autocomplete'
import { initAutocomplete } from '../../src/core';

/**
 * Props for the React ThaiAddressAutocomplete component.
 */
interface ThaiAddressAutocompleteProps {
  /** Data source function (use adapter factories). */
  source: SourceFn;
  /** Callback when a suggestion is selected. */
  onSelect: (item: ThaiAddressSuggestion) => void;
  /** Custom item renderer. */
  renderItem?: RenderItemFn;
  /** Custom container renderer. */
  renderContainer?: RenderContainerFn;
  /** CSS class name overrides. */
  classNames?: ClassNames;
  /** Input placeholder text. */
  placeholder?: string;
  /** Input aria-label for accessibility. */
  ariaLabel?: string;
  /** Debounce delay in ms. @default 200 */
  debounceMs?: number;
  /** Minimum query length to trigger search. @default 1 */
  minLength?: number;
  /** Max number of suggestions. @default 20 */
  maxResults?: number;
  /** Additional className for the input element. */
  className?: string;
}

/**
 * A React component that wraps the headless thai-address-autocomplete engine.
 *
 * Manages the lifecycle of the autocomplete instance via useEffect,
 * creating it on mount and destroying it on unmount.
 */
export const ThaiAddressAutocomplete: React.FC<ThaiAddressAutocompleteProps> = ({
  source,
  onSelect,
  renderItem,
  renderContainer,
  classNames,
  placeholder = 'Search Thai address...',
  ariaLabel = 'Search Thai address',
  debounceMs = 200,
  minLength = 1,
  maxResults = 20,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const instanceRef = useRef<AutocompleteInstance | null>(null);

  // Stable callback refs to avoid re-initializing on every render
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const stableOnSelect = useCallback((item: ThaiAddressSuggestion) => {
    onSelectRef.current(item);
  }, []);

  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const ac = initAutocomplete(inputEl, {
      source,
      onSelect: stableOnSelect,
      renderItem,
      renderContainer,
      classNames,
      debounceMs,
      minLength,
      maxResults,
    });

    instanceRef.current = ac;

    return () => {
      ac.destroy();
      instanceRef.current = null;
    };
  }, [source, stableOnSelect, renderItem, renderContainer, classNames, debounceMs, minLength, maxResults]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={className}
    />
  );
};

export default ThaiAddressAutocomplete;
