class Peer {
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

    async synchronize(){
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
