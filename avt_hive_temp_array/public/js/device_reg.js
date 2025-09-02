page_init();
async function page_init() {
    const root  = ReactDOM.createRoot(document.getElementById("root"));
    const data_row = {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "10px",
        marginBottom: "5px"
    }
    const cell  = {
        border: "1px solid #ddd",
        borderRadius: "2px",
        textAlign: "center",
        backgroundColor: "white",
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        device_reg(formData.get("device_type"),formData.get("device"),formData.get("device_name"))
    }

    const response = await(await fetchData("request/able",{
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token')
    })).json();

    let elemets = [
        React.createElement("h2",null,"장비등록"),
        React.createElement("form",{id:"userForm", onSubmit: handleSubmit},[
            React.createElement("div",{style:data_row},[
                React.createElement("label",{style:cell, htmlFor:"device"},"온도센서"),
                React.createElement("input",{style:cell, type:"radio", name:"device_type", value:"array", defaultChecked:true}),
            ]),
            React.createElement("div",{className:"input-group"},[
                React.createElement("label",{htmlFor:"device"},"장비ID"),
                React.createElement("input",{type:"text", className:"input-field", name:"device", required:true},null),
            ]),
            React.createElement("div",{className:"input-group"},[
                React.createElement("label",{htmlFor:"device_name"},"장비 이름"),
                React.createElement("input",{type:"text", className:"input-field", name:"device_name", required:true},null),
            ]),
            React.createElement("button",{className:"submit-button"},"등록"),
        ])
    ];
    
    let enable_device = [];
    for (const type_key in response) {
        const type_list = response[type_key];
        if(type_list.length > 0 && type_key != "ip"){
            enable_device.push(React.createElement("p",{className:"form-section"},type_key),React.createElement(DeviceList, {initialList:type_list,type:type_key}));
        }         
    }
    if(enable_device.length > 0){
        elemets.push(
            React.createElement("div",{style:{alignItems:"center",margin:"20px 0",color:"#888"}},"연결 가능한 벌통"),
            React.createElement("div",null,enable_device)
        );
    }else{
        elemets.push(
            React.createElement("div",{style:{alignItems:"center",margin:"20px 0",color:"#888"}},"User IP: "+response.ip),
        );
    }
    
    const container = React.createElement("div",{className:"submit-container"},elemets);
    root.render(container);
}

function DeviceList({initialList,type}) {
  const [list, setList] = React.useState(initialList);

  const handleRemoveItem = (indexToRemove) => {
    setList((prevList) => prevList.filter((_, index) => index !== indexToRemove));
  };
  
  return React.createElement(
    'div',
    null,
    list.map((item, index) =>
        React.createElement('div', {className:"user-link", style:{cursor:"pointer"}, key:index, onClick:()=>{
            Swal.fire({
                position: "top",
                icon:   "info",
                title:  type+" 장비 이름을 정해주세요.",
                showConfirmButton: false,
                input:  'text',
            }).then((result)=>{
                if(result.isConfirmed && result.value.length > 0){
                    device_reg(type,item,result.value).then((response)=>{
                        if(response) handleRemoveItem(index);
                    });
                }
            })
        }}, item)
    )
  );
}

async function device_reg(type,dvid,name) {
    const response = await fetchData("request/connect",{
                        id:     localStorage.getItem('user'),
                        token:  localStorage.getItem('token'),
                        dvid:   dvid,
                        type:   type,
                        name:   name
                    });
    console.log(response);
    if(response.status == 200){
        Swal.fire({
            position: "top",
            icon:   "success",
            title:  "등록되었습니다.",
            showConfirmButton: false,
            timer:  1500
        });
        return true;
    }else{
        return false;
    }
}