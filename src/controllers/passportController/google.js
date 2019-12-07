const passport = require('passport')
const passportGoogle = require('passport-google-oauth')
const UserModel = require('../../models/userModel');
const ChatGroupModel = require('../../models/chatGroupModel');
const ggAuth = require('../../../config/googleAuth')
import {transErrors, transSuccess} from "../../../lang/vi"

let GoogleStrategy = passportGoogle.OAuth2Strategy;

let initPassportGoogle = () => {
    passport.use(new GoogleStrategy({
        clientID: ggAuth.googleAuth.CLIENT_ID,
        clientSecret: ggAuth.googleAuth.CLIENT_SECRET,
        callbackURL: ggAuth.googleAuth.CALLBACK_URL,
        passReqToCallback: true,
    }, async (req,  accessToken, refreshToken, profile, done) => {
        try {
            let user = await UserModel.findOne({"google.uid": profile.id});
            if (user) {
                return done(null, user, req.flash("success", transSuccess.loginSuccess(user.username)))
            }
            let newUserItem = {
                username: profile.displayName,
                gender: profile.gender,
                local: {isActive: true},
                google: {
                    uid: profile.id,
                    token: accessToken,
                    email: profile.emails[0].value
                }
            };
            let newUser = new UserModel(newUserItem);
            await newUser.save();
            return done(null, newUser, req.flash("success", transSuccess.loginSuccess(newUser.username)))

            
        } catch (error) {
            console.log(error);
            return done(null, false, req.flash("errors", transErrors.server_error))
        }
    }))
    
    //save userId to session
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    // this is called by passport.session()
    // return userInfo to req.user
    passport.deserializeUser( async (id, done) => {
        try {
            let user = await UserModel.findUserByIdForSessionToUse(id);
            let getChatGroupIds = await ChatGroupModel.getChatGroupIdsByUser(user._id);

            user = user.toObject();
            user.chatGroupIds = getChatGroupIds

            return done(null, user)
        } catch (error) {
            return done(error, null)
        }
    });
}

module.exports = initPassportGoogle