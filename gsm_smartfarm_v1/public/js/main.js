if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    window.location.href = '/web/login';
}else if(localStorage.getItem('device') === null){
    window.location.href = '/web/select';
}else{
    const userid    = localStorage.getItem('user');
    const token     = localStorage.getItem('token');
    const device    = localStorage.getItem('device');
    const date_now  = new Date();

    fetch(window.location.protocol+"//"+window.location.host+"/user/log", {
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
        response.status
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
        const res = data.split("\r\n");
        
        if(res[0] == "log"){
            const graph = {
                labels: [],
                datasets: [{
                    label: '물',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }, {
                    label: '양액',
                    data: [],
                    borderColor: 'rgb(54, 162, 235)',
                    tension: 0.1
                }, {
                    label: '실내',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }, {
                    label: '실외',
                    data: [],
                    borderColor: 'rgb(255, 206, 86)',
                    tension: 0.1
                }]
            }
            let log_day = null;
            for (let index = 1; index < res.length-1; index++) {
                const log = res[index].split(",");
                const log_date = new Date(log[0]);
                if(log_day == log_date.getDate()){
                    graph.labels.push(log_date.getHours()+":"+log_date.getMinutes());
                }else{
                    log_day = log_date.getDate();
                    graph.labels.push(log_date.getDate()+"일 "+log_date.getHours()+":"+log_date.getMinutes());
                }
                graph.datasets[0].data.push(log[1]/10);
                graph.datasets[1].data.push(log[2]/10);
                graph.datasets[2].data.push(log[3]/10);
                graph.datasets[3].data.push(log[4]/10);
                if(index == res.length-2){
                    document.getElementById('log_date').textContent = log_date.getFullYear()+"년 "+(log_date.getMonth()+1)+"월 "+log_date.getDate()+"일 "+log_date.getHours()+"시 "+log_date.getMinutes()+"분";
                    document.getElementById('temp_water').textContent = log[1]/10;
                    document.getElementById('temp_lquid').textContent = log[2]/10;
                    document.getElementById('temp_inside').textContent = log[3]/10;
                    document.getElementById('temp_outside').textContent = log[4]/10;
                }
            }
            let chart = new Chart(document.getElementById('tempChart').getContext('2d'), {
                type: 'line',
                data: graph,
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '온도 (°C)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: '시간'
                            }
                        }
                    }
                }
            });
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    });
}