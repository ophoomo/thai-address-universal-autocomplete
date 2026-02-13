<!--
  Vue 3 example app demonstrating ThaiAddressAutocomplete usage.

  To run this example:
  1. Create a Vue 3 app (e.g., with Vite)
  2. Install: npm install thai-address-autocomplete thai-address-universal
  3. Copy ThaiAddressAutocomplete.vue and this file into your project
  4. Import and use the component
-->

<template>
  <div style="max-width: 500px; margin: 40px auto; font-family: sans-serif">
    <h1>Thai Address Autocomplete — Vue</h1>

    <div style="margin-bottom: 20px">
      <label>Province (จังหวัด)</label>
      <ThaiAddressAutocomplete
        :source="provinceSource"
        :render-item="renderItem"
        placeholder="พิมพ์ชื่อจังหวัด..."
        input-class="form-input"
        @select="onSelect"
      />
    </div>

    <div style="margin-bottom: 20px">
      <label>District (อำเภอ)</label>
      <ThaiAddressAutocomplete
        :source="districtSource"
        :render-item="renderItem"
        placeholder="พิมพ์ชื่ออำเภอ..."
        input-class="form-input"
        @select="onSelect"
      />
    </div>

    <div
      v-if="selectedAddress"
      style="
        margin-top: 20px;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;
        border: 1px solid #ddd;
      "
    >
      <h3>Selected Address:</h3>
      <pre style="font-size: 14px">{{ JSON.stringify(selectedAddress, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ThaiAddressAutocomplete from './ThaiAddressAutocomplete.vue';

// In production, import from 'thai-address-autocomplete'
import { createProvinceSource, createDistrictSource } from '../../src/adapters';
import type { ThaiAddressSuggestion } from '../../src/types';

const provinceSource = createProvinceSource({ maxResults: 10 });
const districtSource = createDistrictSource({ maxResults: 10 });
const selectedAddress = ref<ThaiAddressSuggestion | null>(null);

/**
 * Custom render item showing address fields inline.
 */
function renderItem(item: ThaiAddressSuggestion, isActive: boolean): HTMLElement {
  const li = document.createElement('li');
  li.style.padding = '10px 12px';
  li.style.cursor = 'pointer';
  li.style.borderBottom = '1px solid #f0f0f0';
  if (isActive) {
    li.style.backgroundColor = '#e8f0fe';
  }
  li.innerHTML = `
    <strong>${item.sub_district}</strong> » ${item.district} » ${item.province}
    <span style="color: #888; margin-left: 8px">(${item.postal_code})</span>
  `;
  return li;
}

function onSelect(item: ThaiAddressSuggestion) {
  selectedAddress.value = item;
}
</script>
