module.exports = {
    device : function(type){
        if(type==undefined) return "./data/device";
        return "./data/device/"+type;
    },
    admin : function(){
        return "./data/admin";
    },
    user : function(user_id){
        if(user_id==undefined) return "./data/user";
        return "./data/user/"+user_id;
    },
}