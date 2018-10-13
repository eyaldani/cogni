const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;

let app = express();

app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(bodyParser.urlencoded({
//     extended: true
// }));
//
// app.use(bodyParser.json());

app.use((req, res, next) => {
  let now = new Date().toString();
  let log = (`${now}: ${req.method} ${req.url}`);

  console.log(log);
  fs.appendFile('server.log', log + '\n', (err) => {
    if (err) {
      console.log('Unable to append to server.log.')
    }
  });
  next();
});

// app.use((req, res, next) => {
//   res.render('maintenance.hbs', {
//     maintenanceMessage: 'the site is currently updated and we will be back soon'
//   });
// });

app.use(express.static(__dirname + '/public'));

hbs.registerHelper('getCurrentYear', () => {
  return new Date().getFullYear()
});

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'cogni',
});

db.connect((err) => {
  if (err) {
    console.log('Unable to connect DB');
  }
  console.log('MySql connected...');
});

app.get('/', (req, res) => {
  res.render('home.hbs', {
    pageTitle: 'Home Page',
  });
});

app.post('/', (req, res) => {
  let user_name = req.body.firstname;
  let sql = 'select * from administrators where username = ?'
  db.query(sql, [req.body.firstname], (err, result) => {
    if (err) {
      console.log('There was en ERROR inside the query');
    }
    console.log('this is the username: ' + user_name);
    res.end("yes");
  }
)});

app.get('/about', (req, res) => {
  let sql = "INSERT INTO `cogni`.`administrators` (`username`, `password`, `firstname`, `lastname`, `email`) VALUES ('admin3', '12345', 'admin3', 'startor3', 'admin3@test.com')";
  db.query(sql, (err, result) => {
    if (err) {
      console.log('There was en ERROR inside the query');
    }
    res.render('about.hbs');
    console.log('Database created!');
  })
});

app.get('/end', (req, res) => {
  let sql = 'SELECT * FROM administrators';
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send('blablabla');
    });
  });


app.post("/", (req, res) => {
  console.log(req.body.firstname);
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
