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
  .get('/register.ejs', (req, res) => res.render('pages/register.ejs'))
  .get('/dashboard', function(req, res) {
    if (req.session.username && req.session.password) {
      res.render('pages/dashboard.ejs')
    }
    else {
      res.redirect('/')
    }
  })
  .get('/logout', function(req, res) {
    if (req.session.username && req.session.password) {
      req.session.destroy(function () {
        res.redirect('/')
      })
    }
    else {
      res.end()
    }
  })
  .post('/register', function(req, res) {
    //create query to see if username is taken
    var query = 'SELECT user_name FROM users WHERE user_name = $1'
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
              res.send({success: false, redirect: '', msg: 'error inserting to DB'})
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
  .post('/delete_row', function(req, res) {
    var sql = 'DELETE FROM check_register_entry WHERE entry_id = $1'

    values = [req.body.entryID]

    pool.query(sql, values, function(err, result) {
      if (err) {
        console.log(err.stack)
        res.send({success: false, msg: 'error deleting record'})
      }
      else {
        res.send({success: true})
      }  
    })
  })
  .post('/update_transaction', function(req, res) {
    var sql = 'UPDATE check_register_entry SET trans_date = $1, trans_location = $2, category = $3, amount = $4, pay_method = $5, entry_desc = $6, wd_type = $7 WHERE entry_id = $8;'
    
    values = [req.body.transDate, req.body.transLocation, req.body.category, req.body.amount, req.body.mop, req.body.desc, req.body.wd, req.body.entry_id]

    pool.query(sql, values, function(err, result) {
      if (err) {
        console.log(err.stack)
        res.send({success: false, msg: 'error updating record'})
      }
      else {
        res.send({success: true})
      }  
    })
  })
  .post('/insert_transaction', function(req, res) {
    //create insert sql statement
    var sql = 'INSERT INTO check_register_entry (user_name, trans_date, trans_location, category, amount, pay_method, entry_desc, wd_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)'

    //create array of parameters to be inserted in values clause of sql statement
    values = [req.session.username, req.body.transDate, req.body.transLocation, req.body.category, req.body.amount, req.body.mop, req.body.desc, req.body.wd]

    //initiate pool to send insert
    pool.query(sql, values, function(err, response) {
      //if there is an error, send flase to client with err msg
      if (err) {
        console.log(err.stack)
        res.send({success: false, msg: 'error inserting record'})
      }
      //if successful, send true to client
      else {
        res.send({success: true})
      }
    })
  })
  .get('/get_current_row_info', function (req, res) {
    var sql = 'SELECT cr.entry_id, cr.trans_date, cr.trans_location, ccl.cat_name, cr.amount, mcl.mop_type, cr.entry_desc, tcl.wd_type FROM users u INNER JOIN check_register_entry cr ON u.user_name = cr.user_name INNER JOIN cat_common_lookup ccl ON cr.category = ccl.cat_cl_id INNER JOIN mop_common_lookup mcl ON cr.pay_method = mcl.mop_cl_id INNER JOIN type_common_lookup tcl ON cr.wd_type = tcl.type_cl_id WHERE cr.entry_id = $1;'
    values = [req.query.entryID]
    pool.query(sql, values, function(err, result) {
      if (err) {
        console.log("error in query")
        console.log(err.stack)
        res.status(400).send({success: false, msg: 'error querying data'})
      }
      else {
        res.status(200).send({success: true, rows: result.rows, rowCount: result.rowCount})
      }
    })
  })
  .get('/get_user_info', function (req, res) {
    var sql = 'SELECT cr.entry_id, cr.trans_date, cr.trans_location, ccl.cat_name, cr.amount, mcl.mop_type, cr.entry_desc, tcl.wd_type FROM users u INNER JOIN check_register_entry cr ON u.user_name = cr.user_name INNER JOIN cat_common_lookup ccl ON cr.category = ccl.cat_cl_id INNER JOIN mop_common_lookup mcl ON cr.pay_method = mcl.mop_cl_id INNER JOIN type_common_lookup tcl ON cr.wd_type = tcl.type_cl_id WHERE cr.user_name = $1 ORDER BY cr.trans_date;';
    values = [req.session.username]
    pool.query(sql, values, function(err, result) {
      if (err) {
        console.log("error in query")
        console.log(err.stack)
        res.status(400).send({success: false, msg: 'error querying data'})
      }
      console.log("back with DB results:")
      console.log(result.rows)
      res.status(200).send({success: true, rows: result.rows, rowCount: result.rowCount})
    })
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
