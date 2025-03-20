equipment();
async function equipment() {
    const sendData = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token')
    };
    const root  = ReactDOM.createRoot(document.getElementById("root"));

    const response = await fetchData("request/list",sendData);
    const device_list = (await response.text()).split('\r\n');

    console.log(device_list);
    
    const devices = {array:[], hive:[]};

    for (const device of device_list) {
        const status = device.split(',');
        if(status[1] == "hive"){
            console.log(status);
        }else if(status[1] == "array"){
            sendData.type = "array";
            sendData.dvid = status[0];
            // const last_data = await(await fetchData("request/last",sendData)).json();
            devices.array.push(
                React.createElement("div",{className:"device-table"},[
                    React.createElement("div",{className:"device-header",onClick:()=>{location.href="/web/array/"+status[0]}},status[2]),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-label"},"ID"),
                        React.createElement("div",{className:"device-value"},status[0].replaceAll("_",":"))  //device mac address
                    ]),
                    React.createElement("div",{className:"device-row"},[
                        React.createElement("div",{className:"device-button",onClick:()=>{device_modify("disconnect","array",status[0],"")}},"장비삭제"),
                        React.createElement("div",{className:"device-button",onClick:()=>{
                            Swal.fire({
                                position: "top",
                                icon:   "info",
                                title:  status[2]+"의 새로운 이름을 입력해주세요.",
                                showConfirmButton: false,
                                input:  'text',
                            }).then((result)=>{
                                if(result.isConfirmed && result.value.length > 0){
                                    device_modify("device_rename","array",status[0],result.value).then((response)=>{
                                        console.log(response);
                                        // if(response) handleRemoveItem(index);
                                    });
                                }
                            });
                        }},"이름변경")
                    ])
                ])
            );
        }
    }
    for (const key in devices) {
        if(devices[key].length > 0){
            devices[key].push(React.createElement("div",{className:"device-button",onClick:()=>{location.href="/web/arrange/"+key}},key+" 순서정렬"));
        }
    }

    let container = [];
    
    if (devices.array.length > 0) {
        container.push(React.createElement("div",{style:{width:"100%",margin:"auto"}},devices.array));
    }
    root.render(container);
}

async function device_modify(api,type,dvid,name) {
    const response = await fetchData("request/"+api,{
                        id:     localStorage.getItem('user'),
                        token:  localStorage.getItem('token'),
                        type:   type,
                        dvid:   dvid,
                        name:   name
                    });
    console.log(response);
    if(response.status == 200){
        Swal.fire({
            position: "top",
            icon:   "success",
            showConfirmButton: false,
            timer:  1500
        });
        return true;
    }else{
        return false;
    }
}