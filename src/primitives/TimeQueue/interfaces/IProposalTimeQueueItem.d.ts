// Specific interface for a proposal item
import {ITimeQueueItem} from "./ITimeQueueItem.js";

export interface IProposalTimeQueueItem extends ITimeQueueItem {
    payload: {
        startDate: Date;
        endDate: number;
    };
}
