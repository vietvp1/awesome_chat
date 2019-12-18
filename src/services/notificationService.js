const NotificationModel = require('../models/notificationModel')
const UserModel = require('../models/userModel')

const LIMIT = 8;

let getNotifications = (currentUserId) => {
    return new Promise( async (resolve, reject) => {
        try {
            let notifications = await NotificationModel.model.find({
                "receiverId": currentUserId,
            }).sort({"createAt": -1}).limit(LIMIT);

            // lấy user từ senderId trong notification
            let getNotifiContents = notifications.map(async (notification) => {
                 let sender = await UserModel.getNormalUserDataById(notification.senderId);
                return NotificationModel.contents.getContent(notification.type, notification.isRead, sender._id, sender.username, sender.avatar);

            })
            
            resolve(await Promise.all(getNotifiContents));
            

        } catch (error) {
            reject(error);
        }
    })
}

// count all notification unread
let countNotifUnread = (currentUserId) => {
    return new Promise( async (resolve, reject) => {
        try {
            let notificationsUnread = await NotificationModel.model.countDocuments({
                $and: [
                    {"receiverId": currentUserId},
                    {"isRead": false},
                ]
            });
            resolve(notificationsUnread);
            
        } catch (error) {
            reject(error);
        }
    })
}

let readMore = (currentUserId, skipNumberNotification) => {
    return new Promise( async (resolve, reject) => {
        try {
            let newNotifications = await NotificationModel.model.find({
                "receiverId": currentUserId,
            }).sort({"createAt": -1}).skip(skipNumberNotification).limit(LIMIT);
            
            let getNotifiContents = newNotifications.map(async (notification) => {
                let sender = await UserModel.getNormalUserDataById(notification.senderId);
               return NotificationModel.contents.getContent(notification.type, notification.isRead, sender._id, sender.username, sender.avatar);

            })
            
            resolve(await Promise.all(getNotifiContents));
            
        } catch (error) {
            reject(error);
        }
    })
}

let markAllAsRead = (currentUserId, targetUsers) => {
    return new Promise( async (resolve, reject) => {
        try {
            await NotificationModel.model.updateMany(
                {
                    $and: [
                        {"receiverId": currentUserId},
                        {"senderId": {$in: targetUsers} }
                    ]
                }, {"isRead": true})

            resolve(true);         
        } catch (error) {
            console.log(`Error when mark notification as read: ${error}`);
            reject(false);
        }
    })
}

module.exports = {
    getNotifications: getNotifications,
    countNotifUnread: countNotifUnread,
    readMore: readMore,
    markAllAsRead: markAllAsRead,
}

