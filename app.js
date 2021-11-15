require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express();
const passport = require('passport');
var flash = require('express-flash')
const session = require('express-session')
const initializePassport = require('./passport-config')
const mysql = require('mysql')
var dbConnect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chat'
})
dbConnect.connect();

initializePassport(passport);
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
app.use(passport.initialize());
app.use(passport.session());


//------------------ Requests ------------------

app.get('/', (req, res) => {
    res.render('login.ejs')
})

//authenticate user
app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
}))

// app.post('/login', function (req, res, next) {

//     var username = req.body.username;
//     var password = req.body.password;

//     dbConnect.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function (err, rows, fields) {
//         if (err) throw err

//         // if user not found
//         if (rows.length <= 0) {
//             req.flash('error', 'Invalid User Please register to Continue')
//             res.render('login.ejs')
//         }
//         else { // if user found
//             // render to views/user/edit.ejs template file
//             req.session.loggedin = true;
//             req.session.name = username;
//             res.redirect('/home');

//         }
//     })

// })


app.get('/register', (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkExistUser, (req, res) => {
    try {
        const userName = req.body.name
        const password = req.body.password
        var sql = "INSERT INTO users (username, password) VALUES ('" + userName + "', '" + password + "')";
        dbConnect.query(sql, function (err, result) {
            if (err) {
                console.log(err)
            }
            req.flash('success', "User Added Successfully")
            res.render('register.ejs')
            res.end()
        });
    } catch {
        res.redirect('/register')
    }

})

app.get('/home', checkAuthenticated, (req, res) => {
    console.log(req.user.username)     
    res.locals.user = req.user.username    
    res.render('home.ejs')
})

// Middlewares

function checkExistUser(req, res, next) {
    const userName = req.body.name

    var sql = "SELECT count(username) AS userCount FROM USERS WHERE username = '" + userName + "'";

    dbConnect.query(sql, function (err, response) {
        if (response[0].userCount) {
            req.flash('error', 'User Already Exists')
            return res.render('register.ejs')
        }
        return next()
    })
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error', 'Invalid Login')
    return res.render('login.ejs')
}

app.listen(5000, () => {
    console.log('Server Running 5000')
})