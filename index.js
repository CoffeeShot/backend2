const express = require('express');
const bodyparser = require('body-parser');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const {Persons, formatNote} = require('./models/persons');
app.use(cors());
app.use(bodyparser.json());
app.use(express.static('build'));
app.use(morgan(':method :url :status :content - :response-time ms'));
morgan.token('content', (req) => JSON.stringify(req.body));


app.get('/api', (req, res) => {
    res.send('<p>Tarkoititko <em>/api/persons</em> ?</p>')
});

app.get('/api/persons', (req, res) => {
    console.log('Etsitään tietoja..');
    Persons
        .find({})
        .then(persons => {
        res.json(persons.map( person => formatNote(person)))
    });
});

app.post('/api/persons', (req, res) => {
    console.log('Lähetetään tietoa..');
    const body = req.body;

    if (body === null || body === undefined) {
        console.log('Yhteystietoja ei löytynyt');
        return res.status(400).json({error: 'content missing'})
    }

    Persons.find({'name': body.name}).then(result => {

        if (result === [] || result === undefined) {
            const note = new Persons({
                name: body.name,
                number: body.number,
                pk: Math.floor(Math.random()*1000)
            });

            note
                .save()
                .then(savedNote => {
                    console.log('Yhteystieto tallennettu.');
                    res.json(formatNote(savedNote))

            });
        } else {
            console.log({error: 'Kyseinen nimi on jo lisätty'});
            res.status(409).json({error: 'Kyseinen nimi on jo lisätty'})}
    });
});

app.delete('/api/persons/:id', (req, res) => {
    console.log('Poistetaan henkilöä..');
    const id = req.params.id;
    Persons.findByIdAndRemove(id).then(result => {
        console.log(`Poistetaan yhteystieto:\n${result}\n`);
        res.status(204).send('<p>yhteystieto poistettu</p>')
    });
});

app.put('/api/persons/:id', (req, res) => {
    console.log('Päivitetään tietoja..');
    const body = req.body;
    Persons.findByIdAndUpdate(req.params.id, {
        $set: {
            name: body.name,
            number: body.number,
            pk: body.pk
        }
    }).then(result => {
        console.log(`\nMuutetaan yhteystieto:\n\n${result}\n`);
        res.status(200).send('<p>yhteystieto muutettu</p>')
    });
});

let lista = [];

app.get('/info', (req, res) => {
    console.log('Etsitään tietoja..');
    Persons.find({}).then(
        persons => {
            lista = persons.map( person => formatNote(person));
        }
    );
    res.send('<h3>Info-sivu</h3>' +
        '<p>puhelinluettelossa on yhteensä '+lista.length+' henkilöä.</p>' +
        '<br> Pyyntö tehty: '+new Date().toLocaleString())
});

app.get('/api/persons/:pk', (req, res) => {
    console.log('Etsitään henkilöä..');
    Persons.findOne({pk: req.params.pk}).then(
        person => res.json(person)
    )
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`)
});

