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
async function alert_swal(icon,title) {
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
        alert_swal("info",user + "로 로그인 중입니다.");
    }else{
        Swal.fire({
            position: "top",
            icon:   "question",
            title:  user+"로 로그인 하시겠습니까?",
            showCancelButton: true,
            confirmButtonText: "확인",
            cancelButtonText:  "취소"
        }).then(async(result)=>{
            if(result.isConfirmed){
                const respose = await fetchData("admin/user_login",{token:localStorage.getItem('manager'),user:user});
                if (respose.status==400 || respose.status==403) {
                    alert_swal("error","관리자 접속 오류가 발생했습니다.").then(()=>{admin_logout();});
                }else if (respose.status==200) {
                    const data = await respose.text();
                    if (data != "null") {
                        localStorage.setItem('user', user);
                        localStorage.setItem('token', data);
                        alert_swal("success",user + "로 로그인 되었습니다.");
                    } else {
                        alert_swal("warning",user + "의 키가 없습니다.");
                    }
                }
            }
        });
    }
}
////-------------------////
async function dashboard() {
    HTML_scrpit = `<table class="data-table"><thead><tr>
    <th>ID</th><th>이름</th><th>농장</th><th>주소</th><th>전화</th>
    </tr></thead><tbody>`;
    const user_list = await (await fetchData("admin/user_list",{token:localStorage.getItem('manager')})).json();

    for (const user_id in user_list) {
        const user_info = JSON.parse(user_list[user_id]);
        HTML_scrpit += `<tr onclick=user_login("${user_id}") style="cursor:pointer;">
            <td>${user_id}</td>
            <td>${user_info.name}</td>
            <td>${user_info.farm}</td>
            <td>${user_info.addr}</td>
            <td>${user_info.tel}</td>
        </tr>`;
    }
    HTML_scrpit += "</tbody></table>"
    document.getElementById("user_table").innerHTML = HTML_scrpit;

    HTML_scrpit = `<table class="data-table"><thead><tr>
    <th>종류</th><th>IP</th><th>장비ID</th><th>등록 유저</th></tr></thead><tbody>`;

    // {
    //     "act": {
    //         "::1": {
    //             "2c_cf_67_47_6d_a1": "test",
    //             "2c_cf_67_48_45_93": null
    //         }
    //     },
    //     "hive": {
    //         "::ffff:192.168.1.67": {
    //             "AC_15_18_CD_20_D0": "test"
    //         }
    //     },
    //     "hub": {
    //         "::1": {
    //             "C4_D8_D5_AB_CD_58": "test"
    //         }
    //     }
    // }

    const device_list = await (await fetchData("admin/device_list",{token:localStorage.getItem('manager')})).json();
    console.log(device_list);

    for (const device_type in device_list) {
        const type_list = device_list[device_type];
        let type_once = true;
        for (const device_ip in type_list) {
            const ip_list = type_list[device_ip];
            let ip_once = true;
            for (const device in ip_list) {
                const owner = ip_list[device];
                console.log(device,owner);
                HTML_scrpit += "<tr>"
                if(type_once){
                    type_once = false;
                    HTML_scrpit += `<td>${device_type}</td>`;
                }else{
                    HTML_scrpit += `<td></td>`;
                }
                if(ip_once){
                    ip_once = false;
                    HTML_scrpit += `<td>${device_ip}</td>`;
                }else{
                    HTML_scrpit += `<td></td>`;
                }
                HTML_scrpit += `<td>${device}</td>`;
                HTML_scrpit += `<td>${owner}</td>`;
            }
        }
    }

    HTML_scrpit += "</tbody></table>"
    document.getElementById("device_table").innerHTML = HTML_scrpit;
}