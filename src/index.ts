/**
 * @module thai-address-autocomplete
 *
 * A framework-agnostic, headless autocomplete component for Thai address suggestions.
 *
 * ## Quick Start
 * ```ts
 * import { initAutocomplete, createProvinceSource } from 'thai-address-autocomplete';
 *
 * const ac = initAutocomplete(document.getElementById('my-input')!, {
 *   source: createProvinceSource(),
 *   onSelect: (item) => console.log(item),
 * });
 * ```
 *
 * @packageDocumentation
 */

// Core autocomplete engine
export { initAutocomplete } from './core';

// Adapter factories for thai-address-universal
export {
  createProvinceSource,
  createDistrictSource,
  createSubDistrictSource,
  createPostalCodeSource,
} from './adapters';

// Utility functions (available for advanced usage / custom integrations)
export { debounce } from './utils/debounce';
export { resolveKeyboardAction, getNextIndex } from './utils/keyboard';

// Type exports
export type {
  ThaiAddressSuggestion,
  AddressField,
  AutocompleteOptions,
  AutocompleteInstance,
  AutocompleteState,
  ClassNames,
  RenderItemFn,
  RenderContainerFn,
  SourceFn,
  OnSelectFn,
  AdapterOptions,
  AdapterSearchFn,
  KeyboardAction,
} from './types';
