const temperatures  = {};
const times         = {};
const bettery_data  = {};

document.getElementById('data_day').value = new Date().toISOString().substring(0, 10);
getdata(new Date());

function day_change(flage){
    let data_day = new Date(document.getElementById('data_day').value);
    if(flage){
        data_day.setDate(data_day.getDate()+1);
    }else{
        data_day.setDate(data_day.getDate()-1);
    }
    document.getElementById('data_day').value = data_day.toISOString().substring(0, 10);
    const date_data = ""+data_day.getFullYear()+data_day.getMonth()+data_day.getDate();
    if(new Date().toISOString().substring(0, 10) === document.getElementById('data_day').value || temperatures[date_data] === undefined){
        console.log("post!");
        getdata(data_day);
    }else{
        drawing(date_data);
    }
}

function getColor(temp) {
    const minTemp = 0;
    const maxTemp = 50;
    const normalizedTemp = (temp - minTemp) / (maxTemp - minTemp);
    let r, g, b;
    if (normalizedTemp < 0.25) {
        b = 255 * (1 - normalizedTemp * 4);
        g = 255 * normalizedTemp * 4;
        r = 0;
    } else if (normalizedTemp < 0.5) {
        b = 0;
        g = 255;
        r = 255 * (normalizedTemp - 0.25) * 4;
    } else if (normalizedTemp < 0.75) {
        b = 0;
        g = 255 * (1 - (normalizedTemp - 0.5) * 4);
        r = 255;
    } else {
        b = 0;
        g = 0;
        r = 255;
    }
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function updateHoneycomb(key, timeIndex) {    
    const lipo = bettery_data[key]?bettery_data[key][timeIndex]: undefined;
    const lipo_tag = document.getElementById('lipo');
    if(lipo != undefined){
        lipo_tag.style.display = 'block';
        const lipo_percent = lipo > 4.1 ?"100":((lipo-3.3)/0.8*100).toFixed(2);
        const lipo_emoji = lipo > 3.5 ? "🔋" : "🪫";
        document.getElementById('lipo_percent').innerText = lipo_emoji+lipo_percent+"%";        
    }else{
        lipo_tag.style.display = 'none';
    }

    if(timeIndex<temperatures[key].length){
        const honeycomb = document.getElementById('honeycomb');
        honeycomb.innerHTML = '';
        let rowsData = temperatures[key][timeIndex];
        console.log(rowsData.length);
        for (let row = 0; row < rowsData.length; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'row';
            for (let col = 0; col < rowsData[row].length; col++) {
                const temp = rowsData[row][col];
                const temp_correction = (temp/100).toFixed(1);
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.textContent = temp_correction;
                cell.style.backgroundColor = getColor(temp_correction);
                cell.onclick = function() {                    
                    modal_graph(row,col);
                };
                rowElement.appendChild(cell);
            }
            honeycomb.appendChild(rowElement);
            
        }
        const time_log = new Date(times[key][timeIndex]);
        document.getElementById('timeDisplay').textContent = `시간: ${time_log.getFullYear()}년 ${time_log.getMonth()+1}월 ${time_log.getDate()}일 ${time_log.getHours()}시 ${time_log.getMinutes()}분`;
    }
}

function drawing(key){
    document.getElementById('controller').innerHTML=`<button id="prevBtn">이전</button>
    <input type="range" id="timeSlider" min="0" max="0" value="0">
    <button id="nextBtn">다음</button>`;
    const slider    = document.getElementById('timeSlider');
    const prevBtn   = document.getElementById('prevBtn');
    const nextBtn   = document.getElementById('nextBtn');
    let  data_max   = temperatures[key].length-1;
    if(data_max<0) data_max = 0;
    slider.max      = data_max;
    slider.value    = data_max;
    if(data_max>0){
        slider.addEventListener('input', () => updateHoneycomb(key, parseInt(slider.value)));
        prevBtn.addEventListener('click', () => {
            let sliver_val  = parseInt(slider.value);
            if(sliver_val>0)  sliver_val -= 1;
            slider.value    = sliver_val;
            updateHoneycomb(key, sliver_val);
        });
        nextBtn.addEventListener('click', () => {
            let sliver_val  = parseInt(slider.value);
            if(sliver_val<data_max) sliver_val += 1;
            slider.value    = sliver_val;
            updateHoneycomb(key, sliver_val);
        });
        window.addEventListener('resize', () => {
            updateHoneycomb(key, parseInt(slider.value));
        });
    }
    updateHoneycomb(key, data_max);
}

async function getdata(date_now){
    const sendData = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token'),
        type:   "array",
        dvid:   window.location.pathname.split("array/")[1],
        date:   [date_now.getFullYear(), date_now.getMonth(), date_now.getDate()]
    };

    const response = await(await fetchData("request/log", sendData)).json();
    
    const date_data = ""+date_now.getFullYear()+date_now.getMonth()+date_now.getDate();
    if(temperatures[date_data] === undefined) temperatures[date_data] = [];
    if(times[date_data] === undefined) times[date_data] = [];
    
    temperatures[date_data] = [];
    times[date_data]        = [];

    if(response.length>0){
        for (let index = 0; index < response.length; index++) {
            let rawdata = [];
            const json = response[index];
            times[date_data].push(json.date);
            for (const key in json) {
                if(key == "lipo"){
                    if(bettery_data[date_data] == undefined) bettery_data[date_data] = {};
                    bettery_data[date_data][temperatures[date_data].length] = json[key];
                }else if(key != "date"){
                    const element = json[key];
                    rawdata.push(element);
                }
            }
            let temperature = [];
            
            for (let row = 0; row < rawdata[0].length; row++) {
                let temperature_array = [];
                for (let column = rawdata.length-1; column >= 0; column--) {
                    if(temperature_array.length!=0)temperature_array.push((rawdata[row][column]+temperature_array[temperature_array.length-1])/2);
                    temperature_array.push(rawdata[row][column]);
                }
                temperature.push(temperature_array);
            }
            temperatures[date_data].push(temperature);
        }
    }else{
        temperatures[date_data]    = [[]];
        times[date_data]           = [date_now];
    }
    drawing(date_data);
}

function modal_close() {
    document.getElementById('modal').style.display = 'none';
}
function modal_graph(row,col) {
    document.getElementById('modal').style.display = 'block';
    document.getElementById('point_vector').innerText = `point : (${row}, ${col})`;
    echarts_draw(row,col);
}
////-------------------////
function echarts_draw(row,col) {
    let chartDom = document.getElementById("point_graph");
    let chart    = echarts.init(chartDom);
    
    const option = {
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
            min:-20,
            max:50,
            axisLabel: {formatter: '{value} °C'}
        },
        series: [{
            name: "온도",
            type: 'line',
            color: "#ee6666",
            data: [],
            markPoint: {data: [{ type: 'max', name: 'Max' },{ type: 'min', name: 'Min' }]},
            markLine:  {data: [{ type: 'average', name: 'Avg' }]}
        }]
    };

    for (const key in temperatures) {
        const data_graph = temperatures[key];//[row][col];
        for (let index = 0; index < data_graph.length; index++) {
            const datas = data_graph[index];
            if(datas.length != 0){
                const time_log = new Date(times[key][index]);
                option.xAxis.data.push(`${time_log.getFullYear()}/${time_log.getMonth()+1}/${time_log.getDate()} ${time_log.getHours()}:${time_log.getMinutes()}`);
                option.series[0].data.push(datas[row][col]/100);
            }
        }
    }
    chart.setOption(option);
    window.addEventListener('resize', chart.resize);
}