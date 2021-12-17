export const plurals = {
    dash: 'dashes',
    leaf: 'leaves',
    oz: 'oz',
    pinch: 'pinches',
    spritz: 'spritzes',
    cup: 'cups',
    g: 'g',
}

export function pluralize(unit: string): string {
    if (!unit) return unit;
    return plurals[unit] || unit + 's';
}

export const fracCodes = {
    '1/2': '&#189;',
    '1/3': '&#8531;',
    '33/100': '&#8531;',
    '2/3': '&#8532;',
    '66/100': '&#8532',
    '1/4': '&#188;',
    '3/4': '&#190;',
    '1/5': '&#8533;',
    '2/5': '&#8534;',
    '3/5': '&#8535;',
    '4/5': '&#8536;',
    '1/6': '&#8537;',
    '5/6': '&#8538;',
};
