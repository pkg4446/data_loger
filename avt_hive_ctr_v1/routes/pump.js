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
            status_code = await device.connect(user_data.id,"pump",user_data.dvid,user_data.name);
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
            status_code = await device.disconnect(user_data.id,"pump",user_data.dvid);
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send();
});

router.post('/devicerename', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined){
        const path_user = path_data.user()+"/"+user_data.id;
        if(token_check(user_data.token,user_data.id)){
            status_code = 200;
            const list   = file_system.fileRead(path_user,"pump.csv").split("\r\n");
            let new_list = "";
            for (let index = 0; index < list.length; index++) {
                if(index != 0) new_list += "\r\n";
                if(list[index].split(",")[0] === user_data.dvid){
                    new_list += user_data.dvid+","+user_data.name;
                }else{
                    new_list += list[index];
                }
            }
            file_system.fileMK(path_user,new_list,"pump.csv");
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
            if(file_system.check(path_user+"/pump.csv")){
                status_code = 200;
                response    = file_system.fileRead(path_user,"pump.csv");
            }else{
                status_code = 403;
                response    = "pump";
            }
        }else{
            status_code = 401;
            response    = "user";
        }
    }
    res.status(status_code).send(response);
});

router.post('/config', async function(req, res) {
    let status_code = 400;
    let response    = "nodata";
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.date!=undefined){
        const path_device = path_data.device("pump")+"/"+user_data.dvid;
        if(token_check(user_data.token,user_data.id)){
            if(file_system.check(path_device+"/owner.txt")&&(file_system.fileRead(path_device,"owner.txt")==user_data.id)){
                status_code = 200;
                if(file_system.check(path_device+"/lastest.json")){
                    response = file_system.fileRead(path_device,"lastest.json");
                }else{
                    response = "null";
                }
                const response_added = {dv:null,set:null};

                if(file_system.check(path_device+"/device_set.csv")){
                    response_added.dv = file_system.fileRead(path_device,"device_set.csv").split(",");
                }
                if(file_system.check(path_device+"/config.csv")){
                    response_added.set = file_system.fileRead(path_device,"config.csv").split(",");
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

router.post('/setup', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.index!=undefined && user_data.time!=undefined){
        const path_device = path_data.device("pump")+"/"+user_data.dvid;
        if(token_check(user_data.token,user_data.id)){
            if(file_system.check(path_device+"/owner.txt")&&(file_system.fileRead(path_device,"owner.txt")==user_data.id)){
                status_code = 200;
                let file_data;
                if(file_system.check(path_device+"/config.csv")){
                    file_data = file_system.fileRead(path_device,"config.csv").split(",");
                }else{
                    file_data = ['12','12','12','12','12','12'];
                }
                file_data[user_data.index] = user_data.time;
                let config_data = file_data[0];
                for (let index = 1; index < file_data.length; index++) {
                    config_data += ","+file_data[index];
                }
                file_system.fileMK(path_device,config_data,"config.csv");
            }else{
                status_code = 403;
            }
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send();
});

router.post('/log', async function(req, res) {
    let status_code = 400;
    let response    = "nodata";
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.date!=undefined){
        const   path_device = path_data.device("pump")+"/"+user_data.dvid;
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