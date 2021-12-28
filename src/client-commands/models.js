const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema(
    {
        PRN: { type: String, required: true},
        SRN: { type: String, required: true},
        Semester: { type: String, required: true},
        Section: { type: String, required: true},
        Cycle: { type: String, required: true},
        CandB: { type: String, required: true},
        Branch: { type: String, required: true},
        Campus: { type: String, required: true}
    }
)

const VerifiedSchema = new mongoose.Schema(
    {
        Username: { type: String, required: true},
        ID: { type: String, required: true},
        PRM: { type: String, required: true}
    }
);

let batch_2018 = mongoose.model('batch_2018', BatchSchema);
let batch_2019 = mongoose.model('batch_2019', BatchSchema);
let batch_2020 = mongoose.model('batch_2020', BatchSchema);
let batch_2021 = mongoose.model('batch_2021', BatchSchema);
let verified = mongoose.model('verified', VerifiedSchema);

module.exports.batch_2018 = batch_2018;
module.exports.batch_2019 = batch_2019;
module.exports.batch_2020 = batch_2020;
module.exports.batch_2021 = batch_2021;
module.exports.verified = verified;