equipment();
async function equipment() {
    const sendData = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token')
    };
    const root  = ReactDOM.createRoot(document.getElementById("root"));

    const response = await fetchData("request/list",sendData);
    const device_list = (await response.text()).split('\r\n');
    
    const devices = {act:[], hive:[]};

    for (const device of device_list) {
        const status = device.split(',');
        if(status[1] == "hive"){
            console.log(status);
        }else if(status[1] == "array"){
            sendData.type = "array";
            sendData.dvid = status[0];
            // const last_data = await(await fetchData("request/last",sendData)).json();
            devices.act.push(
                React.createElement("div",{className:"device-table"},[
                    React.createElement("div",{className:"device-header",onClick:()=>{location.href="/web/array/"+status[0]}},status[2]),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"ID"),   //device name
                        React.createElement("div",{className:"device-value"},status[0].replaceAll("_",":"))  //device mac address
                    ]),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-button"},"장비삭제"),
                        React.createElement("div",{className:"device-button"},"이름변경")
                    ])
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