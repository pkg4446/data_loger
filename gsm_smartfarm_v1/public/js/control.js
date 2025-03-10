window.addEventListener('load', fetchInitialData);
        
        function fetchInitialData() {
            fetch(window.location.protocol+"//"+window.location.host+"/user/config", {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id    : localStorage.getItem('user'),
                    token : localStorage.getItem('token'),
                    dvid  : localStorage.getItem('device'),
                })
            })
            .then(response => response.json())
            .then(data => {
                populateForm(data);
            })
            .catch((error) => {
                alert('초기 데이터를 불러오는 데 실패했습니다.');
            });
        }

        function populateForm(data) {
            console.log(data);
            // 관수
            if(data.water != undefined){
                if(data.water.run != undefined) document.getElementById('water-run').value = data.water.run;
                if(data.water.stp != undefined) document.getElementById('water-stp').value = data.water.stp;
            }
            if(data.liquid != undefined){
                if(data.liquid.run != undefined) document.getElementById('nutrient-run').value = data.liquid.run;
                if(data.liquid.stp != undefined) document.getElementById('nutrient-stp').value = data.liquid.stp;
            }
            // 조명
            if(data.lamp_a != undefined){
                if(data.lamp_a.run != undefined){
                    document.getElementById('light-a-run').value = data.lamp_a.run;
                }
                if(data.lamp_a.stp != undefined){
                    document.getElementById('light-a-stp').value = data.lamp_a.stp;
                };
            }
            if(data.lamp_b != undefined){
                if(data.lamp_b.run != undefined){
                    document.getElementById('light-b-run').value = data.lamp_b.run;
                };
                if(data.lamp_b.stp != undefined){
                    document.getElementById('light-b-stp').value = data.lamp_b.stp;
                };
            }
            if(data.lamp_c != undefined){
                if(data.lamp_c.run != undefined){
                    document.getElementById('light-c-run').value = data.lamp_c.run;
                };
                if(data.lamp_c.stp != undefined){
                    document.getElementById('light-c-stp').value = data.lamp_c.stp;
                };
            }
            if(data.lamp_d != undefined){
                if(data.lamp_d.run != undefined){
                    document.getElementById('light-d-run').value = data.lamp_d.run;
                };
                if(data.lamp_d.stp != undefined){
                    document.getElementById('light-d-stp').value = data.lamp_d.stp;
                };
            }
            // 냉난방
            if(data.temp != undefined){
                if(data.temp.run != undefined) document.getElementById('target-temp').value = data.temp.run;
                if(data.temp.stp != undefined) document.getElementById('temp-tolerance').value = data.temp.stp;
            }
            // 공조
            if(data.circul_i != undefined){
                if(data.circul_i.run != undefined) document.getElementById('internal-run').value   = data.circul_i.run;
                if(data.circul_i.stp != undefined) document.getElementById('internal-stp').value   = data.circul_i.stp;
            }
            if(data.circul_o != undefined){
                if(data.circul_o.run != undefined) document.getElementById('external-run').value   = data.circul_o.run;
                if(data.circul_o.stp != undefined) document.getElementById('external-stp').value   = data.circul_o.stp;
            }
        }

        function sendData(type, action) {
            let data = {
                id    : localStorage.getItem('user'),
                token : localStorage.getItem('token'),
                dvid  : localStorage.getItem('device'),
                type  : type
            }
            switch(type) {
                case 'irrigation':
                    data.data= [[document.getElementById('water-run').value,document.getElementById('water-stp').value],
                                  [document.getElementById('nutrient-run').value,document.getElementById('nutrient-stp').value]
                                ];
                    break;
                case 'lighting':
                    data.data=[[document.getElementById('light-a-run').value,document.getElementById('light-a-stp').value],
                                [document.getElementById('light-b-run').value,document.getElementById('light-b-stp').value],
                                [document.getElementById('light-c-run').value,document.getElementById('light-c-stp').value],
                                [document.getElementById('light-d-run').value,document.getElementById('light-d-stp').value]
                            ];
                    break;
                case 'temperature':
                    data.data = {
                                target: document.getElementById('target-temp').value,
                                tolerance: document.getElementById('temp-tolerance').value
                            };
                    break;
                case 'airConditioning':
                    data.data = [[document.getElementById('internal-run').value,document.getElementById('internal-stp').value],
                                [document.getElementById('external-run').value,document.getElementById('external-stp').value]
                            ];
                    break;
                case 'houseControl':
                    data.data = action;
                    break;
            }

            fetch(window.location.protocol+"//"+window.location.host+"/user/cmd", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.text())
            .then(result => {
                console.log('Success:', result);
                alert(`${type} 데이터가 성공적으로 전송되었습니다.`);
            })
            .catch((error) => {
                console.error('Error:', error);
                alert(`${type} 데이터 전송 중 오류가 발생했습니다.`);
            });
        }