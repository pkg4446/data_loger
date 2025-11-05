const express       = require('express');
const file_system   = require('../api/fs_core');
const memory_admin  = require('../api/memory_admin');
const path_data     = require('../api/path_data');
const file_worker   = require('../worker/file_process');
const router        = express.Router();

router.post('/log', async function(req, res) {    
    const path_device = path_data.device("device")+"/"+req.body.DVC;
    if(!file_system.check(path_device)) memory_admin.data_renewal(false);
    const requestIp = require('request-ip');
    req.body.IP     = requestIp.getClientIp(req);
    const response  = await file_worker.device_log(req.body);
    res.status(201).send(response);
});

router.post('/hive_set', async function(req, res) {
    const path_device  = path_data.device("device")+"/"+req.body.DVC;
    let   file_content = req.body.TMP+","+req.body.RUN;
    file_system.fileMK(path_device,file_content,"device_set.csv");
    file_content += ","+new Date();
    if(file_system.check(path_device+"/device_set_history.csv")){
        file_system.fileADD(path_device,"\r\n"+file_content,"device_set_history.csv");
    }else{
        file_system.fileMK(path_device,file_content,"device_set_history.csv");
    }
    res.status(201).send("ack");
});

router.post('/pump', async function(req, res) {
    const path_pump = path_data.device("pump")+"/"+req.body.DVC;
    if(!file_system.check(path_pump)) memory_admin.data_renewal(false);
    const requestIp = require('request-ip');
    req.body.IP     = requestIp.getClientIp(req);
    const response  = await file_worker.device_pump(req.body);
    res.status(201).send(response);
});

router.post('/pump_set', async function(req, res) {
    const path_device  = path_data.device("pump")+"/"+req.body.DVC;
    let   file_content = req.body.SET;
    file_system.fileMK(path_device,file_content,"device_set.csv");
    file_content += ","+new Date();
    if(file_system.check(path_device+"/device_set_history.csv")){
        file_system.fileADD(path_device,"\r\n"+file_content,"device_set_history.csv");
    }else{
        file_system.fileMK(path_device,file_content,"device_set_history.csv");
    }
    res.status(201).send("ack");
});


router.post('/log_25', async function(req, res) {    
    const path_device = path_data.device("device_25")+"/"+req.body.DVC;
    if(!file_system.check(path_device)) memory_admin.data_renewal(false);
    const requestIp = require('request-ip');
    req.body.IP     = requestIp.getClientIp(req);
    const response  = await file_worker.device_log(req.body);
    res.status(201).send(response);
});

router.post('/set_25', async function(req, res) {
    const path_device  = path_data.device("device_25")+"/"+req.body.DVC;
    let   file_content = req.body.TMP+","+req.body.RUN;
    file_system.fileMK(path_device,file_content,"device_set.csv");
    file_content += ","+new Date();
    if(file_system.check(path_device+"/device_set_history.csv")){
        file_system.fileADD(path_device,"\r\n"+file_content,"device_set_history.csv");
    }else{
        file_system.fileMK(path_device,file_content,"device_set_history.csv");
    }
    res.status(201).send("ack");
});

module.exports = router;