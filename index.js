const express = require('express')
const app = express()
const path = require('path')
const crypto = require('crypto')
const mongoose = require('mongoose')
const multer = require('multer')
const Grid = require('gridfs-stream')
const methodOverRide = require('method-override')
const GridfsStorage = require('multer-gridfs-storage')
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(methodOverRide('_method'))

const mongoURL = 'mongodb://localhost:27017/fileUpload'

const conn = mongoose.createConnection(mongoURL)

var gfs = ''
conn.once('open',()=>{
    console.log('Database connected')
    //Initialize Stram
    gfs = Grid(conn.db,mongoose.mongo)
    gfs.collection('uploads')
})
//Initialize Storage Engine
var storage = new GridfsStorage({
    url: mongoURL,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });


app.set('view engine','ejs')
app.use(express.static(__dirname + '/public'));
app.get('/',(req,res)=>{
    res.render('index')
})

/*
 @route: /upload
 desc: uploading file to db
*/
app.post('/upload',upload.single('file'),(req,res)=>{
    res.json({file:req.file})
})
app.listen('8080',function(){
    console.log('listening on port 8080')
})