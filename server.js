const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const session = require('express-session');
const db = require('./db.js');


let app = express();


app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({ secret: 'ItIsOurSercet', cookie: { maxAge: null }}))

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


let sess;
let user;

app.get('/', (req, res) => {
  sess = req.session;
  sess.permission = 'Guest';
  console.log(user);
  if (!user) {
    res.render('login.hbs')
  } else if (sess.permission = 'Admin') {
    res.render('administrators.hbs', {
      user
    });
    return
  } else if (sess.permission = 'Therapist') {
    res.render('therapists.hbs');
  } else if (sess.permission = 'Patient') {
    res.render('patients.hbs');
  }
});


app.post('/', (req, res) => {
  sess.username = req.body.username;
  sess.password = req.body.password;
  let sql = 'select * from administrators where username = ? AND password = ?;'
  db.query(sql, [sess.username, sess.password], (err, result, fields) => {
    if (err) {
      console.log('There was en ERROR inside the query');
    }
    try {
      console.log('New admin connected: ' + JSON.stringify(result[0].username));
      console.log('Admin First Name: ' + JSON.stringify(result[0].firstname));
      hbs.registerHelper('admin', () => {
        return true
      });
      sess.permission = 'Admin'
      user = {
        username: JSON.stringify(result[0].username),
        firstname: JSON.stringify(result[0].firstname),
        lastname: JSON.stringify(result[0].lastname),
        password: JSON.stringify(result[0].password),
        email: JSON.stringify(result[0].email),
        permission: 'admin'
      }
      res.render('administrators.hbs', {
        user
      });
    } catch (e) {
      console.log('Username or password does not exits inside administrators');
      if (JSON.stringify(result) === '[]') {
        let sql = 'select * from therapists where username = ? AND password = ?;'
        db.query(sql, [sess.username, sess.password], (err, result, fields) => {
          if (err) {
            console.log('There was en ERROR inside the query');
          }
          try {
            console.log('New therapist connected: ' + JSON.stringify(result[0].username));
            hbs.registerHelper('therapist', () => {
              return true
            });
            sess.permission = 'Therapist'
            user = {
              username: JSON.stringify(result[0].username),
              firstname: JSON.stringify(result[0].firstname),
              lastname: JSON.stringify(result[0].lastname),
              password: JSON.stringify(result[0].password),
              email: JSON.stringify(result[0].email),
              phone: JSON.stringify(result[0].phone),
              title: JSON.stringify(result[0].title),
              permission: 'therapist'
            }
            res.render('therapists.hbs', {
              user
            });
          } catch (e) {
            console.log('Username or password does not exits inside therapists');
            if (JSON.stringify(result) === '[]') {
              let sql = 'select * from patients where username = ? AND password = ?;'
              db.query(sql, [sess.username, sess.password], (err, result, fields) => {
                if (err) {
                  console.log('There was en ERROR inside the query');
                }
                try {
                  console.log('New patient connected: ' + JSON.stringify(result[0].username));
                  hbs.registerHelper('patient', () => {
                    return true
                  });
                  sess.permission = 'Patient'
                  user = {
                    username: JSON.stringify(result[0].username),
                    firstname: JSON.stringify(result[0].firstname),
                    lastname: JSON.stringify(result[0].lastname),
                    password: JSON.stringify(result[0].password),
                    email: JSON.stringify(result[0].email),
                    phone: JSON.stringify(result[0].phone),
                    sex: JSON.stringify(result[0].sex),
                    city: JSON.stringify(result[0].city),
                    street: JSON.stringify(result[0].street),
                    houseNumber: JSON.stringify(result[0].houseNumber),
                    permission: 'patient'
                  }
                  res.render('patients.hbs', {
                    user
                  });
                } catch (e) {
                  console.log('Username or password does not exits inside patients');
                  hbs.registerHelper('invalidInput', () => {
                    return true
                  });
                  res.render('login.hbs', {
                    pageTitle: 'Login Page',
                  });
                }
              });
            };
          };
        });
        }
      }
    })
  });


app.get('/register', (req, res) => {
  if (sess.permission !== 'Guest') {
    res.redirect('/');
  }
  res.render('register.hbs', {
    pageTitle: 'Register Page',
  });
});

app.post('/register', (req, res) => {
  console.log(req.body)
  let username = req.body.username
  let password = req.body.password
  let firstname = req.body.firstname
  let lastname = req.body.lastname
  let email = req.body.email
  let phone = req.body.phone
  let sex = req.body.gender
  let city = req.body.city
  let street = req.body.street
  let houseNumber = req.body.houseNumber
  let dateOfBirth = req.body.dateofbirth
  let sql = 'INSERT INTO `cogni`.`patients` (`username`, `password`, `firstname`, `lastname`, `email`, `phone`, `sex`, `city`, `street`, `houseNumber`, `dateOfBirth`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [username, password, firstname, lastname, email, phone, sex, city, street, houseNumber, dateOfBirth], (err, result, fields) => {
    if (err) {
      console.log('There was en ERROR inside the query. Probably this username is already used.');
      res.render('register_2.hbs')
    } else {
      let sql = 'select * from patients where username = ? AND password = ?;'
      db.query(sql, [username, password], (err, result, fields) => {
        if (err) {
          console.log('There was en ERROR inside the query');
        } else {
          console.log('New patient added: ' + JSON.stringify(result[0].username));
          hbs.registerHelper('successfully_registered', () => {
            return true
          });
          res.redirect('/');
    }
  })
};
});
});

app.get('/about', (req, res) => {
  console.log(sess.permission)
  res.render('about.hbs', {
    pageTitle: 'About Page',
  });
});

app.get('/adding_therapist', (req, res) => {
  res.render('adding_therapist.hbs', {
    pageTitle: 'Add a Therapist Page',
  });
});

app.post('/adding_therapist', (req, res) => {
  let username = req.body.username
  let password = req.body.password
  let firstname = req.body.firstname
  let lastname = req.body.lastname
  let email = req.body.email
  let phone = req.body.phone
  let title = req.body.title
  let sql = 'INSERT INTO `cogni`.`therapists` (`username`, `password`, `firstname`, `lastname`, `email`, `title`, `phone`) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [username, password, firstname, lastname, email, title, phone], (err, result, fields) => {
    if (err) {
      console.log('There was en ERROR inside the query. Probably this therapist already exists.');
      res.send('ERROR')
    } else {
      console.log('New therapist added: ' + JSON.stringify(firstname) + JSON.stringify(lastname));
      res.render('adding_therapist_v.hbs', {
        firstname, lastname
      });
    }
  })
});

app.get('/adding_patient', (req, res) => {
  res.render('adding_patient.hbs', {
    pageTitle: 'Add a Patient Page',
  });
});

app.post('/adding_patient', (req, res) => {
  console.log(req.body)
  let username = req.body.username
  let password = req.body.password
  let firstname = req.body.firstname
  let lastname = req.body.lastname
  let email = req.body.email
  let phone = req.body.phone
  let sex = req.body.gender
  let city = req.body.city
  let street = req.body.street
  let houseNumber = req.body.houseNumber
  let dateOfBirth = req.body.dateofbirth
  let sql = 'INSERT INTO `cogni`.`patients` (`username`, `password`, `firstname`, `lastname`, `email`, `phone`, `sex`, `city`, `street`, `houseNumber`, `dateOfBirth`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [username, password, firstname, lastname, email, phone, sex, city, street, houseNumber, dateOfBirth], (err, result, fields) => {
    if (err) {
      console.log('There was en ERROR inside the query. Probably this username is already used.');
      hbs.registerHelper('invalidInput', () => {
        return true
      });
      res.redirect('/adding_patient');
    } else {
      let sql = 'select * from patients where username = ? AND password = ?;'
      db.query(sql, [username, password], (err, result, fields) => {
        if (err) {
          console.log('There was en ERROR inside the query');
        } else {
          console.log('New patient added: ' + JSON.stringify(result[0].username));
          res.render('/adding_patient_v', {
            firstname, lastname
          });
        };
      });
    };
  });
});

app.get('/contact', (req, res) => {
  res.render('contact.hbs', {
    pageTitle: 'Contact Page',
  });
});

app.get('/profile', (req, res) => {
  res.render('profile.hbs', {
    pageTitle: 'Profile Page',
    user
  });
});

app.post('/profile', (req, res) => {
  console.log(req.body);
  console.log(req.body.firstname);
  console.log(user.username);
  // user.firstname = req.body.firstname
  // user.lastname = req.body.lastname
  // user.email = req.body.email
  username = user.username.slice(1, -1);
  console.log(username);
  firstname = req.body.firstname
  lastname = req.body.lastname
  email = req.body.email
  if (user.permission === 'admin') {
    console.log('now we are going to update this admin!');
    if (!req.body.password) {
      console.log('WITHOUS PASSWORD');
      let sql = 'UPDATE `cogni`.`administrators` SET `firstname`=?, `lastname`=?, `email`=? WHERE username=?;'
      db.query(sql, [firstname, lastname, email, username], (err, result, fields) => {
        if (err) {
          console.log('There was en ERROR inside the query');
        } else {
          console.log('The user: ' + user.username + ' has been updated.');
          console.log(JSON.stringify(result));
          res.send('YES!!!');
        }
      })
    };
  }
})

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
