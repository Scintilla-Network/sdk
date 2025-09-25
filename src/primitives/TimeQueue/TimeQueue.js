export default class TimeQueue {
    constructor() {
        this.queue = new Map();
    }

    static fromJSON(json) {
        const queue = new TimeQueue();
        const entries = JSON.parse(json);
        for (const [timestamp, items] of entries) {
            for (const item of items) {
                queue.enqueue(timestamp, item);
            }
        }
        return queue;
    }

    enqueue(timestamp, item) {
        if (!this.queue.has(timestamp)) {
            this.queue.set(timestamp, []);
        }
        this.queue.get(timestamp)?.push(item);
    }

    dequeue(upToTimestamp) {
        const keysToRemove = [...this.queue.keys()].filter(key => key <= upToTimestamp);
        const dequeuedItems = [];

        for (const key of keysToRemove) {
            const items = this.queue.get(key) || [];
            dequeuedItems.push(...items);
            this.queue.delete(key);
        }

        return dequeuedItems;
    }

    peekNextTimestamp() {
        if (this.queue.size === 0) {
            return null;
        }
        const nextTimestamp = Math.min(...this.queue.keys());
        return nextTimestamp;
    }

    isEmpty() {
        return this.queue.size === 0;
    }

    toJSON() {
        return JSON.stringify([...this.queue]);
    }
}

