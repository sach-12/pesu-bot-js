// commands anyone can use
const config = require('../config.json');
const clientInfo = require("./clientHelper");

class Misc {
    constructor() {
        this.commands = [

        ];
    }

    sleep = (seconds) => {
        return new Promise(resolve => setTimeout(resolve, seconds*1000))
    }

    
}
const misc = new Misc()

module.exports = misc