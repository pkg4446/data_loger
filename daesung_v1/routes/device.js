const express       = require('express');
const requestIp     = require('request-ip');
const file_system   = require('../api/fs_core');
const path_data     = require('../api/fs_path');
const router        = express.Router();

router.post('/act', async function(req, res) {
    let status = 404;
    if(req.body.DVC!=undefined){
        status = 200;
        req.body.DVC = req.body.DVC.replaceAll(":","_");

        const log_date = new Date();
        const path_device = path_data.device("act")+"/"+req.body.DVC;
        const device_ip   = requestIp.getClientIp(req);
        let path_log = path_device+"/"+log_date.getFullYear()+"/";
        if(!await file_system.check(path_log)){await file_system.folderMK(path_log);}

        if(await file_system.check(path_device+"/ip.txt")){
            if(await file_system.fileRead(path_device,"ip.txt") != device_ip) await file_system.fileMK(path_device,device_ip,"ip.txt");
        }else await file_system.fileMK(path_device,device_ip,"ip.txt");
        if(log_date.getMonth()<10) path_log += "0";
        path_log += log_date.getMonth();
        let filename = "";
        if(log_date.getDate()<10) filename += "0";
        filename += log_date.getDate();
        req.body.DATA.date = log_date;
        const file_content = JSON.stringify(req.body.DATA);

        if(!await file_system.check(path_log)){await file_system.folderMK(path_log);}
        await file_system.fileMK(path_device,file_content,"lastest.json");
        if(await file_system.check(path_log+"/"+filename+".json")){
            await file_system.fileADD(path_log,",\r\n"+file_content,filename+".json");
        }else{
            await file_system.fileMK(path_log,"["+file_content,filename+".json");
        }
    }
    res.status(status).send();
});

router.post('/hub', async function(req, res) {
    let status = 400;
    let response = "";
    if(req.body.HUB!=undefined){
        console.log("data received: HUB");
        status = 200;
        req.body.HUB = req.body.HUB.replaceAll(":","_");

        const log_date = new Date();
        const path_hub = path_data.device("hub")+"/"+req.body.HUB;
        const path_device = path_hub+"/"+req.body.TYPE+"/"+req.body.DVC;
        const device_ip   = requestIp.getClientIp(req);
        let path_log = path_device+"/"+log_date.getFullYear()+"/";
        if(!await file_system.check(path_log)){await file_system.folderMK(path_log);}

        if(await file_system.check(path_hub+"/ip.txt")){
            if(await file_system.fileRead(path_hub,"ip.txt") != device_ip) await file_system.fileMK(path_hub,device_ip,"ip.txt");
        }else await file_system.fileMK(path_hub,device_ip,"ip.txt");

        if(req.body.API == "log"){
            if(log_date.getMonth()<10) path_log += "0";
            path_log += log_date.getMonth();
            let filename = "";
            if(log_date.getDate()<10) filename += "0";
            filename += log_date.getDate();
            req.body.DATA.date = log_date;
            const file_content = JSON.stringify(req.body.DATA);

            if(!await file_system.check(path_log)){await file_system.folderMK(path_log);}
            await file_system.fileMK(path_device,file_content,"lastest.json");
            if(await file_system.check(path_log+"/"+filename+".json")){
                await file_system.fileADD(path_log,",\r\n"+file_content,filename+".json");
            }else{
                await file_system.fileMK(path_log,"["+file_content,filename+".json");
            };
            if(await file_system.check(path_device + "/config.json")){
                const device_config = JSON.parse(await file_system.fileRead(path_device,"config.json"));
                if(device_config.ex_goal != undefined){
                    if(device_config.ex_run  == undefined) device_config.ex_run = 0;
                    if(device_config.ex_goal != device_config.goal || device_config.ex_run != device_config.run)
                    response = req.body.DVC+" WEB "+device_config.ex_goal+" "+device_config.ex_run;
                }
            }
        }else if(req.body.API == "mod"){
            console.log(req.body);
            if(await file_system.check(path_device + "/config.json")){
                const device_config = JSON.parse(await file_system.fileRead(path_device,"config.json"));
                device_config.goal  = req.body.DATA.goal;
                device_config.run   = req.body.DATA.run;
                await file_system.fileMK(path_device,JSON.stringify(device_config),"config.json");
            }else{
                await file_system.fileMK(path_device,JSON.stringify(req.body.DATA),"config.json");
            }
        }else if(req.body.API == "set"){
            console.log(req.body);
            const device_config   = JSON.parse(await file_system.fileRead(path_device,"config.json"));
            device_config.ex_goal = req.body.DATA.goal;
            device_config.goal    = req.body.DATA.goal;
            device_config.ex_run  = req.body.DATA.run;
            device_config.run     = req.body.DATA.run;
            await file_system.fileMK(path_device,JSON.stringify(device_config),"config.json");
        }
    }
    res.status(status).send(response);
});

module.exports = router;