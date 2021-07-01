const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload')
require('dotenv').config()

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sot4y.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const port = 5000;

app.get('/', (req,res) => {
    res.send('Hello from DB working working!');
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentsCollection = client.db("doctorsPortal").collection("appointments");
  const doctorsCollection = client.db("doctorsPortal").collection("doctors");
  
  
app.post('/addAppointment', (req, res) => {
    const appointment = req.body;
    console.log(appointment)
    appointmentsCollection.insertOne(appointment)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
})
app.get('/appointments', (req, res) => {
    appointmentsCollection.find({})
    .toArray((err, documents) => {
        res.send(documents)
    })
})


app.get('/doctors', (req, res) => {
    doctorsCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
});

app.post('/appointmentsByDate', (req, res) => {
    const date = req.body;
    const email = req.body.email;
    doctorsCollection.find( {email: email} )
    .toArray((err, doctors) => {
       const filter = {date: date.date}
       if(doctors.length === 0) {
           filter.email = email;
       }
        appointmentsCollection.find(filter)
        .toArray((err, documents) => {
            console.log(email, date.date, doctors, documents)
            res.send(documents);
        })
       
    })
   
})

app.post('/addADoctor', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;

    console.log( name, email, file );
    file.mv(`${__dirname}/doctors/${file.name}`, err => {
        if(err) {
            console.log(err);
            return res.status(500).send({msg: 'failed to upload image '})
        }
        doctorsCollection.insertOne({ name, email, file })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
        return res.send({name: file.name, path: `/${file.name}`})
    })
    //added
    //finish added
})

app.post('/isDoctor', (req, res) => {
    const email = req.body.email;
    doctorsCollection.find({ email: email})
    .toArray((err, doctor) => {
        res.send(doctor.length > 0)
    })
})

});

app.listen(process.env.PORT || port)