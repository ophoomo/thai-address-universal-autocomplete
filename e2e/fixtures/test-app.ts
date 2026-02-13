/**
 * E2E test application entry point.
 *
 * This file is bundled by esbuild (with all dependencies inlined)
 * to create a self-contained script for the E2E test fixture page.
 */

import {
  initAutocomplete,
  createProvinceSource,
  createDistrictSource,
  createSubDistrictSource,
  createPostalCodeSource,
} from '../../src/index';
import type { ThaiAddressSuggestion } from '../../src/types';

const subdistrictInput = document.getElementById('subdistrict-input') as HTMLInputElement;
const districtInput = document.getElementById('district-input') as HTMLInputElement;
const provinceInput = document.getElementById('province-input') as HTMLInputElement;
const postalInput = document.getElementById('postal-input') as HTMLInputElement;

function showResult(item: ThaiAddressSuggestion): void {
  const resultEl = document.getElementById('result')!;
  const jsonEl = document.getElementById('result-json')!;
  resultEl.style.display = 'block';
  jsonEl.textContent = JSON.stringify(item, null, 2);
}

/** Fill all address fields from the selected suggestion. */
function fillAllFields(item: ThaiAddressSuggestion): void {
  subdistrictInput.value = item.sub_district;
  districtInput.value = item.district;
  provinceInput.value = item.province;
  postalInput.value = item.postal_code;
  showResult(item);
}

function customRenderItem(item: ThaiAddressSuggestion, isActive: boolean): HTMLElement {
  const li = document.createElement('li');
  li.className = 'tac-item';
  li.innerHTML = `
    <span>${item.sub_district}</span> &raquo;
    <span>${item.district}</span> &raquo;
    <span>${item.province}</span>
    <span>(${item.postal_code})</span>
  `;
  if (isActive) {
    li.style.backgroundColor = '#e8f0fe';
  }
  return li;
}

// Sub-district (ตำบล)
initAutocomplete(subdistrictInput, {
  source: createSubDistrictSource({ maxResults: 10 }),
  onSelect: fillAllFields,
  renderItem: customRenderItem,
  debounceMs: 50,
});

// District (อำเภอ)
initAutocomplete(districtInput, {
  source: createDistrictSource({ maxResults: 10 }),
  onSelect: fillAllFields,
  renderItem: customRenderItem,
  debounceMs: 50,
});

// Province (จังหวัด)
initAutocomplete(provinceInput, {
  source: createProvinceSource({ maxResults: 10 }),
  onSelect: fillAllFields,
  renderItem: customRenderItem,
  debounceMs: 50,
});

// Postal code (รหัสไปรษณีย์)
initAutocomplete(postalInput, {
  source: createPostalCodeSource({ maxResults: 10 }),
  onSelect: fillAllFields,
  renderItem: customRenderItem,
  debounceMs: 50,
});
