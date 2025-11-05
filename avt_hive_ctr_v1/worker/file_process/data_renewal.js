const { parentPort } = require('worker_threads');
const memory_admin   = require('../../api/memory_admin');
const ip_collecter   = require('../../api/ip_collecter');

parentPort.on('message', async (data) => {
    let server_data = {
        user:   memory_admin.data_get_user(),
        device: memory_admin.data_get_device("device","renew_device.txt","data_device.json"),
        device_25: memory_admin.data_get_device("device_25","renew_device_25.txt","data_device_25.json"),
        pump:   memory_admin.data_get_device("pump","renew_pump.txt","data_pump.json")
    };
    const ip_check = ip_collecter.ip_get();
    const response = server_data;
    // 결과를 메인 스레드로 전송
    parentPort.postMessage(response);
});