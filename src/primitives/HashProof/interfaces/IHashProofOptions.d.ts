import {IHashProofHeaderOptions} from "./IHashProofHeaderOptions.js";
import {IHashProofPayloadOptions} from "./IHashProofPayloadOptions.js";

export interface IHashProofOptions {
    header?: IHashProofHeaderOptions;
    payload?: IHashProofPayloadOptions;
}
