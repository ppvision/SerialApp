export  function is_float(v){
        return parseInt(v*1) != parseFloat(v*1)
}

export function delay_ms(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}




export function curr_tm_str(tm = new Date()){
    function b2(v){if(v>=10)return v;return "0"+v;}
    function b3(v){if(v>=100)return v;if(v>=10)return "0"+v;return "00"+v;}

    let year     = tm.getFullYear();
    let month    = tm.getMonth()+1;
    let date     = tm.getDate();
    let hour     = tm.getHours();
    let minutes  = tm.getMinutes();
    let seconds  = tm.getSeconds();
    let mSec     = tm.getMilliseconds();
    hour = (hour +8) %24
    let date_str = `${year}-${b2(month)}-${b2(date)} ${b2(hour)}:${b2(minutes)}:${b2(seconds)}.${b3(mSec)}`;
    return date_str;
}
