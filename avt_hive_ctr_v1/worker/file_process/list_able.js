const { parentPort } = require('worker_threads');
const memory_admin  = require('../../api/memory_admin');

parentPort.on('message', async (conn_ip) => {
    let response = {hive:"",hive_25:"",pump:""};
    const data_hive = memory_admin.data_get_device("device","renew_device.txt","data_device.json")[conn_ip];
    const data_hive_25 = memory_admin.data_get_device("device_25","renew_device_25.txt","data_device_25.json")[conn_ip];    
    const data_pump = memory_admin.data_get_device("pump","renew_pump.txt","data_pump.json")[conn_ip];
    for (const key in data_hive) {
        if(data_hive[key].USER == null) response.hive += key+',';
    }
    for (const key in data_hive_25) {
        if(data_hive_25[key].USER == null) response.hive_25 += key+',';
    }
    for (const key in data_pump) {
        if(data_pump[key].USER == null) response.pump += key+',';
    }
    // 결과를 메인 스레드로 전송
    parentPort.postMessage(response);
});