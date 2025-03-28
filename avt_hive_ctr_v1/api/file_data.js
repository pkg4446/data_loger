module.exports = {
    firmware : function(){
        return "device_version.txt";
    },
    firmware_update : function(device){
        return "firmware"+device+".txt";
    },
}