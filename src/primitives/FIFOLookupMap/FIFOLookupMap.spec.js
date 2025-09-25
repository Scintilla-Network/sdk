// import { describe, it, expect, beforeEach } from 'vitest';
import { describe, it, expect, beforeEach } from '@scintilla-network/litest';
import FIFOLookupMap from './FIFOLookupMap.js';

describe('FIFOLookupMap', () => {
    let fifoMap;

    beforeEach(() => {
        fifoMap = new FIFOLookupMap(3, 'header.epoch');
    });

    it('adds items correctly and respects max size limit', () => {
        fifoMap.add({
            header: { epoch: 0, timestamp: new Date(), previousHash: null, proposer: 'alice' },
            signatures: [],
            payload: { data: {} }
        });
        fifoMap.add({
            header: { epoch: 1, timestamp: new Date(), previousHash: 'hash0', proposer: 'bob' },
            signatures: [],
            payload: { data: {} }
        });
        fifoMap.add({
            header: { epoch: 2, timestamp: new Date(), previousHash: 'hash1', proposer: 'charlie' },
            signatures: [],
            payload: { data: {} }
        });
        fifoMap.add({
            header: { epoch: 3, timestamp: new Date(), previousHash: 'hash2', proposer: 'david' },
            signatures: [],
            payload: { data: {} }
        });

        expect(fifoMap.get('0')).toBeUndefined();
        expect(fifoMap.get('3')).toBeDefined();
        expect(fifoMap.get('3')?.header.proposer).toBe('david');
    });

    it('ensures FIFO behavior upon reaching max size', () => {
        for (let i = 0; i < 5; i++) {
            fifoMap.add({
                header: { epoch: i, timestamp: new Date(), previousHash: i > 0 ? `hash${i-1}` : null, proposer: `proposer${i}` },
                signatures: [],
                payload: { data: {} }
            });
        }

        expect(fifoMap.get('0')).toBeUndefined();
        expect(fifoMap.get('1')).toBeUndefined();
        expect(fifoMap.get('2')).toBeDefined();
        expect(fifoMap.get('4')).toBeDefined();
    });

    it('retrieves the last element of a given property', () => {
        fifoMap.add({
            header: { epoch: 0, timestamp: new Date(), previousHash: null, proposer: 'alice' },
            signatures: [],
            payload: { data: { 'cluster': 'v1' } }
        });
        fifoMap.add({
            header: { epoch: 1, timestamp: new Date(), previousHash: 'hash0', proposer: 'bob' },
            signatures: [],
            payload: { data: { 'cluster': 'v2' } }
        });
        fifoMap.add({
            header: { epoch: 2, timestamp: new Date(), previousHash: 'hash1', proposer: 'charlie' },
            signatures: [],
            payload: { data: { 'cluster': 'v3' } }
        });

        const lastClusterCore = fifoMap.getLast('payload.data.cluster');

        expect(lastClusterCore).not.toBeNull();
        expect(lastClusterCore?.header.epoch).toBe(2);
        expect(lastClusterCore?.payload.data['cluster']).toBe('v3');

        const lastWithValue = fifoMap.getLast('payload.data.cluster', 'v2');

        expect(lastWithValue).not.toBeNull();
        expect(lastWithValue?.header.epoch).toBe(1);
        expect(lastWithValue?.payload.data['cluster']).toBe('v2');
    });

    it('handles addition of items with the same primary key correctly', () => {
        fifoMap.add({
            header: { epoch: 1, timestamp: new Date(), previousHash: null, proposer: 'alice' },
            signatures: [],
            payload: { data: {} }
        });
        fifoMap.add({
            header: { epoch: 1, timestamp: new Date(), previousHash: null, proposer: 'bob' },
            signatures: [],
            payload: { data: {} }
        });

        expect(fifoMap.get('1')?.header.proposer).toBe('alice');
    });

    it('removes items correctly', () => {
        fifoMap.add({
            header: { epoch: 1, timestamp: new Date(), previousHash: null, proposer: 'alice' },
            signatures: [],
            payload: { data: {} }
        });
        fifoMap.add({
            header: { epoch: 2, timestamp: new Date(), previousHash: 'hash1', proposer: 'bob' },
            signatures: [],
            payload: { data: {} }
        });
        fifoMap.remove('1');

        expect(fifoMap.get('1')).toBeUndefined();
        expect(fifoMap.get('2')).toBeDefined();
    });

    it('handles epoch 0 correctly', () => {
        fifoMap.add({
            header: { epoch: 0, timestamp: new Date(), previousHash: null, proposer: 'alice' },
            signatures: [],
            payload: { data: {} }
        });

        expect(fifoMap.get('0')).toBeDefined();
        expect(fifoMap.get('0')?.header.epoch).toBe(0);
    });
});

