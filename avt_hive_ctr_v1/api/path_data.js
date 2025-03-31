module.exports = {
    admin : function(){
        return "./data/admin";
    },
    common : function(){
        return "./data/common";
    },
    device : function(type){
        return "./data/"+type;
    },
    firmware : function(){
        return "./data/path_firmware";
    },
    user : function(){
        return "./data/user";
    },
}