const { useState, useEffect, useRef } = React;
const { createRoot } = ReactDOM;
const log_data = {};

// 메인 App 컴포넌트
function App() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [childName, setChildName] = useState('');
    const [config, setConfig] = useState({});
    const [chartData, setChartData] = useState({
        table_time: [],
        table_temp: [],
        table_humi: [],
        table_heat: []
    });
    const [lastData, setLastData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const sendData = {
        id: localStorage.getItem('user'),
        token: localStorage.getItem('token'),
    };
    const pathname_parse = (window.location.pathname.split("nest/")[1]);

    // 선택한 날짜에 대한 데이터를 가져오는 함수
    async function fetchDataForDate(date) {
        setIsLoading(true);
        try {
            // 경로와 파일명을 선택한 날짜 기준으로 포맷
            let file_path = date.getFullYear() + "/";
            if (date.getMonth() < 10) file_path += "0";
            file_path += date.getMonth();

            let file_name = date.getDate() < 10 ? "0" : "";
            file_name += date.getDate();
            const key = file_path+"/"+file_name;
            // 선택한 날짜의 로그 데이터 가져오기
            if(log_data[key]==undefined){
                log_data[key] = await (await fetchData("request/log", {
                    ...sendData,
                    hub: pathname_parse[0],
                    type: "hive",
                    dvid: pathname_parse[1],
                    data: { path: file_path, name: file_name }
                })).json();
                if (log_data[key][0] == undefined) log_data[key] = [];
            }
            // 로그를 차트 데이터로 처리
            let table_time = [];
            let table_temp = [];
            let table_humi = [];
            let table_heat = [];

            for (const log of log_data[key]) {
                const log_time = new Date(log.date);
                const minutes = log_time.getMinutes() < 10 ? "0" + log_time.getMinutes() : log_time.getMinutes();
                table_time.push(log_time.getHours() + ":" + minutes);
                table_temp.push(log.temp);
                table_humi.push(log.humi);
                table_heat.push((log.work / log.runt) * 40);
            }

            setChartData({
                table_time,
                table_temp,
                table_humi,
                table_heat
            });

        } catch (error) {
            console.error("데이터 가져오기 오류:", error);
        } finally {
            setIsLoading(false);
        }
    }

    // 초기 로드
    useEffect(() => {
        async function initialLoad() {
            try {
                // 장비 이름 가져오기
                const hive_name = await (await fetchData("req_hub/child", {
                    ...sendData,
                    hub: pathname_parse[0],
                    type: "hive",
                    dvid: pathname_parse[1]
                })).json();
                setChildName(hive_name.name !== undefined ? hive_name.name : pathname_parse[1]);
                // 장비 설정 가져오기
                const hive_config = await (await fetchData("req_hub/child_config", {
                    ...sendData,
                    hub: pathname_parse[0],
                    type: "hive",
                    dvid: pathname_parse[1]
                })).json();
                setConfig(hive_config);
                // 최신 데이터 기록 가져오기
                const last_data = await (await fetchData("request/last", {
                    ...sendData,
                    type: "hub",
                    dvid: pathname_parse[0] + "/hive/" + pathname_parse[1]
                })).json();

                setLastData(last_data);
                // 오늘 날짜 데이터 가져오기
                await fetchDataForDate(selectedDate);
            } catch (error) {
                console.error("초기 데이터 로드 오류:", error);
            }
        }
        initialLoad();
    }, []);

    // 선택한 날짜가 변경될 때 데이터 다시 가져오기
    useEffect(() => {
        fetchDataForDate(selectedDate);
    }, [selectedDate]);

    // 날짜 선택기 컴포넌트
    function DateSelector() {
        const today = new Date();

        // 입력 필드용 날짜 포맷
        const formatDateForInput = (date) => {
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        };
        
        // 날짜 변경 처리
        const handleDateChange = (event) => {
            const newDate = new Date(event.target.value);
            if (newDate <= today) {
                setSelectedDate(newDate);
            }
        };
        
        // 이전 날 버튼 핸들러
        const handlePrevDay = () => {
            const prevDay = new Date(selectedDate);
            prevDay.setDate(prevDay.getDate() - 1);
            setSelectedDate(prevDay);
        };
        
        // 다음 날 버튼 핸들러
        const handleNextDay = () => {
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            // 미래 날짜 선택 방지
            if (nextDay <= today) {
                setSelectedDate(nextDay);
            }
        };
        
        const isToday = formatDateForInput(selectedDate) === formatDateForInput(today);
        
        return React.createElement('div', { className: 'date-selector', style: { display: 'flex', justifyContent: 'center', gap: '10px', margin: '10px 0' } },
            React.createElement('button', {
                className: 'edit-btn',
                onClick: handlePrevDay
            }, '◀ 이전 날짜'),
            React.createElement('input', {
                type: 'date',
                value: formatDateForInput(selectedDate),
                onChange: handleDateChange,
                max: formatDateForInput(today),
                style: { textAlign: 'center' }
            }),
            React.createElement('button', {
                className: 'edit-btn',
                onClick: handleNextDay,
                disabled: isToday,
                style: isToday ? { opacity: 0.5 } : {}
            }, '다음 날짜 ▶')
        );
    }

    function Header() {
        const [deviceName, setDeviceName] = useState(childName);
        const [isEditing, setIsEditing] = useState(false);
        const [tempName, setTempName] = useState('');
        
        useEffect(() => {
            setDeviceName(childName);
        }, [childName]);
        
        const startEditing = () => {
            setTempName(deviceName);
            setIsEditing(true);
        };

        const delete_this = () => {
            Swal.fire({
                title: "장비를 제거합니까?",
                showCancelButton: true,
                confirmButtonText: "제거",
                cancelButtonText: "취소"
            }).then(async(result) => {
                if(result.isConfirmed){
                    secret_code("연결 해제").then(async(result) => {
                        if(result){
                            const response = await fetchData("req_hub/child_del", {...sendData, hub:pathname_parse[0], type:"hive", dvid:pathname_parse[1]})
                            if(response.status == 200){
                                Swal.fire({
                                    position: "top",
                                    icon: "success",
                                    title: '장비가 제거되었습니다.',
                                    timer: 1000
                                }).then(() => {
                                    location.replace(location.origin+"/web/list");
                                });
                            }
                        }else{
                            Swal.fire({
                                title: "코드가 틀렸습니다.",
                                icon: "error"
                            });
                        }
                    })
                }
            })
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
                        className: 'edit-btn cancel-btn',
                        onClick: cancelEdit
                    }, '취소'),
                    React.createElement('button', {
                        className: 'edit-btn',
                        onClick: saveName
                    }, '저장')
                )
            );
        } else {
            return React.createElement('header', null,
                React.createElement('h1', null, deviceName),
                React.createElement('div', { className: 'device-name' },
                    React.createElement('button', {
                        className: 'edit-btn cancel-btn',
                        onClick: delete_this
                    }, '장비 삭제'),
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
    function CurrentStatus() {
        const [tempGoal, setTempGoal]   = useState(config.ex_goal);
        const [heaterUse, setHeaterUse] = useState(config.ex_run);
        
        useEffect(() => {
            if (config.ex_goal == undefined){
                setTempGoal("?");
            }
            if (config.ex_run == undefined){
                setHeaterUse("?");
            }
        }, [config]);

        const setGoal = () => {
            const ex_state = parseInt(tempGoal);
            Swal.fire({
                title: "가온 목표온도",
                showCancelButton: true,
                confirmButtonText: "설정",
                cancelButtonText: "취소",
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
                        const response = await fetchData("req_hub/child_set", {
                            ...sendData, 
                            hub: pathname_parse[0], 
                            type: "hive", 
                            dvid: pathname_parse[1], 
                            config: {ex_goal: change_temp}
                        });
                        config.ex_goal = change_temp;
                        setTempGoal(change_temp);
                    }
                }
            });
        };
        
        const setUse = () => {
            let bool_heat = 1;
            let heat_state = "켠다";
            if(heaterUse){
                bool_heat = 0;
                heat_state = "끈다";
            }
            Swal.fire({
                title: "가온을 "+heat_state,
                showCancelButton: true,
                confirmButtonText: heat_state,
                cancelButtonText: "취소"
            }).then(async(result) => {
                if(result.isConfirmed){
                    const response = await fetchData("req_hub/child_set", {
                        ...sendData, 
                        hub: pathname_parse[0], 
                        type: "hive", 
                        dvid: pathname_parse[1], 
                        config: {ex_run: bool_heat}
                    });
                    config.ex_goal = bool_heat;
                    setHeaterUse(bool_heat);
                }
            });
        };

        // lastData나 config가 아직 로드되지 않은 경우 처리
        if (!lastData || !config.goal) {
            return React.createElement('div', { className: 'card' }, 
                React.createElement('p', null, '데이터를 불러오는 중...')
            );
        }

        const state_goal = tempGoal == config.goal ? tempGoal : config.goal+"°C➝"+tempGoal;
        const state_use = heaterUse == config.run ? heat_state_str(heaterUse) : heat_state_str(config.run)+"➝"+heat_state_str(heaterUse);
        
        // 화면 표시용 날짜 포맷
        const data_date = lastData ? new Date(lastData.date) : new Date();
        const date_str = `${data_date.getFullYear()}/${data_date.getMonth()+1}/${data_date.getDate()}. ${data_date.getHours()}:${data_date.getMinutes()}:${data_date.getSeconds()}`;

        return React.createElement('div', { className: 'card' },
            React.createElement('div', null, '최근 업데이트: ' + date_str),
            React.createElement('div', {style:{display:"flex", justifyContent:"space-between", marginTop: "10px"}},
                React.createElement('div', { className: 'headline' }, "목표🌡️: "+state_goal+"°C"),
                React.createElement('button', {
                    className: 'edit-btn',
                    onClick: setGoal
                }, '변경'),
                React.createElement('div', { className: 'headline' }, "작동: "+state_use),
                React.createElement('button', {
                    className: 'edit-btn',
                    onClick: setUse
                }, '변경')
            ),
            React.createElement('div', { className: 'current-readings' },
                React.createElement('div', { className: 'reading' },
                    React.createElement('p', { className: 'value' }, lastData.temp + '°C'),
                    React.createElement('p', { className: 'label' }, '온도🌡️')
                ),
                React.createElement('div', { className: 'reading' },
                    React.createElement('p', { className: 'value' }, lastData.humi + ' %'),
                    React.createElement('p', { className: 'label' }, '습도💧')
                ),
                React.createElement('div', { className: 'reading' },
                    React.createElement('p', { className: 'value' }, Math.round((lastData.work/lastData.runt)*40) + " W"),
                    React.createElement('p', { className: 'label' }, '가온🔥')
                )
            ),
            React.createElement(DateSelector, null), // 날짜 선택기 추가
        );
    }

    // 차트 컴포넌트
    function ChartCard({ title, chartId, chartColor, data_min, data_max }) {
        const chartRef = useRef(null);
        const chartInstance = useRef(null);
        
        useEffect(() => {
            if (chartRef.current && chartData.table_time && chartData.table_time.length > 0) {                
                // 이전 차트 인스턴스 제거
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }
                
                // 차트에 표시할 데이터 선택
                const chartDataKey = getChartDataKey(title);
                
                // 차트 생성
                chartInstance.current = new Chart(chartRef.current, {
                    type: 'line',
                    data: {
                        labels: chartData.table_time,
                        datasets: [{
                            label: getChartLabel(title),
                            data: chartData[chartDataKey],
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
        }, [chartData]);
        
        // 차트 라벨 가져오기
        function getChartLabel(type) {
            switch (type) {
                case '온도': return '°C';
                case '습도': return '%';
                case '가온': return 'W';
                default: return '';
            }
        }
        
        // 각 차트 유형에 해당하는 데이터 키 가져오기
        function getChartDataKey(type) {
            switch (type) {
                case '온도': return 'table_temp';
                case '습도': return 'table_humi';
                case '가온': return 'table_heat';
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

    // 데이터 로딩 중일 때
    if (isLoading && !lastData) {
        return React.createElement('div', { style: { width: "100%" } },
            React.createElement(Header, null),
            React.createElement('div', { className: 'card' },
                React.createElement('p', null, '데이터를 불러오는 중...')
            )
        );
    }
    
    // 메인 렌더링
    return React.createElement('div', { style: { width: "100%" } },
        React.createElement(Header, null),
        React.createElement(CurrentStatus, null),
        React.createElement('br', null, null),
        React.createElement('div', { className: 'dashboard' },
            React.createElement(ChartCard, {
                title: '온도',
                chartId: 'tempChart',
                chartColor: '#f0a500',
                data_min: -10,
                data_max: 50,
            }),
            React.createElement(ChartCard, {
                title: '습도',
                chartId: 'humidityChart',
                chartColor: '#00adb5',
                data_min: 0,
                data_max: 100,
            }),
            React.createElement(ChartCard, {
                title: '가온',
                chartId: 'heatingChart',
                chartColor: '#ff6b6b',
                data_min: 0,
                data_max: 50,
            })
        )
    );
}

// 시크릿 코드 함수
async function secret_code(title) {
    let del_code = "";
    for (let index = 0; index < 4; index++) {
        del_code += ascii();
    }
    const input = await Swal.fire({
        title: title,
        input: "text",
        text: del_code + "를 입력하세요.",
        showCancelButton: true,
        inputPlaceholder: del_code,
        confirmButtonText: "변경",
        cancelButtonText: "취소"
    })
    console.log(del_code, input.value);
    return del_code == input.value;
}

// ASCII 코드 생성 함수
function ascii() {
    const type = Math.floor(Math.random()*3);
    let ascii_dec = 0;
    if(type == 0){
        ascii_dec = Math.floor(Math.random()*10)+48;
    }else{
        ascii_dec = Math.floor(Math.random()*26);
        if(type == 1) ascii_dec += 65;
        else ascii_dec += 97;
    }
    return String.fromCharCode(ascii_dec);
}

// 초기화 및 앱 렌더링
function init() {
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(React.createElement(App, null));
}

init();