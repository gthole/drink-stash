import { Pipe, PipeTransform } from '@angular/core';

const plurals = {
    dash: 'dashes',
    leaf: 'leaves',
    oz: 'oz',
    pinch: 'pinches',
    spritz: 'spritzes',
}

function pluralize(unit: string): string {
    if (!unit) return unit;
    return plurals[unit] || unit + 's';
}


// TODO: Standardize conversions and extend them to other UOM
@Pipe({name: 'multiplierAmount'})
export class MultiplierAmountPipe implements PipeTransform {
    transform(amount: number, multiplier: number, unit: string): number {
        const value = amount * multiplier;
        if (unit === 'oz' && value > 4) {
            return value / 4;
        }
        return value;
    }
}


@Pipe({name: 'multiplierUnit'})
export class MultiplierUnitPipe implements PipeTransform {
    transform(unit: string, multiplier: number, amount: number): string {
        const value = amount * multiplier;
        let res = unit;
        if (unit === 'oz' && value > 4) {
            res = 'cup';
        }
        // Pluralize
        if (value > 1) {
            res = pluralize(res);
        }
        return res;
    }
}
