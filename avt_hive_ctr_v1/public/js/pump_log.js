if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    window.location.href = '/web/login';
}else if(localStorage.getItem('macaddr') === null){
    window.location.href = '/web/select';
}else{
    document.getElementById('data_day').value = new Date().toISOString().substring(0, 10);
    getdata(new Date());
}
////--------------------------------------------------------------------////
const liquid_hight = 60;
const log_data = {};
////--------------------------------------------------------------------////
function date_parser(data_day) {
    return ""+data_day.getFullYear()+data_day.getMonth()+data_day.getDate();
}
////-------------------////
function time_parser(data_day) {
    let minute = data_day.getMinutes();
    if(minute<10) minute = "0"+minute;
    return ""+data_day.getHours()+":"+minute;
}
////-------------------////
function day_change(flage){
    let data_day = new Date(document.getElementById('data_day').value);
    if(flage){
        data_day.setDate(data_day.getDate()+1);
        const today = new Date();
        if(today<data_day) data_day = today;
    }else{
        data_day.setDate(data_day.getDate()-1);
    }
    document.getElementById('data_day').value = data_day.toISOString().substring(0, 10);
    const date_data = date_parser(data_day);
    if(log_data[date_data] === undefined){
        getdata(data_day);
    }else{
        draw_chart(date_data);
    }
}
function draw_chart(date_data){
    echarts_draw(log_data[date_data],"L","graph_water","sona");
    echarts_draw(log_data[date_data],"°C","graph_temp","temp");
    echarts_draw(log_data[date_data],"%","graph_humi","humi");
}
////-------------------////
function getdata(date_now){
    const userid    = localStorage.getItem('user');
    const token     = localStorage.getItem('token');
    const device    = localStorage.getItem('macaddr');

    fetch(window.location.protocol+"//"+window.location.host+"/pump/log", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id:     userid,
            token:  token,
            dvid:   device,
            date:   [date_now.getFullYear(),date_now.getMonth(),date_now.getDate()]
        })
    })
    .then(response => {
        if (response.status==400) {
            throw new Error('정보가 누락됐습니다.');
        }else if (response.status==401) {
            throw new Error('로그인 정보가 없습니다.');
        }else if (response.status==403) {
            throw new Error('등록되지 않은 장비입니다.');
        }else if (response.status==409) {
            throw new Error('이미 등록된 장비입니다.');
        }
        return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .then(data => {
        const res       = data.split("\r\n");
        const date_data = date_parser(date_now);

        if(log_data[date_data] === undefined) log_data[date_data] = [];

        if(res[0] == "log"){
            for (let index = 1; index < res.length; index++) {
                log_data[date_data].push(JSON.parse(res[index]));
            }
        }else{
            log_data[date_data] = [];
        }
        draw_chart(date_data);
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    });
}
////-------------------////
function echarts_draw(draw_data,format,dom,data) {
    const option_basic = {
        tooltip: {trigger: 'axis'},
        toolbox: {
            show: true,
            feature: {
                dataZoom:  { yAxisIndex: 'none'},
                dataView:  { readOnly: false },
                magicType: { type: ['line', 'bar'] }
            }
        },
        color:["#73c0de","#fac858"],
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: []
        },
        yAxis: {
            type: 'value',
            min:0,
            max:100,
            axisLabel: {formatter: '{value} '+format}
        },
        series: [{
            name: "펌프",
            type: 'line',
            data: [],
            markPoint: {data: [{ type: 'max', name: 'Max' },{ type: 'min', name: 'Min' }]},
            markLine:  {data: [{ type: 'average', name: 'Avg' }]}
        }]
    };

    const option = {...option_basic};

    if(draw_data != undefined && draw_data.length != 0){
        for (let index = 0; index < draw_data.length; index++) {
            const data_date = new Date(draw_data[index].date);
            option.xAxis.data.push(time_parser(data_date));
        }
    }

    if(data == "sona"){
        option.yAxis.max = 200;
        option.series[0].name = "급수";
        option.series.push(
            {
                name: "사양",
                type: 'line',
                data: [],
                markPoint: {data: [{ type: 'max', name: 'Max' },{ type: 'min', name: 'Min' }]},
                markLine:  {data: [{ type: 'average', name: 'Avg' }]}
            }
        );
    }else if(data == "temp"){
        option.yAxis.min = -20;
        option.yAxis.max = 50;
        option.series[0].name = "온도";
        option.color[0] = "#ee6666";
    }else{
        option.series[0].name = "습도";
        option.color[0] = "#5470c6";
    }

    if(data == "sona"){
        const liquid_hight = 60;
        for (let index = 0; index < draw_data.length; index++) {
            option.series[0].data.push(liquid_hight-parseInt(draw_data[index].DATA.sona1));
            option.series[1].data.push(liquid_hight-parseInt(draw_data[index].DATA.sona2));
        }
    }else{
       for (let index = 0; index < draw_data.length; index++) {
            option.series[0].data.push(draw_data[index].DATA[data]);
        } 
    }
    let chartDom = document.getElementById(dom);
    let chart    = echarts.init(chartDom, null, {renderer: 'canvas',useDirtyRect: false});
    chart.setOption(option);
    window.addEventListener('resize', chart.resize);
}
////-------------------////