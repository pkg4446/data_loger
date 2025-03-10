module.exports = {
    device : function(type){
        if(type==undefined) return "./data/device";
        return "./data/device/"+type;
    },
    admin : function(){
        return "./data/admin";
    },
    user : function(){
        return "./data/user";
    },
}