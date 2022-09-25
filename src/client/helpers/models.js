// File for mongoose models

const {Schema, model} = require('mongoose')

const BatchSchema = new Schema(
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

const VerifiedSchema = new Schema(
    {
        Username: { type: String, required: true},
        ID: { type: String, required: true},
        PRN: { type: String, required: true}
    }
);

const AnonBanSchema = new Schema(
    {
        ID: { type: String, required: true},
        Reason: {type: String, required: true}
    }
);

const batch_2018 = model('batch_2018', BatchSchema, 'batch_2018');
const batch_2019 = model('batch_2019', BatchSchema, 'batch_2019');
const batch_2020 = model('batch_2020', BatchSchema, 'batch_2020');
const batch_2021 = model('batch_2021', BatchSchema, 'batch_2021');
const batch = model('batch', BatchSchema, 'batch');
const verified = model('verified', VerifiedSchema, 'verified');
const anonban = model('anonban', AnonBanSchema, 'anonban');

module.exports.batch_2018 = batch_2018;
module.exports.batch_2019 = batch_2019;
module.exports.batch_2020 = batch_2020;
module.exports.batch_2021 = batch_2021;
module.exports.batch = batch;
module.exports.verified = verified;
module.exports.anonban = anonban;