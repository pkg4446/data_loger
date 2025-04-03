const express       = require('express');
const requestIp     = require('request-ip');
const file_system   = require('../api/fs_core');
const path_data     = require('../api/fs_path');
const login_check   = require('../api/login_check');
const device        = require('../api/device');
const router        = express.Router();

router.post('/info', async function(req, res) {
    let status_code = 400;
    const response  = {list:null};
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined){
        if(await login_check.user(user_data.token,user_data.id)){
            status_code = 200;
            const path_hub = path_data.device("hub")+"/"+user_data.dvid;
            if(await file_system.check(path_hub+"/list.json")){
                response.list = await file_system.fileRead(path_hub,"list.json");
            }
            const list_hub = await file_system.Dir(path_hub);
            for (const type_device of list_hub) {
                if(type_device.split(".").length<2){
                    const hub_child = await file_system.Dir(path_hub+"/"+type_device);
                    response[type_device] = {};
                    for (const child of hub_child) {
                        const path_child = path_hub+"/"+type_device+"/"+child
                        if(await file_system.check(path_child+"/lastest.json")){
                            response[type_device][child] = await file_system.fileRead(path_child,"lastest.json");
                        }else{
                            response[type_device][child] = null;
                        }
                    }
                    // response[type_device]
                }
            }
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send(response);
});

router.post('/child', async function(req, res) {
    let status_code = 400;
    let response    = {};
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.hub!=undefined && user_data.dvid!=undefined && user_data.type!=undefined){
        if(await login_check.user(user_data.token,user_data.id)){
            status_code = 200;
            const path_hub = path_data.device("hub")+"/"+user_data.hub;
            if(await file_system.check(path_hub+"/list.json")){
                response.name = JSON.parse(await file_system.fileRead(path_hub,"list.json"))[user_data.type][user_data.dvid];
            }
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send(response);
});

router.post('/child_name', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.hub!=undefined && user_data.dvid!=undefined && user_data.type!=undefined && user_data.name!=undefined && user_data.name.length>0){
        if(await login_check.user(user_data.token,user_data.id)){
            const path_hub = path_data.device("hub")+"/"+user_data.hub;
            if(await file_system.fileRead(path_hub,"owner.txt") == user_data.id){
                status_code = 200;
                let list_json = {};
                if(await file_system.check(path_hub+"/list.json")) list_json = JSON.parse(await file_system.fileRead(path_hub,"list.json"));
                if(list_json[user_data.type] == undefined) list_json[user_data.type] = {};
                list_json[user_data.type][user_data.dvid] = user_data.name;
                await file_system.fileMK(path_hub,JSON.stringify(list_json),"list.json");
            }
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send();
});

router.post('/child_del', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.hub!=undefined && user_data.dvid!=undefined && user_data.type!=undefined){
        if(await login_check.user(user_data.token,user_data.id)){
            const path_hub = path_data.device("hub")+"/"+user_data.hub;
            if(await file_system.fileRead(path_hub,"owner.txt") == user_data.id){
                const path_child = path_hub+"/"+user_data.type+"/"+user_data.dvid;
                if(await file_system.check(path_child)){
                    status_code = 200;
                    await file_system.folderDel(path_child);
                }
            }
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send();
});

router.post('/child_log', async function(req, res) {
    let status_code = 400;
    let response    = {};
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.type!=undefined && user_data.data!=undefined){
        if(await login_check.user(user_data.token,user_data.id)){
            status_code = 200;
            const path_child = path_data.device("hub")+"/"+user_data.hub+"/"+user_data.type+"/"+user_data.dvid+"/"+user_data.data.path;
            if(await file_system.check(path_child+"/"+user_data.data.name+".json")){
                response = await file_system.fileRead(path_child,user_data.data.name+".json")+"]";
            }
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send(response);
});

router.post('/child_config', async function(req, res) {
    let status_code = 400;
    let response    = {};
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.type!=undefined){
        if(await login_check.user(user_data.token,user_data.id)){
            status_code = 200;
            const path_child = path_data.device("hub")+"/"+user_data.hub+"/"+user_data.type+"/"+user_data.dvid;
            if(await file_system.check(path_child+"/config.json")){
                response = JSON.parse(await file_system.fileRead(path_child,"config.json"));
            }
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send(response);
});

router.post('/child_set', async function(req, res) {
    let status_code = 400;
    let response    = {};
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.type!=undefined && user_data.config!=undefined){
        if(await login_check.user(user_data.token,user_data.id)){
            const path_hub   = path_data.device("hub")+"/"+user_data.hub;
            if(await file_system.fileRead(path_hub,"owner.txt") == user_data.id){
                const path_child = path_hub+"/"+user_data.type+"/"+user_data.dvid;
                if(await file_system.check(path_child)){
                    status_code = 200;
                    if(await file_system.check(path_child+"/config.json")){
                        const device_config = JSON.parse(await file_system.fileRead(path_child,"config.json"));
                        for (const key in user_data.config) {
                            device_config[key] = user_data.config[key];
                        }
                        await file_system.fileMK(path_child,JSON.stringify(device_config),"config.json");
                    }else{
                        await file_system.fileMK(path_child,JSON.stringify(user_data.config),"config.json");
                    }
                }
            }
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send(response);
});
module.exports = router;