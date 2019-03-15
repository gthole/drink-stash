/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
    id: string;
}

interface Alert {
    header: string;
    message: string;
}

interface ServiceResponse<K> {
    fetched: string;
    count: number;
    results: K[];
}
