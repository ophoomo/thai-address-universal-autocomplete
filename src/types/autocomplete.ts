/**
 * @module types/autocomplete
 * Core type definitions for the headless autocomplete library.
 *
 * These types define the contract between the library's core engine,
 * adapters, and consumer code. They are framework-agnostic by design.
 */

/**
 * Represents a Thai address suggestion returned from the data source.
 *
 * Maps directly to the `IExpanded` type from `thai-address-universal`,
 * but defined independently to avoid coupling consumers to the upstream type.
 */
export interface ThaiAddressSuggestion {
  /** Province name (จังหวัด), e.g. "กรุงเทพมหานคร" */
  province: string;
  /** District name (เขต/อำเภอ), e.g. "คลองสาน" */
  district: string;
  /** Sub-district name (แขวง/ตำบล), e.g. "คลองต้นไทร" */
  sub_district: string;
  /** Postal code (รหัสไปรษณีย์), e.g. "10600" */
  postal_code: string;
}

/** The searchable fields of a Thai address. */
export type AddressField = keyof ThaiAddressSuggestion;

/**
 * A function that fetches suggestions for a given query string.
 * Must return a Promise resolving to an array of suggestions.
 */
export type SourceFn = (query: string) => Promise<ThaiAddressSuggestion[]>;

/**
 * Custom render function for a single suggestion item.
 * @param item - The suggestion data to render.
 * @param isActive - Whether this item is currently highlighted via keyboard navigation.
 * @returns An HTMLElement representing the suggestion item.
 */
export type RenderItemFn = (item: ThaiAddressSuggestion, isActive: boolean) => HTMLElement;

/**
 * Custom render function for the suggestions dropdown container.
 * @param children - Array of rendered item elements to be placed inside the container.
 * @returns An HTMLElement wrapping all the suggestion items.
 */
export type RenderContainerFn = (children: HTMLElement[]) => HTMLElement;

/**
 * Callback invoked when a user selects a suggestion.
 * @param item - The selected suggestion.
 */
export type OnSelectFn = (item: ThaiAddressSuggestion) => void;

/**
 * CSS class names used by the autocomplete widget.
 * All keys are optional — the library provides sensible defaults.
 */
export interface ClassNames {
  /** Root wrapper element. Default: "tac-root" */
  root?: string;
  /** Input element class. Default: "tac-input" */
  input?: string;
  /** Suggestions dropdown container. Default: "tac-dropdown" */
  dropdown?: string;
  /** Individual suggestion item. Default: "tac-item" */
  item?: string;
  /** Currently active/highlighted item. Default: "tac-item--active" */
  itemActive?: string;
  /** Hidden state for the dropdown. Default: "tac-dropdown--hidden" */
  dropdownHidden?: string;
}

/**
 * Configuration options for initializing the autocomplete widget.
 */
export interface AutocompleteOptions {
  /**
   * Data source function that returns matching suggestions for a query.
   * Typically wraps one of the adapter search functions.
   */
  source: SourceFn;

  /**
   * Callback fired when a user selects a suggestion (via click or Enter key).
   */
  onSelect: OnSelectFn;

  /**
   * Custom render function for individual suggestion items.
   * If omitted, a default renderer is used that displays all address fields.
   */
  renderItem?: RenderItemFn;

  /**
   * Custom render function for the suggestions container.
   * If omitted, a default `<ul>` container is used.
   */
  renderContainer?: RenderContainerFn;

  /**
   * CSS class name overrides for all widget elements.
   */
  classNames?: ClassNames;

  /**
   * Debounce delay in milliseconds for input events.
   * Prevents excessive API calls while the user is typing.
   * @default 200
   */
  debounceMs?: number;

  /**
   * Minimum number of characters required before triggering a search.
   * @default 1
   */
  minLength?: number;

  /**
   * Maximum number of suggestions to display.
   * @default 20
   */
  maxResults?: number;
}

/**
 * Internal state of the autocomplete engine.
 * Exposed for testing and advanced integrations.
 */
export interface AutocompleteState {
  /** Whether the suggestions dropdown is currently visible. */
  isOpen: boolean;
  /** Current list of suggestions. */
  suggestions: ThaiAddressSuggestion[];
  /** Index of the currently highlighted suggestion (-1 = none). */
  activeIndex: number;
  /** Current value of the input field. */
  query: string;
}

/**
 * The public API returned by `initAutocomplete`.
 * Provides methods to programmatically control or tear down the widget.
 */
export interface AutocompleteInstance {
  /** Remove all event listeners and DOM elements created by the widget. */
  destroy: () => void;
  /** Open the suggestions dropdown programmatically. */
  open: () => void;
  /** Close the suggestions dropdown. */
  close: () => void;
  /** Trigger a search with the given query. */
  search: (query: string) => Promise<void>;
  /** Get the current internal state (read-only snapshot). */
  getState: () => Readonly<AutocompleteState>;
  /** Update options after initialization. */
  updateOptions: (options: Partial<AutocompleteOptions>) => void;
}

/**
 * Options for configuring an adapter search function.
 */
export interface AdapterOptions {
  /** Maximum number of results to return. @default 20 */
  maxResults?: number;
}

/** A search function returned by an adapter factory. */
export type AdapterSearchFn = (query: string) => Promise<ThaiAddressSuggestion[]>;

/** Keyboard actions handled by the autocomplete. */
export type KeyboardAction = 'next' | 'prev' | 'select' | 'close';
