const file_system   = require('./fs_core');
const path_data     = require('./fs_path');

module.exports = {
    admin : async function(token){
        let response = false;
        const path_admin = path_data.admin();
        if(await file_system.check(path_admin+"/token.json")){
            const valid_count = 99;//로그인 풀리기 전까지 쿼리 갯수
            const admin_token = JSON.parse(await file_system.fileRead(path_admin,"token.json"));
            for (let index = 0; index < admin_token.length; index++) {
                if(admin_token[index].token == token && ++admin_token[index].valid < valid_count){
                    response = true;
                    await file_system.fileMK(path_admin,JSON.stringify(admin_token),"token.json");
                    break;
                }
            }
        }
        return response;
    },

    user : async function(token,user_id){
        let response = false;
        const path_user = path_data.user()+"/"+user_id;
        if(await file_system.check(path_user+"/login.txt")){
            const user_token = await file_system.fileRead(path_user,"login.txt");
            if(user_token == token){response = true;}
        }
        return response;
    },

    gender: async function(user_id){
        let response = "?";
        const path_user = path_data.user()+"/"+user_id;
        if(await file_system.check(path_user+"/gender.txt")){
            const user_token = await file_system.fileRead(path_user,"login.txt");
            if(user_token == token){response = true;}
        }
        return response;
    },
}