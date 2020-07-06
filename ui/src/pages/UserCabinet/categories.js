// These are copied directly from the API
export const categories = {
    1: 'Uncategorized',
    2: 'Bitters',
    3: 'Syrup',
    4: 'Juice',
    5: 'Kitchen Staples',
    6: 'Gin',
    7: 'Rum',
    8: 'Tequila',
    9: 'Brandy',
    10: 'Whisk(e)y',
    11: 'Sherry & Port',
    12: 'Vermouth',
    13: 'Beer & Wine',
    14: 'Amaro & Apertivos',
    15: 'Liqueur & Cordials',
    16: 'Other Spirits',
};

export const categoryIds = Object.keys(categories).reduce((r, id) => {
    r[categories[id]] = id;
    return r;
}, {});
