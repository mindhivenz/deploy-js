export interface IControlSecret {
    customer: string;
    site: string;
    host: string;
    key: string;
    cipher: string;
    file: string;
}
export interface IControlSecretFilters {
    customer?: string;
    site?: string;
    host?: string;
    key?: string;
    file?: string;
}
export declare const FILTER_NAMES: (keyof IControlSecretFilters)[];
export declare const scopeName: ({ customer, site, host }: IControlSecret) => string;
export declare const controlRepoDir: (cwd?: string) => Promise<string>;
export declare const controlSecrets: (controlDir?: string) => Promise<IControlSecret[]>;
export declare const describeFilters: (filters: IControlSecretFilters) => string;
export declare const findControlSecrets: (filters: IControlSecretFilters, controlDir?: string) => Promise<IControlSecret[]>;
