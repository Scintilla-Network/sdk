// import {describe, it, expect} from "vitest";
import {describe, it, expect} from "@scintilla-network/litest";
import Peer from './Peer.js';

describe('Peer', () => {
    describe('constructor', () => {
        it('should create a peer instance with hostname and port', () => {
            const peer = new Peer({
                hostname: 'localhost',
                port: 8080
            });
            
            expect(peer.hostname).toBe('localhost');
            expect(peer.port).toBe(8080);
            expect(peer.id).toBe('localhost:8080');
            expect(peer.type).toBe('seed');
            expect(peer.services).toEqual({});
        });

        it('should create a peer from string URI', () => {
            const peer = new Peer('localhost:8080');
            
            expect(peer.hostname).toBe('localhost');
            expect(peer.port).toBe('8080');
            expect(peer.id).toBe('localhost:8080');
        });

        it('should add http:// prefix if protocol is missing', () => {
            const peer = new Peer('localhost:8080');
            expect(peer.hostname).toBe('localhost');
        });

        it('should work with existing http:// prefix', () => {
            const peer = new Peer('http://localhost:8080');
            expect(peer.hostname).toBe('localhost');
        });

        it('should work with https:// prefix', () => {
            const peer = new Peer('https://localhost:8080');
            expect(peer.hostname).toBe('localhost');
        });
    });

    describe('synchronize', () => {
        it('should populate services with correct ports', async () => {
            const peer = new Peer({
                hostname: 'localhost',
                port: 8080
            });

            await peer.synchronize();

            expect(peer.services).toEqual({
                scintilla: {
                    rest: {
                        port: 8887,
                        hostname: 'localhost'
                    },
                    tcp: {
                        port: 8888,
                        hostname: 'localhost'
                    }
                },
                identity: {
                    rest: {
                        port: 8882,
                        hostname: 'localhost'
                    }
                },
                drive: {
                    rest: {
                        port: 8886,
                        hostname: 'localhost'
                    }
                },
                banking: {
                    rest: {
                        port: 8884,
                        hostname: 'localhost'
                    }
                }
            });
        });
    });

    describe('fromString', () => {
        it('should create a peer instance from string', () => {
            const peer = Peer.fromString('localhost:8080');
            
            expect(peer.hostname).toBe('localhost');
            expect(peer.port).toBe('8080');
            expect(peer.id).toBe('localhost:8080');
        });

        it('should handle URLs with protocol', () => {
            const peer = Peer.fromString('http://scintilla.network:8080');
            
            expect(peer.hostname).toBe('scintilla.network');
            expect(peer.port).toBe('8080');
            expect(peer.id).toBe('scintilla.network:8080');
        });
    });
}); 