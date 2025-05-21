equipment();
async function equipment() {
    const root = ReactDOM.createRoot(document.getElementById("root"));
    const { useState } = React;
    
    function DeviceManager() {
        // 장비 목록 원본 데이터 상태
        const [devices, setDevices] = useState({
            list: [],  // 원본 장비 데이터 목록 
            hub: [],   // 처리된 허브 장비 데이터
            hive: [],  // 처리된 벌통 장비 데이터
            act: []    // 처리된 액트 장비 데이터
        });
        
        // 초기 데이터 로딩
        React.useEffect(() => {
            loadDevices();
        }, []);
        
        // 장비 데이터 로딩 함수
        async function loadDevices() {
            const sendData = {
                id: localStorage.getItem('user'),
                token: localStorage.getItem('token')
            };
            
            try {
                const response = await fetchData("request/list", sendData);
                const device_list = (await response.text()).split('\r\n');
                
                // 빈 항목 필터링
                const filteredList = device_list.filter(device => device.trim() !== '');
                
                // 상태 업데이트를 위한 임시 객체
                const updatedDevices = {
                    list: filteredList,
                    hub: [],
                    hive: [],
                    act: []
                };
                
                // 각 장비 처리
                for (const device of filteredList) {
                    const status = device.split(',');
                    console.log(status);
                    if (status[1] === "hub") {
                        const hubDevice = await processHubDevice(status, sendData);
                        updatedDevices.hub.push(hubDevice);
                    } else if (status[1] === "hive") {
                        const hiveDevice = await processHiveDevice(status, sendData);
                        updatedDevices.hive.push(hiveDevice);
                    } else if (status[1] === "act") {
                        const actDevice = await processActDevice(status, sendData);
                        updatedDevices.act.push(actDevice);
                    }
                }
                
                // 상태 업데이트
                setDevices(updatedDevices);
            } catch (error) {
                console.error("데이터 로딩 중 오류 발생:", error);
                // 에러 처리 - 사용자에게 알림 표시 등
            }
        }
        
        // Hub 장비 처리 함수
        async function processHubDevice(status, sendData) {
            let hub_child = [];
            const hubSendData = {...sendData, type: "hub", dvid: status[0]};
            
            try {
                const response = await fetchData("req_hub/info", hubSendData);
                const list_hub = await response.json();
                let list_name = null;
                if(list_hub["list"] != null) list_name = JSON.parse(list_hub["list"]);
                
                for (const child_type in list_hub) {
                    if(child_type !== "list") {
                        const child_list = list_hub[child_type];                       

                        let type_name = "벌통";
                        for (const child in child_list) {
                            const child_name = (list_name!=null&&list_name[child_type][child]!= undefined)?list_name[child_type][child]:"새 장치";
                            if(child_list[child] == null) {
                                hub_child.push(
                                    React.createElement("div", {className: "device-child", key: `${status[0]}-${child}`},
                                        React.createElement("div", {className: "child-table"}, [
                                            React.createElement("div", {className: "child-header"}, type_name + ": " + child_name),
                                            React.createElement("div", {className: "device-row"}, [
                                                React.createElement("div", {className: "device-label"}, "ID"),
                                                React.createElement("div", {className: "device-value"}, child)
                                            ])
                                        ])
                                    )
                                );
                            } else {
                                try {
                                    const child_data = JSON.parse(child_list[child]);
                                    const data_date = new Date(child_data.date);
                                    const date_str = `${data_date.getFullYear()}/${data_date.getMonth()+1}/${data_date.getDate()},${data_date.getHours()}:${data_date.getMinutes()}:${data_date.getSeconds()}`;
                                    
                                    console.log(child);
                                    if(child_data.runt == 0) child_data.runt = 1;
                                    hub_child.push(
                                        React.createElement("div", {className: "device-child", key: `${status[0]}-${child}`},
                                            React.createElement("div", {className: "child-table"}, [
                                                React.createElement("div", {className: "child-header",onClick:()=>{location.href = "/web/"+child_type+"/"+status[0]+"/"+child}}, type_name + ": " + child_name),
                                                React.createElement("div", {className: "device-row"}, [
                                                    React.createElement("div", {className: "device-label"}, "ID"),
                                                    React.createElement("div", {className: "device-value"}, child)
                                                ]),
                                                React.createElement("div", {className: "device-row"}, [
                                                    React.createElement("div", {className: "device-label"}, "시간"),
                                                    React.createElement("div", {className: "device-value"}, date_str),
                                                ]),
                                                React.createElement("div", {className: "device-row"}, [
                                                    React.createElement("div", {className: "device-label"}, "온도🌡️"),
                                                    React.createElement("div", {className: "device-value"}, child_data.temp + "°C"),
                                                ]),
                                                React.createElement("div", {className: "device-row"}, [
                                                    React.createElement("div", {className: "device-label"}, "습도💧"),
                                                    React.createElement("div", {className: "device-value"}, child_data.humi + " %"),
                                                ]),
                                                React.createElement("div", {className: "device-row"}, [
                                                    React.createElement("div", {className: "device-label"}, "가온🔥"),
                                                    React.createElement("div", {className: "device-value"}, Math.round((child_data.work/child_data.runt)*40) + " W"),
                                                ]),
                                            ])
                                        )
                                    );
                                } catch (error) {
                                    console.error("데이터 파싱 오류:", error);
                                }
                            }
                        }
                    }
                }
                
                return React.createElement("div", {className: "device-table", key: status[0]}, [
                    React.createElement("div", {className: "device-header"}, status[2] + " 🍯 양봉장"),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {className: "device-label"}, "ID"),
                        React.createElement("div", {className: "device-value"}, status[0].replaceAll("_", ":"))
                    ]),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {
                            className: "device-button",
                            onClick: () => unconnectDevice(status[1], status[0])
                        }, "장비삭제"),
                        React.createElement("div", {
                            className: "device-button",
                            onClick: () => renameDevice(status[1], status[0])
                        }, "이름변경")
                    ]),
                    ...hub_child
                ]);
            } catch (error) {
                console.error("허브 장비 처리 중 오류 발생:", error);
                return React.createElement("div", {className: "device-table", key: status[0]}, [
                    React.createElement("div", {className: "device-header"}, status[2] + " 🍯 양봉장 (데이터 로드 실패)"),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {className: "device-label"}, "ID"),
                        React.createElement("div", {className: "device-value"}, status[0].replaceAll("_", ":"))
                    ]),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {
                            className: "device-button",
                            onClick: () => unconnectDevice(status[1], status[0])
                        }, "장비삭제"),
                        React.createElement("div", {
                            className: "device-button",
                            onClick: () => renameDevice(status[1], status[0])
                        }, "이름변경")
                    ])
                ]);
            }
        }
        
        // Hive 장비 처리 함수
        async function processHiveDevice(status, sendData) {
            const hiveSendData = {...sendData, type: "hive", dvid: status[0]};
            
            try {
                const response = await fetchData("request/last", hiveSendData);
                const last_data = await response.json();
                const data_date = new Date(last_data.date);
                const date_str = `${data_date.getFullYear()}/${data_date.getMonth()+1}/${data_date.getDate()},${data_date.getHours()}:${data_date.getMinutes()}:${data_date.getSeconds()}`;
                
                console.log("Hive device data:", last_data, status[0]);

                return React.createElement("div", {className: "device-table", key: status[0]}, [
                    React.createElement("div", {
                        className: "device-header", 
                        onClick: () => {location.href = "/web/nest/"+status[0]}
                    }, status[2] + " 🍯 벌통"),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {className: "device-label"}, "ID"),
                        React.createElement("div", {className: "device-value"}, status[0].replaceAll("_", ":"))
                    ]),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {className: "device-label"}, "시간"),
                        React.createElement("div", {className: "device-value"}, date_str),
                    ]),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {className: "device-label"}, "온도🌡️"),
                        React.createElement("div", {className: "device-value"}, last_data.temp + "°C"),
                    ]),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {className: "device-label"}, "습도💧"),
                        React.createElement("div", {className: "device-value"}, last_data.humi + " %"),
                    ]),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {className: "device-label"}, "가온🔥"),
                        React.createElement("div", {className: "device-value"}, Math.round((last_data.work/last_data.runt)*40) + " W"),
                    ]),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {
                            className: "device-button",
                            onClick: () => unconnectDevice(status[1], status[0])
                        }, "장비삭제"),
                        React.createElement("div", {
                            className: "device-button",
                            onClick: () => renameDevice(status[1], status[0])
                        }, "이름변경")
                    ])
                ]);
            } catch (error) {
                console.error("벌통 장비 처리 중 오류 발생:", error);
                return React.createElement("div", {className: "device-table", key: status[0]}, [
                    React.createElement("div", {className: "device-header"}, status[2] + " 🍯 벌통 (데이터 로드 실패)"),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {className: "device-label"}, "ID"),
                        React.createElement("div", {className: "device-value"}, status[0].replaceAll("_", ":"))
                    ]),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {
                            className: "device-button",
                            onClick: () => unconnectDevice(status[1], status[0])
                        }, "장비삭제"),
                        React.createElement("div", {
                            className: "device-button",
                            onClick: () => renameDevice(status[1], status[0])
                        }, "이름변경")
                    ])
                ]);
            }
        }

        // Act 장비 처리 함수
        async function processActDevice(status, sendData) {
            const actSendData = {...sendData, type: "act", dvid: status[0]};
            
            try {
                const response = await fetchData("request/last", actSendData);
                const last_data = await response.json();
                const data_date = new Date(last_data.date);
                const date_str = `${data_date.getFullYear()}/${data_date.getMonth()+1}/${data_date.getDate()},${data_date.getHours()}:${data_date.getMinutes()}:${data_date.getSeconds()}`;
                
                return React.createElement("div", {className: "device-table", key: status[0]}, [
                    React.createElement("div", {
                        className: "device-header", 
                        onClick: () => {location.href = "/web/act/" + status[0]}
                    }, status[2] + " 🐝 출입기록"),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {className: "device-label"}, "ID"),
                        React.createElement("div", {className: "device-value"}, status[0].replaceAll("_", ":"))
                    ]),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {className: "device-label"}, "시간"),
                        React.createElement("div", {className: "device-value"}, date_str),
                    ]),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {
                            className: "device-button",
                            onClick: () => unconnectDevice(status[1], status[0])
                        }, "장비삭제"),
                        React.createElement("div", {
                            className: "device-button",
                            onClick: () => renameDevice(status[1], status[0])
                        }, "이름변경")
                    ]),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {className: "device-label"}, "합계"),
                        React.createElement("div", {className: "device-value"}, last_data.sum),
                    ]),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {className: "device-label"}, "출"),
                        React.createElement("div", {className: "device-value"}, last_data.in),
                    ]),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {className: "device-label"}, "입"),
                        React.createElement("div", {className: "device-value"}, last_data.out),
                    ])
                ]);
            } catch (error) {
                console.error("액트 장비 처리 중 오류 발생:", error);
                return React.createElement("div", {className: "device-table", key: status[0]}, [
                    React.createElement("div", {className: "device-header"}, status[2] + " 🐝 출입기록 (데이터 로드 실패)"),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {className: "device-label"}, "ID"),
                        React.createElement("div", {className: "device-value"}, status[0].replaceAll("_", ":"))
                    ]),
                    React.createElement("div", {className: "device-row"}, [
                        React.createElement("div", {
                            className: "device-button",
                            onClick: () => unconnectDevice(status[1], status[0])
                        }, "장비삭제"),
                        React.createElement("div", {
                            className: "device-button",
                            onClick: () => renameDevice(status[1], status[0])
                        }, "이름변경")
                    ])
                ]);
            }
        }
        
        // 장비 이름 변경 함수
        async function renameDevice(type, dvid) {
            Swal.fire({
                position: "top",
                icon: "info",
                title: "이름 바꾸기",
                input: 'text',
                showCancelButton: true,
                confirmButtonText: "저장",
                cancelButtonText: "취소"
            }).then(async(result) => {
                if(result.isConfirmed && result.value.length > 0) {
                    try {
                        const response = await fetchData("request/device_rename", {
                            id: localStorage.getItem('user'),
                            token: localStorage.getItem('token'),
                            type: type,
                            dvid: dvid,
                            name: result.value
                        });
                        
                        if(response.status == 200) {
                            Swal.fire({
                                position: "top",
                                icon: "success",
                                title: "변경되었습니다.",
                                showConfirmButton: false,
                                timer: 1500
                            });
                            
                            // 이름이 변경된 장치의 데이터 업데이트
                            const updatedList = devices.list.map(device => {
                                const parts = device.split(',');
                                if (parts[0] === dvid && parts[1] === type) {
                                    // 이름만 변경하고 나머지는 유지
                                    return `${parts[0]},${parts[1]},${result.value}`;
                                }
                                return device;
                            });
                            
                            // 장비 목록 업데이트 후 화면 갱신
                            setDevices(prev => ({...prev, list: updatedList}));
                            loadDevices(); // 전체 데이터 새로 로드
                        }
                    } catch (error) {
                        console.error("이름 변경 중 오류 발생:", error);
                        Swal.fire({
                            position: "top",
                            icon: "error",
                            title: "이름 변경 실패",
                            text: "서버 통신 중 오류가 발생했습니다.",
                            showConfirmButton: true
                        });
                    }
                }
            });
        }
        
        // 장비 삭제 함수
        async function unconnectDevice(type, dvid) {
            Swal.fire({
                position: "top",
                icon: "question",
                title: "장비를 제거합니까?",
                showCancelButton: true,
                confirmButtonText: "확인",
                cancelButtonText: "취소"
            }).then(async (result) => {
                if(result.isConfirmed) {
                    try {
                        const response = await fetchData("request/disconnect", {
                            id: localStorage.getItem('user'),
                            token: localStorage.getItem('token'),
                            type: type,
                            dvid: dvid
                        });
                        
                        if(response.status == 200) {
                            Swal.fire({
                                position: "top",
                                icon: "success",
                                title: "제거 되었습니다.",
                                showConfirmButton: false,
                                timer: 1500
                            });
                            
                            // 삭제된 장비를 목록에서 제거
                            const updatedList = devices.list.filter(device => {
                                const parts = device.split(',');
                                return !(parts[0] === dvid && parts[1] === type);
                            });
                            
                            // 각 장비 타입별 배열에서 해당 장비 제거
                            const updatedHubDevices = type === "hub" 
                                ? devices.hub.filter(device => device.key !== dvid)
                                : devices.hub;
                                
                            const updatedHiveDevices = type === "hive" 
                                ? devices.hive.filter(device => device.key !== dvid)
                                : devices.hive;
                                
                            const updatedActDevices = type === "act" 
                                ? devices.act.filter(device => device.key !== dvid)
                                : devices.act;
                            
                            // 상태 업데이트하여 UI 갱신
                            setDevices({
                                list: updatedList,
                                hub: updatedHubDevices,
                                hive: updatedHiveDevices,
                                act: updatedActDevices
                            });
                            
                            // 전체 데이터 새로 로드
                            loadDevices();
                        }
                    } catch (error) {
                        console.error("장비 삭제 중 오류 발생:", error);
                        Swal.fire({
                            position: "top",
                            icon: "error",
                            title: "장비 삭제 실패",
                            text: "서버 통신 중 오류가 발생했습니다.",
                            showConfirmButton: true
                        });
                    }
                }
            });
        }
        
        // 컨테이너 렌더링 (이 부분이 중요, 항상 객체 구조를 유지)
        const container = [];
        
        // hub 장비 컨테이너 추가
        if (devices.hub.length > 0) {
            container.push(
                React.createElement("div", {
                    className: "dashboard",
                    key: "hub-container"
                }, devices.hub)
            );
        }
        
        // hive 장비 컨테이너 추가
        if (devices.hive.length > 0) {
            container.push(
                React.createElement("div", {
                    className: "dashboard",
                    key: "hive-container"
                }, devices.hive)
            );
        }
        
        // act 장비 컨테이너 추가
        if (devices.act.length > 0) {
            container.push(
                React.createElement("div", {
                    className: "dashboard",
                    key: "act-container"
                }, devices.act)
            );
        }
        
        return React.createElement("div", {style: {width: "100%"},key: "main-container"}, container);
    }
    
    // 메인 컴포넌트 렌더링
    root.render(React.createElement(DeviceManager, null));
}

// fetchData 함수는 기존 코드에 있다고 가정합니다.