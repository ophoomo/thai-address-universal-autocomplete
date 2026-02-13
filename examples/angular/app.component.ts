/**
 * Angular example app demonstrating both the directive and component approaches.
 *
 * Shows how to:
 * - Use adapter factories as source functions
 * - Handle selection with (addressSelect) output
 * - Provide custom renderItem for UI customization
 * - Use the directive approach (attach to existing <input>)
 * - Use the component approach (<thai-address-autocomplete />)
 *
 * To run this example:
 * 1. Create an Angular app (e.g., with Angular CLI: ng new my-app)
 * 2. Install: npm install thai-address-autocomplete thai-address-universal
 * 3. Copy the directive/component files into your project
 * 4. Import and use them as shown below
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// In production, import from 'thai-address-autocomplete'
import {
  createProvinceSource,
  createDistrictSource,
  createPostalCodeSource,
} from '../../src/adapters';
import type { ThaiAddressSuggestion, RenderItemFn } from '../../src/types';

import { ThaiAddressAutocompleteDirective } from './thai-address-autocomplete.directive';
import { ThaiAddressAutocompleteComponent } from './thai-address-autocomplete.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ThaiAddressAutocompleteDirective, ThaiAddressAutocompleteComponent],
  template: `
    <div style="max-width: 500px; margin: 40px auto; font-family: sans-serif">
      <h1>Thai Address Autocomplete — Angular</h1>

      <!-- Directive approach: attach to an existing input -->
      <div style="margin-bottom: 20px">
        <label>Province — Directive (จังหวัด)</label>
        <input
          type="text"
          thaiAddressAutocomplete
          [source]="provinceSource"
          [renderItem]="renderItem"
          [debounceMs]="150"
          [maxResults]="10"
          (addressSelect)="onSelect($event)"
          placeholder="พิมพ์ชื่อจังหวัด..."
          style="width: 100%; padding: 10px; border: 2px solid #ccc; border-radius: 6px; font-size: 1rem"
        />
      </div>

      <!-- Component approach: self-contained component -->
      <div style="margin-bottom: 20px">
        <label>District — Component (อำเภอ)</label>
        <thai-address-autocomplete
          [source]="districtSource"
          [renderItem]="renderItem"
          [debounceMs]="150"
          [maxResults]="10"
          placeholder="พิมพ์ชื่ออำเภอ..."
          (addressSelect)="onSelect($event)"
        />
      </div>

      <div style="margin-bottom: 20px">
        <label>Postal Code — Component (รหัสไปรษณีย์)</label>
        <thai-address-autocomplete
          [source]="postalCodeSource"
          [renderItem]="renderItem"
          [debounceMs]="150"
          [maxResults]="10"
          placeholder="พิมพ์รหัสไปรษณีย์..."
          (addressSelect)="onSelect($event)"
        />
      </div>

      <!-- Selected result -->
      <div
        *ngIf="selectedAddress"
        style="margin-top: 20px; padding: 16px; background: #f5f5f5; border-radius: 8px; border: 1px solid #ddd"
      >
        <h3>Selected Address:</h3>
        <pre style="font-size: 14px">{{ selectedAddress | json }}</pre>
      </div>
    </div>
  `,
})
export class AppComponent {
  readonly provinceSource = createProvinceSource({ maxResults: 10 });
  readonly districtSource = createDistrictSource({ maxResults: 10 });
  readonly postalCodeSource = createPostalCodeSource({ maxResults: 10 });

  selectedAddress: ThaiAddressSuggestion | null = null;

  /**
   * Custom render item showing address fields with styled layout.
   */
  renderItem: RenderItemFn = (item: ThaiAddressSuggestion, isActive: boolean): HTMLElement => {
    const li = document.createElement('li');
    li.style.padding = '10px 12px';
    li.style.cursor = 'pointer';
    li.style.borderBottom = '1px solid #f0f0f0';
    if (isActive) {
      li.style.backgroundColor = '#e8f0fe';
    }
    li.innerHTML = `
      <strong>${item.sub_district}</strong> &raquo; ${item.district} &raquo; ${item.province}
      <span style="color: #888; margin-left: 8px">(${item.postal_code})</span>
    `;
    return li;
  };

  onSelect(item: ThaiAddressSuggestion): void {
    this.selectedAddress = item;
  }
}
