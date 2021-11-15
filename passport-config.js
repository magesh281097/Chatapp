const LocalStrategy = require('passport-local').Strategy
var flash = require('express-flash')
const mysql = require('mysql')

var dbConnect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chat'
})
dbConnect.connect();

function initialize(passport) {
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback : true
    }, function (req,username, password, done) {
        if (!username || !password) { return done(null, false, req.flash('error', 'All fields are required.')); }

        dbConnect.query('SELECT * FROM USERS WHERE username=?', [username], (err,res) => {
            if(err){ return done(null,false, req.flash('error',err)) }

            if(!res.length){ return done(null, false, req.flash('error','Invalid username or password.')); }

            const dbPass = res[0].password;
            if(dbPass != password){
                return done(null, false, req.flash('error','Invalid password.'));
            }
            return done(null,res[0])

        })

        passport.serializeUser(function(user, done){
            done(null, user.id);
        });
        passport.deserializeUser(function(id, done){
            dbConnect.query("select * from users where id = "+ id, function (err, rows){
                done(err, rows[0]);
            });
        });
    }))
}

module.exports = initialize