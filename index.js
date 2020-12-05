const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const connectionString = process.env.DATABASE_URL || "postgres://vxoamrmqssrudd:4c05e37c81e75aec0250bfb63a806b52fde20762f604e8cbc35ad5146551b3e4@ec2-35-168-77-215.compute-1.amazonaws.com:5432/d317kp8ultukfi?ssl=true"
const {Pool, Client} = require('pg')
const pool = new Pool({
  connectionString: connectionString
})
const session = require('express-session')
const bcrypt = require('bcrypt')
const saltRounds = 10

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded({extended: false}))
  .use(session({
    secret: 'secretShadow' ,
    resave: false ,
    saveUninitialized: true
  }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/register', function(req, res) {
    //create query to see if username is taken
    var query = 'SELECT user_name, FROM users WHERE user_name = $1'
    values = [req.body.username]

    //execute query
    pool.query(query, values, function(err, response) {
      if (err) {
        console.log(err.stack)
        res.send({success: false, redirect: '', msg: 'there was an error with the register query'})
      }
      else if (response.rowCount != 0) {
        res.send({success: false, redirect: '', msg: 'username is in use'})
      }
      else {
        //first hash the password
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

          //check for hashing err
          if (err) {
            console.log(err.stack)
            res.send({success: false, redirect: '', msg: 'error hashing password'})
          }
        
          //prepare new query to insert new user info
          insert = "INSERT INTO users VALUES($1, $2, $3, $4, $5)"
          values = [req.body.username, hash, req.body.fname, req.body.lname, req.body.income]

          //execute the query
          pool.query(insert, values, function(err, response) {
            if (err) {
              console.log(err.stack)
            }
          })

          //set session variables
          req.session.username = req.body.username
          req.session.password = hash

          //respond successfully to client
          res.send({success: true, redirect: 'dashboard', msg: 'successfully registered new user'})
        })
      }
    })
  })
  .post('/login', function(req, res) {
    //create query to pull user info from DB for verification
    var query = 'SELECT user_name, hashed_pass FROM users WHERE user_name = $1'
    values = [req.body.username]

    //execute the query
    pool.query(query, values, function(err, response) {
      //if an error, report to client
      if (err) {
        console.log(err.stack)
        res.send({success: false, redirect: '', msg: 'there was an error with the query'})
      }
      //if no results from query report to client
      else if (response.rowCount == 0) {
        res.send({success: false, redirect: '', msg: 'the account does not exist'})
      }
      //we got a result, now compare passwords
      else {
        var storedHash = response.rows[0].hashed_pass;
        bcrypt.compare(req.body.password, storedHash, function(err, compareResult) {
          //if err comparing report to client
          if (err) {
            console.log(err.stack)
            res.send({success: false, redirect: '', msg: 'could not compare passwords'})
          }
          //no err, save username and password to session and report to/redirect client
          else {
            req.session.username = response.rows[0].user_name
            req.session.password = response.rows[0].hashed_pass
            res.send({success: true, redirect: 'dashboard', msg: response.rows[0].user_name + ' logged in'})
          }
        })
      }
    })
  })
  .get('/get_user_info', function (req, res) {
    var sql = 'SELECT u.first_name, u.last_name, cr.trans_date, cr.trans_location, cr.category, cr.amount, cr.pay_method, cr.entry_desc, cr.wd_type FROM users u INNER JOIN check_register_entry cr ON u.user_name = cr.user_name;';
    pool.query(sql, function(err, result) {
      if (err) {
        console.log("error in query")
        console.log(err)
        res.status(400).send(err)
      }
      console.log("back with DB results:")
      console.log(result.rows)
      res.status(200).send(result.rows[0])
    })
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
