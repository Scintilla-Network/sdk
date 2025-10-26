class Peer {
    /**
     * Create Peer from string
     * @param {string} uri - The URI
     * @returns {Peer} The Peer instance
     */
    static fromString(uri) {
        if(!uri?.includes('http') && !uri?.includes('https')) {
            uri = `http://${uri}`;
        }
        const {  hostname, port } = new URL(uri);
        return new Peer({
            hostname,
            port
        })
    }

    /**
     * Create Peer
     * @param {Object} props - The properties
     * @param {string} props.hostname - The hostname
     * @param {number} props.port - The port
     */
    constructor(props) {
        if(typeof props === 'string') {
            return Peer.fromString(props);
        }

        this.hostname = props.hostname;
        this.port = props.port;

        this.id = `${this.hostname}:${this.port}`;

        this.type = props?.type ?? 'seed';


        this.services = {};
    }

    /**
     * Synchronize the peer
     * @returns {Promise<void>}
     */
    async synchronize() {
        // Connect
        // Ask for peers, identity and more
        this.services['scintilla'] = {
            rest:{
                port: 8887,
                hostname: this.hostname
            },
            tcp:{
                port: 8888,
                hostname: this.hostname
            }
        }
        this.services['identity'] = {
            rest:{
                port: 8882,
                hostname: this.hostname
            }
        }

        this.services['drive'] = {
            rest:{
                port: 8886,
                hostname: this.hostname
            }
        }

        this.services['banking'] = {
            rest:{
                port: 8884,
                hostname: this.hostname
            }
        }
    }
}

export default Peer;
