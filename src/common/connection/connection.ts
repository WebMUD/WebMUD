import { DataConnection } from "peerjs";
import { ConnectionBase, ConnectionStatus } from "./connection-base";

/**
 * external connection
 */
export class Connection extends ConnectionBase {
    private conn: DataConnection;

    constructor(conn: DataConnection) {
        super();

        this.conn = conn;
        this.status = ConnectionStatus.OK;

        this.onClose(()=>{
            this.status = ConnectionStatus.CLOSE;
        })

        try {
            conn.on('error', (err: Error)=>{
                this.status = ConnectionStatus.ERROR;
                this.onError.emit(err);
            });
    
            conn.on('data', (data: unknown)=>{
                if (typeof data !== 'string') throw new Error('expected string');
                this.onData.emit(data);
            });
    
            conn.on('close', ()=>{
                this.onClose.emit();
            });
        } catch (err) {
            this.status = ConnectionStatus.ERROR;
            throw err;
        }
    }

    public send(data: string): Error|undefined {
        try {
            this.conn.send(data);
        } catch (err) {
            this.status = ConnectionStatus.ERROR;
            return err;
        }
        return undefined;
    }

    public close() {
        this.conn.close();
    }
}