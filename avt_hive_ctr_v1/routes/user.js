const crypto        = require("crypto");
const express       = require('express');
const file_system   = require('../api/fs_core');
const memory_admin  = require('../api/memory_admin');
const router        = express.Router();
const path_data     = require('../api/path_data');
const file_worker   = require('../worker/file_process');

router.post('/login', async function(req, res) {
    let status_code  = 400;
    let response     = "nodata";
    const login_data = req.body;
    if(login_data.id!=undefined&&login_data.pass!=undefined){
        const path_user = path_data.user()+"/"+login_data.id;
        if(file_system.check(path_user+"/config.csv")){
            const user_config = file_system.fileRead(path_user,"config.csv").split(",");
            if(crypto.createHash("sha256").update(login_data.pass+user_config[0]).digest("base64") == user_config[1]){
                status_code     = 200;
                const loginfo   = crypto.randomBytes(16).toString('hex');
                file_system.fileMK(path_user,loginfo,"login.txt");
                response        = loginfo;
            }else{
                status_code = 403;
                response    = "password";
            }
        }else{
            status_code = 406;
            response    = "userid";
        }
    }
    res.status(status_code).send(response);
});

router.post('/info', async function(req, res) {
    let status_code  = 400;
    let response     = "nodata";
    const login_data = req.body;
    if(login_data.id!=undefined&&login_data.token!=undefined){
        const path_user = path_data.user()+"/"+login_data.id;
        if(file_system.check(path_user+"/config.csv") && file_system.check(path_user+"/login.txt")){
            status_code = 200;
            const user_config = file_system.fileRead(path_user,"config.csv").split(",");
            response = user_config[3]+","+user_config[4]+","+user_config[5]+","+user_config[6];
        }else{
            status_code = 406;
            response    = "userid";
        }
    }
    res.status(status_code).send(response);
});

router.post('/join', async function(req, res) {
    let status_code = 400;
    const join_data = req.body;
    if(join_data.id!=undefined && join_data.pass!=undefined && join_data.check!=undefined){
        status_code = 403;
        const   path_user = path_data.user()+"/"+join_data.id;
        if(file_system.check(path_user)){
            status_code = 406;
        }else if(join_data.pass == join_data.check){
            status_code = 200;
            memory_admin.data_renewal(true);
            file_system.folderMK(path_user);
            const randombyte = crypto.randomBytes(4).toString('hex');
            let file_content = randombyte+","+crypto.createHash("sha256").update(join_data.pass+randombyte).digest("base64")+","+(new Date())+","+
            join_data.name+","+join_data.farm+","+join_data.addr+","+join_data.tel;
            file_system.fileMK(path_user,file_content,"config.csv");
            file_system.fileMK(path_user,join_data.location,"location.txt");
        }
    }
    res.status(status_code).send();
});

router.post('/list_able', async function(req, res) {
    let status_code = 400;
    let response    = "nodata";
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined){
        const   path_device = path_data.device("device");
        if(file_system.check(path_device)){
            status_code = 200;
            const requestIp = require('request-ip');
            const conn_ip   = requestIp.getClientIp(req);
            response = await file_worker.list_able(conn_ip);
        }else{
            status_code = 401;
            response    = "user";
        }
    }
    res.status(status_code).send(response);
});

module.exports = router;