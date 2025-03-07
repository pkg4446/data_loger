equipment();
async function equipment() {
    const sendData = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token')
    };
    const root  = ReactDOM.createRoot(document.getElementById("root"));

    const response = await fetchData("device/list",sendData);
    const device_list = (await response.text()).split('\r\n');
    
    const devices = {act:[], hive:[]};

    for (const device of device_list) {
        const status = device.split(',');
        if(status[1] == "hive"){
            console.log(status);
        }else if(status[1] == "act"){
            sendData.type = "act";
            sendData.dvid = status[0];
            const last_data = await(await fetchData("device/last",sendData)).json();
            devices.act.push(
                React.createElement("div",{className:"device-table"},[
                    React.createElement("div",{className:"device-header",onClick:()=>{location.href="/web/act/"+status[0]}},status[2]+" 🐝 출입기록"),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"ID"),   //device name
                        React.createElement("div",{className:"device-value"},status[0].replaceAll("_",":"))  //device mac address
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
                    ]),
                ])
            );
        }
    }

    let container = [];
    
    if (devices.act.length > 0) {
        container.push(React.createElement("div",{style:{width:"100%",margin:"auto"}},devices.act));
    }
    root.render(container);
}