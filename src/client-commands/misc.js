// Helper functions for other files

class Misc {
    constructor() {
        this.commands = [

        ];
    }

    sleep = (seconds) => 
        new Promise(resolve => setTimeout(resolve, seconds*1000))

    
}
const misc = new Misc()

module.exports = misc