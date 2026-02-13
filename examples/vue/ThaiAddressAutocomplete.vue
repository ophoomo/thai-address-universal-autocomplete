<!--
  Vue 3 integration example for thai-address-autocomplete.

  This component wraps the headless autocomplete engine in a Vue component
  using the Composition API.

  Usage:
  ```vue
  <template>
    <ThaiAddressAutocomplete
      :source="provinceSource"
      @select="onSelect"
      placeholder="Search province..."
    />
  </template>

  <script setup>
  import { createProvinceSource } from 'thai-address-autocomplete';
  import ThaiAddressAutocomplete from './ThaiAddressAutocomplete.vue';

  const provinceSource = createProvinceSource({ maxResults: 10 });
  const onSelect = (item) => console.log('Selected:', item);
  </script>
  ```
-->

<template>
  <input
    ref="inputRef"
    type="text"
    :placeholder="placeholder"
    :aria-label="ariaLabel"
    :class="inputClass"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

// In production, import from 'thai-address-autocomplete'
import { initAutocomplete } from '../../src/core';
import type {
  SourceFn,
  RenderItemFn,
  RenderContainerFn,
  ClassNames,
  AutocompleteInstance,
  ThaiAddressSuggestion,
} from '../../src/types';

/**
 * Component props matching the headless autocomplete options.
 */
const props = withDefaults(
  defineProps<{
    source: SourceFn;
    renderItem?: RenderItemFn;
    renderContainer?: RenderContainerFn;
    classNames?: ClassNames;
    placeholder?: string;
    ariaLabel?: string;
    debounceMs?: number;
    minLength?: number;
    maxResults?: number;
    inputClass?: string;
  }>(),
  {
    placeholder: 'Search Thai address...',
    ariaLabel: 'Search Thai address',
    debounceMs: 200,
    minLength: 1,
    maxResults: 20,
  },
);

/**
 * Emitted when a suggestion is selected.
 */
const emit = defineEmits<{
  select: [item: ThaiAddressSuggestion];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
let instance: AutocompleteInstance | null = null;

/**
 * Initialize the autocomplete engine when the component mounts.
 */
onMounted(() => {
  if (!inputRef.value) return;

  instance = initAutocomplete(inputRef.value, {
    source: props.source,
    onSelect: (item) => emit('select', item),
    renderItem: props.renderItem,
    renderContainer: props.renderContainer,
    classNames: props.classNames,
    debounceMs: props.debounceMs,
    minLength: props.minLength,
    maxResults: props.maxResults,
  });
});

/**
 * Update options when props change.
 */
watch(
  () => [props.source, props.renderItem, props.renderContainer, props.classNames],
  () => {
    instance?.updateOptions({
      source: props.source,
      renderItem: props.renderItem,
      renderContainer: props.renderContainer,
      classNames: props.classNames,
    });
  },
);

/**
 * Clean up the autocomplete instance when the component unmounts.
 */
onUnmounted(() => {
  instance?.destroy();
  instance = null;
});

/**
 * Expose the autocomplete instance for parent component access.
 */
defineExpose({
  getInstance: () => instance,
});
</script>
