export declare const allStages = "all";
interface ISecretContext {
    proj: string;
    stage?: string;
}
export interface ISecretRef extends ISecretContext {
    name: string;
}
export declare const getSecretText: (ref: ISecretRef) => Promise<string>;
export declare const getSecretJson: (ref: ISecretRef) => Promise<any>;
export declare const setSecretText: (ref: ISecretRef, secret: string) => Promise<void>;
export declare const setSecretJson: (ref: ISecretRef, secretObj: object) => Promise<void>;
interface ReadStdInOrPromptTextOpts {
    prompt: string;
}
export declare const readStdInOrPromptText: ({ prompt: message, }: ReadStdInOrPromptTextOpts) => Promise<string>;
export declare const readStdInSecretText: () => Promise<string>;
export declare const readStdInSecretJson: () => Promise<any>;
export {};
