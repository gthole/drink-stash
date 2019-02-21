import _ from 'lodash';
import * as diacritics from 'diacritics';
import { Component, OnInit, Input, forwardRef, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";


const COMPLETER_CONTROL_VALUE_ACCESSOR = {
    multi: true,
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutoCompleteComponent),
};

@Component({
    selector: 'autocomplete',
    template: `
    <div class="autocomplete">
        <input
            [(ngModel)]="value"
            (keydown)="onKeydown($event)"
            (input)="onInput($event)"
            (blur)="onBlur($event)"
            class="{{ inputClass }}"
            placeholder="{{ placeholder }}"
        />
        <div *ngIf="suggestions.length" class="autocomplete-items">
            <div
                *ngFor="let s of suggestions; let i = index"
                [ngClass]="{'autocomplete-active': i === selectedItem}"
                (click)="select(i)">
                {{ s }}
            </div>
        </div>
    </div>
    `,
    styles: [`
    .autocomplete {
        /*the container must be positioned relative:*/
        position: relative;
        display: inline-block;
        width: 100%;
    }
    .autocomplete-items {
        position: absolute;
        border: 1px solid #d4d4d4;
        border-bottom: none;
        border-top: none;
        z-index: 99;
        /*position the autocomplete items to be the same width as the container:*/
        top: 100%;
        left: 0;
        right: 0;
    }
    .autocomplete-items div {
          padding: 10px;
          cursor: pointer;
          background-color: #fff;
          border-bottom: 1px solid #d4d4d4;
    }
    .autocomplete-items div:hover {
          /*when hovering an item:*/
          background-color: #e9e9e9;
    }
    .autocomplete-active {
          /*when navigating through the items using the arrow keys:*/
          background-color: #4DC0B5 !important;
          color: #ffffff;
    }
    `],
    providers: [COMPLETER_CONTROL_VALUE_ACCESSOR]
})
export class AutoCompleteComponent implements OnInit, ControlValueAccessor{
    @Input() dataSource: string[];
    @Input() inputClass: string = '';
    @Input() placeholder: string = '';
    @Input() disableInput = false;
    @Input() clearOnSelect = false;
    @Input() displayCount = 5;

    @Output() selected = new EventEmitter<string>();

    _value: string = '';
    cleanData: {[k: string]: string} = {};
    suggestions: string[] = [];
    selectedItem: number = 0;

    private _onTouchedCallback: () => void = () => {};
    private _onChangeCallback: (_: any) => void = () => {};

    public get value(): string {
        return this._value;
    }

    public set value(v: string) {
        this._value = v;
        this._onChangeCallback(v);
    }

    ngOnInit(): void {
        this.dataSource.forEach((s) => {
            const key = this.clean(s);
            this.cleanData[key] = s;
        });
    }

    clean(s: string): string {
        return diacritics.remove(s.trim()).toLowerCase();
    }

    onInput(e) {
        if (this._value.length < 2) {
            this.suggestions = [];
            return;
        }
        const search = this.clean(this._value);
        this.suggestions = [];
        for (let s of Object.keys(this.cleanData)) {
            if (s.includes(search)) {
                this.suggestions.push(this.cleanData[s]);
                if (this.suggestions.length >= this.displayCount) {
                    break;
                }
            }
        }
    }

    select(i) {
        this.value = this.suggestions[i] || '';
        this.selectedItem = 0;
        this.suggestions = [];
        this.selected.emit(this.value);
        if (this.clearOnSelect) {
            this.value = '';
        }
    }

    onBlur(e: any) {
        this.selectedItem = 0;
        this.suggestions = [];
    }

    onKeydown(e) {
        switch (e.keyCode) {
            case 40:
                this.selectedItem += 1;
                break;
            case 38:
                this.selectedItem -= 1;
                break;
            case 13:
                e.preventDefault();
                this.select(this.selectedItem);
                break;
        }
    }

    public onTouched() {
        this._onTouchedCallback();
    }

    public writeValue(v: any) {
        this.value = v;
    }

    public registerOnChange(fn: any) {
        this._onChangeCallback = fn;
    }

    public registerOnTouched(fn: any) {
        this._onTouchedCallback = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disableInput = isDisabled;
    }
}
