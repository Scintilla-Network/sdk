import { describe, it, expect } from '@scintilla-network/litest';
import Queue from './Queue.js';

describe('Queue', () => {
    it('enqueues and dequeues items correctly', () => {
        const queue = new Queue<number>();
        queue.enqueue(1);
        queue.enqueue(2);

        expect(queue.dequeue()).toBe(1);
        expect(queue.dequeue()).toBe(2);
        expect(queue.dequeue()).toBeNull();
    });

    it('peeks at the next item correctly', () => {
        const queue = new Queue<string>();
        expect(queue.peek()).toBeNull();

        queue.enqueue('first');
        queue.enqueue('second');

        expect(queue.peek()).toBe('first');
    });

    it('checks if the queue is empty correctly', () => {
        const queue = new Queue<boolean>();
        expect(queue.isEmpty()).toBe(true);

        queue.enqueue(true);
        expect(queue.isEmpty()).toBe(false);

        queue.dequeue();
        expect(queue.isEmpty()).toBe(true);
    });

    it('clears the queue correctly', () => {
        const queue = new Queue<any>();
        queue.enqueue({ some: 'object' });
        queue.enqueue(['an', 'array']);

        queue.clear();
        expect(queue.isEmpty()).toBe(true);
    });

    it('converts to array correctly', () => {
        const queue = new Queue<number>();
        queue.enqueue(1);
        queue.enqueue(2);

        const array = queue.toArray();
        expect(array).toEqual([1, 2]);
    });

    it('returns correct size', () => {
        const queue = new Queue<number>();
        expect(queue.size()).toBe(0);

        queue.enqueue(1);
        queue.enqueue(2);
        expect(queue.size()).toBe(2);

        queue.dequeue();
        expect(queue.size()).toBe(1);
    });
});
