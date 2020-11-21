const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const connectionString = process.env.DATABASE_URL || "postgres://vxoamrmqssrudd:4c05e37c81e75aec0250bfb63a806b52fde20762f604e8cbc35ad5146551b3e4@ec2-35-168-77-215.compute-1.amazonaws.com:5432/d317kp8ultukfi?ssl=true"
const {Pool, Client} = require('pg')
const pool = new Pool()

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/get_user_info', function (req, res) {
    var sql = 'SELECT u.first_name, u.last_name, cr.trans_date, cr.trans_location, cr.category, cr.amount, cr.pay_method, cr.entry_desc, cr.wd_type FROM users u INNER JOIN check_register_entry cr ON u.user_name = cr.user_name;';
    pool.query(sql, function(err, result) {
      if (err) {
        console.log("error in query")
        console.log(err)
      }
      console.log("back with DB results:")
      console.log(result.rows)
      res.status(200).send(result.rows)
    })
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
