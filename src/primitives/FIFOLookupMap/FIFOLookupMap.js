class FIFOLookupMap {
    /**
     * Create FIFOLookupMap
     * @param {number} maxSize - The maximum size of the map
     * @param {string} primaryKey - The primary key
     * @param {Object[]} data - The data
     * @returns {FIFOLookupMap} The FIFOLookupMap instance
     */
    constructor(maxSize, primaryKey = "key", data = []) {
        this.maxSize = maxSize;
        this.primaryKey = primaryKey;
        this.map = new Map();
        this.order = [];

        data.forEach((dataItem) => {
            this.add(dataItem);
        });
    }

    /**
     * Create FIFOLookupMap from JSON
     * @param {Object} json - The JSON object
     * @returns {FIFOLookupMap} The FIFOLookupMap instance
     */
    static fromJSON(json) {
        return new FIFOLookupMap(json.maxSize, json.primaryKey, json.data);
    }

    /**
     * Convert to JSON
     * @returns {Object} The JSON object
     */
    toJSON() {
        return {
            maxSize: this.maxSize,
            primaryKey: this.primaryKey,
            data: Array.from(this.map.values())
        };
    }

    /**
     * Get a value by primary key
     * @param {string} primaryKeyValue - The primary key value
     * @returns {Object} The value
     */
    get(primaryKeyValue) {
        return this.map.get(primaryKeyValue);
    }

    /**
     * Add a value to the map
     * @param {Object} data - The data
     * @returns {void}
     */
    add(data) {
        const primaryKeyValue = this.getNestedProperty(data, this.primaryKey);
        if (primaryKeyValue === undefined) {
            throw new Error(`Data must include the primary key: ${this.primaryKey}`);
        }

        const stringKey = String(primaryKeyValue);

        if (this.map.has(stringKey)) {
            return;
        }

        this.map.set(stringKey, data);
        this.order.push(stringKey);

        if (this.order.length > this.maxSize) {
            const oldestKey = this.order.shift();
            this.map.delete(oldestKey);
        }
    }

    /**
     * Get the last value by property name and value
     * @param {string} propertyName - The property name
     * @param {any} value - The value
     * @returns {Object} The last value
     */
    getLast(propertyName, value = undefined) {
        for (let i = this.order.length - 1; i >= 0; i--) {
            const key = this.order[i];
            const item = this.map.get(key);
            if (!item) continue;

            const propertyValue = this.getNestedProperty(item, propertyName);

            if (propertyValue !== undefined && (value === undefined || propertyValue === value)) {
                return item;
            }
        }
        return null;
    }

    /**
     * Remove a value by primary key
     * @param {string} primaryKeyValue - The primary key value
     * @returns {void}
     */
    remove(primaryKeyValue) {
        const stringKey = String(primaryKeyValue);
        this.map.delete(stringKey);
        const index = this.order.indexOf(stringKey);
        if (index > -1) {
            this.order.splice(index, 1);
        }
    }

    /**
     * Get a nested property
     * @param {Object} obj - The object
     * @param {string} path - The path
     * @returns {any} The nested property
     */
    getNestedProperty(obj, path) {
        const result = path.split('.').reduce((acc, part) => {
            return acc && typeof acc === 'object' ? acc[part] : undefined;
        }, obj);
        return result;
    }
}

export default FIFOLookupMap;

