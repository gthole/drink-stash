import { Pipe, PipeTransform } from '@angular/core';
import { fracCodes } from '../constants';
import * as n2f from 'num2fraction';


@Pipe({name: 'fractions'})
export class FractionPipe implements PipeTransform {
    transform(amount: number): string {
        const whole = Math.floor(amount);
        const part = amount - whole;
        if (part > 0.01) {
            let prefix = '';
            if (whole > 0) {
                prefix = whole + ' ';
            }
            const frac = n2f(part);
            if (fracCodes[frac]) {
                return `${prefix}<span class="-ml-1 text-2xl">${fracCodes[frac]}</span>`;
            }
            const [num, denom] = n2f(part).split('/');
            return `${prefix}<sup>${num}</sup>/<sub>${denom}</sub>`;
        }
        return '' + amount;
    }
}

