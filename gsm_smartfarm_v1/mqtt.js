const mqtt      = require("mqtt");

const options   = {
    host:       "smarthive.kr",
    port:       1883,
    protocol:   "mqtt",
    username:   "test",
    password:   "test",
};
const client = mqtt.connect(options);

client.subscribe("GSM");

client.on("error", (error) => {console.log("Can't connect" + error);});
client.on("connect", () => {console.log("mqtt state: "+ client.connected);});

client.on("message", async(topic, message) => {	
    console.log(`토픽:${topic.toString()}, 메세지:${message.toString()}, ID:${client.getLastMessageId()}`);
});
//client.end();

function sendMQTT(target,contents){
    //console.log("send: ",target, "message: ",contents);
    client.publish(target,contents,{qos:2});  
}

module.exports = {
    send : async function(data){
        let response = true;
        try {
            sendMQTT(data.TARGET, data.COMMEND);
        } catch (error) {
            response = false;
        }        
        return response;
    },
}