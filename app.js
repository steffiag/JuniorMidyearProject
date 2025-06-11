//set up the server
const express = require("express");
const db = require("./db/db_connection");
const app = express();
const PORT = process.env.PORT || 3000;
const multer = require("multer");


// define middleware that serves static resources in the public directory
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/uploads"));

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

//configures express to parse URL POST request bodies
app.use(express.urlencoded({extended: false}));


const get_all_picture_items = `
    SELECT name
    FROM picture
`;

app.get("/", (req, res) => {
    db.execute(get_all_picture_items, (error, results) => {
        if (error) {
            res.status(500).send(error); 
        } else {
            res.render("homepage", {pics:results});
        }
    });
});

app.get('/login', (req, res) => {
  res.render('login');
  
});

app.get("/boards", (req, res) => {
    db.execute(get_all_picture_items, (error, results) => {
        if (error) {
            res.status(500).send(error); 
        } else {
            res.render("boards", {pics:results});
        }
    });
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const upload_image = `
    INSERT INTO picture (name)
    VALUES (?)
`;


app.post("/upload", upload.single("photo"), (req, res) => {
    db.execute(upload_image, [req.file.filename], (error, results) => {
        if(error){
            res.status(500).send(error);
        }
        else {
            res.redirect("/");
        }
    });
});

const create_board = `
    INSERT INTO board (board_name)
    VALUES (?)
`;
app.post("/boards", (req, res) => {
    db.execute(create_board, [req.body.board], (error, results) => {
        if(error){
            res.status(500).send(error);
        }
        
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});