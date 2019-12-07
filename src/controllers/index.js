const authController = require('./authController')
const homeController = require('./homeController')
const user = require('./userController')
const contact = require('./contactController')
const notification = require('./notificationController')
const messageController = require('./messageController')
const groupChatController = require('./groupChatController')


export const home = homeController;
export const auth = authController;
export const userController = user;
export const contactController = contact;
export const notificationController = notification;
export const message = messageController;
export const groupChat = groupChatController;;