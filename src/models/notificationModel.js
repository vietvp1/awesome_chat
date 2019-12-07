const mongoose = require('mongoose')
let Schema = mongoose.Schema;

let NotificationeSchema = new Schema({
    senderId: String ,
    receiverId: String,
    type: String,
    isRead: {type: Boolean, default: false},
    createAt: {type: Number, default: Date.now},
})

const NOTIFICATION_TYPES = {
    ADD_CONTACT: "add_contact",
    APPROVE_CONTACT: "approve_contact",
}

const NOTIFICATION_CONTENTS = {
    getContent: (notificationType, isRead, userId, username, userAvatar) => {
        if (notificationType === NOTIFICATION_TYPES.ADD_CONTACT) {
            if (!isRead) {
                return `<div class="notif-readed-false" data-uid="${ userId}">
                        <img class="avatar-small" src="images/users/${userAvatar}" alt=""> 
                        <strong>${username}</strong> đã gửi cho bạn một lời mời kết bạn.
                    </div>`;
            }
            return `<div data-uid="${ userId}">
                        <img class="avatar-small" src="images/users/${userAvatar}" alt=""> 
                        <strong>${username}</strong> đã gửi cho bạn một lời mời kết bạn.
                    </div>`;
        }

        if (notificationType === NOTIFICATION_TYPES.APPROVE_CONTACT) {
            if (!isRead) {
                return `<div class="notif-readed-false" data-uid="${ userId}">
                        <img class="avatar-small" src="images/users/${userAvatar}" alt=""> 
                        <strong>${username}</strong> đã chấp nhận lời mời kết bạn của bạn.
                    </div>`;
            }
            return `<div data-uid="${ userId}">
                        <img class="avatar-small" src="images/users/${userAvatar}" alt=""> 
                        <strong>${username}</strong> đã chấp nhận lời mời kết bạn của bạn.
                    </div>`;
        }

        return "No matching with any notification type.";
    },
}

module.exports = {
    model: mongoose.model('notification', NotificationeSchema),
    types: NOTIFICATION_TYPES,
    contents: NOTIFICATION_CONTENTS,
}