function init() {
    const today = new Date();
    graph(today);
}

async function graph(select_day) {
    // 오늘 날짜 생성 (시간은 00:00:00으로 설정)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // select_day가 오늘보다 미래인 경우 오늘 날짜로 제한
    if (select_day > today) {
        select_day = new Date(today);
    }
    
    const sendData = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token'),
        type:   "act",
        dvid:   window.location.pathname.split("act/")[1],
        date:   [select_day.getFullYear(), select_day.getMonth(), select_day.getDate()]
    };
    
    const root = ReactDOM.createRoot(document.getElementById("root"));
    const response = await(await fetchData("request/log", sendData)).json();
    
    const option = {
        title: {text:'🐝'},
        tooltip: {trigger: 'axis'},
        legend: {data: ['Total', 'Bee-In', 'Bee-Out']},
        grid: {left:'3%', right:'4%', bottom:'3%', containLabel: true},
        toolbox: {feature: {saveAsImage:{}}},
        yAxis: {type:'value'},
        xAxis: {type:'category', data:[]},
        series: [
            {name:'Total',   type:'line', step:'middle', data:[]},
            {name:'Bee-In',  type:'line', step:'start',  data:[]},
            {name:'Bee-Out', type:'line', step:'end',    data:[]}
        ]
    };
    
    const data_sum = {sum:0, in:0, out:0};
    
    for (const element of response) {
        option.xAxis.data.push(time_parser(element.date));
        for (const key in element) {
            if (data_sum[key] !== undefined) {
                data_sum[key] += element[key];
            }
        }
        option.series[0].data.push(element.sum);
        option.series[1].data.push(element.in);
        option.series[2].data.push(element.out);
    }
    
    // YYYY-MM-DD 형식으로 날짜 포맷팅
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    const dateValue = formatDateForInput(select_day);
    
    // 이전 날짜로 이동
    function prevDay() {
        const prevDate = new Date(select_day);
        prevDate.setDate(prevDate.getDate() - 1);
        graph(prevDate);
    }
    
    // 다음 날짜로 이동 (오늘 날짜 이후로는 불가)
    function nextDay() {
        const nextDate = new Date(select_day);
        nextDate.setDate(nextDate.getDate() + 1);
        
        // 다음 날짜가 오늘 이후인지 확인
        if (nextDate > today) {
            return; // 오늘 이후로는 이동 불가
        }
        
        graph(nextDate);
    }
    
    // 날짜 입력 필드 변경 처리
    function handleDateChange(event) {
        const newDate = new Date(event.target.value);
        // 시간대 오프셋 조정
        newDate.setMinutes(newDate.getMinutes() + newDate.getTimezoneOffset());
        
        // 선택한 날짜가 오늘 이후인지 확인
        if (newDate > today) {
            graph(today); // 오늘 이후로는 오늘 날짜로 제한
            return;
        }
        
        graph(newDate);
    }
    
    // 다음 날짜 버튼 활성화 여부 확인
    const isNextButtonDisabled = new Date(select_day.getTime()) >= today;
    // 버튼 스타일 정의
    const buttonStyle = {
        padding: '8px 16px',
        margin: '0 10px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    };
    // 비활성화된 버튼 스타일
    const disabledButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#cccccc',
        cursor: 'not-allowed',
        opacity: 0.7,
        boxShadow: 'none'
    };
    // 입력 필드 스타일
    const inputStyle = {
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    };
    // 통계 컨테이너 스타일
    const statsContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        margin: '10px 0',
        padding: '5px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
    // 개별 통계 항목 스타일
    const statItemStyle = {
        margin: '0 15px',
        padding: '8px 15px',
        borderRadius: '20px',
        fontWeight: 'bold',
        display: 'inline-block'
    };
    // 색상이 다른 통계 스타일
    const totalStatStyle = {
        ...statItemStyle,
        backgroundColor: '#e8f5e9',
        color: '#2e7d32'
    };
    const inStatStyle = {
        ...statItemStyle,
        backgroundColor: '#e3f2fd',
        color: '#1565c0'
    };
    const outStatStyle = {
        ...statItemStyle,
        backgroundColor: '#ffebee',
        color: '#c62828'
    };
    
    root.render([
        React.createElement("div", null, [
            React.createElement("button", { onClick: prevDay,style: buttonStyle }, "prev day"),
            React.createElement("input", {
                type: "date",
                value: dateValue,
                onChange: handleDateChange,
                max: formatDateForInput(today), // 오늘 날짜를 최대값으로 설정
                style: inputStyle
            }),
            React.createElement("button", { 
                onClick: nextDay,
                disabled: isNextButtonDisabled, // 오늘 날짜면 비활성화
                style: isNextButtonDisabled ? disabledButtonStyle : buttonStyle
            }, "next day")
        ]),
        React.createElement("div", { style: statsContainerStyle }, [
            React.createElement("span", { style: totalStatStyle }, "합계: " + data_sum.sum),
            React.createElement("span", { style: inStatStyle }, "입: " + data_sum.in),
            React.createElement("span", { style: outStatStyle }, "출: " + data_sum.out)
        ]),
        React.createElement(EChartsComponent, { option }, null)
    ]);
}

// 시간 파서 함수
function time_parser(data_time) {
    const time = new Date(data_time);
    let minute = time.getMinutes();
    if(minute < 10) minute = "0" + minute;
    return "" + time.getHours() + ":" + minute;
}

// ECharts 컴포넌트
function EChartsComponent({ option }) {
    const chartRef = React.useRef(null);
    
    React.useEffect(function() {
        const chartDom = chartRef.current;
        const myChart = echarts.init(chartDom);
        myChart.setOption(option);
        
        // 클린업 함수
        return function() {
            myChart.dispose();
        };
    }, [option]);
    
    return React.createElement('div', {
        ref: chartRef,
        style: { width: 'inherit', height: '300px' }
    });
}

// 초기화 함수 실행
init();