const express = require('express')
const router = express.Router();
const passport = require('passport')
import {home, auth, userController, contactController, notificationController, message, groupChat} from "../controllers/index"
import {authValid, userValid, contactValid, messageValid, groupChatValid} from "../validator/index"
import initPassportLocal from "../controllers/passportController/local"
import initPassportFacebook from "../controllers/passportController/facebook"
import initPassportGoogle from "../controllers/passportController/google"


//init all passportt
initPassportLocal();
initPassportFacebook();
initPassportGoogle();

let initRoutes = (app) =>{
    router.get('/login-register', auth.checkLoggedOut ,auth.getLoginRegister)
    router.post('/register', auth.checkLoggedOut ,authValid.register, auth.postRegister)
    router.get("/verify/:token", auth.checkLoggedOut ,auth.verifyAccount);
    router.post("/login", auth.checkLoggedOut ,passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login-register",
        successFlash: true,
        failureFlash: true,
    }));
    router.get("/auth/facebook", auth.checkLoggedOut ,passport.authenticate("facebook", {scope: ["email"]}));
    router.get("/auth/facebook/callback", auth.checkLoggedOut ,passport.authenticate("facebook",{
        successRedirect: "/",
        failureRedirect: "/login-register",
    }))
    router.get("/auth/google", auth.checkLoggedOut, passport.authenticate("google", {scope: ["email"]}));
    router.get("/auth/google/callback", auth.checkLoggedOut, passport.authenticate("google",{
        successRedirect: "/",
        failureRedirect: "/login-register",
    }))

    router.get('/', auth.checkLoggedIn ,home.getHome)
    router.get('/logout', auth.checkLoggedIn ,auth.getLogout)
    router.put("/user/update-avatar", auth.checkLoggedIn, userController.updateAvatar)
    router.put("/user/update-info", auth.checkLoggedIn, userValid.updateInfo ,userController.updateInfo)
    router.put("/user/update-password", auth.checkLoggedIn, userValid.updatePassword ,userController.updatePassword)
    router.get("/contact/find-users/:keyword", auth.checkLoggedIn, contactValid.findUsersContact ,contactController.findUsersContact)
    router.post("/contact/add-new", auth.checkLoggedIn ,contactController.addNew)
    router.delete("/contact/remove-contact", auth.checkLoggedIn ,contactController.removeContact)

    router.delete("/contact/remove-request-contact-sent", auth.checkLoggedIn ,contactController.removeRequestContact)
    router.delete("/contact/remove-request-contact-received", auth.checkLoggedIn ,contactController.removeRequestContactReceived)
    router.put("/contact/approve-request-contact-received", auth.checkLoggedIn ,contactController.approveRequestContactReceived)

    
    router.get("/contact/read-more-contacts", auth.checkLoggedIn ,contactController.readMoreContacts)
    router.get("/contact/read-more-contacts-sent", auth.checkLoggedIn ,contactController.readMoreContactsSent)
    router.get("/contact/read-more-contacts-received", auth.checkLoggedIn ,contactController.readMoreContactsReceived)
    router.get("/contact/search-friends/:keyword", auth.checkLoggedIn, contactValid.searchFriends ,contactController.searchFriends)
    router.get("/contact/find-more-friends-to-add-groupChat/:keyword", auth.checkLoggedIn ,contactController.findMoreFriendsToAddGroup)

    router.get("/notification/read-more", auth.checkLoggedIn, notificationController.readMore )
    router.put("/notification/mark-all-as-read", auth.checkLoggedIn, notificationController.markAllAsRead )

    router.post("/message/add-new-text-emoji", auth.checkLoggedIn, messageValid.checkMessageLength, message.addNewTextEmoji)
    router.post("/message/add-new-image", auth.checkLoggedIn, message.addNewImage)
    router.post("/message/add-new-attachment", auth.checkLoggedIn, message.addNewAttachment)
    router.get("/message/read-more-all-chat", auth.checkLoggedIn, message.readMoreAllChat)
    router.get("/message/read-more-personal-chat", auth.checkLoggedIn, message.readMorePersonalChat)
    router.get("/message/read-more-group-chat", auth.checkLoggedIn, message.readMoreGroupChat)

    router.get("/message/read-more", auth.checkLoggedIn, message.readMore)
    router.get("/message/find-conversations/:keyword", auth.checkLoggedIn, message.findConversations)

    router.post("/group-chat/add-new", auth.checkLoggedIn, groupChatValid.addNewGroup, groupChat.addNewGroup)
    router.put("/group-chat/add-more", auth.checkLoggedIn,  groupChat.addMoreMembersForGroup)
    router.get("/group-chat/read-more", auth.checkLoggedIn,  groupChat.readMoreMembersInGroup)

    return app.use("/", router);
}

module.exports = initRoutes