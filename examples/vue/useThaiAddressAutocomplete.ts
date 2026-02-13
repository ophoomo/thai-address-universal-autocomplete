/**
 * Vue 3 Composable for the headless thai-address-autocomplete engine.
 *
 * This composable provides a more "Vue-native" integration, returning
 * reactive state that can be used in templates directly.
 *
 * Usage:
 * ```vue
 * <script setup>
 * import { useThaiAddressAutocomplete } from './useThaiAddressAutocomplete';
 * import { createProvinceSource } from 'thai-address-autocomplete';
 *
 * const { inputRef, state, close } = useThaiAddressAutocomplete({
 *   source: createProvinceSource(),
 *   onSelect: (item) => console.log('Selected:', item),
 * });
 * </script>
 *
 * <template>
 *   <input ref="inputRef" type="text" />
 *   <p v-if="state.isOpen">{{ state.suggestions.length }} suggestions</p>
 * </template>
 * ```
 */

import { ref, onMounted, onUnmounted, reactive, type Ref } from 'vue';

// In production, import from 'thai-address-autocomplete'
import { initAutocomplete } from '../../src/core';
import type { AutocompleteOptions, AutocompleteInstance, AutocompleteState } from '../../src/types';

interface UseThaiAddressAutocompleteReturn {
  /** Bind this ref to your <input> element. */
  inputRef: Ref<HTMLInputElement | null>;
  /** Reactive autocomplete state. */
  state: AutocompleteState;
  /** Close the dropdown programmatically. */
  close: () => void;
  /** Open the dropdown programmatically. */
  open: () => void;
  /** Trigger a search programmatically. */
  search: (query: string) => Promise<void>;
}

/**
 * Vue 3 composable that wraps the headless autocomplete engine.
 * Returns a template ref and reactive state.
 */
export function useThaiAddressAutocomplete(
  options: AutocompleteOptions,
): UseThaiAddressAutocompleteReturn {
  const inputRef = ref<HTMLInputElement | null>(null);
  let instance: AutocompleteInstance | null = null;

  const state = reactive<AutocompleteState>({
    isOpen: false,
    suggestions: [],
    activeIndex: -1,
    query: '',
  });

  // Sync internal state with the reactive state object
  const wrappedOnSelect: AutocompleteOptions['onSelect'] = (item) => {
    options.onSelect(item);
    syncState();
  };

  function syncState() {
    if (!instance) return;
    const s = instance.getState();
    state.isOpen = s.isOpen;
    state.suggestions = s.suggestions;
    state.activeIndex = s.activeIndex;
    state.query = s.query;
  }

  onMounted(() => {
    if (!inputRef.value) return;

    instance = initAutocomplete(inputRef.value, {
      ...options,
      onSelect: wrappedOnSelect,
    });
  });

  onUnmounted(() => {
    instance?.destroy();
    instance = null;
  });

  return {
    inputRef,
    state,
    close: () => {
      instance?.close();
      syncState();
    },
    open: () => {
      instance?.open();
      syncState();
    },
    search: async (query: string) => {
      await instance?.search(query);
      syncState();
    },
  };
}
