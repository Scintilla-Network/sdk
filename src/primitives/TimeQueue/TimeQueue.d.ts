import { ITimeQueueItem } from "./interfaces/ITimeQueueItem.js";

export default class TimeQueue {
    private queue: Map<number, ITimeQueueItem[]>;

    constructor();

    static fromJSON(json: string): TimeQueue;
    enqueue(timestamp: number, item: ITimeQueueItem): void;
    dequeue(upToTimestamp: number): ITimeQueueItem[];
    peekNextTimestamp(): number | null;
    isEmpty(): boolean;
    toJSON(): string;
}

