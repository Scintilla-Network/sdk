export default class TimeQueue {
    /**
     * Create a new TimeQueue
     */
    constructor() {
        this.queue = new Map();
    }

    /**
     * Create a new TimeQueue from a JSON object
     * @param {string} json - The JSON object
     * @returns {TimeQueue} The TimeQueue instance
     */
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

    
    /**
     * Enqueue an item at a given timestamp
     * @param {number} timestamp - The timestamp
     * @param {any} item - The item to enqueue
     */
    enqueue(timestamp, item) {
        if (!this.queue.has(timestamp)) {
            this.queue.set(timestamp, []);
        }
        this.queue.get(timestamp)?.push(item);
    }

    /**
     * Dequeue items up to a given timestamp
     * @param {number} upToTimestamp - The timestamp up to which to dequeue
     * @returns {any[]} The dequeued items
     */
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

    /**
     * Peek at the next timestamp
     * @returns {number | null} The next timestamp
     */
    peekNextTimestamp() {
        if (this.queue.size === 0) {
            return null;
        }
        const nextTimestamp = Math.min(...this.queue.keys());
        return nextTimestamp;
    }

    /**
     * Check if the queue is empty
     * @returns {boolean} True if the queue is empty, false otherwise
     */
    isEmpty() {
        return this.queue.size === 0;
    }

    /**
     * Convert the queue to a JSON object
     * @returns {string} The JSON object
     */
    toJSON() {
        return JSON.stringify([...this.queue]);
    }
}

