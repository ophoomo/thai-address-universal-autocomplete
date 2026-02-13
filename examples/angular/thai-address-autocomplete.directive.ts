/**
 * Angular Directive for thai-address-autocomplete.
 *
 * A lightweight directive that attaches the headless autocomplete engine
 * directly to any `<input>` element. This is the most flexible approach —
 * it lets you use any input element in your template without wrapping it
 * in a custom component.
 *
 * Usage:
 * ```html
 * <input
 *   type="text"
 *   thaiAddressAutocomplete
 *   [source]="provinceSource"
 *   [renderItem]="customRenderItem"
 *   [debounceMs]="150"
 *   [maxResults]="10"
 *   (addressSelect)="onSelect($event)"
 *   placeholder="พิมพ์ชื่อจังหวัด..."
 * />
 * ```
 *
 * To use this directive:
 * 1. Install: npm install thai-address-autocomplete thai-address-universal
 * 2. Copy this file into your Angular project
 * 3. Import the directive in your standalone component or NgModule
 */

import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
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

@Directive({
  selector: 'input[thaiAddressAutocomplete]',
  standalone: true,
})
export class ThaiAddressAutocompleteDirective implements OnInit, OnChanges, OnDestroy {
  /** Data source function (use adapter factories). */
  @Input({ required: true }) source!: SourceFn;

  /** Custom item renderer. */
  @Input() renderItem?: RenderItemFn;

  /** Custom container renderer. */
  @Input() renderContainer?: RenderContainerFn;

  /** CSS class name overrides. */
  @Input() classNames?: ClassNames;

  /** Debounce delay in ms. @default 200 */
  @Input() debounceMs = 200;

  /** Minimum query length to trigger search. @default 1 */
  @Input() minLength = 1;

  /** Max number of suggestions. @default 20 */
  @Input() maxResults = 20;

  /** Emitted when a suggestion is selected. */
  @Output() addressSelect = new EventEmitter<ThaiAddressSuggestion>();

  private instance: AutocompleteInstance | null = null;

  constructor(private readonly el: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    this.createInstance();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If the instance exists and a relevant input changed, update options
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
    this.instance = initAutocomplete(this.el.nativeElement, {
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
