import session from "express-session"
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session)

let sessionStore = new MongoStore({ mongooseConnection: mongoose.connection })

let configSession = (app) => {
    app.use(session({
        key: "express.sid",
        secret: 'mysupersecret' ,
        resave: false, 
        saveUninitialized: false,
        store: sessionStore,
        cookie: { maxAge: 180 * 60 * 1000 * 24 }
    }))
}

module.exports = {
    configSession: configSession,
    sessionStore: sessionStore,
};