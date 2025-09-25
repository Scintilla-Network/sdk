import { IRelayBlockHeaderOptions } from "./IRelayBlockHeaderOptions.js";
import { IRelayBlockPayloadOptions } from "./IRelayBlockPayloadOptions.js";
import {IRelayBlockSignature} from "./IRelayBlockSignature.js";

export interface IRelayBlockOptions {
    header?: IRelayBlockHeaderOptions;
    payload?: IRelayBlockPayloadOptions;
    signatures?: IRelayBlockSignature[];
}
