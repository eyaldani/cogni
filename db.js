let mysql = require('mysql');
let db;

function connectDatabase() {
  console.log('IM HERERERER')
    if (!db) {
      db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'cogni',
      });

        db.connect(function(err){
            if(!err) {
                console.log('Database is connected!');
            } else {
                console.log('Error connecting database!');
            }
        });
    }
    return db;
}

module.exports = connectDatabase();
