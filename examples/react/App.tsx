/**
 * React example app demonstrating ThaiAddressAutocomplete usage.
 *
 * Shows how to:
 * - Use adapter factories as source functions
 * - Handle selection callbacks
 * - Provide custom renderItem for UI customization
 *
 * To run this example:
 * 1. Create a React app (e.g., with Vite)
 * 2. Install: npm install thai-address-autocomplete thai-address-universal
 * 3. Copy this file and ThaiAddressAutocomplete.tsx into your project
 * 4. Import and use the component
 */

import React, { useState } from 'react';
import { ThaiAddressAutocomplete } from './ThaiAddressAutocomplete';

// In production, import from 'thai-address-autocomplete'
import type { ThaiAddressSuggestion } from '../../src/types';
import { createProvinceSource, createDistrictSource } from '../../src/adapters';

const provinceSource = createProvinceSource({ maxResults: 10 });
const districtSource = createDistrictSource({ maxResults: 10 });

export default function App() {
  const [selectedAddress, setSelectedAddress] = useState<ThaiAddressSuggestion | null>(null);

  /**
   * Custom render item that highlights the address components.
   */
  const renderItem = (item: ThaiAddressSuggestion, isActive: boolean): HTMLElement => {
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
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Thai Address Autocomplete — React</h1>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="province">Province (จังหวัด)</label>
        <ThaiAddressAutocomplete
          source={provinceSource}
          onSelect={(item) => setSelectedAddress(item)}
          renderItem={renderItem}
          placeholder="พิมพ์ชื่อจังหวัด..."
          className="form-input"
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="district">District (อำเภอ)</label>
        <ThaiAddressAutocomplete
          source={districtSource}
          onSelect={(item) => setSelectedAddress(item)}
          renderItem={renderItem}
          placeholder="พิมพ์ชื่ออำเภอ..."
          className="form-input"
        />
      </div>

      {selectedAddress && (
        <div style={{
          marginTop: 20,
          padding: 16,
          background: '#f5f5f5',
          borderRadius: 8,
          border: '1px solid #ddd',
        }}>
          <h3 style={{ marginBottom: 8 }}>Selected Address:</h3>
          <pre style={{ fontSize: 14 }}>
            {JSON.stringify(selectedAddress, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
