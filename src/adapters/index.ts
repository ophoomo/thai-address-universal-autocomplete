/**
 * @module adapters
 * Adapter functions that bridge `thai-address-universal` search APIs
 * with the autocomplete engine's `SourceFn` contract.
 *
 * Each adapter factory returns a `SourceFn` that can be passed directly
 * to `initAutocomplete({ source: ... })`.
 */

export {
  createProvinceSource,
  createDistrictSource,
  createSubDistrictSource,
  createPostalCodeSource,
} from './thai-address-adapter';
