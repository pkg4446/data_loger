ReactDOM.render(React.createElement("div",{onClick:()=>admin_logout(),},"MOD OFF"), document.getElementById("multi_fn"));

document.getElementById("dashboard").innerHTML = '<div id="user_table"></div><br><div id="device_table"></div>';

admin_check();
function admin_logout() {
    localStorage.removeItem('manager');
    Swal.fire({
        position: "top",
        icon:   "info",
        title:  '관리자 로그아웃',
        text:   '관리자 계정이 로그아웃 되었습니다.',
        showConfirmButton: false,
        timer:  1500
    }).then(() => {
        window.location.href = '/';
    });
}
////-------------------////
async function admin_check() {
    const response = await fetchData("admin/check",{token:localStorage.getItem('manager')});
    if (response.status==400) {admin_logout();}
    else{dashboard();}
}
////--------------------------------------------------------------------////
function alert_swal(icon,title) {
    Swal.fire({
        position: "top",
        icon:   icon,
        title:  title,
        showConfirmButton: false,
        timer:  1500
    });
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
////-------------------////
function user_login(user) {
    if(user == localStorage.getItem('user')){
        alert_swal("info",user + " : Checked");
    }else{
        Swal.fire({
            position: "top",
            icon:   "question",
            title:  user+" 체크",
            showCancelButton: true,
            confirmButtonText: "확인",
            cancelButtonText:  "취소"
        }).then((result)=>{
            if(result.isConfirmed){
                fetch(window.location.protocol+"//"+window.location.host+"/admin/superuser", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token:  localStorage.getItem('manager'),
                        user:   user
                    })
                }).then(response => {
                    if (response.status==400) {
                        throw new Error('관리자 TOKEN이 누락됐습니다.');
                    }else if (response.status==403) {
                        throw new Error('TOKEN이 유효하지 않습니다.');
                    }
                    return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
                })
                .then(data => {
                    if (data != "fail") {
                        localStorage.setItem('user', user);
                        localStorage.setItem('token', data);
                        Swal.fire({
                            position: "top",
                            icon:   "success",
                            title:  user + ": Checked",
                            showConfirmButton: false,
                            timer:  1500
                        });
                    } else {}
                })
                .catch((error) => {
                    console.error('Error:', error);
                    Swal.fire({
                        position: "top",
                        icon:   "error",
                        title:  '관리자 접속 오류가 발생했습니다.',
                        text:   error,
                        showConfirmButton: false,
                        timer:  1500
                    }).then(() => {
                        admin_authority();
                    });
                });
            }
        });
    }
}
////-------------------////
function dashboard() {
    HTML_scrpit = `<table class="data-table"><thead><tr>
    <th>ID</th><th>이름</th><th>농장</th><th>주소</th><th>전화</th><th>가입날짜</th>
    </tr></thead><tbody>`;
    const user_list = [];
    for (const user_id in user_list) {
        const user_info = user_list[user_id];
        const user_date = new Date(user_info.date);
        HTML_scrpit += `<tr onclick=user_login("${user_id}") style="cursor:pointer;">
            <td>${user_id}</td>
            <td>${user_info.name}</td>
            <td>${user_info.farm}</td>
            <td>${user_info.addr}</td>
            <td>${user_info.tel}</td>
            <td>${user_date.toISOString().substring(0, 10)}</td>
        </tr>`;
    }
    HTML_scrpit += "</tbody></table>"
    document.getElementById("user_table").innerHTML = HTML_scrpit;

    HTML_scrpit = `<table class="data-table"><thead><tr>
    <th>IP</th><th>ID</th><th>firmware</th><th>등록 유저</th></tr></thead><tbody>`;
    const device_list = [];
    for (const device_ip in device_list) {
        if(device_ip != "ver"){
            let ip_once = true;
            for (const device_id in device_list[device_ip]) {
                let version = device_list[device_ip][device_id].VER;
                let version_update = true;
                let user_id = device_list[device_ip][device_id].USER;
                if(version == null){version = "?.?.?";}
                else if(version == device_list.ver){
                    version_update = false;
                    version = "latest ver";
                }
                HTML_scrpit += "<tr>"
                if(ip_once){
                    ip_once = false;
                    HTML_scrpit += `<td>${device_ip}</td>`;
                }else{
                    HTML_scrpit += `<td></td>`;
                }
                HTML_scrpit += `<td>${device_id}</td><td`;
                if(version_update){HTML_scrpit += ` onclick=firmware_update("${device_id}") style="cursor:pointer;"`;}
                HTML_scrpit += `>${version}</td>`;
                if(user_id == null){HTML_scrpit  += `<td onclick=device_regist("${device_ip}","${device_id}")`;}
                else{HTML_scrpit += `<td onclick=device_del("${device_ip}","${device_id}","${user_id}")`;}
                HTML_scrpit += ` style="cursor:pointer;">${user_id}</td></tr>`;
            }
        }
    }
    HTML_scrpit += "</tbody></table>"
    document.getElementById("device_table").innerHTML = HTML_scrpit;
}