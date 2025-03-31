const file_system = require('./fs_core');
const path_data   = require('./path_data');
const file_data   = require('./file_data');
const file_worker = require('../worker/file_process');

module.exports = {
    data_renewal : function(type){
        const path_admin = path_data.admin();
        if(type)file_system.fileMK(path_admin,"1","renew_user.txt");
        else{
            file_system.fileMK(path_admin,"1","renew_device.txt");
            file_system.fileMK(path_admin,"1","renew_pump.txt");
            file_system.fileMK("./data/common","1","renew_data.txt");
        }
    },
    data_check : function(file_name){
        const path_admin = path_data.admin();
        let response  = false;
        if(file_system.check(path_admin+"/renew_"+file_name+".txt") && file_system.check(path_admin+"/data_"+file_name+".json")){
            if(file_system.fileRead(path_admin,"renew_"+file_name+".txt") == "1") response = true;
        }else{response = true;}
        return response;
    },
    data_get : async function(){
        let response = null;
        response = await file_worker.data_renewal();
        return response;
    },
    data_get_user : function(){
        let response = null;
        const path_admin = path_data.admin();
        const path_user  = path_data.user();
        const user_list  = file_system.Dir(path_user);
        if(this.data_check("user")){
            response = {};
            file_system.fileMK(path_admin,"0","renew_user.txt");
            for (let index = 0; index < user_list.length; index++) {
                const user_path = path_user+"/"+user_list[index];
                if(file_system.check(user_path+"/config.csv")){
                    const user_info = file_system.fileRead(user_path,"config.csv").split(",");
                    response[user_list[index]] = {
                        date:user_info[2],
                        name:user_info[3],
                        farm:user_info[4],
                        addr:user_info[5],
                        tel :user_info[6]
                    };
                }else{
                    response[user_list[index]] = {date:null,name:null,farm:null,addr:null,tel :null};
                }
            }
            file_system.fileMK(path_admin,JSON.stringify(response),"data_user.json");
        }else{
            response = JSON.parse(file_system.fileRead(path_admin,"data_user.json"));
        }
        return response;
    },
    data_get_device : function(){
        let response = null;
        const path_admin  = path_data.admin();
        const path_device = path_data.device("device");
        const device_list = file_system.Dir(path_device);
        if(this.data_check("device")){
            response = {};
            file_system.fileMK(path_admin,"0","renew_device.txt");
            for (let index = 0; index < device_list.length; index++) {
                const device_path = path_device+"/"+device_list[index];
                const device_ip = file_system.fileRead(device_path,"ip.txt");
                if(response[device_ip] == undefined) response[device_ip] = {};
                response[device_ip][device_list[index]] = {USER:file_system.fileRead(device_path,"owner.txt"),VER:file_system.fileRead(device_path,"ver.txt"),}
            }
            file_system.fileMK(path_admin,JSON.stringify(response),"data_device.json");
        }else{
            response = JSON.parse(file_system.fileRead(path_admin,"data_device.json"));
        }
        return response;
    },
    data_get_pump : function(){
        let response = null;
        const path_admin  = path_data.admin();
        const path_pump = path_data.device("pump");
        const pump_list = file_system.Dir(path_pump);
        if(this.data_check("pump")){
            response = {};
            file_system.fileMK(path_admin,"0","renew_pump.txt");
            for (let index = 0; index < pump_list.length; index++) {
                const pump_path = path_pump+"/"+pump_list[index];
                const pump_ip = file_system.fileRead(pump_path,"ip.txt");
                if(response[pump_ip] == undefined) response[pump_ip] = {};
                response[pump_ip][pump_list[index]] = {USER:file_system.fileRead(pump_path,"owner.txt"),VER:file_system.fileRead(pump_path,"ver.txt"),}
            }
            file_system.fileMK(path_admin,JSON.stringify(response),"data_pump.json");
        }else{
            response = JSON.parse(file_system.fileRead(path_admin,"data_pump.json"));
        }
        return response;
    },
}