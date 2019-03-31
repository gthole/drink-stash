/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
    id: string;
}

interface Alert {
    header: string;
    message: string;
}

interface QueryParams {
    [k: string]: string | number | string[];
}

interface ServiceResponse<K> {
    fetched: string;
    count: number;
    results: K[];
}
