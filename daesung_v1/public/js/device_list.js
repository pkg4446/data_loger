equipment();
async function equipment() {
    const sendData = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token')
    };
    const root  = ReactDOM.createRoot(document.getElementById("root"));

    const response = await fetchData("request/list",sendData);
    const device_list = (await response.text()).split('\r\n');
    const devices = {act:[], hub:[]};

    for (const device of device_list) {
        const status = device.split(',');
        if(status[1] == "hub"){
            let hub_child = [];
            sendData.dvid = status[0];
            const list_hub = await(await fetchData("request/hub",sendData)).json();
            console.log(list_hub);
            for (const child_type in list_hub) {
                if(child_type!="list"){
                    const child_list = list_hub[child_type];
                    hub_child.push(
                        React.createElement("div",{className:"device-row"},[
                            React.createElement("div",{className:"device-label"},"LIST - "+child_type)
                        ])
                    );
                    for (const child of child_list) {
                        let child_name = "새 장치";
                        if(list_hub["list"] != null){
                            child_name = list_hub["list"][child_type][child];
                        };
                        hub_child.push(
                            React.createElement("div",{className:"device-row"},[
                                React.createElement("div",{className:"device-label"},child_type),
                                React.createElement("div",{className:"device-label"},child),
                                React.createElement("div",{className:"device-value"},child_name)
                            ])
                        );
                    }
                    console.log(child_list);
                }
            }

            devices.hub.push(
                React.createElement("div",{className:"device-table"},[
                    React.createElement("div",{className:"device-header",onClick:()=>{alert("이름바꾸기")}},status[2]+" 🍯 양봉장"),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"ID"),   //device name
                        React.createElement("div",{className:"device-value"},status[0].replaceAll("_",":"))  //device mac address
                    ]),
                    hub_child
                ])
            );
        }else if(status[1] == "act"){
            sendData.type = "act";
            sendData.dvid = status[0];
            const last_data = await(await fetchData("request/last",sendData)).json();
            const data_date = new Date(last_data.date);
            devices.act.push(
                React.createElement("div",{className:"device-table"},[
                    React.createElement("div",{className:"device-header",onClick:()=>{location.href="/web/act/"+status[0]}},status[2]+" 🐝 출입기록"),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"ID"),   //device name
                        React.createElement("div",{className:"device-value"},status[0].replaceAll("_",":"))  //device mac address
                    ]),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"date"),
                        React.createElement("div",{className:"device-value"},last_data.date),
                    ]),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"total"),
                        React.createElement("div",{className:"device-value"},last_data.sum),
                    ]),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"in"),
                        React.createElement("div",{className:"device-value"},last_data.in),
                    ]),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"out"),
                        React.createElement("div",{className:"device-value"},last_data.out),
                    ])
                ])
            );
        }
    }

    let container = [];
    
    if (devices.act.length > 0) {
        container.push(React.createElement("div",{style:{width:"100%",margin:"auto"}},devices.act));
    }
    if (devices.hub.length > 0) {
        container.push(React.createElement("div",{style:{width:"100%",margin:"auto"}},devices.hub));
    }
    root.render(container);
}