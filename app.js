require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express();
const passport = require('passport');
const flash = require('express-flash')
const session = require('express-session')
// const initializePassport = require('./passport-config')
const mysql = require('mysql')
var dbConnect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chat'
})
dbConnect.connect();


app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))


//------------------ Requests ------------------

app.get('/', (err, res) => {
    res.render('login.ejs')
})

app.get('/register', (err, res) => {
    res.render('register.ejs')
})

app.post('/register', checkExistUSer, (req, res) => {
    try {
        const userName = req.body.name
        const password = req.body.password
        var sql = "INSERT INTO users (username, password) VALUES ('" + userName + "', '" + password + "')";
        dbConnect.query(sql, function (err, result) {
            if (err) throw err;
            res.redirect('/')
        });
    } catch {
        res.redirect('/register')
    }

})

function checkExistUSer(req, res, next) {
    const userName = req.body.name

    var sql = "SELECT count(username) AS userCount FROM USERS WHERE username = '" + userName + "'";

    dbConnect.query(sql, function (err, res) {
        if (err) {
            console.log(err)
            // return next()
        }
        req.flash('error', 'User Already Exists');
        // if(res[0].count){
        //     res.redirect('/')
        // }
    })
}

app.listen(5000, () => {
    console.log('Server Running 5000')
})