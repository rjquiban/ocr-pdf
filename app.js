const express = require("express");
const app = express();
const fs = require("fs");   //read files and create files
const multer = require("multer");   //upload files to server
const {createWorker} = require("tesseract.js");
const worker = createWorker({   //worker analyzes images
    logger: m => console.log(m)
});  

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage}).single('testFile');

app.set('view engine', 'ejs');

/* * * * *  ROUTES * * * * */
app.get("/", function(req, res){
    res.render('index');
});

app.post("/upload", function(req, res){
    upload(req, res, err => {
        fs.readFile("./uploads/" + req.file.originalname, (err, data) => {
            if(err) return console.log("This is your error", err);
            
            (async () => {
                await worker.load();
                console.log("load");

                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                console.log("after initialize");
                console.log(data);

                const { data: { text } } = await worker.recognize(data);
                console.log("text should be here:");
                console.log(text);
                await worker.terminate();
              })();
        });
    });
});

// listen and start server
const PORT = 3000;
app.listen(PORT, function(){
    console.log("Starting server on port " + PORT);
});

