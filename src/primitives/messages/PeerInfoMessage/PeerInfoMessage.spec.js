import { describe, it, expect } from '@scintilla-network/litest';
import { PeerInfoMessage } from './PeerInfoMessage.js';
import { Identity } from '../../Identity/Identity.js';
import { uint8array } from '@scintilla-network/keys/utils';

describe('PeerInfoMessage', () => {
    it('initializes with default values if no arguments are provided', () => {
        const identity = new Identity({
            moniker: 'test-identity',
            members: [['alice', 1000, 0, 0, 0, 0, 0]],
        });

        const peerInfo = new PeerInfoMessage({
            identity: identity
        });

        expect(peerInfo.kind).toBe('PEERINFO');
        expect(peerInfo.version).toBe(1);
        expect(peerInfo.quorum).toBeUndefined();
        expect(peerInfo.host).toBe('0.0.0.0');
        expect(peerInfo.port).toBe(8888);
        expect(peerInfo.identity).toEqual(identity);
    });

    it('initializes with custom values', () => {
        const identity = new Identity({
            moniker: 'test-identity',
            members: [['alice', 1000, 0, 0, 0, 0, 0]],
        });

        const peerInfo = new PeerInfoMessage({
            quorum: 'scintilla',
            host: '192.168.1.100',
            port: 9999,
            identity: identity
        });

        expect(peerInfo.quorum).toBe('scintilla');
        expect(peerInfo.host).toBe('192.168.1.100');
        expect(peerInfo.port).toBe(9999);
        expect(peerInfo.identity).toEqual(identity);
    });

    it('initializes with IPv6 host', () => {
        const identity = new Identity({
            moniker: 'test-identity',
            members: [['alice', 1000, 0, 0, 0, 0, 0]],
        });

        const peerInfo = new PeerInfoMessage({
            quorum: 'scintilla',
            host: '2a02:842a:299:c01:51e4:959f:941:7970',
            port: 8887,
            identity: identity
        });

        expect(peerInfo.host).toBe('2a02:842a:299:c01:51e4:959f:941:7970');
        expect(peerInfo.port).toBe(8887);
    });

    describe('toUint8Array', () => {
        it('should convert to Uint8Array', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: '192.168.1.100',
                port: 9999,
                identity: identity
            });

            const uint8Array = peerInfo.toUint8Array();
            expect(uint8Array).toBeInstanceOf(Uint8Array);
            expect(uint8Array.length).toBeGreaterThan(0);
        });

        it('should set default host if host is missing', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: null,
                port: 9999,
                identity: identity
            });

            expect(peerInfo.host).toBe('0.0.0.0');
        });

        it('should set default port if port is missing', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: '192.168.1.100',
                port: null,
                identity: identity
            });

            expect(peerInfo.port).toBe(8888);
        });

        it('should throw error if identity is not valid', () => {
            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: '192.168.1.100',
                port: 9999,
                identity: { invalid: 'identity' }
            });

            expect(() => peerInfo.toUint8Array()).toThrow('Identity is not a valid Identity');
        });

        it('should handle identity with toUint8Array method', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: '192.168.1.100',
                port: 9999,
                identity: identity
            });

            const uint8Array = peerInfo.toUint8Array();
            expect(uint8Array).toBeInstanceOf(Uint8Array);
        });

        it('should handle identity JSON object', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: '192.168.1.100',
                port: 9999,
                identity: identity.toJSON()
            });

            const uint8Array = peerInfo.toUint8Array();
            expect(uint8Array).toBeInstanceOf(Uint8Array);
        });
    });

    describe('fromUint8Array', () => {
        it('should deserialize from Uint8Array', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: '192.168.1.100',
                port: 9999,
                identity: identity
            });

            const uint8Array = peerInfo.toUint8Array();
            const parsed = PeerInfoMessage.fromUint8Array(uint8Array);

            expect(parsed.kind).toBe('PEERINFO');
            expect(parsed.version).toBe(1);
            expect(parsed.quorum).toBe('scintilla');
            expect(parsed.host).toBe('192.168.1.100');
            expect(parsed.port).toBe(9999);
            expect(parsed.identity.moniker).toBe('test-identity');
        });

        it('should handle round-trip serialization', () => {
            const identity = new Identity({
                moniker: 'yggdrasil',
                parent: 'sct',
                members: [['sct16r5ed3h8k794luyzp2ht096429c0ku6trvq2x8', 1000, 0, 0, 0, 0, 0]],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: '2a02:842a:299:c01:51e4:959f:941:7970',
                port: 8887,
                identity: identity
            });

            const uint8Array = peerInfo.toUint8Array();
            const parsed = PeerInfoMessage.fromUint8Array(uint8Array);

            expect(parsed.quorum).toBe(peerInfo.quorum);
            expect(parsed.host).toBe(peerInfo.host);
            expect(parsed.port).toBe(peerInfo.port);
            expect(parsed.identity.moniker).toBe(peerInfo.identity.moniker);
            expect(parsed.identity.parent).toBe(peerInfo.identity.parent);
        });

        it('should preserve identity members', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [
                    ['alice', 1000, 0, 0, 0, 0, 0],
                    ['bob', 500, 0, 0, 0, 0, 0]
                ],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: '192.168.1.100',
                port: 9999,
                identity: identity
            });

            const uint8Array = peerInfo.toUint8Array();
            const parsed = PeerInfoMessage.fromUint8Array(uint8Array);

            expect(parsed.identity.members.length).toBe(2);
            expect(parsed.identity.members[0][0]).toBe('alice');
            expect(parsed.identity.members[1][0]).toBe('bob');
        });

        it('should maintain consistency across multiple serializations', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: '192.168.1.100',
                port: 9999,
                identity: identity
            });

            const uint8Array1 = peerInfo.toUint8Array();
            const uint8Array2 = peerInfo.toUint8Array();

            expect(uint8array.toHex(uint8Array1)).toBe(uint8array.toHex(uint8Array2));
        });
    });

    describe('different quorum values', () => {
        it('should handle different quorum names', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const quorums = ['scintilla', 'core.banking', 'core.identity', 'custom-quorum'];

            quorums.forEach(quorum => {
                const peerInfo = new PeerInfoMessage({
                    quorum: quorum,
                    host: '192.168.1.100',
                    port: 9999,
                    identity: identity
                });

                const uint8Array = peerInfo.toUint8Array();
                const parsed = PeerInfoMessage.fromUint8Array(uint8Array);

                expect(parsed.quorum).toBe(quorum);
            });
        });
    });

    describe('different host formats', () => {
        it('should handle IPv4 addresses', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const hosts = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '127.0.0.1'];

            hosts.forEach(host => {
                const peerInfo = new PeerInfoMessage({
                    quorum: 'scintilla',
                    host: host,
                    port: 8888,
                    identity: identity
                });

                const uint8Array = peerInfo.toUint8Array();
                const parsed = PeerInfoMessage.fromUint8Array(uint8Array);

                expect(parsed.host).toBe(host);
            });
        });

        it('should handle IPv6 addresses', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const hosts = [
                '2a02:842a:299:c01:51e4:959f:941:7970',
                '::1',
                'fe80::1',
                '2001:db8::1'
            ];

            hosts.forEach(host => {
                const peerInfo = new PeerInfoMessage({
                    quorum: 'scintilla',
                    host: host,
                    port: 8888,
                    identity: identity
                });

                const uint8Array = peerInfo.toUint8Array();
                const parsed = PeerInfoMessage.fromUint8Array(uint8Array);

                expect(parsed.host).toBe(host);
            });
        });

        it('should handle hostnames', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const hosts = ['localhost', 'example.com', 'relay.scintilla.network'];

            hosts.forEach(host => {
                const peerInfo = new PeerInfoMessage({
                    quorum: 'scintilla',
                    host: host,
                    port: 8888,
                    identity: identity
                });

                const uint8Array = peerInfo.toUint8Array();
                const parsed = PeerInfoMessage.fromUint8Array(uint8Array);

                expect(parsed.host).toBe(host);
            });
        });
    });

    describe('different port values', () => {
        it('should handle various port numbers', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const ports = [80, 443, 8080, 8888, 9999, 3000, 65535];

            ports.forEach(port => {
                const peerInfo = new PeerInfoMessage({
                    quorum: 'scintilla',
                    host: '192.168.1.100',
                    port: port,
                    identity: identity
                });

                const uint8Array = peerInfo.toUint8Array();
                const parsed = PeerInfoMessage.fromUint8Array(uint8Array);

                expect(parsed.port).toBe(port);
            });
        });
    });

    describe('complex identity scenarios', () => {
        it('should handle identity with parent', () => {
            const identity = new Identity({
                moniker: 'yggdrasil',
                parent: 'sct',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: '192.168.1.100',
                port: 9999,
                identity: identity
            });

            const uint8Array = peerInfo.toUint8Array();
            const parsed = PeerInfoMessage.fromUint8Array(uint8Array);

            expect(parsed.identity.parent).toBe('sct');
            expect(parsed.identity.moniker).toBe('yggdrasil');
        });

        it('should handle identity with records', () => {
            const identity = new Identity({
                moniker: 'yggdrasil',
                parent: 'sct',
                members: [['sct16r5ed3h8k794luyzp2ht096429c0ku6trvq2x8', 1000, 0, 0, 0, 0, 0]],
                records: {
                    clusters: {
                        scintilla: {
                            relayer: {
                                agent: 'relayersd-0.1.0',
                                type: 'relayer',
                                version: '0.1.0',
                                network: {
                                    http: {
                                        host: '2a02:842a:299:c01:51e4:959f:941:7970',
                                        port: 8887
                                    },
                                    tcp: {
                                        host: '2a02:842a:299:c01:51e4:959f:941:7970',
                                        port: 8888
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: '2a02:842a:299:c01:51e4:959f:941:7970',
                port: 8888,
                identity: identity
            });

            const uint8Array = peerInfo.toUint8Array();
            const parsed = PeerInfoMessage.fromUint8Array(uint8Array);

            expect(parsed.identity.records).toBeDefined();
            expect(parsed.identity.records.clusters).toBeDefined();
            expect(parsed.identity.records.clusters.scintilla).toBeDefined();
        });

        it('should handle identity with multiple members', () => {
            const identity = new Identity({
                moniker: 'multi-member',
                members: [
                    ['alice', 1000, 0, 0, 0, 0, 0],
                    ['bob', 800, 0, 0, 0, 0, 0],
                    ['charlie', 600, 0, 0, 0, 0, 0],
                    ['dave', 400, 0, 0, 0, 0, 0]
                ],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: '192.168.1.100',
                port: 9999,
                identity: identity
            });

            const uint8Array = peerInfo.toUint8Array();
            const parsed = PeerInfoMessage.fromUint8Array(uint8Array);

            expect(parsed.identity.members.length).toBe(4);
            expect(parsed.identity.members[0][0]).toBe('alice');
            expect(parsed.identity.members[3][0]).toBe('dave');
        });
    });

    describe('edge cases', () => {
        it('should handle empty quorum', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: '',
                host: '192.168.1.100',
                port: 9999,
                identity: identity
            });

            const uint8Array = peerInfo.toUint8Array();
            const parsed = PeerInfoMessage.fromUint8Array(uint8Array);

            expect(parsed.quorum).toBe('');
        });

        it('should handle undefined quorum', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const peerInfo = new PeerInfoMessage({
                host: '192.168.1.100',
                port: 9999,
                identity: identity
            });

            expect(peerInfo.quorum).toBeUndefined();
        });

        it('should use default host when not provided', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                identity: identity
            });

            expect(peerInfo.host).toBe('0.0.0.0');
        });

        it('should use default port when not provided', () => {
            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: '192.168.1.100',
                identity: identity
            });

            expect(peerInfo.port).toBe(8888);
        });
    });

    describe('real-world scenarios', () => {
        it('should handle typical relay node peer info', () => {
            const identity = new Identity({
                moniker: 'yggdrasil',
                parent: 'sct',
                members: [['sct16r5ed3h8k794luyzp2ht096429c0ku6trvq2x8', 1000, 0, 0, 0, 0, 0]],
                records: {
                    clusters: {
                        scintilla: {
                            relayer: {
                                agent: 'relayersd-0.1.0',
                                type: 'relayer',
                                version: '0.1.0',
                                network: {
                                    http: {
                                        host: '2a02:842a:299:c01:51e4:959f:941:7970',
                                        port: 8887
                                    },
                                    tcp: {
                                        host: '2a02:842a:299:c01:51e4:959f:941:7970',
                                        port: 8888
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'scintilla',
                host: '2a02:842a:299:c01:51e4:959f:941:7970',
                port: 8888,
                identity: identity
            });

            const uint8Array = peerInfo.toUint8Array();
            const parsed = PeerInfoMessage.fromUint8Array(uint8Array);

            expect(parsed.quorum).toBe('scintilla');
            expect(parsed.host).toBe('2a02:842a:299:c01:51e4:959f:941:7970');
            expect(parsed.port).toBe(8888);
            expect(parsed.identity.moniker).toBe('yggdrasil');
            expect(parsed.identity.parent).toBe('sct');
        });

        it('should handle local development peer info', () => {
            const identity = new Identity({
                moniker: 'local-dev',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const peerInfo = new PeerInfoMessage({
                quorum: 'dev-quorum',
                host: 'localhost',
                port: 3000,
                identity: identity
            });

            const uint8Array = peerInfo.toUint8Array();
            const parsed = PeerInfoMessage.fromUint8Array(uint8Array);

            expect(parsed.quorum).toBe('dev-quorum');
            expect(parsed.host).toBe('localhost');
            expect(parsed.port).toBe(3000);
            expect(parsed.identity.moniker).toBe('local-dev');
        });
    });
});
