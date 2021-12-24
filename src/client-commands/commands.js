const config = require('../config.json');

module.exports = {
    init: function (client) {
        this.startTime = Math.floor(Date.now() / 1000);
        this.client = client;
        this.message = NaN;
        console.log(this.client);
    },

    uptime: function(message) {
        this.message = message;
        const currTime = Math.floor(Date.now() / 1000);
        let timeElapsed = currTime - this.startTime;

        message.reply("Bot was started <t:"+this.startTime+":R>\ni.e., on <t:"+ this.startTime + ":f>");
    },
    
    ping: function(message) {
        this.message = message;
        message.channel.send({
            content: `Pong!!!\nPing =${this.client.ws.ping} ms`
        });
    }

};