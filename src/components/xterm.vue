<template>
    <div class="myxterm" ref="myxterm" id="myxterm"> </div>
</template>

<script>

import 'xterm/css/xterm.css'
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit'

export default{
    name: 'xtermWin',
    props: {
        caption:{type:String,default:""},
        prompt:{type:String,default:"$"},
        onData:{type:Function,default:null},
    },
    created(){

    },
    data(){
        return {
            xterm:null,
            rows: 35,
            cols: 100,
            curr_line:'',
            entries:[],
            currPos:0,
            pos:0,
            fitAddon :null,
            command:'',
            textEncoder:new TextEncoder(),
        }
    },  
    mounted() {
        this.initXterm();
        this.resizeScreen();
    },
    methods: {
        initXterm() {
            let self = this
            let term = new Terminal({
                rendererType: "canvas", //渲染类型
                rows: self.rows, //行数
                cols: self.cols, // 不指定行数，自动回车后光标从下一行开始
                convertEol: true, //启用时，光标将设置为下一行的开头
                // scrollback: 50, //终端中的回滚量
                disableStdin: false, //是否应禁用输入
                // cursorStyle: "underline", //光标样式
                cursorBlink: true, //光标闪烁
                fontFamily: "Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace",
                fontSize: 12,
                theme: {
                  foreground: "#ECECEC", //字体
                  background: "#000000", //背景色
                  cursor: "help", //设置光标
                  lineHeight: 20
                }
            })
            // 创建terminal实例
            term.open(this.$refs["myxterm"])

            // 换行并输入起始符 $
            term.prompt = () => {  
                term.write("\x1b[33m$\x1b[0m>")
            }
            // canvas背景全屏
            this.fitAddon = new FitAddon()
            term.loadAddon(this.fitAddon)
            this.fitAddon.fit()

            window.addEventListener("resize", self.resizeScreen)
            self.xterm = term;


            self.runFakeTerminal()
        },
        write(data){
            if(this.xterm) this.xterm.write(data);
        },
        triggerResize(){
            setTimeout(()=>{
                window.dispatchEvent(new Event('resize'));
            },50)
        },
        resizeScreen() {
            try { 
              this.fitAddon.fit()
            } catch (e) {
              console.log("e", e.message)
            }
        },
        runFakeTerminal() {
            let self = this
            let term = self.xterm
            if (term._initialized) return
            // 初始化
            term._initialized = true
            /*
                term.write(this.caption+"\n")
                term.prompt()
            */
            // 添加事件监听器，支持输入方法
            /*
            term.onKey(e=> {
                let ev = e.domEvent;
                console.log(`Key:[${ev.keyCode}-${ev.key}] shiftKey:${ev.shiftKey} altKey:${ev.altKey} ctrlKey:${ev.ctrlKey} metaKey:${ev.metaKey} `)
                if(ev.key == 'k' && (ev.ctrlKey||ev.metaKey)){
                    console.log("CLEAR")
                    term.clear();
                }
                // debugger;
                // input_Handle(ev.key);
            })*/
            term.onData(e => {
                console.log(`onData:[${e.toString()}]`,typeof(e),e=='',e==' ');
                if(self.onData)  self.onData(e);
                return
            });
        },
        
    }   
}
</script>
<style lang="scss" scoped>
.myxterm {
   width  :100%;
   min-height: calc(100vh - 284px);
   .xterm-viewport{
      width  :100%;
  }
}

</style>