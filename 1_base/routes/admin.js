const crypto        = require("crypto");
const express       = require('express');
const file_system   = require('../api/fs_core');
const path_data     = require('../api/fs_path');
const login_check   = require("../api/login_check");
const router        = express.Router();

router.post('/check', async function(req, res) {
    let status_code  = 400;
    const admin_data = req.body;
    if(admin_data.token!=undefined){
        if(await login_check.admin(admin_data.token)){status_code = 200;}
    }
    res.status(status_code).send();
});

router.post('/authority', async function(req, res) {
    let status_code  = 400;
    let response     = "key";
    const admin_data = req.body;
    if(admin_data.key!=undefined){
        function new_key() {
            const token_key = {
                "key": crypto.randomBytes(4).toString('hex'),
                "valid": 0
            };
            return JSON.stringify(token_key);
        }
        const path_admin = path_data.admin();
        if(await file_system.check(path_admin+"/key.json")){
            const valid_count = 9; //비번 바뀌는 주기
            const admin_info  = JSON.parse(await file_system.fileRead(path_admin,"key.json"));
            if(++admin_info.valid>valid_count){
                status_code = 202;
                await file_system.fileMK(path_admin,new_key(),"key.json");
            }else{
                await file_system.fileMK(path_admin,JSON.stringify(admin_info),"key.json");
                if(admin_info.key == admin_data.key){
                    status_code       = 200;
                    const token_admin = [{token:crypto.randomBytes(16).toString('hex'),valid:0}];
                    if(await file_system.check(path_admin+"/token.json")){
                        admin_tokens = JSON.parse(await file_system.fileRead(path_admin,"token.json"));
                        for (let index = 0; index < admin_tokens.length; index++) {
                            token_admin.push(admin_tokens[index]);
                            if(index == 3) break; //동시 로그인 제한
                        }
                    }
                    await file_system.fileMK(path_admin,JSON.stringify(token_admin),"token.json");
                    response = token_admin[0].token;
                }else{
                    status_code = 403;
                    response    = "fail";
                }
            }
        }else{
            status_code = 202;
            await file_system.folderMK(path_admin);
            await file_system.fileMK(path_admin,new_key(),"key.json");
            response    = "new";
        }
    }
    res.status(status_code).send(response);
});
////-----------------sudo-----------------------////
router.post('/user', async function(req, res) {
    let status_code  = 400;
    const admin_data = req.body;
    if(admin_data.token!=undefined && admin_data.type!=undefined){
        if(await login_check.admin(admin_data.token)){
            status_code = 200;
            if(admin_data.type=="check"){

            }else{

            }
        }
    }
    res.status(status_code).send();
});

module.exports = router;