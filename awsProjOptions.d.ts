export interface IProjOptions {
    proj: string;
    stage: string;
    fullDurationSession?: boolean;
}
export interface IRegionalProjOptions extends IProjOptions {
    region: string;
}
