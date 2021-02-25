const bcrypt = require('bcrypt');
const cors = require('cors');
const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const port = process.env.PORT || 9000;
const mongoose = require('mongoose');
const QRcode = require('qrcode')



//Connexion à MongoDB 
mongoose.connect('mongodb://localhost:27017/BDD',{ useNewUrlParser: true,useUnifiedTopology: true })
    .then(()=>console.log('connected to MongoDb...'))
    .catch(err=> console.error('could not connect to mongo db', err));

    //FAbriquant
    let FabriquantSchema = new mongoose.Schema({
        mail : String,
        password : String,
        nom_entreprise: String,
        localisation : String,     
       
    });
    const FabriquantModel = mongoose.model('Fabirquant', FabriquantSchema);
    app.use(cors());
    app.use(bodyparser.urlencoded({extended : true}));
    app.use(bodyparser.json());
    const FabriquantR = express.Router();
    FabriquantR.route('/')
        .get(async(req,res)=> {
            let allFabriquant = await FabriquantModel.find()
            console.log('get frabriquant')
            res.json(allFabriquant)
        })
        .post(async(req,res)=>{
            FabriquantModel.find({mail : req.body.mail})
                .exec((err,resu)=>{
                    if(typeof resu[0] != 'undefined'){

                        bcrypt.compare( req.body.password, resu[0].password, function(err, result){
                            console.log(result)
                            if(!result){
                                res.send('invalid password or mail')
                                console.log(result)
                               
                            }else{
                                res.send(resu)
                            }
                        })
                       
                    }else{
                        bcrypt.genSalt(10,function(err,salt){
                            bcrypt.hash(req.body.password,salt,function(err,hash){
                                const password = hash
                                const Fabric = new FabriquantModel({
                                    mail: req.body.mail,
                                    password : password
                                })
                                const result = Fabric.save()
                                console.log(result)
                                res.send('Add')
                            })
                        })
                    }
                })
        })
    app.use('/api/fabric', FabriquantR);

    //Medicaments
    let MedicamentsSchema = new mongoose.Schema({
        nom_med : String,
        composition : String,
        cip : String,
        posologie : String,
    })
    const MedicamentsModel =  mongoose.model('Mediments', MedicamentsSchema);

    const MedicamentsR = express.Router();
    MedicamentsR.route('/')
    .get(async(req,res)=> {
        let allMedicaments = await MedicamentsModel.find()
        console.log('get medicament')
        res.json(allMedicaments)
    })
    .post(async(req,res)=>{
        const medicament = new MedicamentsModel({
            nom_med : req.body.nom_med,
            composition : req.body.composition,
            cip : req.body.cip,
            posologie : req.body.cip
        })
        let result = medicament.save()
        res.send('true')
    })
    MedicamentsR.route('/:id')
    .get(async (req, res) => {
        let med =  await MedicamentsModel.find({nom_med : req.params.nom_med});
        console.log("med get")
        res.send(med)
    })

    app.use('/api/medicament',MedicamentsR)


    // Pharmaciens
    let PharmaciensSchema = new mongoose.Schema({
        nom_pharm : String,
        localisation : String,
        mail : String,
        password : String,
    })
    const PharmaciensModel =  mongoose.model('Pharmaciens', PharmaciensSchema);
    const PharmiciensR = new express.Router()
    PharmiciensR.route('/')
    .post(async(req,res)=>{
        PharmaciensModel.find({mail : req.body.mail})
            .exec((err,resu)=>{
                if(typeof resu[0] != 'undefined'){

                    bcrypt.compare( req.body.password, resu[0].password, function(err, result){
                        console.log(result)
                        if(!result){
                            res.send('invalid password or mail')
                            console.log(result)
                           
                        }else{
                            res.send(resu)
                        }
                    })
                    
                }else{
                    bcrypt.genSalt(10,function(err,salt){
                        bcrypt.hash(req.body.password,salt,function(err,hash){
                            const password = hash
                            const Fabric = new PharmaciensModel({
                                nom_pharm : req.body.nom_pharm,
                                localisation : req.body.localisation,
                                mail: req.body.mail,
                                password : password
                            })
                            const result = Fabric.save()
                            res.send(true)
                        })
                    })
                }
            })
    })
    .get(async(req,res)=> {
        let allPharmaciens = await PharmaciensModel.find()
        console.log('get Pharmaciens')
        res.json(allPharmaciens)
    })
    app.use('/api/pharm', PharmiciensR);

    // Localisation
    let LocalisationSchema = new mongoose.Schema({
        localisation : String,
        date : String,
        id_med : String,
    })
    const LocalisationModel =  mongoose.model('Localisation', LocalisationSchema);
    const LocalisationR = new express.Router()
    LocalisationR.route('/')
    .post(async(req,res)=>{
        console.log(req.body)
        let local = new LocalisationModel({
            localisation : req.body.localisation,
            date : Date(),
            id_med : req.body.id_med
        })
        let result = local.save()
        res.send(local)
        let data = {
            localisation : req.body.localisation,
            date : Date(),
            id_med : req.body.id_med
        }
            
        run().catch(error => console.error(error.stack));
        const fs = require('fs');
        async function run() {
        const res = await QRcode.toDataURL(data.id_med);

        fs.writeFileSync('./qr.html', `<img src="${res}">`);
        console.log('Wrote to ./qr.html');
        }
    })
    .get(async(req,res)=> {
        let allLocalisation = await LocalisationModel.find()
        console.log('get Localisation')
        res.json(allLocalisation)
    })
    app.use('/api/loc', LocalisationR);

    app.listen(port);
    console.log(' RESTful API server started on: ' + port);
   
