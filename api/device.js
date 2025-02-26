const file_system = require('./fs_core');
const path_data = require('./fs_path');

module.exports = {
    ip_check: async function(conn_ip){ 
        const device_list = await file_system.Dir(path_data.device());
        let response = [];
        for (const device of device_list) {
            const device_path = path_data.device()+"/"+device;
            if(!await file_system.check(device_path+"/owner.txt") && await file_system.check(device_path+"/ip.txt")){
                if(await file_system.fileRead(device_path,"ip.txt") == conn_ip){
                    response.push(device);
                }
            }
        }
        return response;
    },
}