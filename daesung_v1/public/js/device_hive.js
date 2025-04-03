const { useState, useEffect, useRef } = React;
const { createRoot } = ReactDOM;

equipment();

async function equipment() {
    const root  = ReactDOM.createRoot(document.getElementById("root"));
    const sendData = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token'),
    };
    const pathname_parse = (window.location.pathname.split("hive/")[1]).split("/");
    const last_data = await (await fetchData("request/last",  {...sendData, type: "hub", dvid: pathname_parse[0]+"/hive/"+pathname_parse[1]})).json();
    const data_date = new Date(last_data.date);
    const date_str  = `${data_date.getFullYear()}/${data_date.getMonth()+1}/${data_date.getDate()}. ${data_date.getHours()}:${data_date.getMinutes()}:${data_date.getSeconds()}`;
    
    const hive_name  = await (await fetchData("req_hub/child", {...sendData, hub: pathname_parse[0], type:"hive", dvid:pathname_parse[1]})).json();
    const child_name = hive_name.name!=undefined ? hive_name.name:pathname_parse[1];

    const hive_config = await (await fetchData("req_hub/child_config", {...sendData, hub:pathname_parse[0], type:"hive", dvid:pathname_parse[1]})).json();

    const today = new Date();

    let file_path = today.getFullYear()+"/";
    if(today.getMonth()<10) file_path += "0";
    file_path += today.getMonth();

    let file_name = today.getDate()<10?"0":"";
    file_name += today.getDate();

    const hive_log = await (await fetchData("req_hub/child_log", {...sendData, hub:pathname_parse[0], type:"hive", dvid:pathname_parse[1], data:{path:file_path,name:file_name}})).json();
    console.log(hive_log);
    
    function Header() {
        const [deviceName, setDeviceName] = useState(child_name);
        const [isEditing, setIsEditing] = useState(false);
        const [tempName, setTempName] = useState('');
        
        const startEditing = () => {
            setTempName(deviceName);
            setIsEditing(true);
        };
        
        const saveName = async() => {
            if(deviceName!=tempName){
                const rename = await fetchData("req_hub/child_name", {...sendData, hub:pathname_parse[0], type:"hive", dvid:pathname_parse[1], name:tempName});
                if(rename.status==200){
                    setDeviceName(tempName);
                }
            }
            setIsEditing(false);
        };
        
        const cancelEdit = () => {
            setIsEditing(false);
        };
        
        // JSX 없이 createElement로 구현
        if (isEditing) {
            return React.createElement('header', null,
                React.createElement('div', { className: 'device-name' },
                    React.createElement('input', {
                        type: 'text',
                        className: 'name-input',
                        value: tempName,
                        onChange: (e) => setTempName(e.target.value)
                    }),
                    React.createElement('button', {
                        className: 'edit-btn',
                        onClick: saveName
                    }, '저장'),
                    React.createElement('button', {
                        className: 'edit-btn cancel-btn',
                        onClick: cancelEdit
                    }, '취소')
                )
            );
        } else {
            return React.createElement('header', null,
                React.createElement('h1', null, deviceName),
                React.createElement('div', { className: 'device-name' },
                    React.createElement('button', {
                        className: 'edit-btn',
                        onClick: startEditing
                    }, '이름 변경')
                )
            );
        }
    }

    function heat_state_str(params) {
        if(params) return "⭕";
        else return "❌";
    }
    // 현재 상태 표시 컴포넌트
    function CurrentStatus({ temperature, humidity, heating }) {

        const [tempGoal,  setTempGoal]  = useState(hive_config.goal);
        const [heaterUse, setHeaterUse] = useState(hive_config.run);

        const setGoal = () => {
            const ex_state = parseInt(tempGoal);
            Swal.fire({
                title: "가온 목표온도",
                showCancelButton: true,
                confirmButtonText: "설정",
                cancelButtonText:  "취소",
                input: "range",
                inputLabel: "목표온도",
                inputAttributes: {
                    min: "0",
                    max: "35",
                    step: "1"
            },
                inputValue: tempGoal
            }).then(async(result) => {
                if(result.isConfirmed){
                    const change_temp = parseInt(result.value);
                    if(ex_state != change_temp){
                        const response = await fetchData("req_hub/child_set", {...sendData, hub:pathname_parse[0], type:"hive", dvid:pathname_parse[1], config:{ex_goal:change_temp}})
                        setTempGoal(result.value);
                    }
                }
            })
        };
        const setUse  = () => {
            let bool_heat  = 1;
            let heat_state = "켠다";
            if(heaterUse){
                bool_heat  = 0;
                heat_state = "끈다";
            }
            Swal.fire({
                title: "가온을 "+heat_state,
                showCancelButton: true,
                confirmButtonText: heat_state,
                cancelButtonText:  "취소"
            }).then(async(result) => {
                if(result.isConfirmed){
                    const response = await fetchData("req_hub/child_set", {...sendData, hub:pathname_parse[0], type:"hive", dvid:pathname_parse[1], config:{ex_run:bool_heat}})
                    setHeaterUse(bool_heat);
                }
            })
        };

        const state_goal = tempGoal ==hive_config.ex_goal? tempGoal:hive_config.ex_goal+"°C➝"+tempGoal;
        const state_use  = heaterUse==hive_config.ex_run ? heat_state_str(heaterUse):heat_state_str(hive_config.ex_run)+"➝"+heat_state_str(heaterUse);

        return React.createElement('div', { className: 'card' },
            React.createElement('div', null, '최근 업데이트: '+date_str),
            React.createElement('div', {style:{display:"flex", justifyContent:"space-between"}},
                React.createElement('div', { className: 'headline' }, "목표🌡️: "+state_goal+"°C"),
                React.createElement('button', {
                    className: 'edit-btn',
                    onClick: ()=>setGoal(25)
                }, '변경'),
                React.createElement('div', { className: 'headline' }, "작동: "+state_use),
                React.createElement('button', {
                    className: 'edit-btn',
                    onClick: ()=>setUse("On")
                }, '변경')
            ),
            React.createElement('div', { className: 'current-readings' },
                React.createElement('div', { className: 'reading' },
                    React.createElement('p', { className: 'value' }, temperature + '°C'),
                    React.createElement('p', { className: 'label' }, '온도🌡️')
                ),
                React.createElement('div', { className: 'reading' },
                    React.createElement('p', { className: 'value' }, humidity + ' %'),
                    React.createElement('p', { className: 'label' }, '습도💧')
                ),
                React.createElement('div', { className: 'reading' },
                    React.createElement('p', { className: 'value' }, heating +" W"),
                    React.createElement('p', { className: 'label' }, '가온🔥')
                )
            )
        );
    }

    // 차트 컴포넌트
    function ChartCard({ title, chartId, chartType, data_min, data_max }) {
        const chartRef = useRef(null);
        const chartInstance = useRef(null);
        
        useEffect(() => {
            if (chartRef.current) {
                // 차트 데이터 준비
                const timeLabels = generateTimeLabels();
                let chartData, chartColor;
                
                switch (chartType) {
                    case 'temperature':
                        chartData = [31.2, 31.5, 31.8, 32.0, 32.3, 32.5, 32.6, 31.2, 31.5, 31.8, 32.0];
                        chartColor = '#f0a500';
                        break;
                    case 'humidity':
                        chartData = [60, 61, 63, 64, 66, 67, 68, 69, 70, 64, 65];
                        chartColor = '#00adb5';
                        break;
                    case 'heating':
                        chartData = [35, 35, 40, 25, 25, 10, 15, 20, 35, 40, 40];
                        chartColor = '#ff6b6b';
                        break;
                    default:
                        chartData = [];
                        chartColor = '#333';
                }
                
                // 이전 차트 인스턴스 제거
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }
                
                // 차트 생성
                chartInstance.current = new Chart(chartRef.current, {
                    type: 'line',
                    data: {
                        labels: timeLabels,
                        datasets: [{
                            label: getChartLabel(chartType),
                            data: chartData,
                            borderColor: chartColor,
                            backgroundColor: `${chartColor}20`, // 투명도 추가
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                            }
                        },
                        scales: {
                            y: {
                                min: data_min,
                                max: data_max
                            }
                        }
                    }
                });
            }
            // 컴포넌트 언마운트 시 차트 정리
            return () => {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }
            };
        }, [chartType]);
        // 차트 라벨 가져오기
        function getChartLabel(type) {
            switch (type) {
                case 'temperature': return '온도 (°C)';
                case 'humidity': return '습도 (%)';
                case 'heating': return '출력 (W)';
                default: return '';
            }
        }
        return React.createElement('div', { className: 'card' },
            React.createElement('h3', null, title),
            React.createElement('div', { className: 'chart-container' },
                React.createElement('canvas', { id: chartId, ref: chartRef })
            )
        );
    }

    // 메인 앱 컴포넌트
    function App() {
        return React.createElement('div', { style:{width:"100%"} },
            React.createElement(Header, null),
            React.createElement(CurrentStatus, {
                temperature: last_data.temp,
                humidity: last_data.humi,
                heating:  Math.round((last_data.work/last_data.runt)*40)
            }),
            React.createElement('br', null, null),
            React.createElement('div', { className: 'dashboard' },
                
                React.createElement(ChartCard, {
                    title: '온도',
                    chartId: 'tempChart',
                    chartType: 'temperature',
                    data_min: -10,
                    data_max: 50,
                }),
                React.createElement(ChartCard, {
                    title: '습도',
                    chartId: 'humidityChart',
                    chartType: 'humidity',
                    data_min: 0,
                    data_max: 100,
                }),
                React.createElement(ChartCard, {
                    title: '가온',
                    chartId: 'heatingChart',
                    chartType: 'heating',
                    data_min: 0,
                    data_max: 50,
                })
            )
        );
    }
    
    // 시간 라벨 생성 함수
    function generateTimeLabels() {
        const labels = [];
        const now = new Date();
        for (let i = 10; i >= 0; i--) {
            const d = new Date(now);
            d.setHours(now.getHours() - i);
            labels.push(d.getHours() + ':00');
        }
        return labels;
    }

    root.render(React.createElement(App, null));
}