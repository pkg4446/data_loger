async function secret_code(title) {
    let del_code = "";
    for (let index = 0; index < 4; index++) {
        del_code += ascii();
    }
    const input = await Swal.fire({
        title: title,
        input: "text",
        text: del_code + "를 입력하세요.",
        showCancelButton: true,
        inputPlaceholder: del_code,
        confirmButtonText: "변경",
        cancelButtonText:  "취소"
    })
    console.log(del_code,input.value);
    return del_code == input.value;
}
////-------------------////
function ascii() {
    const type = Math.floor(Math.random()*3);
    let ascii_dec = 0;
    if(type == 0){
        ascii_dec = Math.floor(Math.random()*10)+48;
    }else{
        ascii_dec = Math.floor(Math.random()*26);
        if(type == 1) ascii_dec += 65;
        else ascii_dec += 97;
    }
    return String.fromCharCode(ascii_dec);
}