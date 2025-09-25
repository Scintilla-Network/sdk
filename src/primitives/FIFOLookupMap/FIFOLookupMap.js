class FIFOLookupMap {
    constructor(maxSize, primaryKey = "key", data = []) {
        this.maxSize = maxSize;
        this.primaryKey = primaryKey;
        this.map = new Map();
        this.order = [];

        data.forEach((dataItem) => {
            this.add(dataItem);
        });
    }

    static fromJSON(json) {
        return new FIFOLookupMap(json.maxSize, json.primaryKey, json.data);
    }

    toJSON() {
        return {
            maxSize: this.maxSize,
            primaryKey: this.primaryKey,
            data: Array.from(this.map.values())
        };
    }

    get(primaryKeyValue) {
        return this.map.get(primaryKeyValue);
    }

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

    remove(primaryKeyValue) {
        const stringKey = String(primaryKeyValue);
        this.map.delete(stringKey);
        const index = this.order.indexOf(stringKey);
        if (index > -1) {
            this.order.splice(index, 1);
        }
    }

    getNestedProperty(obj, path) {
        const result = path.split('.').reduce((acc, part) => {
            return acc && typeof acc === 'object' ? acc[part] : undefined;
        }, obj);
        return result;
    }
}

export default FIFOLookupMap;

