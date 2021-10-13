let express = require('express')
//let passport = require('passport')
let flash = require('connect-flash')
let http = require('http')
//let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')
let session = require('express-session')
let morgan = require('morgan')
//let mongoose=require('./config/mongodb')
let app = express()
const port =  8000


//-------IMP----------
// pass passport object to auth functions
let passport=require('./config/passport') 

app.use(morgan('dev'))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(session({ resave:true, saveUninitialized: false,secret: 'fghwj67754wegn456fdy65eujtrh' })) // session secret
app.use(passport.initialize())
app.use(passport.session()) // persistent login sessions
app.use(flash()) // use for flash messages stored in session

app.set('view engine', 'ejs')

//-------IMP----------
// load routes and pass in app and configured passport

var routes=require('./routes/auth_routes.js')
//app.use(passport)
app.use("/",routes)
//require('./routes/auth_routes.js')(app, passport)

// create server object
let server = http.createServer(app)
// booting up server function
let boot = function () {
  server.listen(port, function () {
    console.log('Express server listening on port ', port)
  })
}
// shutdown server function
let shutdown = function () {
  server.close()
}


// if main module then start server else pass to exports
if (!require.parent) {
  boot()
} else {
  console.log('Running ap as module')
  module.exports = {
    boot: boot,
    shutdown: shutdown,
    port: port,
    server: server,
    app: app
  }
}
