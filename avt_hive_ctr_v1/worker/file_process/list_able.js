const { parentPort } = require('worker_threads');
const memory_admin  = require('../../api/memory_admin');

parentPort.on('message', async (conn_ip) => {
    let response = {hive:"",pump:""};
    const data_hive = memory_admin.data_get_device()[conn_ip];
    const data_pump = memory_admin.data_get_pump()[conn_ip];
    for (const key in data_hive) {
        if(data_hive[key].USER == null) response.hive += key+',';
    }
    for (const key in data_pump) {
        if(data_pump[key].USER == null) response.pump += key+',';
    }
    // 결과를 메인 스레드로 전송
    parentPort.postMessage(response);
});