export class CacheService {
    set(name: string, value: any): void {
        sessionStorage.setItem(name, JSON.stringify(value));
    }

    get(name: string): any {
        const item = sessionStorage.getItem(name);
        if (!item) return;
        return JSON.parse(item);
    }

    remove(name: string): void {
        sessionStorage.clearItem(name);
    }

    clear(): void {
        sessionStorage.clear();
    }
}
