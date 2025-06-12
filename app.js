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
    SELECT *
    FROM picture
`;

app.get("/", (req, res) => {
    db.execute(get_all_picture_items, (error, pics) => {
        if (error) {
            res.status(500).send(error); 
        } 
        db.execute(get_all_board_items, (error, boards) => {
        if (error) {
            res.status(500).send(error); 
        } else {
            res.render("homepage", {board_names:boards, pics:pics});
        }
    });
    });
});

app.get('/login', (req, res) => {
  res.render('login');
  
});

app.get('/signup', (req, res) => {
  res.render('signup');
  
});

const get_all_board_items = `
    SELECT board.board_id, board.board_name, (SELECT pic.name
    FROM picture pic
    WHERE pic.board_id = board.board_id
    LIMIT 1) AS preview
    FROM board board
`;

app.get("/boards", (req, res) => {
    db.execute(get_all_board_items, (error, results) => {
        if (error) {
            res.status(500).send(error); 
        } else {
            res.render("boards", {boards:results});
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
    INSERT INTO picture (name, board_id)
    VALUES (?, ?)
`;


app.post("/upload", upload.single("photo"), (req, res) => {
    const boardId = req.body.board === "" ? null : req.body.board;
    db.execute(upload_image, [req.file.filename, boardId], (error, results) => {
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
app.post("/new-board", (req, res) => {
    db.execute(create_board, [req.body.board], (error, results) => {
        if(error){
            res.status(500).send(error);
        }
        else {
            res.redirect("/boards");
        }
        
    });
});

const get_board_specific_pics = `
  SELECT name
  FROM picture
  WHERE board_id = ?
`

app.post('/board_pics', (req, res) => {
  const boardId = req.body.board_id;
  db.execute(get_board_specific_pics, [boardId], (error, results) => {
    if (error) {
      res.status(500).send(error);
    } 
    db.execute(get_all_board_items, (err, boards) => {  
      if (err) return res.status(500).send(err);
      res.render('homepage', { board_names: boards, pics:results });
    });
  });
});


const delete_pic = `
    DELETE FROM picture
    WHERE name = ?
`

app.get('/homepage/:name/delete', (req, res) => {
  db.execute(delete_pic, [req.params.name], (err) => {
    if (err) return res.status(500).send(err);
    res.redirect('/');
  });
});

const unassign_pics_from_board = `
    UPDATE picture
    SET board_id = NULL
    WHERE board_id IN (
      SELECT board_id FROM board WHERE board_name = ?
    )
`;

const delete_board = `
    DELETE FROM board
    WHERE board_name = ?
`;

app.get('/boards/:name/delete', (req, res) => {
    const boardName = req.params.name;
    db.execute(unassign_pics_from_board, [boardName], (err) => {
    if (err) return res.status(500).send(err);
    });
    db.execute(delete_board, [boardName], (err) => {
      if (err) return res.status(500).send(err);
      res.redirect('/boards');
    });
});

const update_board_location= 
  `UPDATE picture 
  SET board_id = ? 
  WHERE name = ?`;
;

app.post('/update-board', (req, res) => {
    const boardId = req.body.board_id === "" ? null : req.body.board_id;
    db.execute(update_board_location, [boardId, req.body.pic_name], (err) => {
    if (err) return res.status(500).send(err);
    res.redirect('/');
  });
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});