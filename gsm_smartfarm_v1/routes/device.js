const express       = require('express');
const file_system   = require('../fs_core');
const router        = express.Router();
const requestIp     = require('request-ip');

router.post('/log', async function(req, res) {    
    const IP  = requestIp.getClientIp(req);
    //console.log(IP,req.body);

    const   path_device = "./data/device/"+req.body.DEVID;
    const   date_now    = new Date();
    let     path_log    = path_device+"/"+date_now.getFullYear()+"/";
    if(date_now.getMonth()<10) path_log += "0";
    path_log += date_now.getMonth();
    let     filename    = "";
    if(date_now.getDate()<10) filename += "0";
    filename += date_now.getDate();
    let file_content    = date_now+","+req.body.t_w+","+req.body.t_l+","+req.body.t_a+","+req.body.t_o+","+req.body.i_t+","+req.body.i_h+","+req.body.ze3+"\r\n";
    
    if(!file_system.check(path_log)) file_system.folderMK(path_log);
    file_system.fileMK(path_device,IP+"\r\n","ip.txt");
    if(file_system.check(path_log+"/"+filename+".csv")){
        file_system.fileADD(path_log,file_content,filename+".csv");
    }else{
        file_system.fileMK(path_log,file_content,filename+".csv");
    }
    res.status(201).send("ack");
});

router.post('/config', async function(req, res) {    
    let device_config={};
    const   path_device = "./data/device/"+req.body.DEVID;
    if(file_system.check(path_device+"/config.json")) device_config = JSON.parse(file_system.fileRead(path_device,"config.json"));
    if(device_config[req.body.cmd]===undefined) device_config[req.body.cmd]={};
    if(device_config[req.body.cmd+"_t"]===undefined) device_config[req.body.cmd+"_t"]={};
    device_config[req.body.cmd][req.body.type]=req.body.val;
    device_config[req.body.cmd+"_t"][req.body.type]=new Date();
    file_system.fileMK(path_device,JSON.stringify(device_config),"config.json");
    res.status(201).send("ack");
});

module.exports = router;
