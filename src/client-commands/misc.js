// Helper functions used in other files

class Misc {
    constructor() {
        this.commands = [

        ];
    }

    sleep = (seconds) => 
        new Promise(resolve => setTimeout(resolve, seconds*1000))

    // Function to deverify members when they leave the server or when !d is used
    deverifyFunc = async(mid) => {
        const mongoose = require('mongoose')
        const {verified} = require('./models')

        mongoose.connect('mongodb://localhost:27017/pesu',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const ret = await verified.findOneAndDelete({ID: mid})
        if(ret === null) {
            return false
        }
        else {
            return true
        }
    }

    
}
const misc = new Misc()

module.exports = misc