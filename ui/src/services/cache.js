export class CacheService {
    set(name, value) {
        sessionStorage.setItem(name, JSON.stringify(value));
    }

    get(name) {
        const item = sessionStorage.getItem(name);
        if (!item) return;
        return JSON.parse(item);
    }

    remove(name) {
        sessionStorage.clearItem(name);
    }

    clear() {
        sessionStorage.clear();
    }
}
