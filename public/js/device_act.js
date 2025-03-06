function init() {
    const today = new Date();
    graph(today);
}

async function graph(select_day) {
    const sendData = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token'),
        type:   "act",
        dvid:   window.location.pathname.split("act/")[1],
        date:   [select_day.getFullYear(), select_day.getMonth(), select_day.getDate()]
    };
    
    const root = ReactDOM.createRoot(document.getElementById("root"));
    const response = await(await fetchData("device/log", sendData)).json();
    
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
    
    // 다음 날짜로 이동
    function nextDay() {
        const nextDate = new Date(select_day);
        nextDate.setDate(nextDate.getDate() + 1);
        graph(nextDate);
    }
    
    // 날짜 입력 필드 변경 처리
    function handleDateChange(event) {
        const newDate = new Date(event.target.value);
        // 시간대 오프셋 조정
        newDate.setMinutes(newDate.getMinutes() + newDate.getTimezoneOffset());
        graph(newDate);
    }
    
    root.render([
        React.createElement("div", null, [
            React.createElement("button", { onClick: prevDay }, "prev day"),
            React.createElement("input", {
                type: "date",
                value: dateValue,
                onChange: handleDateChange
            }),
            React.createElement("button", { onClick: nextDay }, "next day")
        ]),
        React.createElement("div", null, [
            React.createElement("span", null, "total:" + data_sum.sum),
            React.createElement("span", null, ", in:" + data_sum.in),
            React.createElement("span", null, ", out:" + data_sum.out)
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