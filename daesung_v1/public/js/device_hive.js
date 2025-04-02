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
    const list_name = await (await fetchData("request/child", {...sendData, dvid: pathname_parse[0]})).json();
    
    console.log(last_data);
    console.log(list_name);
    const data_date = new Date(last_data.date);
    const date_str = `${data_date.getFullYear()}/${data_date.getMonth()+1}/${data_date.getDate()}. ${data_date.getHours()}:${data_date.getMinutes()}:${data_date.getSeconds()}`;

    let child_name = pathname_parse[1];
    if(list_name["hive"] != undefined) {
        child_name = list_name["hive"][pathname_parse[1]];
    }

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
                const rename = await fetchData("request/child_name", {...sendData, hub:pathname_parse[0], type:"hive",  dvid:pathname_parse[1], name:tempName});
                console.log(rename.status);
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

    // 현재 상태 표시 컴포넌트
    function CurrentStatus({ temperature, humidity, heating }) {
        return React.createElement('div', { className: 'card' },
            React.createElement('div', null, '최근 업데이트: '+date_str),
            React.createElement('div', {style:{display:"flex", justifyContent:"space-between"}},
                React.createElement('h1', null, "가온 온도:"),
                React.createElement('button', {
                    className: 'edit-btn',
                    onClick: "test"
                }, '변경'),
                React.createElement('h2', null, "가온 작동:"),
                React.createElement('button', {
                    className: 'edit-btn',
                    onClick: "test"
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
        return React.createElement('div', { className: 'container' },
            React.createElement(Header, null),
            React.createElement('div', { className: 'dashboard' },
                React.createElement(CurrentStatus, {
                    temperature: last_data.temp,
                    humidity: last_data.humi,
                    heating:  Math.round((last_data.work/last_data.runt)*40)
                }),
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