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
        if(await file_system.check(path_device+"/ip.txt")){
            if(await file_system.fileRead(path_device,"ip.txt") != device_ip) await file_system.fileMK(path_device,device_ip,"ip.txt");
        }else await file_system.fileMK(path_device,device_ip,"ip.txt");
        if(log_date.getMonth()<10) path_log += "0";
        path_log += log_date.getMonth();
        let filename = "";
        if(log_date.getDate()<10) filename += "0";
        filename += log_date.getDate();
        
        req.body.DATA.date = log_date;

        if(!await file_system.check(path_log)){await file_system.folderMK(path_log);}
        const file_content = JSON.stringify(req.body.DATA);
        await file_system.fileMK(path_device,file_content,"lastest.json");
        if(await file_system.check(path_log+"/"+filename+".json")){
            await file_system.fileADD(path_log,","+file_content,filename+".json");
        }else{
            await file_system.fileMK(path_log,"["+file_content,filename+".json");
        }
    }
    res.status(status).send();
});

module.exports = router;