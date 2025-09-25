import {IClusterBlockHeaderOptions} from "./IClusterBlockHeaderOptions.js";
import {IClusterBlockPayloadOptions} from "./IClusterBlockPayloadOptions.js";
import {IClusterBlockAuthorization} from "./IClusterBlockAuthorization.js";

export interface IClusterBlockOptions {
    header?: IClusterBlockHeaderOptions;
    payload?: IClusterBlockPayloadOptions;
    authorizations?: IClusterBlockAuthorization[];
}
