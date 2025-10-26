import { describe, it, expect } from '@scintilla-network/litest';
import TimeQueue from './TimeQueue.js';

describe('TimeQueue', () => {
    it('enqueues and dequeues items correctly', () => {
        const timeQueue = new TimeQueue();
        const now = Date.now();

        const item1 = { type: 'PROPOSAL_END', payload: { someData: 'test1' } };
        const item2 = { type: 'PROPOSAL_START', payload: { someData: 'test2' } };

        timeQueue.enqueue(now, item1);
        timeQueue.enqueue(now + 1000, item2);

        const dequeuedItems = timeQueue.dequeue(now);

        expect(dequeuedItems).toEqual([item1]);
        expect(dequeuedItems).toHaveLength(1);
        expect(timeQueue.isEmpty()).toBe(false);

        const dequeuedItems2 = timeQueue.dequeue(now + 1000);
        expect(dequeuedItems2).toEqual([item2]);
        expect(dequeuedItems2).toHaveLength(1);
        expect(timeQueue.isEmpty()).toBe(true);
    });

    it('peeks at the next timestamp correctly', () => {
        const timeQueue = new TimeQueue();
        expect(timeQueue.peekNextTimestamp()).toBeNull();

        const now = Date.now();
        timeQueue.enqueue(now, { type: 'TEST', payload: {} });
        expect(timeQueue.peekNextTimestamp()).toBe(now);
    });

    it('serializes and deserializes correctly', () => {
        const timeQueue = new TimeQueue();
        const now = Date.now();

        timeQueue.enqueue(now, { type: 'PROPOSAL_END', payload: { someData: 'test' } });

        const serializedQueue = timeQueue.toJSON();
        const deserializedQueue = TimeQueue.fromJSON(serializedQueue);

        expect(deserializedQueue).toBeInstanceOf(TimeQueue);
        const dequeuedItems = deserializedQueue.dequeue(now);
        expect(dequeuedItems).toHaveLength(1);
        expect(dequeuedItems[0].type).toBe('PROPOSAL_END');
        expect(dequeuedItems[0].payload).toEqual({ someData: 'test' });
    });

    it('checks if the queue is empty correctly', () => {
        const timeQueue = new TimeQueue();
        expect(timeQueue.isEmpty()).toBe(true);

        const now = Date.now();
        timeQueue.enqueue(now, { type: 'TEST', payload: {} });
        expect(timeQueue.isEmpty()).toBe(false);
    });
});
