import { parse, stringify } from 'querystring';

export function parseSearch(input) {
    const params = input.startsWith('?') ? input.slice(1) : input;
    const parsed = parse(params);

    // Coerce search into an array
    if (!parsed.search) {
        parsed.search = [];
    } else if (!Array.isArray(parsed.search)) {
        parsed.search = [parsed.search];
    }

    parsed.page = parseInt(parsed.page) || 1;

    const slug = parsed.show || null;
    Reflect.deleteProperty(parsed, 'show');
    Reflect.deleteProperty(parsed, '');

    return [slug, parsed];
}

export function stringifySearch(params, slug) {
    const full = Object.assign({show: slug}, params);

    if (full.page === 1) {
        Reflect.deleteProperty(full, 'page');
    }
    if (!slug) {
        Reflect.deleteProperty(full, 'show');
    }

    return stringify(full).replace(/(^&)|(&$)/g, '');
}

export function cleanParams(params) {
    const qp = {...params, per_page: 50};
    qp.search = qp.search.map(s => s.split('[')[0]);
    return qp;
}
