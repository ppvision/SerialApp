<template>
  <div >
     <el-button  target="_blank" rel="noopener" @click="list_serial">vue-cli documentation</el-button>
     <el-button @click="selectFile">YModem</el-button>
    <Shell ref="xterm" :onData="writeSerial"></Shell>
  </div>
</template>

<script>

import {transfer} from "@/Modules/ymodem";
import {Serial} from "@/Modules/web_serial";
import xterminal from "@/components/xterm";
import {delay_ms,curr_tm_str} from "@/utils/index";

 
export default {
  name: 'HelloWorld',
  components: {Shell:xterminal},
    data(){
        return {
            serial:null,
        }
    },
  props: {
    msg: String,
    config : {type: Object,default: function(){return null }},
  },
  methods: {
    async flash_ymodem(code,pre='',after='') {
        // if(this.serial&&this.serial.writable){}
        if(pre)   await this.writeSerial(pre);
        await delay_ms(500);
        const encoder = new TextEncoder();
        const buffer = encoder.encode(code);
        const result = await transfer(this.serial, "code", buffer);
        console.log("upload file result:",result);
        await delay_ms(500);
        if(after) await this.writeSerial(after);
    },
    writeSerial(data){
        // eslint-disable-next-line
        // debugger
        if(this.serial) return Promise.reject('!serial')
        return this.serial.write(data).then(()=>{
            // console.log("writeSerial OK")
        }).catch(err=>{
            console.log("writeSerial",err)
        })
    },
    async list_serial(){
        let self = this;
        try {
            {transfer}
            if(this.serial){
                let readable = self.serial.readable;
                if(readable){
                    await readable.cancel()
                }
                this.serial.close()
            }
            const port = await navigator.serial.requestPort();
            console.log("SELECT PORT:",port,port.getInfo())
            const serial = new Serial(port);
            let onRecv =(data)=>{
                // const decoder = new TextDecoder();
                // console.log("onRecv",decoder.decode(data),data);
                let xterm = this.$refs.xterm;
                if(xterm){
                    xterm.write(data)//echo info
                }
            }
            let onDisconnect =()=>{
                console.log("onDisconnect")
            }

            let onConnect =()=>{
                console.log("onConnect")
            }

            serial.on('data',onRecv);
            serial.on('disconnect',onDisconnect);
            serial.on('connect',onConnect);

            const info = await serial.getInfo();

            console.log("GET INFO:",info);
            await serial.open({
                baudRate: 115200,
                dataBits:8,//7 or 8
                stopBits:1,//1 or 2
                parity:'none',// even or odd
                bufferSize:1024,//must less than 16M
                flowControl:'none',//none||hardware
            }).catch(err=>{
                console.log("OPEN COM ERROR:",err)
            });

            this.serial = serial;

            // const supported = supportedDevices.find(
            //     (d) =>
            //     d.vendorId === info.usbVendorId && d.productId === info.usbProductId
            // );
/*
            const supportedDevices=[];

            this.terminal.current.enable();
            await serial.open({
                baudRate: 115200
            });
            serial.on("data", (data) => {
                this.terminal.current.write(data);
            });
            serial.write("\r.hi\r");
            this.setState((prev) => {
                return {
                    ...prev,
                    target: {
                        ...prev.target,
                        serial: serial,
                        vendor: supported ? supported.vendor : null,
                        product: supported ? supported.product : null,
                    },
                };
            });
*/            
        } catch (err) {
            console.log(err);
        }
    },
    YmodemLog(){
        let xterm = this.$refs.xterm;
        function f(...arg){
            let msg = curr_tm_str()+":";
            msg += [...arg].map(it=>{
                let type = typeof(it);
                if(type == 'object') {
                    return JSON.stringify(it)
                }else if(type == 'boolean'){
                    return it?"True":"False"
                }else if(Array.isArray(it)){
                    return (it.map(o=>typeof(o)=='object'?JSON.stringify(o):o.toString())).join('');
                }
                return it?it.toString():'';
            }).join(',');
            if(xterm) xterm.write(msg+"\n")
        }
        return f
    },
    async selectFile(){
            let self = this;
            if(!this.serial) return this.$message.error("请先打开串口");
            async function file_contents(contents,file) {
                let cont_len   = contents.byteLength;
                let [name,ext] = file.name.split('.');
                if(file.size != cont_len){
                    console.log("LEN Size mismatch\r\n");
                }
                console.log("============> Load File Name:",name,ext);
                console.log("RESTORE:",contents,typeof(contents));
                // eslint-disable-next-line
                // debugger
                await transfer(self.serial, name, new Uint8Array(contents),self.YmodemLog()).then((result)=>{
                    if(result && result.totalBytes == result.writtenBytes){
                        self.$message.success('文件传输完毕！')
                    }else{
                        self.$message.error('文件传输失败！')
                    }
                })
            }
            
            function openFile(callback) {
                function clickElem(elem) {
                    var eventMouse = document.createEvent("MouseEvents")
                    eventMouse.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
                    elem.dispatchEvent(eventMouse)
                }

                function readFile(e) {
                    var file = e.target.files[0];
                    if (!file) return;
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        var contents = e.target.result;
                        typeof(callback)=='function'?callback(contents,file):""
                        document.body.removeChild(fileInput)
                    }
                    // reader.readAsText(file)
                    reader.readAsArrayBuffer(file)
                }

                let fileInput = document.createElement("input")
                fileInput.type          ='file'
                fileInput.style.display ='none'
                fileInput.onchange      =readFile
                // fileInput.func          =func
                document.body.appendChild(fileInput)
                clickElem(fileInput)
            }
            openFile(file_contents);
        }

    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
