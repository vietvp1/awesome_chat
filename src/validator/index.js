const authValidation = require('./authValidation')
const userValidation = require('./userValidation')
const contactValidation = require('./contactValidation')
const messageValidation = require('./messageValidation')
const groupChatValidation = require('./groupChatValidation')

export const authValid = authValidation;
export const userValid = userValidation;
export const contactValid = contactValidation;
export const messageValid = messageValidation;
export const groupChatValid = groupChatValidation;