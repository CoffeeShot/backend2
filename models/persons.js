const mongoose = require('mongoose');

const url = db_pass;

mongoose.connect(url);

const Schema = new mongoose.Schema(
    {
        name: String,
        number: String,
        pk: Number
    }
);

const Persons = mongoose.model('persons', Schema);

const formatNote = (note) => {
    const formattedNote = { ...note._doc, id: note._id };
    delete formattedNote._id;
    delete formattedNote.__v;
    return formattedNote
};

module.exports = {Persons, formatNote};
