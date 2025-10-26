class Queue {
    /**
     * Create Queue
     */
    constructor() {
        this.items = [];
    }

    /**
     * Enqueue an item
     * @param {any} item - The item to enqueue
     */
    enqueue(item) {
        this.items.push(item);
    }

    /**
     * Dequeue an item
     * @param {any} item - The item to dequeue
     * @returns {any} The dequeued item
     */
    dequeue(item = null) {
        if (this.isEmpty()) {
            return null;
        }

        if(item) {
            this.items = this.items.filter((i) => i !== item);
            return item;
        } else {
            return this.items.shift() || null;
        }
    }

    /**
     * Convert the queue to an array
     * @returns {any[]} The array
     */
    toArray() {
        return this.items;
    }

    /**
     * Peek at the next item
     * @returns {any} The next item
     */
    peek() {
        return this.items.length > 0 ? this.items[0] : null;
    }

    /**
     * Check if the queue is empty
     * @returns {boolean} True if the queue is empty
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Get the size of the queue
     * @returns {number} The size of the queue
     */
    size() {
        return this.items.length;
    }

    /**
     * Clear the queue
     */
    clear() {
        this.items = [];
    }
}

export default Queue;

