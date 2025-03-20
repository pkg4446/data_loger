function EquipmentManager() {
  const [arrayDevices, setArrayDevices] = React.useState([]);
  const [hiveDevices, setHiveDevices] = React.useState([]);

  React.useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    const sendData = {
      id: localStorage.getItem('user'),
      token: localStorage.getItem('token')
    };

    const response = await fetchData("request/list", sendData);
    const device_list = (await response.text()).split('\r\n');
        
    const tempArrayDevices = [];
    const tempHiveDevices = [];

    for (const device of device_list) {
      const status = device.split(',');
      if (status[1] === "hive") {
        console.log(status);
        tempHiveDevices.push(status);
      } else if (status[1] === "array") {
        tempArrayDevices.push(status);
      }
    }

    setArrayDevices(tempArrayDevices);
    setHiveDevices(tempHiveDevices);
  };

  const handleDelete = async (deviceId) => {
    const success = await device_modify("disconnect", "array", deviceId, "");
    if (success) {
      setArrayDevices(prev => prev.filter(device => device[0] !== deviceId));
    }
  };

  const handleRename = async (deviceId, currentName) => {
    Swal.fire({
      position: "top",
      icon: "info",
      title: currentName + "의 새로운 이름을 입력해주세요.",
      showConfirmButton: true,
      input: 'text',
    }).then(async (result) => {
      if (result.isConfirmed && result.value.length > 0) {
        const success = await device_modify("device_rename", "array", deviceId, result.value);
        if (success) {
          setArrayDevices(prev => prev.map(device => {
            if (device[0] === deviceId) {
              return [device[0], device[1], result.value];
            }
            return device;
          }));
        }
      }
    });
  };

  const renderArrayDevices = () => {
    return arrayDevices.map((status, index) => (
      React.createElement("div", { key: status[0], className: "device-table" }, [
        React.createElement("div", { 
          className: "device-header", 
          onClick: () => { location.href = "/web/array/" + status[0] }
        }, status[2]),
        React.createElement("div", { className: "device-row" }, [
          React.createElement("div", { className: "device-label" }, "ID"),
          React.createElement("div", { className: "device-value" }, status[0].replaceAll("_", ":"))
        ]),
        React.createElement("div", { className: "device-row" }, [
          React.createElement("div", { 
            className: "device-button", 
            onClick: () => handleDelete(status[0])
          }, "장비삭제"),
          React.createElement("div", { 
            className: "device-button", 
            onClick: () => handleRename(status[0], status[2])
          }, "이름변경")
        ])
      ])
    ));
  };

  const navigateToArrange = (type) => {
    location.href = "/web/arrange/" + type;
  };

  return React.createElement("div", {style: { width: "100%", margin: "auto" }}, [...renderArrayDevices(),
    arrayDevices.length > 0 && React.createElement("div", { 
      className: "device-button", 
      // onClick: () => navigateToArrange("array")
    }, "array 순서정렬")
  ]);
}

async function device_modify(api, type, dvid, name) {
  const response = await fetchData("request/" + api, {
    id: localStorage.getItem('user'),
    token: localStorage.getItem('token'),
    type: type,
    dvid: dvid,
    name: name
  });
    
  if (response.status == 200) {
    Swal.fire({
      position: "top",
      icon: "success",
      showConfirmButton: false,
      timer: 1500
    });
    return true;
  } else {
    return false;
  }
}

// 메인 렌더링 함수
function initEquipment() {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(React.createElement(EquipmentManager));
}

// 초기화 함수 실행
initEquipment();