//set up the server
const express = require("express");
const db = require("./db/db_connection");
const app = express();
const PORT = process.env.PORT || 3000;

// define middleware that serves static resources in the public directory
app.use(express.static(__dirname + "/public"));
// app.use(express.static(__dirname + "/Script"));

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

//configures express to parse URL POST request bodies
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.render('homepage');
  res.send('Hello from Junior Midyear Project!');
  
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});