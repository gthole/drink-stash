/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
    id: string;
}

interface Alert {
    header: string;
    message: string;
}
