equipment();
async function equipment() {
    const sendData = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token')
    };
    const root  = ReactDOM.createRoot(document.getElementById("root"));

    const response = await fetchData("request/list",sendData);
    const device_list = (await response.text()).split('\r\n');
    const devices = {hub:[],act:[]};

    for (const device of device_list) {
        const status = device.split(',');
        if(status[1] == "hub"){
            let hub_child = [];
            sendData.type = "hub";
            sendData.dvid = status[0];
            const list_hub = await(await fetchData("request/hub",sendData)).json();

            for (const child_type in list_hub) {
                if(child_type!="list"){
                    const child_list = list_hub[child_type];
                    let   type_name = "벌통"
                    for (const child in child_list) {
                        let child_name = "새 장치";
                        if(list_hub["list"] != null){
                            child_name = list_hub["list"][child_type][child];
                        };
                        if(child_list[child] == null){
                            hub_child.push(
                                React.createElement("div",{className:"device-child"},
                                    React.createElement("div",{className:"child-table"},[
                                        React.createElement("div",{className:"child-header"},type_name + ": " + child_name),
                                        React.createElement("div",{className:"device-row"},[
                                            React.createElement("div",{className:"device-label"},"ID"),  //device name
                                            React.createElement("div",{className:"device-value"},child)  //device mac address
                                        ])
                                    ])
                                )
                            );
                        }else{
                            const child_data = JSON.parse(child_list[child]);
                            const data_date = new Date(child_data.date);
                            const date_str = `${data_date.getFullYear()}/${data_date.getMonth()}/${data_date.getDate()},${data_date.getHours()}:${data_date.getMinutes()}:${data_date.getSeconds()}`;
                            console.log(child_data);
                            if(child_data.runt == 0) child_data.runt = 1;
                            hub_child.push(
                                React.createElement("div",{className:"device-child"},
                                    React.createElement("div",{className:"child-table"},[
                                        React.createElement("div",{className:"child-header"},type_name + ": " + child_name),
                                        React.createElement("div",{className:"device-row"},[
                                            React.createElement("div",{className:"device-label"},"ID"),  //device name
                                            React.createElement("div",{className:"device-value"},child)  //device mac address
                                        ]),
                                        React.createElement("div",{className:"device-row"},[
                                            React.createElement("div",{className:"device-label"},"시간"),
                                            React.createElement("div",{className:"device-value"},date_str),
                                        ]),
                                        React.createElement("div",{className:"device-row"},[
                                            React.createElement("div",{className:"device-label"},"온도🌡️"),
                                            React.createElement("div",{className:"device-value"},child_data.temp+"°C"),
                                        ]),
                                        React.createElement("div",{className:"device-row"},[
                                            React.createElement("div",{className:"device-label"},"습도💧"),
                                            React.createElement("div",{className:"device-value"},child_data.humi+" %"),
                                        ]),
                                        React.createElement("div",{className:"device-row"},[
                                            React.createElement("div",{className:"device-label"},"출력🔥"),
                                            React.createElement("div",{className:"device-value"},Math.round((child_data.work/child_data.runt)*40)+" W"),
                                        ]),
                                    ])
                                )
                            );
                        }
                    }
                }
            }
            devices.hub.push(
                React.createElement("div",{className:"device-table"},[
                    React.createElement("div",{className:"device-header"},status[2]+" 🍯 양봉장"),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"ID"),   //device name
                        React.createElement("div",{className:"device-value"},status[0].replaceAll("_",":"))  //device mac address
                    ]),
                    React.createElement("div", { className: "device-row" }, [
                        React.createElement("div", { 
                          className: "device-button", 
                          onClick: () => unconnect(status[1],status[0])
                        }, "장비삭제"),
                        React.createElement("div", { 
                          className: "device-button", 
                          onClick: () => rename(status[1],status[0])
                        }, "이름변경")
                    ]),
                    hub_child
                ])
            );
        }else if(status[1] == "act"){
            sendData.type = "act";
            sendData.dvid = status[0];
            const last_data = await(await fetchData("request/last",sendData)).json();
            const data_date = new Date(last_data.date);
            const date_str = `${data_date.getFullYear()}/${data_date.getMonth()}/${data_date.getDate()},${data_date.getHours()}:${data_date.getMinutes()}:${data_date.getSeconds()}`;
            devices.act.push(
                React.createElement("div",{className:"device-table"},[
                    React.createElement("div",{className:"device-header",onClick:()=>{location.href="/web/act/"+status[0]}},status[2]+" 🐝 출입기록"),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"ID"),   //device name
                        React.createElement("div",{className:"device-value"},status[0].replaceAll("_",":"))  //device mac address
                    ]),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"시간"),
                        React.createElement("div",{className:"device-value"},date_str),
                    ]),
                    React.createElement("div", { className: "device-row" }, [
                        React.createElement("div", { 
                          className: "device-button", 
                          onClick: () => unconnect(status[1],status[0])
                        }, "장비삭제"),
                        React.createElement("div", { 
                          className: "device-button", 
                          onClick: () => rename(status[1],status[0])
                        }, "이름변경")
                    ]),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"합계"),
                        React.createElement("div",{className:"device-value"},last_data.sum),
                    ]),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"출"),
                        React.createElement("div",{className:"device-value"},last_data.in),
                    ]),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"입"),
                        React.createElement("div",{className:"device-value"},last_data.out),
                    ])
                ])
            );
        }
    }
    let container = [];
    for (const key in devices) {
        if (devices[key].length > 0) {
            container.push(React.createElement("div",{style:{width:"100%",margin:"auto"}},devices[key]));
        }
    }
    root.render(container);
}

function unconnect(type,dvid) {
    Swal.fire({
        position: "top",
        icon:   "question",
        title:  "장비를 제거합니까?",
    }).then(async (result)=>{
        if(result.isConfirmed){
            const response = await fetchData("request/disconnect",{
                id:     localStorage.getItem('user'),
                token:  localStorage.getItem('token'),
                type:   type,
                dvid:   dvid
            });
            console.log(response);
            if(response.status == 200){
                Swal.fire({
                    position: "top",
                    icon:   "success",
                    title:  "제거 되었습니다.",
                    showConfirmButton: false,
                    timer:  1500
                });
            }
        }                
    });
}

function rename(type,dvid) {
    Swal.fire({
        position: "top",
        icon:   "info",
        title:  "이름 바꾸기",
        input:  'text',
    }).then(async(result)=>{
        if(result.isConfirmed && result.value.length > 0){
            const response = await fetchData("request/device_rename",{
                id:     localStorage.getItem('user'),
                token:  localStorage.getItem('token'),
                type:   type,
                dvid:   dvid,
                name:   result.value
                });
                console.log(response);
                if(response.status == 200){
                    Swal.fire({
                    position: "top",
                    icon:   "success",
                    title:  "변경되었습니다.",
                    showConfirmButton: false,
                    timer:  1500
                });
            }
        }                
    })
}