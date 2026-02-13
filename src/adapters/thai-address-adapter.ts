/**
 * @module adapters/thai-address-adapter
 * Wraps `thai-address-universal` search functions into the `SourceFn` type
 * expected by the autocomplete core.
 *
 * Each factory function accepts optional configuration and returns a
 * `SourceFn` that fetches and transforms results from the upstream library.
 *
 * Design decision: We import from `thai-address-universal` dynamically
 * where possible, but the peer dependency ensures it's available at runtime.
 */

import {
  searchAddressByProvince,
  searchAddressByDistrict,
  searchAddressBySubDistrict,
  searchAddressByPostalCode,
} from 'thai-address-universal';
import type { ThaiAddressSuggestion, AdapterOptions, AdapterSearchFn } from '../types';

/** Default maximum number of results returned by an adapter. */
const DEFAULT_MAX_RESULTS = 20;

/**
 * Creates a source function that searches Thai addresses by **province** (จังหวัด).
 *
 * @param options - Optional configuration for result limits.
 * @returns A `SourceFn` compatible with `AutocompleteOptions.source`.
 *
 * @example
 * ```ts
 * import { initAutocomplete, createProvinceSource } from 'thai-address-autocomplete';
 *
 * initAutocomplete(inputEl, {
 *   source: createProvinceSource({ maxResults: 10 }),
 *   onSelect: (item) => console.log(item),
 * });
 * ```
 */
export function createProvinceSource(options?: AdapterOptions): AdapterSearchFn {
  const maxResults = options?.maxResults ?? DEFAULT_MAX_RESULTS;

  return async (query: string): Promise<ThaiAddressSuggestion[]> => {
    if (!query.trim()) return [];
    const results = await searchAddressByProvince(query, maxResults);
    return results as ThaiAddressSuggestion[];
  };
}

/**
 * Creates a source function that searches Thai addresses by **district** (อำเภอ/เขต).
 *
 * @param options - Optional configuration for result limits.
 * @returns A `SourceFn` compatible with `AutocompleteOptions.source`.
 *
 * @example
 * ```ts
 * const source = createDistrictSource({ maxResults: 15 });
 * ```
 */
export function createDistrictSource(options?: AdapterOptions): AdapterSearchFn {
  const maxResults = options?.maxResults ?? DEFAULT_MAX_RESULTS;

  return async (query: string): Promise<ThaiAddressSuggestion[]> => {
    if (!query.trim()) return [];
    const results = await searchAddressByDistrict(query, maxResults);
    return results as ThaiAddressSuggestion[];
  };
}

/**
 * Creates a source function that searches Thai addresses by **sub-district** (ตำบล/แขวง).
 *
 * @param options - Optional configuration for result limits.
 * @returns A `SourceFn` compatible with `AutocompleteOptions.source`.
 *
 * @example
 * ```ts
 * const source = createSubDistrictSource({ maxResults: 10 });
 * ```
 */
export function createSubDistrictSource(options?: AdapterOptions): AdapterSearchFn {
  const maxResults = options?.maxResults ?? DEFAULT_MAX_RESULTS;

  return async (query: string): Promise<ThaiAddressSuggestion[]> => {
    if (!query.trim()) return [];
    const results = await searchAddressBySubDistrict(query, maxResults);
    return results as ThaiAddressSuggestion[];
  };
}

/**
 * Creates a source function that searches Thai addresses by **postal code** (รหัสไปรษณีย์).
 *
 * @param options - Optional configuration for result limits.
 * @returns A `SourceFn` compatible with `AutocompleteOptions.source`.
 *
 * @example
 * ```ts
 * const source = createPostalCodeSource({ maxResults: 5 });
 * ```
 */
export function createPostalCodeSource(options?: AdapterOptions): AdapterSearchFn {
  const maxResults = options?.maxResults ?? DEFAULT_MAX_RESULTS;

  return async (query: string): Promise<ThaiAddressSuggestion[]> => {
    if (!query.trim()) return [];
    const results = await searchAddressByPostalCode(query, maxResults);
    return results as ThaiAddressSuggestion[];
  };
}
