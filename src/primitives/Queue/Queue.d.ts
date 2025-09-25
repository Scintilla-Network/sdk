declare class Queue<T> {
    private items: T[];

    constructor();

    enqueue(item: T): void;
    dequeue(item?: T | null | undefined): T | null;
    toArray(): T[];
    peek(): T | null;
    isEmpty(): boolean;
    size(): number;
    clear(): void;
}

export default Queue;

