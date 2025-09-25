class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue(item = null) {
        if (this.isEmpty()) {
            return null;
        }

        if(item) {
            // We can use the filter method to remove the item from the array
            this.items = this.items.filter((i) => i !== item);
            return item;
        } else {
            return this.items.shift() || null; // Ensures null is returned if shift() returns undefined
        }
    }

    toArray() {
        return this.items;
    }

    peek() {
        return this.items.length > 0 ? this.items[0] : null;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    clear() {
        this.items = [];
    }
}

export default Queue;

