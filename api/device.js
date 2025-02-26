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

    connect: async function(user, dvid, name){
        let response = 401;
        const path_user   = path_data.user()+"/"+user;
        const path_device = path_data.device()+"/"+dvid;

        if(await file_system.check(path_user) && await file_system.check(path_device)){
            if(await file_system.check(path_device+"/owner.txt")){
                response = 409;
            }else{
                //여기서 관리자모드 변경추가
                response = 200;
                const file_content = await file_system.fileRead(path_user,"device.csv");
                if(file_content){
                    const devices  = file_content.split("\r\n");
                    let device_duplication = false;
                    for (let index = 0; index < devices.length; index++) {
                        if(devices[index].split(",")[0] == dvid){
                            device_duplication = true;
                            break;
                        }
                    }
                    if(!device_duplication) await file_system.fileADD(path_user,"\r\n"+dvid+","+name,"device.csv");
                }else{
                    await file_system.fileMK(path_user,dvid+","+name,"device.csv");
                }
                await file_system.fileMK(path_device,user,"owner.txt");
            }
        }
        return response;
    },

    disconnect: async function(user, dvid, name){
        let response = 401;
        const path_user   = path_data.user()+"/"+user;
        const path_device = path_data.device()+"/"+dvid;

        if(await file_system.check(path_device+"/owner.txt")){
            response = 200;
            //여기서 관리자모드 변경추가
            await file_system.fileDel(path_device,"owner.txt");
        }
        if(await file_system.check(path_user+"/device.csv")){
            response = 200;
            //여기서 관리자모드 변경추가
            let new_list = "";
            const list  = await file_system.fileRead(path_user,"device.csv").split("\r\n");
            let line_shift = false;
            for (let index = 0; index < list.length; index++) {
                if(list[index].split(",")[0] != device_id){
                    if(line_shift) new_list += "\r\n";
                    else line_shift = true;
                    new_list += list[index];
                }
            }
            await file_system.fileMK(path_user,new_list,"device.csv");
        }
        return response;
    },
}