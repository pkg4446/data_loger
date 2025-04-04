const express       = require('express');
const file_system   = require('../api/fs_core');
const device        = require('../api/device');
const path_data     = require('../api/path_data');
const router        = express.Router();

function token_check(token,user_id) {
    let response = false;
    const path_user = path_data.user()+"/"+user_id;
    if(file_system.check(path_user+"/login.txt")){
        const user_token = file_system.fileRead(path_user,"login.txt");
        if(user_token == token){response = true;}
    }
    return response;
}

router.post('/connect', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.name!=undefined && user_data.name.length>0){
        user_data.name = user_data.name.replaceAll(' ',"_");
        if(token_check(user_data.token,user_data.id)){
            status_code = await device.connect(user_data.id,"device",user_data.dvid,user_data.name);
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send();
});

router.post('/disconnect', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined){
        if(token_check(user_data.token,user_data.id)){
            status_code = await device.disconnect(user_data.id,"device",user_data.dvid);
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send();
});

router.post('/heater', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined){
        const   path_device = path_data.device("device")+"/"+user_data.dvid;
        if(token_check(user_data.token,user_data.id)){
            if(file_system.check(path_device)){
                status_code = 200;
                if(user_data.func){
                    file_system.fileMK(path_device,String(user_data.value),"heater_temp.csv");
                }else{
                    file_system.fileMK(path_device,String(user_data.value),"heater_able.csv");
                }
            }else{
                status_code = 403;
            }
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send();
});

router.post('/list', async function(req, res) {
    let status_code = 400;
    let response    = "nodata";
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined){
        const   path_user   = path_data.user()+"/"+user_data.id;
        if(token_check(user_data.token,user_data.id)){
            if(file_system.check(path_user+"/device.csv")){
                status_code = 200;
                response    = file_system.fileRead(path_user,"device.csv");
            }else{
                status_code = 403;
                response    = "device";
            }
        }else{
            status_code = 401;
            response    = "user";
        }
    }
    res.status(status_code).send(response);
});

router.post('/list_arrange', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined){
        const   path_user   = path_data.user()+"/"+user_data.id;
        if(token_check(user_data.token,user_data.id)){
            status_code = 200;
            let device = "";
            for (let index = 0; index < user_data.list.length; index++) {
                if(index != 0) device += "\r\n";
                device += user_data.list[index];
            }
            if(file_system.fileRead(path_user,"device.csv") != device) file_system.fileMK(path_user,device,"device.csv");
        }else{
            status_code = 406;
        }
    }
    res.status(status_code).send();
});

router.post('/config', async function(req, res) {
    let status_code = 400;
    let response    = "nodata";
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.date!=undefined){
        const   path_device = path_data.device("device")+"/"+user_data.dvid;
        if(token_check(user_data.token,user_data.id)){
            if(file_system.check(path_device+"/owner.txt")&&(file_system.fileRead(path_device,"owner.txt")==user_data.id)){
                status_code = 200;
                if(file_system.check(path_device+"/lastest.json")){
                    response = file_system.fileRead(path_device,"lastest.json");
                }else{
                    response = "null";
                }
                const response_added = {dv:null,ab:null,th:null};
                if(file_system.check(path_device+"/device_set.csv")){
                    response_added.dv = file_system.fileRead(path_device,"device_set.csv").split(",");
                }
                if(file_system.check(path_device+"/heater_able.csv")){
                    response_added.ab = file_system.fileRead(path_device,"heater_able.csv");
                }
                if(file_system.check(path_device+"/heater_temp.csv")){
                    response_added.th = file_system.fileRead(path_device,"heater_temp.csv").split(",");
                }
                response += "\r\n"+JSON.stringify(response_added);
            }else{
                status_code = 403;
                response    = "device";
            }
        }else{
            status_code = 401;
            response    = "user";
        }
    }
    res.status(status_code).send(response);
});

router.post('/log', async function(req, res) {
    let status_code = 400;
    let response    = "nodata";
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.date!=undefined){
        const   path_device = path_data.device("device")+"/"+user_data.dvid;
        if(token_check(user_data.token,user_data.id)){
            if(file_system.check(path_device+"/owner.txt")&&(file_system.fileRead(path_device,"owner.txt")==user_data.id)){
                status_code = 200;
                response    = "ok";
                for (let index = 1; index < 3; index++) {if(user_data.date[index]<10){user_data.date[index] = "0"+user_data.date[index];}}
                if(file_system.check(path_device+"/"+user_data.date[0]+"/"+user_data.date[1]+"/"+user_data.date[2]+".json")){
                    response    = "log\r\n" + file_system.fileRead(path_device+"/"+user_data.date[0]+"/"+user_data.date[1],user_data.date[2]+".json");
                }else{
                    response = "null";
                }
            }else{
                status_code = 403;
                response    = "device";
            }
        }else{
            status_code = 401;
            response    = "user";
        }
    }
    res.status(status_code).send(response);
});

module.exports = router;