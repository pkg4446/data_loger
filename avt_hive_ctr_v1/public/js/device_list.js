const calibration = 2;
let view_locker = false;
if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    window.location.href = '/web/login';
}else{
    document.getElementById("lock_btn").innerHTML  = `<div class="btnbox"><span class="btn" id="view_lock" onclick=lock_shift()>화면 잠김</span> <span class="btn" onclick=fetch_equipment(false) style="background-color:blue;"">데이터 갱신</span></div>`;
    fetch_user_info();
    fetch_equipment(true);
    setInterval(() => fetch_equipment(false), 150*1000);
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
function lock_shift() {
    view_locker = !view_locker;
    const view_lock = document.getElementById("view_lock");
    if(view_locker){
        view_lock.innerText = "화면 풀림";
        view_lock.style.backgroundColor = "#4ce73c";

    }else{
        view_lock.innerText = "화면 잠김";
        view_lock.style.backgroundColor = "#e74c3c";
    }
}
////-------------------////
function pump_log(macaddr) {
    if(view_locker){
        localStorage.setItem('macaddr', macaddr);
        window.location.href = '/web/pump_log';
    }
}
////-------------------////
function device_detail(macaddr,devid) {
    if(view_locker){
        localStorage.setItem('macaddr', macaddr);
        localStorage.setItem('device', devid);
        window.location.href = '/web/select';
    }
}
////-------------------////
function device_25_detail(macaddr,devid) {
    if(view_locker){
        localStorage.setItem('macaddr', macaddr);
        localStorage.setItem('device_25', devid);
        window.location.href = '/web/select_25';
    }
}
////-------------------////
function device_rename(type,devid) {
    if(view_locker){
        Swal.fire({
            title: "장비 이름",
            input: "text",
            showCancelButton: true,
            inputPlaceholder: "변경할 이름을 입력하세요.",
            confirmButtonText: "변경",
            cancelButtonText:  "취소"
        }).then((result) => {
            if (result.isConfirmed){
                const device_name = result.value.replaceAll(" ","");
                if(device_name === ""){
                    Swal.fire({
                        title: "이름이 없습니다.",
                        text: "이름을 입력하세요.",
                        icon: "error"
                    });
                }else{
                    fetch_device_rename(type,devid,device_name);
                }
            }
        });
    }
}
////-------------------////
function pump_config_set(title,macaddr,index,code) {
    if(view_locker){
        const init_value = document.getElementById(macaddr+code).innerText;
        Swal.fire({
            title: title,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "설정",
            cancelButtonText:  "취소",
            input: "range",
            inputLabel: "시간",
            inputAttributes: {
                min: 0,
                max: 23,
                step: 1
        },
            inputValue: init_value.replace("시","")            
        }).then((result) => {
            if (result.isConfirmed){
                const post_data = {
                    id:     localStorage.getItem('user'),
                    token:  localStorage.getItem('token'),
                    dvid:   macaddr,
                    index:  index,
                    time:  result.value
                }
                fetch(window.location.protocol+"//"+window.location.host+"/pump/setup", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(post_data)
                }).then(response => {
                    if(response.status==200){document.getElementById(macaddr+code).innerText = result.value+"시";}
                })
            }
        });
    }
}
////-------------------////
function goal_temp_change(api,gorl_devid,devid,index_num) {
    if(view_locker){
        let init_value = 0;
        if(index_num == 5 ) init_value = parseInt(document.getElementById(gorl_devid).innerText);
        else init_value = parseInt(document.getElementById(gorl_devid+index_num).innerText);
        Swal.fire({
            title: "가온 목표온도",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "설정",
            cancelButtonText:  "취소",
            input: "range",
            inputLabel: "목표온도",
            inputAttributes: {
                min: "-"+calibration,
                max: "35",
                step: "1"
        },
            inputValue: init_value
        }).then((result) => {
            if (result.isConfirmed){
                const set_value = parseInt(result.value);
                if(api=="hive"){
                    const value_number = 5;
                    let temperature = [];
                    
                    if(index_num == value_number){
                        for (let index = 0; index < value_number; index++) {
                            temperature.push(parseInt(set_value));
                            document.getElementById(gorl_devid+index).innerText = set_value;
                        }
                    }else{
                        for (let index = 0; index < value_number; index++) {
                            if(index_num == index){
                                temperature.push(parseInt(set_value));
                                document.getElementById(gorl_devid+index).innerText = set_value;
                            }else temperature.push(parseInt(document.getElementById(gorl_devid+index).innerText))
                        }
                    }
                    let temperature_avg = 0;
                    for (let index = 0; index < value_number; index++) {
                        temperature_avg += temperature[index];
                        temperature[index] += calibration;
                    }
                    temperature_avg = temperature_avg/value_number;

                    fetch_equipment_heater(api,devid,true,temperature);
                    document.getElementById(gorl_devid).innerText = temperature_avg;
                }else{
                    fetch_equipment_heater(api,devid,true,set_value);
                    document.getElementById(gorl_devid).innerText = set_value;
                }
            }
        });        
    }
}
////-------------------////
function temp_assist_change(api,temp_devid,devid) {
    if(view_locker){
        const heat_text = "가온 기능: ";
        Swal.fire({
            title: "가온 기능",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "사용",
            cancelButtonText:  "정지"
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById(temp_devid).innerHTML = heat_text+"ON";
                fetch_equipment_heater(api,devid,false,1);
                Swal.fire({
                    title: "ON",
                    text: "가온 기능을 사용합니다.",
                    icon: "success"
                });
                } else if(result.dismiss === "cancel"){
                document.getElementById(temp_devid).innerHTML = heat_text+"OFF";
                fetch_equipment_heater(api,devid,false,0);
                Swal.fire({
                    title: "OFF",
                    text: "가온 기능을 정지합니다.",
                    icon: "error"
                });
            }
        });
    }
}
////-------------------////
function getdata_pump(send_data, device){
    fetch(window.location.protocol+"//"+window.location.host+"/pump/config", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({...send_data, dvid:device[0]})
    })
    .then(response => {
        if (response.status==400 || response.status==401) {
            alert_swal("error",'로그인 정보가 없습니다.');
        }else if (response.status==403) {
            // alert_swal("error",'등록되지 않은 장비입니다.');
        }
        return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .then(data => {
        const response = data.split("\r\n");
        const pump_data = JSON.parse(response[0]);
        const pump_config = JSON.parse(response[1]);
        if(pump_config.set == null){pump_config.set=[12,12,12,12,12,12];}

        let HTML_script =  `<div class="pump-row">
                            <div class="cell" id="${device[0]}" onclick=device_rename("pump","${device[0]}") style="cursor:pointer;">${device[1]}</div>
                            <div class="cell header">${device[0]}</div>`;

        if(response[0]!="null"){
            const today = new Date();
            today.setHours(today.getHours()-1);
            const data_date = new Date(pump_data.date);

            const liquid_hight = 60;
            let level_water = liquid_hight-parseInt(pump_data.DATA.sona1);
            if(level_water < 0) level_water = 0;
            let level_honey = liquid_hight-parseInt(pump_data.DATA.sona2);
            if(level_honey < 0) level_honey = 0;

            HTML_script += `<div class="cell humidity" onclick=pump_log("${device[0]}")>급수💧:${level_water*2} L</div>`;
            HTML_script += `<div class="cell temp-air" onclick=pump_log("${device[0]}")>사양🍯:${level_honey*2} L</div></div>`;
            HTML_script += ``;

            if(today>data_date){
                HTML_script+= `<div class="menu-row">
                                    <div class="cell warning" onclick=fetch_equipment_disconnect("pump",'${device[0]}') style="cursor:pointer;">장비 삭제</div>
                                    <div class="cell warning">마지막 기록 : ${data_date.getFullYear()}년 ${data_date.getMonth()+1}월 ${data_date.getDate()}일 ${data_date.getHours()}시 ${data_date.getMinutes()}분</div>
                                </div>`;
            }

            HTML_script += `<div class="pump-row">`;
            HTML_script += `<div class="cell temp-warm">온도🌡️</div><div class="cell">${pump_data.DATA.temp}°C</div>
                            <div class="cell humidity" >습도💧</div><div class="cell">${pump_data.DATA.humi} %</div></div>`;

            HTML_script += `</div><div class="data-row">`;
            HTML_script += `<div class="cell humidity">급수💧</div>
                            <div class="cell header" onclick=pump_config_set("급수💧시작","${device[0]}",2,"ws")>시작</div><div id="${device[0]}ws" class="cell">${pump_config.set[2]}시</div>
                            <div class="cell header" onclick=pump_config_set("급수💧종료","${device[0]}",3,"we")>종료</div><div id="${device[0]}we" class="cell">${pump_config.set[3]}시</div>`;

            HTML_script += `<div class="cell temp-air">사양🍯</div>
                            <div class="cell header" onclick=pump_config_set("사양🍯시작","${device[0]}",4,"ss")>시작</div><div id="${device[0]}ss" class="cell">${pump_config.set[4]}시</div>
                            <div class="cell header" onclick=pump_config_set("사양🍯종료","${device[0]}",5,"se")>종료</div><div id="${device[0]}se" class="cell">${pump_config.set[5]}시</div>`;
            
            // HTML_script += `<div class="cell temp-warm">열선🔥</div>
            //                 <div class="cell header" onclick=pump_config_set("열선🔥시작","${device[0]}",0,"hs")>시작</div><div id="${device[0]}hs" class="cell">${pump_config.set[0]}시</div>
            //                 <div class="cell header" onclick=pump_config_set("열선🔥종료","${device[0]}",1,"he")>종료</div><div id="${device[0]}he" class="cell">${pump_config.set[1]}시</div></div>`;
        }else{
            HTML_script += `<div class="menu-row">
                                <div class="cell warning" onclick=fetch_equipment_disconnect("pump",'${device[0]}') style="cursor:pointer;">장비 삭제</div>
                                <div class="cell warning">마지막 기록 : ${data_date.getFullYear()}년 ${data_date.getMonth()+1}월 ${data_date.getDate()}일 ${data_date.getHours()}시 ${data_date.getMinutes()}분</div>
                            </div>`;
        }

        document.getElementById("unit_"+device[0]).innerHTML = HTML_script;
    });
}
////-------------------////
function getdata_hive(send_data, device){
    const hive_num = 5;
    fetch(window.location.protocol+"//"+window.location.host+"/hive/config", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({...send_data, dvid:device[0]})
    })
    .then(response => {
        if (response.status==200) return response.text();// JSON 대신 텍스트로 응답을 읽습니다.
        if (response.status==400 || response.status==401) {
            alert_swal("error",'로그인 정보가 없습니다.');
        }else if (response.status==403) {
            // alert_swal("error",'등록되지 않은 장비입니다.');
        }
        console.log(device);
        return "null";
    })
    .then(data => {
        const response = data.split("\r\n");
        const gorl_devid = "goal_"+device[0];
        const heat_devid = "heat_"+device[0];

        let HTML_script  = `<div class="unit-info">
                                <div class="cell" id="${device[0]}" onclick=device_rename("hive","${device[0]}") style="cursor:pointer;">${device[1]}</div>
                                <div class="cell">${device[0]}</div>`;
        if(response[0]!="null"){
            const device_log    = JSON.parse(response[0]);
            const device_config = JSON.parse(response[1]);

            const bar_number = 4;
            const today = new Date();
            today.setHours(today.getHours()-1);
            const data_date = new Date(device_log.date);

            HTML_script+= `<div class="cell" id="${heat_devid}" onclick=temp_assist_change("hive","${heat_devid}","${device[0]}") `;
            if(device_config.dv != null && device_config.dv[device_config.dv.length-1] === device_config.ab) HTML_script+= 'style="background-color:Chartreuse'
            else HTML_script+= 'style="background-color:Yellow'
            HTML_script+= ';cursor:pointer;"'
            
            if(device_config.ab === '1'){
                HTML_script+= ">가온 기능: ON</div>";
            }else{
                HTML_script+= ">가온 기능: OFF</div>";
            }

            let average_value   = 0;
            if( device_config.th != null){
                for (let index = 0; index < hive_num; index++) {
                    average_value += parseInt(device_config.th[index]);
                }
            }else{
                device_config.th = [0,0,0,0,0];
            }

            let average_value_check = 0;
            if( device_config.dv != null){
                for (let index = 0; index < device_config.dv.length-1; index++) {
                    average_value_check += parseInt(device_config.dv[index]);
                }
            }
            HTML_script+= `<div class="cell" onclick=goal_temp_change("hive","${gorl_devid}","${device[0]}",5,null) `;
            if(average_value === average_value_check){
                HTML_script+= 'style="background-color:Chartreuse'
            }else{
                HTML_script+= 'style="background-color:Yellow';
            }
            HTML_script+= `;cursor:pointer;">가온 평균:<span id="${gorl_devid}">${Math.round(average_value/hive_num)-calibration}</span>°C</div></div>`;
            if(today>data_date){
                HTML_script+= `<div class="menu-row">
                                    <div class="cell warning" onclick=fetch_equipment_disconnect("hive",'${device[0]}') style="cursor:pointer;">장비 삭제</div>
                                    <div class="cell warning">마지막 기록 : ${data_date.getFullYear()}년 ${data_date.getMonth()+1}월 ${data_date.getDate()}일 ${data_date.getHours()}시 ${data_date.getMinutes()}분</div>
                                </div>`;
            }
            if(device_config.ab === '1') HTML_script+= `<div class="data-row-full">`;
            else HTML_script+= `<div class="data-row">`;
            HTML_script+=   `<div class="cell header">번호</div>
                            <div class="cell header">공간 °C</div>
                            <div class="cell header">봉구 °C</div>
                            <div class="cell header">습도 %</div>`;
            if(device_config.ab === '1') HTML_script+=  `<div class="cell header">가온 출력</div>`;
            HTML_script+=   `<div class="cell header">가온 °C</div>
                                </div><div>`;
            for (let index = 0; index < hive_num; index++) {
                if(device_config.ab === '1') HTML_script+= `<div class="data-row-full">`;
                else HTML_script+= `<div class="data-row">`;
                HTML_script+=  `<div class="cell"           onclick=device_detail("${device[0]}","${device[1]}") style="cursor:pointer;">${index+1}</div>
                                <div class="cell temp-air"  onclick=device_detail("${device[0]}","${device[1]}") style="cursor:pointer;">${(parseFloat(device_log["TM"][index])-calibration).toFixed(1)}</div>
                                <div class="cell temp-warm" onclick=device_detail("${device[0]}","${device[1]}") style="cursor:pointer;">${parseFloat(device_log["IC"][index]).toFixed(1)}</div>
                                <div class="cell humidity"  onclick=device_detail("${device[0]}","${device[1]}") style="cursor:pointer;">${parseInt(device_log["HM"][index])}</div>`;
                if(device_config.ab === '1'){
                    HTML_script+=   `<div class="cell"><div class="progress-bars">`;
                                        const bar_percent = Math.round(device_log.WK[index]/device_log.GAP*100);
                                        const bar_ratio   = (100/bar_number).toFixed(1);
                                        const bar_fill    = (bar_percent/bar_ratio).toFixed(1);
                                        
                                        for (let index_bar = 0; index_bar < bar_number; index_bar++) {
                                            if(index_bar>=bar_number-bar_fill){
                                                HTML_script+= `<div class="bar"><div class="bar-fill" style="width:100%"></div></div>`;
                                            }else{
                                                if(bar_number-bar_fill-index_bar-1 < 0){
                                                    HTML_script+= `<div class="bar"><div class="bar-fill" style="width:${Math.round((bar_fill-Math.floor(bar_fill))*100)}%"></div></div>`;
                                                }else{HTML_script+= `<div class="bar"><div class="bar-fill"></div></div>`;}
                                            }
                                        }
                    HTML_script+=   "</div></div>";
                }
                HTML_script+= `<div class="cell header"    onclick=goal_temp_change("hive","${gorl_devid}","${device[0]}",${index},${device_config.dv}) style="cursor:pointer;"><span id="${gorl_devid+index}">${device_config.th[index]-calibration}</span></div></div>`;
            }
        }else{
            HTML_script+= `    <div class="cell" id="${heat_devid}" onclick=temp_assist_change("hive","${heat_devid}","${device[0]}")>가온 기능: OFF</div>
                                <div class="cell" onclick=goal_temp_change("hive","${gorl_devid}","${device[0]}",5,null)>목표:<span id="${gorl_devid}">0</span>°C</div>
                            </div>
                            <div class="menu-row">
                                <div class="cell warning" onclick=fetch_equipment_disconnect("hive",'${device[0]}') style="cursor:pointer;">장비 삭제</div>
                                <div class="cell warning">데이터가 없음</div>
                            </div>`;
        }
        HTML_script+= "</div>"
        document.getElementById("unit_"+device[0]).innerHTML = HTML_script;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function getdata_hive_25(send_data, device){
    fetch(window.location.protocol+"//"+window.location.host+"/hive_25/config", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({...send_data, dvid:device[0]})
    })
    .then(response => {
        if (response.status==400 || response.status==401) {
            alert_swal("error",'로그인 정보가 없습니다.');
        }else if (response.status==403) {
            // alert_swal("error",'등록되지 않은 장비입니다.');
        }
        return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .then(data => {
        const response = data.split("\r\n");
        const gorl_devid = "goal_"+device[0];
        const heat_devid = "heat_"+device[0];

        let HTML_script  = `<div class="unit-info">
                                <div class="cell" id="${device[0]}" onclick=device_rename("hive","${device[0]}") style="cursor:pointer;">${device[1]}</div>
                                <div class="cell">${device[0]}</div>`;
        if(response[0]!="null"){
            const device_log    = JSON.parse(response[0]);
            const device_config = JSON.parse(response[1]);
            
            const bar_number = 4;
            const today = new Date();
            today.setHours(today.getHours()-1);
            const data_date = new Date(device_log.date);

            HTML_script+= `<div class="cell" id="${heat_devid}" onclick=temp_assist_change("hive_25","${heat_devid}","${device[0]}") `;
            if(device_config.dv != null && device_config.dv[device_config.dv.length-1] === device_config.ab) HTML_script+= 'style="background-color:Chartreuse'
            else HTML_script+= 'style="background-color:Yellow'
            HTML_script+= ';cursor:pointer;"'
            
            if(device_config.ab === '1'){
                HTML_script+= ">가온 기능: ON</div>";
            }else{
                HTML_script+= ">가온 기능: OFF</div>";
            }

            let average_value   = 0;
            if( device_config.th != null){
                average_value += parseInt(device_config.th);
            }else{
                device_config.th = 0;
            }

            let average_value_check = 0;
            if( device_config.dv != null){
                for (let index = 0; index < device_config.dv.length-1; index++) {
                    average_value_check += parseInt(device_config.dv);
                }
            }
            HTML_script+= `<div class="cell" onclick=goal_temp_change("hive_25","${gorl_devid}","${device[0]}",5,null) `;
            if(average_value === average_value_check){
                HTML_script+= 'style="background-color:Chartreuse'
            }else{
                HTML_script+= 'style="background-color:Yellow';
            }

            HTML_script+= `;cursor:pointer;">가온:<span id="${gorl_devid}">${Math.round(average_value)}</span>°C</div></div>`;

            if(today>data_date){
                HTML_script+= `<div class="menu-row">
                                    <div class="cell warning" onclick=fetch_equipment_disconnect("hive_25",'${device[0]}') style="cursor:pointer;">장비 삭제</div>
                                    <div class="cell warning">마지막 기록 : ${data_date.getFullYear()}년 ${data_date.getMonth()+1}월 ${data_date.getDate()}일 ${data_date.getHours()}시 ${data_date.getMinutes()}분</div>
                                </div>`;
            }

            HTML_script+=   `<div class="data-row">
                            <div class="cell header">외벽 °C</div>
                            <div class="cell header">공간 °C</div>
                            <div class="cell header">봉구 °C</div>
                            <div class="cell header">습도 %</div>
                            <div class="cell header">가온 출력</div>
                            </div><div><div class="data-row">
                            <div class="cell"           onclick=device_25_detail("${device[0]}","${device[1]}") style="cursor:pointer;">${(parseFloat(device_log["TP"][0])).toFixed(1)}</div>
                            <div class="cell temp-air"  onclick=device_25_detail("${device[0]}","${device[1]}") style="cursor:pointer;">${(parseFloat(device_log["TP"][1])).toFixed(1)}</div>
                            <div class="cell temp-warm" onclick=device_25_detail("${device[0]}","${device[1]}") style="cursor:pointer;">${parseFloat(device_log["TP"][2]).toFixed(1)}</div>
                            <div class="cell humidity"  onclick=device_25_detail("${device[0]}","${device[1]}") style="cursor:pointer;">${parseInt(device_log["HM"][2])}</div>`;
            HTML_script+=   `<div class="cell"><div class="progress-bars">`;
                const bar_percent = Math.round(device_log.WK/device_log.GAP*100);
                const bar_ratio   = (100/bar_number).toFixed(1);
                const bar_fill    = (bar_percent/bar_ratio).toFixed(1);
                
                for (let index_bar = 0; index_bar < bar_number; index_bar++) {
                    if(index_bar>=bar_number-bar_fill){
                        HTML_script+= `<div class="bar"><div class="bar-fill" style="width:100%"></div></div>`;
                    }else{
                        if(bar_number-bar_fill-index_bar-1 < 0){
                            HTML_script+= `<div class="bar"><div class="bar-fill" style="width:${Math.round((bar_fill-Math.floor(bar_fill))*100)}%"></div></div>`;
                        }else{HTML_script+= `<div class="bar"><div class="bar-fill"></div></div>`;}
                    }
                }
            HTML_script+=   "</div></div></div>";



        }else{
            HTML_script+= `    <div class="cell" id="${heat_devid}" onclick=temp_assist_change("hive_25","${heat_devid}","${device[0]}")>가온 기능: OFF</div>
                                <div class="cell" onclick=goal_temp_change("hive_25","${gorl_devid}","${device[0]}",5,null)>목표:<span id="${gorl_devid}">0</span>°C</div>
                            </div>
                            <div class="menu-row">
                                <div class="cell warning" onclick=fetch_equipment_disconnect("hive_25",'${device[0]}') style="cursor:pointer;">장비 삭제</div>
                                <div class="cell warning">데이터가 없음</div>
                            </div>`;
        }
        HTML_script+= "</div>"
        document.getElementById("unit_"+device[0]).innerHTML = HTML_script;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
////-------------------////
function list_shift(device_list,swap_a,swap_b) {
    if(view_locker){
        let devices = [];
        if(swap_a != null && swap_b != null){
            for (let index = 0; index < device_list.length; index++) {
                if(index == swap_a){devices.push(device_list[swap_b]);}
                else if(index == swap_b){devices.push(device_list[swap_a]);}
                else{devices.push(device_list[index]);}
            }
        }else{
            devices = device_list;
        }
        let HTML_script = "<br>";
        for (let index = 0; index < devices.length; index++) {
            const device = devices[index].split(",");
            HTML_script += `<div class="unit-info">
                    <div class="cell" id="${device[0]}">${device[1]}</div>
                    <div class="cell">${device[0]}</div>`
            if(index == 0)  HTML_script += `<div class="cell">위로</div>`
            else            HTML_script += `<div class="cell" onclick=list_shift(${JSON.stringify(devices)},${index},${index-1})>위로</div>`
            
            if(index == devices.length-1) HTML_script += `<div class="cell">아래로</div>`
            else                          HTML_script += `<div class="cell" onclick=list_shift(${JSON.stringify(devices)},${index},${index+1})>아래로</div>`
            HTML_script += "</div>";
        }
        HTML_script += `<div class="btn" style="background-color:#4ce73c;" onclick=fetch_list_change(${JSON.stringify(devices)})>확인</div>`;
        
        document.getElementById('farm_section_device').innerHTML = HTML_script;
    }
}
////-------------------////
function fetch_list_change(device_list) {
    const post_data = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token'),
        list:   device_list
    }
    fetch(window.location.protocol+"//"+window.location.host+"/hive/list_arrange", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post_data)
    })
    .then(response => {
        if (response.status==400 || response.status==406) {
            alert_swal("error",'로그인 정보가 없습니다.');
            window.location.href = '/web/login';
        }else{
            alert_swal("info",'벌통을 정렬 했습니다.');
            fetch_equipment(true);
        }
        return; // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .catch(error => {
        console.log(error);
    });
}
////-------------------////
async function fetch_equipment(init) {
    let HTML_script = "<br>";
    // 여기에 실제 서버 URL을 입력하세요
    const today = new Date();
    const post_data = {
        date:   [today.getFullYear(),today.getMonth(),today.getDate()],
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token')
    }
    const pump = await fetch(window.location.protocol+"//"+window.location.host+"/pump/list", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post_data)
    });

    const hive = await fetch(window.location.protocol+"//"+window.location.host+"/hive/list", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post_data)
    });

    const hive_25 = await fetch(window.location.protocol+"//"+window.location.host+"/hive_25/list", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post_data)
    });

    if (pump.status==400 || pump.status==401) {
        alert_swal("error",'로그인 정보가 없습니다.');
        window.location.href = '/web/login';
    }else if (pump.status==403 && hive.status==403) {
        alert_swal("error",'등록된 장비가 없습니다.');
        window.location.href = '/web/connect';
    }

    if (pump.status==200) {
        const devices = (await pump.text()).split("\r\n");
        let pump_list = [];
        if(init){
            for (let index = 0; index < devices.length; index++) {
                const device = devices[index].split(",");
                pump_list.push(device);
                HTML_script+= `<div class="unit-section" id="unit_${device[0]}"></div>`;
            }
            document.getElementById('farm_section_pump').innerHTML = HTML_script;
            HTML_script = "";
        }
        for (let index = 0; index < pump_list.length; index++) {
            getdata_pump(post_data,pump_list[index]);
        }
    }
    
    if (hive.status==200) {
        const devices = (await hive.text()).split("\r\n");
        let device_list = [];
        if(init){
            for (let index = 0; index < devices.length; index++) {
                const device = devices[index].split(",");
                if(device[0] == "") continue;
                device_list.push(device);
                HTML_script+= `<div class="unit-section" id="unit_${device[0]}"></div>`;
            }
            HTML_script += `<div class="btn" onclick=list_shift(${JSON.stringify(devices)},${null},${null})>벌통x5 정렬</div><br>`;
            document.getElementById('farm_section_device').innerHTML = HTML_script;
            HTML_script = "";
        }
        for (let index = 0; index < device_list.length; index++) {
            getdata_hive(post_data,device_list[index]);
        }
    }

    if (hive_25.status==200) {
        const devices = (await hive_25.text()).split("\r\n");
        let device_list = [];
        if(init){
            for (let index = 0; index < devices.length; index++) {
                const device = devices[index].split(",");
                if(device[0] == "") continue;
                device_list.push(device);
                HTML_script+= `<div class="unit-section" id="unit_${device[0]}"></div>`;
            }
            HTML_script += `<div class="btn" onclick=list_shift(${JSON.stringify(devices)},${null},${null})>벌통 정렬</div>`;
            document.getElementById('farm_section_device_25').innerHTML = HTML_script;
        }
        for (let index = 0; index < device_list.length; index++) {
            getdata_hive_25(post_data,device_list[index]);
        }
    }
}
////-------------------////
function fetch_user_info() {
    // 여기에 실제 서버 URL을 입력하세요
    const post_data = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token'),
    }
    fetch(window.location.protocol+"//"+window.location.host+"/user/info", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post_data)
    })
    .then(response => {
        if (response.status==400 || response.status==406) {
            alert_swal("error",'로그인 정보가 없습니다.');
            window.location.href = '/web/login';
        }
        return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .then(data => {
        const user_info = data.split(",");
        document.getElementById('user_name').innerText = user_info[0];
        document.getElementById('farm_name').innerText = user_info[1];
        document.getElementById('farm_addr').innerText = user_info[2];
    })
    .catch(error => {
        console.log(error);
    });
}
////-------------------////
function fetch_equipment_disconnect(type,device_id) {
    if(view_locker){
        Swal.fire({
            title: "장비 삭제",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "삭제",
            cancelButtonText:  "취소"
        }).then((result) => {
            if (result.isConfirmed){
                const post_data = {
                    id:     localStorage.getItem('user'),
                    token:  localStorage.getItem('token'),
                    dvid:   device_id
                }
                fetch(window.location.protocol+"//"+window.location.host+"/"+type+"/disconnect", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(post_data)
                })
                .then(response => {
                    if (response.status==400 || response.status==401) {
                        alert_swal("error",'로그인 정보가 없습니다.');
                        window.location.href = '/web/login';
                    }else if (response.status==403) {
                        alert_swal("warning","등록된 장비가 없습니다.");
                    }else if (response.status==200) {
                        document.getElementById(`unit_${device_id}`).innerHTML="";
                        alert_swal("success","장비등록을 해제했습니다.");                        
                    }
                })
                .catch(error => {
                    console.log(error);
                });
            }
        });
    }
}
////-------------------////
function fetch_device_rename(type,device_id,device_name) {
    if(view_locker){
        const post_data = {
            id:     localStorage.getItem('user'),
            token:  localStorage.getItem('token'),
            dvid:   device_id,
            name:   device_name
        }
        fetch(window.location.protocol+"//"+window.location.host+"/"+type+"/devicerename", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(post_data)
        })
        .then(response => {
            if (response.status==400 || response.status==401) {
                alert_swal("error",'로그인 정보가 없습니다.');
                window.location.href = '/web/login';
            }else if (response.status==403) {
                alert_swal("warning","등록된 장비가 없습니다.");
            }else if (response.status==200) {
                document.getElementById(`${device_id}`).innerText = device_name;
                alert_swal("success","장비 이름을 변경했습니다.");
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
}
////-------------------////
function fetch_equipment_heater(api,device_id,func,value) {
    // 여기에 실제 서버 URL을 입력하세요
    const post_data = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token'),
        dvid:   device_id,
        func:   func,
        value:  value
    }
    fetch(window.location.protocol+"//"+window.location.host+"/"+api+"/heater", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post_data)
    })
    .then(response => {
        if (response.status==400 || response.status==401) {
            alert_swal("error",'로그인 정보가 없습니다.');
            window.location.href = '/web/login';
        }else if (response.status==403) {
            alert_swal("warning","등록된 장비가 없습니다.");
        }else if (response.status==200) {
            alert_swal("success","설정이 적용 되었습니다.");
        }
    })
    .catch(error => {
        console.log(error);
    });
}
////--------------------------------------------------------------------////