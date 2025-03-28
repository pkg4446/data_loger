const { parentPort } = require('worker_threads');
const file_system    = require("../../api/fs_core");
const path_data      = require("../../api/path_data");
const file_data      = require("../../api/file_data");

parentPort.on('message', async (device) => {
    const   path_device = path_data.pump()+"/"+device.DVC;
    delete  device.DVC;
    device.date = new Date();

    let path_log = path_device+"/"+device.date.getFullYear()+"/";
    
    if(device.date.getMonth()<10) path_log += "0";
    path_log += device.date.getMonth();
    let filename = "";
    if(device.date.getDate()<10) filename += "0";
    filename += device.date.getDate();
    let file_content = JSON.stringify(device);

    if(!file_system.check(path_log)){file_system.folderMK(path_log);}
    
    if(file_system.check(path_device+"/ip.txt")){
        if(file_system.fileRead(path_device,"ip.txt") != device.IP) file_system.fileMK(path_device,device.IP,"ip.txt");
    }else file_system.fileMK(path_device,device.IP,"ip.txt");

    file_system.fileMK(path_device,file_content,"lastest.json");
    if(file_system.check(path_log+"/"+filename+".json")){
        file_system.fileADD(path_log,"\r\n"+file_content,filename+".json");
    }else{
        file_system.fileMK(path_log,file_content,filename+".json");
    }
    
    let response = "";
    if(file_system.fileRead(path_device,file_data.firmware_update("pump")) == 1){
        response = "updt,";
    }else{
        response = "set,";
        if(file_system.check(path_device+"/config.csv")){
            response += file_system.fileRead(path_device,"config.csv")
        }else response += "12,12,12,12,12,12";
    }

    // 결과를 메인 스레드로 전송
    parentPort.postMessage(response);
});