import { EventEmitter } from 'events';

export class Serial extends EventEmitter {
    constructor(serial) {
        super();
        this.serial   = serial;
        this.connected= false;
        this.reader   = null;
    }
    async getInfo() {
      return this.serial.getInfo();
    }
    state(){
        return this.serial.state;
    }
    read(){
        let self = this;
        const readLoop = () => {
            let readable = self.serial.readable;
            if(!readable ) return "!readable";
            //readFatal,writeFatal
            const reader = readable.getReader();/*creates a reader and locks readable to it*/
            self.reader = reader;
            reader.read().then(({value, done}) => {
                reader.releaseLock();
                if (value) {
                    self.emit('data', value);
                }
                if (done) {
                    // disconnect
                    /*If done is true, the serial port has been closed or there is no more data coming in*/
                }else {
                    readLoop();
                }
            }).catch((err) => {
                reader.releaseLock();
                console.log(err);
                self.connected = false;
                self.emit('disconnect',err);
            })
        };
        readLoop();
        return ;
    }
    open(options) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.serial.open(options) .then(() => {
                self.connected = true;
                self.emit('connect');
                self.read();
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
          if (this.reader) {
            this.reader.cancel()
                .then(() => this.serial.close())
                .then(() => resolve())
                .catch((err) => reject(err));
          } else if(this.serial){
            this.reader = null;
            this.serial.close()
              .then(() => resolve())
              .catch((err) => reject(err));
          }
        });
    }
    write(data, encoding = 'string') {
        return new Promise((resolve, reject) => {
            let writable = this.serial.writable;
            if(!writable) reject("!writable")
            const writer = writable.getWriter();
            if (encoding === 'string') {
                const encoder = new TextEncoder();
                writer.write(encoder.encode(data))
                    .then(() => resolve())
                    .catch((err) => reject(err));
            } else if (encoding === 'binary') {
                writer.write(data)
                    .then(() => resolve())
                    .catch((err) => reject(err));
            }
            writer.releaseLock();
        });
    }
}
