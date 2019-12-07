import {validationResult} from"express-validator/check"
import {message} from "../services/index"
import {app} from "../../config/app"
import {transErrors, transSuccess} from "../../lang/vi"
import fsExtra from "fs-extra"
import {lastItemOfArray, convertTimestampToHumanTime, bufferToBase64} from "../helpers/clientHelper"
import {promisify} from "util"
const ejs = require('ejs')
const multer = require('multer')

//make ejs function renderfile available with async await
const renderFile = promisify(ejs.renderFile).bind(ejs);

let addNewTextEmoji = async (req, res) => {
    let errorArr = [];
    let validationErrors = validationResult(req)
    
    if (!validationErrors.isEmpty()) {
        let errors = Object.values(validationErrors.mapped());
        errors.forEach(item => {
            errorArr.push(item.msg)
        })
        
        return res.status(500).send(errorArr)
    }

    try {
        let sender = {
            id: req.user._id,
            name: req.user.username,
            avatar: req.user.avatar
        };
        let receivedId = req.body.uid;
        let messageVal = req.body.messageVal;
        let isChatGroup = req.body.isChatGroup;

        let newMessage = await message.addNewTextEmoji(sender, receivedId, messageVal, isChatGroup);
        
        return res.status(200).send({message: newMessage});
    } catch (error) {
        return res.status(500).send(error)
    }
}

//handle image chat
let storageImageChat = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, app.image_message_directory);
    },
    filename: (req, file, callback) => {
        let math = app.image_message_type;
        if (math.indexOf(file.mimetype) === -1 ) {
            return callback(transErrors.image_message_type, null);
        }

        let imageName = `${file.originalname}`; //${Date.now()}-
        callback(null, imageName);
    },
})

let ImageMessageUploadFile = multer({
    storage: storageImageChat,
    limits: {fileSize: app.image_message_limit_size }
}).single("my-image-chat")

let addNewImage = (req, res) => {
    ImageMessageUploadFile(req, res, async(error) => {
        if (error) {
            if(error.message) {
                return res.status(500).send(transErrors.image_message_size)
            }
            return res.status(500).send(error);
        }

        try {
            let sender = {
                id: req.user._id,
                name: req.user.username,
                avatar: req.user.avatar
            };
            let receivedId = req.body.uid;
            let messageVal = req.file;
            let isChatGroup = req.body.isChatGroup;
    
            let newMessage = await message.addNewImage(sender, receivedId, messageVal, isChatGroup);
            
            //remove image vì ảnh đã được lưu trên mongodb
            await fsExtra.remove(`${app.image_message_directory}/${newMessage.file.fileName}`);

            return res.status(200).send({message: newMessage});
            } catch (error) {
                return res.status(500).send(error)
            }
    });
}

//handle attachment chat
let storageAttachmentChat = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, app.attachment_message_directory);
    },
    filename: (req, file, callback) => {
        let attachmentName = `${file.originalname}`; //${Date.now()}-
        callback(null, attachmentName);
    },
})

let AttachmentMessageUploadFile = multer({
    storage: storageAttachmentChat,
    limits: {fileSize: app.attachment_message_limit_size }
}).single("my-attachment-chat")

let addNewAttachment = (req, res) => {
    AttachmentMessageUploadFile(req, res, async(error) => {
        if (error) {
            if(error.message) {
                return res.status(500).send(transErrors.attachment_message_size)
            }
            return res.status(500).send(error);
        }

        try {
            let sender = {
                id: req.user._id,
                name: req.user.username,
                avatar: req.user.avatar
            };
            let receivedId = req.body.uid;
            let messageVal = req.file;
            let isChatGroup = req.body.isChatGroup;
    
            let newMessage = await message.addNewAttachment(sender, receivedId, messageVal, isChatGroup);
            
            //remove attachment vì ảnh đã được lưu trên mongodb
            await fsExtra.remove(`${app.attachment_message_directory}/${newMessage.file.fileName}`);

            return res.status(200).send({message: newMessage});
            } catch (error) {
                return res.status(500).send(error)
            }
    });
}

let readMoreAllChat = async (req, res) => {
    try {
        //get skip number from query param
        let skipPersonal = +(req.query.skipPersonal);
        let skipGroup = +(req.query.skipGroup);

        //get more item
        let newAllConversations = await message.readMoreAllChat(req.user._id, skipPersonal, skipGroup);
        
        let dataToRender = {
            newAllConversations: newAllConversations,
            lastItemOfArray: lastItemOfArray,
            convertTimestampToHumanTime: convertTimestampToHumanTime,
            bufferToBase64: bufferToBase64,
            user: req.user,
        };

        let leftSideData = await renderFile("src/views/main/readMoreConversations/_leftSide.ejs", dataToRender);
        let rightSideData = await renderFile("src/views/main/readMoreConversations/_rightSide.ejs", dataToRender);
        let imageModalData = await renderFile("src/views/main/readMoreConversations/_imageModal.ejs", dataToRender);
        let attachmentModalData = await renderFile("src/views/main/readMoreConversations/_attachmentModal.ejs", dataToRender);

        
        // ejs.renderFile("src/views/main/readMoreConversations/_leftSide.ejs", dataToRender, {}, function (err, str) {})
        
        return res.status(200).send({
            leftSideData: leftSideData,
            rightSideData: rightSideData,
            imageModalData: imageModalData,
            attachmentModalData: attachmentModalData,
        });
        
    } catch (error) {
        return res.status(500).send(error);
    }
}

let readMore = async (req, res) => {
    try {
        //get skip number from query param
        let skipMessage = +(req.query.skipMessage);
        let targetId = req.query.targetId;
        let chatInGroup = (req.query.chatInGroup === "true");

        //get more item
        let newMessages = await message.readMore(req.user._id, skipMessage, targetId, chatInGroup);
        
        let dataToRender = {
            newMessages: newMessages,
            bufferToBase64: bufferToBase64,
            user: req.user,
        };

        let rightSideData = await renderFile("src/views/main/readMoreMessages/_rightSide.ejs", dataToRender);
        let imageModalData = await renderFile("src/views/main/readMoreMessages/_imageModal.ejs", dataToRender);
        let attachmentModalData = await renderFile("src/views/main/readMoreMessages/_attachmentModal.ejs", dataToRender);
        // ejs.renderFile("src/views/main/readMoreMessages/_leftSide.ejs", dataToRender, {}, function (err, str) {})
        
        return res.status(200).send({
            rightSideData: rightSideData,
            imageModalData: imageModalData,
            attachmentModalData: attachmentModalData,
        });
        
    } catch (error) {
        return res.status(500).send(error);
    }
}

module.exports = {
    addNewTextEmoji: addNewTextEmoji,
    addNewImage: addNewImage,
    addNewAttachment: addNewAttachment,
    readMoreAllChat: readMoreAllChat,
    readMore: readMore,
}