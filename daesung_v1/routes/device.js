const express       = require('express');
const requestIp     = require('request-ip');
const file_system   = require('../api/fs_core');
const path_data     = require('../api/fs_path');
const router        = express.Router();

async function fn_path_log(path_device,log_date,device_ip) {
    let path_log = path_device+"/"+log_date.getFullYear()+"/";
    if(!await file_system.check(path_log)){await file_system.folderMK(path_log);}

    if(await file_system.check(path_device+"/ip.txt")){
        if(await file_system.fileRead(path_device,"ip.txt") != device_ip) await file_system.fileMK(path_device,device_ip,"ip.txt");
    }else await file_system.fileMK(path_device,device_ip,"ip.txt");

    if(log_date.getMonth()<10) path_log += "0";
    path_log += log_date.getMonth();

    if(!await file_system.check(path_log)){await file_system.folderMK(path_log);}    
    return path_log;
}

function fn_file_name(log_date) {
    let filename = "";
    if(log_date.getDate()<10) filename += "0";
    filename += log_date.getDate();
    return filename;
}

async function fn_save_log(path_device,path_log,filename,file_content){
    if(!await file_system.check(path_log)){await file_system.folderMK(path_log);}
        await file_system.fileMK(path_device,file_content,"lastest.json");
    if(await file_system.check(path_log+"/"+filename+".json")){
        await file_system.fileADD(path_log,",\r\n"+file_content,filename+".json");
    }else{
        await file_system.fileMK(path_log,"["+file_content,filename+".json");
    }
}

async function hive_config(DVC,path_device) {
    let response = "";
    if(await file_system.check(path_device + "/config.json")){
        const device_config = JSON.parse(await file_system.fileRead(path_device,"config.json"));
        if(device_config.ex_goal != undefined){
            if(device_config.ex_run  == undefined) device_config.ex_run = 0;
            if(device_config.ex_goal != device_config.goal || device_config.ex_run != device_config.run)
            response = DVC+" WEB "+device_config.ex_goal+" "+device_config.ex_run;
        }
    }else{
        response = DVC+" WEB 3 0";        
        await file_system.fileMK(path_device,JSON.stringify({ex_goal:3,ex_run:0}),"config.json");
    }
    return response;
}

async function modify(path_device,DATA) {
    if(await file_system.check(path_device + "/config.json")){
        const device_config = JSON.parse(await file_system.fileRead(path_device,"config.json"));
        device_config.goal  = DATA.goal;
        device_config.run   = DATA.run;
        await file_system.fileMK(path_device,JSON.stringify(device_config),"config.json");
    }else{
        await file_system.fileMK(path_device,JSON.stringify(DATA),"config.json");
    }
}

async function set_from_divece(path_device,DATA) {
    const device_config   = {
                            ex_goal: DATA.goal,
                            goal:    DATA.goal,
                            ex_run:  DATA.run,
                            run:     DATA.run,
                        }
    await file_system.fileMK(path_device,JSON.stringify(device_config),"config.json");
}

///////////////////////////////////////////////////////////////////////////////////////////////

router.post('/act', async function(req, res) {
    let status = 400;
    if(req.body.DVC!=undefined){
        status = 200;
        req.body.DVC = req.body.DVC.replaceAll(":","_");

        const log_date = new Date();
        const path_device = path_data.device("act")+"/"+req.body.DVC;
        const path_log = await fn_path_log(path_device,log_date,requestIp.getClientIp(req));
        const filename = fn_file_name(log_date);
        const file_content = JSON.stringify({...req.body.DATA, date:log_date});

        await fn_save_log(path_device,path_log,filename,file_content);
    }
    res.status(status).send();
});

router.post('/hive', async function(req, res) {
    let status = 400;
    let response = "";
    if(req.body.DVC!=undefined){
        status = 200;
        req.body.DVC = req.body.DVC.replaceAll(":","_");

        const log_date = new Date();
        const path_device = path_data.device("hive")+"/"+req.body.DVC;
        const path_log = await fn_path_log(path_device,log_date,requestIp.getClientIp(req));
        
        if(req.body.API == "log"){
            const filename = fn_file_name(log_date);
            const file_content = JSON.stringify({...req.body.DATA, date:log_date});
            await fn_save_log(path_device,path_log,filename,file_content);
            response = await hive_config(req.body.DVC,path_device);
        }else if(req.body.API == "mod"){
            await modify(path_device,req.body.DATA);

        }else if(req.body.API == "set"){
            await set_from_divece(path_device,req.body.DATA);
        }
    }
    res.status(status).send(response);
});

router.post('/hub', async function(req, res) {
    let status = 400;
    let response = "";
    if(req.body.HUB!=undefined){
        status = 200;
        req.body.HUB = req.body.HUB.replaceAll(":","_");

        const log_date = new Date();
        const path_hub = path_data.device("hub")+"/"+req.body.HUB;
        const path_device = path_hub+"/"+req.body.TYPE+"/"+req.body.DVC;
        const path_log = await fn_path_log(path_device,log_date,requestIp.getClientIp(req));

        if(req.body.API == "log"){
            const filename = fn_file_name(log_date);
            const file_content = JSON.stringify({...req.body.DATA, date:log_date});
            await fn_save_log(path_device,path_log,filename,file_content);
            response = await hive_config(req.body.DVC,path_device);

        }else if(req.body.API == "mod"){
            await modify(path_device,req.body.DATA);

        }else if(req.body.API == "set"){
            await set_from_divece(path_device,req.body.DATA);
        }
    }
    res.status(status).send(response);
});

module.exports = router;