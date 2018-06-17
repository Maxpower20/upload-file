const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid  = require('gridfs-stream');
const crypto = require('crypto');

// Create mongo connection
const CONN_URI = 'mongodb://localhost:27017/local';
const conn = mongoose.createConnection(CONN_URI);

// Init gfs
let gfs;

conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
    url: CONN_URI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const fileInfo = {
                    filename: file.originalname,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });


/* GET home page with files uploaded info. */
router.get('/', function(req, res, next) {
    gfs.files.find().toArray((err, files) => {
        // Check for files
        if (!files || files.length === 0) {
            res.send('No Files');
        } else {
            res.send('Uploaded files: ' + files.length);
        }
    });
});

/* Upload new File into DB */
router.post('/', upload.single('file'), (req, res) => {
    res.redirect('/file');
});

module.exports = router;
