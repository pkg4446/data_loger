const express       = require('express');
const requestIp     = require('request-ip');
const file_system   = require('../api/fs_core');
const path_data     = require('../api/fs_path');
const login_check   = require('../api/login_check');
const device        = require('../api/device');
const router        = express.Router();

router.post('/connect', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.name!=undefined && user_data.name.length>0){
        user_data.name = user_data.name.replaceAll(' ',"_");
        if(await login_check.user(user_data.token,user_data.id)){
            status_code = await device.connect(user_data.id,user_data.dvid,user_data.name);
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
        if(await login_check.user(user_data.token,user_data.id)){
            status_code = await device.disconnect(user_data.id,user_data.dvid);
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send();
});

router.post('/device_rename', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined){
        const   path_user   = path_data.user()+"/"+user_data.id;
        if(await login_check.user(user_data.token,user_data.id)){
            status_code = 200;
            const list   = file_system.fileRead(path_user,"device.csv").split("\r\n");
            let new_list = "";
            for (let index = 0; index < list.length; index++) {
                if(index != 0) new_list += "\r\n";
                if(list[index].split(",")[0] === user_data.dvid){
                    new_list += user_data.dvid+","+user_data.name;
                }else{
                    new_list += list[index];
                }
            }
            file_system.fileMK(path_user,new_list,"device.csv");
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
        if(await login_check.user(user_data.token,user_data.id)){
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

router.post('/able', async function(req, res) {
    let status_code = 400;
    let response    = "nodata";
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined){
        const   path_device = path_data.device();
        if(file_system.check(path_device)){
            status_code = 200;
            const requestIp = require('request-ip');
            const conn_ip   = requestIp.getClientIp(req);
            response = await device.ip_check(conn_ip);
        }
    }
    res.status(status_code).send(response);
});


module.exports = router;