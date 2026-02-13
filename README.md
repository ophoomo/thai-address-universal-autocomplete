<p align="center">
  <img src="https://github.com/ophoomo/thai-address-universal-autocomplete/raw/master/thai-address-universal-autocomplete.svg" width="100%" />
</p>

<p align="center">
    A framework-agnostic, headless autocomplete component for Thai address suggestions.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/thai-address-universal-autocomplete">
    <img src="https://img.shields.io/npm/v/thai-address-universal-autocomplete" alt="NPM Version">
    </a>
    <a href="https://github.com/ophoomo/thai-address-universal-autocomplete/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/ophoomo/thai-address-universal-autocomplete/publish.yaml" alt="GitHub Actions Workflow Status">
    </a>
    <a href="https://codecov.io/github/ophoomo/thai-address-universal-autocomplete">
    <img src="https://codecov.io/github/ophoomo/thai-address-universal-autocomplete/graph/badge.svg?token=POBBK8A3FD" alt="codecov">
    </a>
    <a href="https://github.com/ophoomo/thai-address-universal-autocomplete/blob/master/LICENSE.md">
    <img src="https://img.shields.io/npm/l/thai-address-universal-autocomplete" alt="License">
    </a>
    <img src="https://img.shields.io/npm/dt/thai-address-universal-autocomplete" alt="NPM Downloads">
</p>

---

## Overview

`thai-address-universal-autocomplete` is a **headless** autocomplete engine
built on top of
[thai-address-universal](https://github.com/ophoomo/thai-address-universal). It
attaches to any `<input>` element and provides Thai address suggestions with
full keyboard navigation and WAI-ARIA accessibility — **without forcing any UI
framework**.

Use it directly with vanilla JavaScript, or integrate it into **React**,
**Vue**, **Angular**, or any other framework.

## Features

- **Framework-agnostic** — works with vanilla JS, React, Vue, Angular, Svelte,
  etc.
- **Headless architecture** — full control over rendering via custom
  `renderItem` / `renderContainer`
- **Accessible** — WAI-ARIA Combobox pattern with live region announcements
- **Keyboard navigation** — ArrowUp / ArrowDown / Enter / Escape
- **Debounced search** — configurable delay to prevent excessive queries
- **Multiple search modes** — search by province, district, sub-district, or
  postal code
- **Lightweight** — zero runtime dependencies (peer dependency on
  `thai-address-universal`)
- **TypeScript** — fully typed API with exported types
- **Tree-shakeable** — ESM / CJS / UMD builds

## Installation

```bash
npm install thai-address-universal-autocomplete thai-address-universal --save
```

> `thai-address-universal` is a **peer dependency** — install it alongside this
> package.

### CDN (Browser)

```html
<script
  src="https://cdn.jsdelivr.net/npm/thai-address-universal/dist/umd/index.js"
></script>
<script
  src="https://cdn.jsdelivr.net/npm/thai-address-universal-autocomplete/dist/index.umd.js"
></script>
```

## Quick Start

```typescript
import {
  createProvinceSource,
  initAutocomplete,
} from "thai-address-universal-autocomplete";

const ac = initAutocomplete(document.getElementById("my-input")!, {
  source: createProvinceSource(),
  onSelect: (item) => {
    console.log(
      item.province,
      item.district,
      item.sub_district,
      item.postal_code,
    );
  },
});

// Clean up when done
ac.destroy();
```

## Adapter Source Functions

Built-in adapters wrap the search functions from `thai-address-universal`:

| Function                            | Search Field | Description                 |
| ----------------------------------- | ------------ | --------------------------- |
| `createProvinceSource(options?)`    | จังหวัด        | Search by province name     |
| `createDistrictSource(options?)`    | อำเภอ / เขต  | Search by district name     |
| `createSubDistrictSource(options?)` | ตำบล / แขวง  | Search by sub-district name |
| `createPostalCodeSource(options?)`  | รหัสไปรษณีย์    | Search by postal code       |

Each adapter accepts an optional `{ maxResults: number }` (default `20`).

```typescript
import {
  createDistrictSource,
  createPostalCodeSource,
  createProvinceSource,
  createSubDistrictSource,
} from "thai-address-universal-autocomplete";

const source = createDistrictSource({ maxResults: 10 });
```

## Options

```typescript
initAutocomplete(inputElement, {
  // Required
  source: SourceFn,            // Data source function (use adapter factories)
  onSelect: OnSelectFn,        // Callback when a suggestion is selected

  // Optional
  renderItem?: RenderItemFn,       // Custom render for each suggestion item
  renderContainer?: RenderContainerFn, // Custom render for the dropdown container
  classNames?: ClassNames,         // CSS class name overrides
  debounceMs?: number,             // Debounce delay in ms (default: 200)
  minLength?: number,              // Min chars before searching (default: 1)
  maxResults?: number,             // Max suggestions shown (default: 20)
});
```

## Instance Methods

`initAutocomplete` returns an `AutocompleteInstance` with the following methods:

| Method                | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `destroy()`           | Remove all event listeners and clean up DOM               |
| `open()`              | Open the suggestions dropdown programmatically            |
| `close()`             | Close the suggestions dropdown                            |
| `search(query)`       | Trigger a search with the given query (bypasses debounce) |
| `getState()`          | Get a read-only snapshot of internal state                |
| `updateOptions(opts)` | Update options after initialization                       |

## CSS Class Names

All class names can be overridden via the `classNames` option:

| Key              | Default                | Description             |
| ---------------- | ---------------------- | ----------------------- |
| `root`           | `tac-root`             | Root wrapper element    |
| `input`          | `tac-input`            | Input element           |
| `dropdown`       | `tac-dropdown`         | Dropdown container      |
| `item`           | `tac-item`             | Suggestion item         |
| `itemActive`     | `tac-item--active`     | Active/highlighted item |
| `dropdownHidden` | `tac-dropdown--hidden` | Hidden dropdown state   |

## Framework Examples

### React

```tsx
import { useEffect, useRef } from "react";
import {
  createProvinceSource,
  initAutocomplete,
} from "thai-address-universal-autocomplete";

function App() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ac = initAutocomplete(inputRef.current!, {
      source: createProvinceSource({ maxResults: 10 }),
      onSelect: (item) => console.log("Selected:", item),
    });
    return () => ac.destroy();
  }, []);

  return <input ref={inputRef} type="text" placeholder="Search province..." />;
}
```

### Vue

```vue
<template>
  <input ref="inputRef" type="text" placeholder="Search province..." />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { initAutocomplete, createProvinceSource } from 'thai-address-universal-autocomplete';

const inputRef = ref(null);
let ac = null;

onMounted(() => {
  ac = initAutocomplete(inputRef.value, {
    source: createProvinceSource({ maxResults: 10 }),
    onSelect: (item) => console.log('Selected:', item),
  });
});

onUnmounted(() => ac?.destroy());
</script>
```

### Angular

```typescript
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import {
  createProvinceSource,
  initAutocomplete,
} from "thai-address-universal-autocomplete";
import type { AutocompleteInstance } from "thai-address-universal-autocomplete";

@Component({
  selector: "app-root",
  standalone: true,
  template: `<input #inputEl type="text" placeholder="Search province..." />`,
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild("inputEl")
  inputRef!: ElementRef<HTMLInputElement>;
  private ac: AutocompleteInstance | null = null;

  ngAfterViewInit() {
    this.ac = initAutocomplete(this.inputRef.nativeElement, {
      source: createProvinceSource({ maxResults: 10 }),
      onSelect: (item) => console.log("Selected:", item),
    });
  }

  ngOnDestroy() {
    this.ac?.destroy();
  }
}
```

### Vanilla HTML

```html
<input type="text" id="province-input" placeholder="Search province..." />

<script type="module">
  import {
    createProvinceSource,
    initAutocomplete,
  } from "thai-address-universal-autocomplete";

  initAutocomplete(document.getElementById("province-input"), {
    source: createProvinceSource({ maxResults: 10 }),
    onSelect: (item) => {
      document.getElementById("province-input").value = item.province;
      console.log(item);
    },
  });
</script>
```

## Custom Rendering

```typescript
initAutocomplete(inputEl, {
  source: createProvinceSource(),
  onSelect: (item) => console.log(item),
  renderItem: (item, isActive) => {
    const li = document.createElement("li");
    li.textContent =
      `${item.sub_district} » ${item.district} » ${item.province} (${item.postal_code})`;
    li.style.padding = "8px 12px";
    li.style.cursor = "pointer";
    if (isActive) li.style.backgroundColor = "#e8f0fe";
    return li;
  },
});
```

## ThaiAddressSuggestion Type

```typescript
interface ThaiAddressSuggestion {
  province: string; // จังหวัด
  district: string; // อำเภอ / เขต
  sub_district: string; // ตำบล / แขวง
  postal_code: string; // รหัสไปรษณีย์
}
```

## 🤝 Contact

📧 For questions or support, please reach out to us at
[me@thanaphoom.dev](mailto:me@thanaphoom.dev).

Thank you for using Thai Address Universal Auto Complete! We hope you find it
useful and look forward to your contributions. 🙌
