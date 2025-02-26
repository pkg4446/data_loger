const crypto        = require("crypto");
const express       = require('express');
const file_system   = require('../api/fs_core');
const path_data     = require('../api/fs_path');
const login_check   = require('../api/login_check');
const router        = express.Router();

router.post('/login', async function(req, res) {
    let status_code  = 400;
    let response     = "nodata";
    const login_data = req.body;
    if(login_data.id!=undefined&&login_data.pass!=undefined){
        const path_user = path_data.user()+"/"+login_data.id;
        if(await file_system.check(path_user+"/config.csv")){
            const user_data = await file_system.fileRead(path_user,"config.csv");
            const user_config = user_data.split(",");

            if(crypto.createHash("sha256").update(login_data.pass+user_config[0]).digest("base64") == user_config[1]){
                status_code     = 200;
                const loginfo   = crypto.randomBytes(16).toString('hex');
                await file_system.fileMK(path_user,loginfo,"login.txt");
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
        if(await login_check.user(login_data.token,login_data.id)){
            status_code = 200;
            response = await file_system.fileRead(path_user,"info.json");
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
        if(await file_system.check(path_user)){
            status_code = 406;
        }else if(join_data.pass == join_data.check){
            status_code = 200;
            await file_system.folderMK(path_user);
            const randombyte = crypto.randomBytes(4).toString('hex');
            let file_content = randombyte+","+crypto.createHash("sha256").update(join_data.pass+randombyte).digest("base64");
            await file_system.fileMK(path_user,file_content,"config.csv");
            delete join_data.id;
            delete join_data.pass;
            delete join_data.check;
            await file_system.fileMK(path_user,JSON.stringify(join_data),"info.json");
            await file_system.fileMK(path_user,""+new Date(),"create_at.txt");
        }
    }
    res.status(status_code).send();
});

module.exports = router;