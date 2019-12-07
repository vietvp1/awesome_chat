const express = require('express')
const connectDB = require('../config/db')
const configViewEngine = require('../config/viewEngine')
const initRoutes = require('./routes/web')
const initSockets = require('./sockets/index')
const bodyParser = require('body-parser')
const connectFlash = require('connect-flash')
const session = require('../config/session')
const passport = require('passport')
const http = require('http')
const socketio = require('socket.io')
const passportSocketIo = require('passport.socketio')
const cookieParser = require('cookie-parser')
const events = require('events');
const configApp = require('../config/app')


const app = express();

//set max connect event listener
events.EventEmitter.defaultMaxListeners = configApp.app.max_event_listeners;

//Init server with socket.io and express app
let server = http.createServer(app);
let io = socketio(server);

// Connect Database
connectDB();

//config session
session.configSession(app);

//config view engine
configViewEngine(app);

app.use(bodyParser.urlencoded({extended:true}))

//enable flash messages
app.use(connectFlash());

//user cookie parser
app.use(cookieParser());

//Config passport
app.use(passport.initialize());
app.use(passport.session());

//init all routes
initRoutes(app);

//config socketio
io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: "express.sid",
    secret: 'mysupersecret',
    store: session.sessionStore,
    success: (data, accept) => {
        if (!data.user.logged_in) {
            return accept("Invalid user.", false)
        }
        return accept(null, true);
    },
    fail: (data, message, error, accept) => {
        if (error) {
            console.log("Failed connection to socket.io:", message);
            return accept(new Error(message), false);
        }
    },
}))

//init all sockets
initSockets(io);


const port = process.env.PORT || 3000;
server.listen(port)


// const pem = require('pem')
// const https = require('https')
// pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
//     if (err) {
//       throw err
//     }
//     const app = express();

//     //Init server with socket.io and express app
//     let server = http.createServer(app);
//     let io = socketio(server);

//     // Connect Database
//     connectDB();

//     //config session
//     session.configSession(app);

//     //config view engine
//     configViewEngine(app);

//     app.use(bodyParser.urlencoded({extended:true}))

//     //enable flash messages
//     app.use(connectFlash());

//     //Config passport
//     app.use(passport.initialize());
//     app.use(passport.session());

//     //init all routes
//     initRoutes(app);

// //config socketio
// io.use(passportSocketIo.authorize({
//     cookieParser: cookieParser,
//     key: "express.sid",
//     secret: 'mysupersecret',
//     store: session.sessionStore,
//     success: (data, accept) => {
//         if (!data.user.logged_in) {
//             return accept("Invalid user.", false)
//         }
//         return accept(null, true);
//     },
//     fail: (data, message, error, accept) => {
//         if (error) {
//             console.log("Failed connection to socket.io:", message);
//             return accept(new Error(message), false);
//         }
//     },
// }))

//     //init all sockets
//     initSockets(io);

    
//     const port = process.env.PORT || 3000;
//     https.createServer({ key: keys.serviceKey, cert: keys.certificate }, app).listen(port)
//   });

