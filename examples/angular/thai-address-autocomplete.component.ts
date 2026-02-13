/**
 * Angular Standalone Component for thai-address-autocomplete.
 *
 * A self-contained component that wraps the headless autocomplete engine.
 * Use this when you prefer a component-based approach over the directive.
 *
 * Usage:
 * ```html
 * <thai-address-autocomplete
 *   [source]="provinceSource"
 *   [renderItem]="customRenderItem"
 *   [debounceMs]="150"
 *   [maxResults]="10"
 *   placeholder="พิมพ์ชื่อจังหวัด..."
 *   (addressSelect)="onSelect($event)"
 * />
 * ```
 *
 * To use this component:
 * 1. Install: npm install thai-address-autocomplete thai-address-universal
 * 2. Copy this file into your Angular project
 * 3. Import the component in your standalone component or NgModule
 */

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

// In production, import from 'thai-address-autocomplete'
import { initAutocomplete } from '../../src/core';
import type {
  AutocompleteInstance,
  ClassNames,
  RenderContainerFn,
  RenderItemFn,
  SourceFn,
  ThaiAddressSuggestion,
} from '../../src/types';

@Component({
  selector: 'thai-address-autocomplete',
  standalone: true,
  template: `
    <input
      #inputEl
      type="text"
      [placeholder]="placeholder"
      [attr.aria-label]="ariaLabel"
      [class]="inputClass"
    />
  `,
})
export class ThaiAddressAutocompleteComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** Data source function (use adapter factories). */
  @Input({ required: true }) source!: SourceFn;

  /** Custom item renderer. */
  @Input() renderItem?: RenderItemFn;

  /** Custom container renderer. */
  @Input() renderContainer?: RenderContainerFn;

  /** CSS class name overrides. */
  @Input() classNames?: ClassNames;

  /** Input placeholder text. */
  @Input() placeholder = 'Search Thai address...';

  /** Input aria-label for accessibility. */
  @Input() ariaLabel = 'Search Thai address';

  /** Debounce delay in ms. @default 200 */
  @Input() debounceMs = 200;

  /** Minimum query length to trigger search. @default 1 */
  @Input() minLength = 1;

  /** Max number of suggestions. @default 20 */
  @Input() maxResults = 20;

  /** Additional CSS class for the input element. */
  @Input() inputClass = '';

  /** Emitted when a suggestion is selected. */
  @Output() addressSelect = new EventEmitter<ThaiAddressSuggestion>();

  @ViewChild('inputEl', { static: true })
  private inputRef!: ElementRef<HTMLInputElement>;

  private instance: AutocompleteInstance | null = null;

  ngAfterViewInit(): void {
    this.createInstance();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.instance) return;

    const relevantKeys: (keyof this)[] = [
      'source',
      'renderItem',
      'renderContainer',
      'classNames',
      'debounceMs',
      'minLength',
      'maxResults',
    ];

    const hasRelevantChange = relevantKeys.some((key) => key in changes);
    if (hasRelevantChange) {
      this.instance.updateOptions({
        source: this.source,
        renderItem: this.renderItem,
        renderContainer: this.renderContainer,
        classNames: this.classNames,
        debounceMs: this.debounceMs,
        minLength: this.minLength,
        maxResults: this.maxResults,
      });
    }
  }

  ngOnDestroy(): void {
    this.instance?.destroy();
    this.instance = null;
  }

  /** Provides access to the underlying autocomplete instance. */
  getInstance(): AutocompleteInstance | null {
    return this.instance;
  }

  private createInstance(): void {
    this.instance = initAutocomplete(this.inputRef.nativeElement, {
      source: this.source,
      onSelect: (item) => this.addressSelect.emit(item),
      renderItem: this.renderItem,
      renderContainer: this.renderContainer,
      classNames: this.classNames,
      debounceMs: this.debounceMs,
      minLength: this.minLength,
      maxResults: this.maxResults,
    });
  }
}
