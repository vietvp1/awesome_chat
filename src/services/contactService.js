const ContactModel = require('../models/contactModel')
const UserModel = require('../models/userModel')
const NotificationModel = require('../models/notificationModel')
import _ from "lodash";
const LIMIT = 15;

let findUsersContact = (currentUserId, keyword) => {
    return new Promise( async (resolve, reject) => {
        let deprecatedUserIds = [currentUserId];
        let contactsByUser = await ContactModel.find({
            $or: [
                {"userId": currentUserId},
                {"contactId": currentUserId}
            ]
        });
        contactsByUser.forEach((contact) => {
            deprecatedUserIds.push(contact.userId);
            deprecatedUserIds.push(contact.contactId)
        });
        deprecatedUserIds = _.uniqBy(deprecatedUserIds);

        // find all users để kết bạn
        let users = await UserModel.find({
            $and: [
                {"_id": {$nin: deprecatedUserIds}},
                {"local.isActive": true},
                {$or: [
                    {"username": {"$regex": new RegExp(keyword, "i")}},
                    {"local.email": {"$regex": new RegExp(keyword, "i")}},
                    {"facebook.email": {"$regex": new RegExp(keyword, "i")}},
                    {"google.email": {"$regex": new RegExp(keyword, "i")}}
                ]}
            ]
        }, {_id: 1, username: 1, address: 1, avatar: 1});
        
        resolve(users);
    })
    
}

let addNew = (currentUserId, contactId) => {
    return new Promise( async (resolve, reject) => {
        let contactExists = await ContactModel.findOne({
            $or: [
                {$and: [
                    {"userId": currentUserId},
                    {"contactId": contactId}
                ]},
                {$and: [
                    {"userId": contactId},
                    {"contactId": currentUserId}
                ]},
            ]
        });
        if (contactExists) {
            return reject(false);
        }

        // create contact
        let newContactItem = {
            userId: currentUserId,
            contactId: contactId
        };
        let newContact = await ContactModel.create(newContactItem);
        
        //create notification
        let notificationItem = {
            senderId: currentUserId ,
            receiverId: contactId,
            type: NotificationModel.types.ADD_CONTACT,
        };
        await NotificationModel.model.create(notificationItem);
        
        resolve(newContact);

    })
    
}

let removeContact = (currentUserId, contactId) => {
    return new Promise( async (resolve, reject) => {
        let removeContact = await ContactModel.deleteOne({
            $or: [
                {$and: [
                    {"userId": currentUserId},
                    {"contactId": contactId},
                    {"status": true},
                ]},
                {$and: [
                    {"userId": contactId},
                    {"contactId": currentUserId},
                    {"status": true},
                ]},
            ]
        });
        
        if (removeContact.n === 0) {
            return reject(false);
        }

        resolve(true);
    })
    
}

let removeRequestContact = (currentUserId, contactId) => {
    return new Promise( async (resolve, reject) => {
        let removeReq = await ContactModel.deleteOne({
            $and: [
                {"userId": currentUserId},
                {"contactId": contactId},
                {"status": false},
            ]
        });
        
        if (removeReq.n === 0) {
            return reject(false);
        }

        //remove notification
        await NotificationModel.model.deleteOne({
            $and: [
                {"senderId": currentUserId},
                {"receiverId": contactId},
                {"type": NotificationModel.types.ADD_CONTACT},
            ]
        });

        resolve(true);
    })
}

let removeRequestContactReceived = (currentUserId, contactId) => {
    return new Promise( async (resolve, reject) => {
        let removeReq = await ContactModel.deleteOne({
            $and: [
                {"contactId": currentUserId},
                {"userId": contactId},
                {"status": false},
            ]
        });
        
        if (removeReq.n === 0) {
            return reject(false);
        }

        //remove notification ( không xóa thông báo người khác gửi yêu cầu kết bạn đến cho mình)
        // await NotificationModel.model.deleteOne({
        //     $and: [
        //         {"senderId": currentUserId},
        //         {"receiverId": contactId},
        //         {"type": NotificationModel.types.ADD_CONTACT},
        //     ]
        // });

        resolve(true);
    })
}

let approveRequestContactReceived = (currentUserId, contactId) => {
    return new Promise( async (resolve, reject) => {
        let approveReq = await ContactModel.updateOne({
            $and: [
                {"contactId": currentUserId},
                {"userId": contactId},
                {"status": false},
            ]
        }, {
            "status": true,
            "updateAt": Date.now(),
        });
        //console.log(approveReq);
        
        if (approveReq.nModified === 0) {
            return reject(false);
        }

        //create notification đã chấp nhập kết bạn trong db
        let notificationItem = {
            senderId: currentUserId ,
            receiverId: contactId,
            type: NotificationModel.types.APPROVE_CONTACT,
        };
        await NotificationModel.model.create(notificationItem);

        resolve(true);
    })
}

let getContacts = (currentUserId) => {
    return new Promise( async (resolve, reject) => {
        try {
            let contacts = await ContactModel.getContacts(currentUserId, LIMIT);
            let users = contacts.map(async (contact) => {
                if (contact.contactId == currentUserId) {
                    return await UserModel.getNormalUserDataById(contact.userId);
                }else{
                    return await UserModel.getNormalUserDataById(contact.contactId);
                }
            })
            
            resolve(await Promise.all(users));
            
        } catch (error) {
            reject(error);
        }
    })
}

let getContactsSent = (currentUserId) => {
    return new Promise( async (resolve, reject) => {
        try {
            let contacts = await ContactModel.find({
                $and: [   
                    {"userId": currentUserId},
                    {"status": false}
                ]
            }).sort({"createAt": -1}).limit(LIMIT);
            let users = contacts.map(async (contact) => {
                return await UserModel.getNormalUserDataById(contact.contactId);
            })
            
            resolve(await Promise.all(users));
            
        } catch (error) {
            reject(error);
        }
    })
}

let getContactsReceived = (currentUserId) => {
    return new Promise( async (resolve, reject) => {
        try {
            let contacts = await ContactModel.find({
                $and: [   
                    {"contactId": currentUserId },
                    {"status": false}
                ]
            }).sort({"createAt": -1}).limit(LIMIT);
            let users = contacts.map(async (contact) => {
                return await UserModel.getNormalUserDataById(contact.userId);
            })
            
            resolve(await Promise.all(users));
            
        } catch (error) {
            reject(error);
        }
    })
}

let countAllContacts = (currentUserId) => {
    return new Promise( async (resolve, reject) => {
        try {
            let count = await ContactModel.countDocuments({
                $and: [   
                    {$or: [
                        {"userId": currentUserId},
                        {"contactId": currentUserId}
                    ]},
                    {"status": true}
                ]
            });
            resolve(count);
        } catch (error) {
            reject(error);
        }
    })
}

let countAllContactsSent = (currentUserId) => {
    return new Promise( async (resolve, reject) => {
        try {
            let count =  await ContactModel.countDocuments({
                $and: [   
                    {"userId": currentUserId},
                    {"status": false}
                ]
            });
            resolve(count);
        } catch (error) {
            reject(error);
        }
    })
}

let countAllContactsReceived = (currentUserId) => {
    return new Promise( async (resolve, reject) => {
        try {
            let count = await ContactModel.countDocuments({
                $and: [   
                    {"contactId": currentUserId },
                    {"status": false}
                ]
            });
            resolve(count);
        } catch (error) {
            reject(error);
        }
    })
}

let readMoreContacts = (currentUserId, skipNumberContacts) => {
    return new Promise( async (resolve, reject) => {
        try {
            let newContacts = await ContactModel.readMoreContacts(currentUserId, skipNumberContacts, LIMIT);
            
            let users = newContacts.map(async (contact) => {
                if (contact.contactId == currentUserId) {
                    return await UserModel.getNormalUserDataById(contact.userId);
                }else{
                    return await UserModel.getNormalUserDataById(contact.contactId);
                }
            })
            
            resolve(await Promise.all(users));
            
        } catch (error) {
            reject(error);
        }
    })
}

let readMoreContactsSent = (currentUserId, skipNumberContacts) => {
    return new Promise( async (resolve, reject) => {
        try {
            let newContacts = await ContactModel.find({
                $and: [   
                    {"userId": currentUserId},
                    {"status": false}
                ]
            }).sort({"createAt": -1}).skip(skipNumberContacts).limit(LIMIT);
            
            let users = newContacts.map(async (contact) => {
                return await UserModel.getNormalUserDataById(contact.contactId);
            })
            
            resolve(await Promise.all(users));
            
        } catch (error) {
            reject(error);
        }
    })
}

let readMoreContactsReceived = (currentUserId, skipNumberContacts) => {
    return new Promise( async (resolve, reject) => {
        try {
            let newContacts = await ContactModel.find({
                $and: [   
                    {"contactId": currentUserId },
                    {"status": false}
                ]
            }).sort({"createAt": -1}).skip(skipNumberContacts).limit(LIMIT);
            
            let users = newContacts.map(async (contact) => {
                return await UserModel.getNormalUserDataById(contact.userId);
            })
            
            resolve(await Promise.all(users));
            
        } catch (error) {
            reject(error);
        }
    })
}

let searchFriends = (currentUserId, keyword) => {
    return new Promise( async (resolve, reject) => {
        let friendIds = [];
        let friends = await ContactModel.getFriends(currentUserId);

        friends.forEach((item) => {
            friendIds.push(item.userId);
            friendIds.push(item.contactId)
        });

        friendIds = _.uniqBy(friendIds);
        friendIds = friendIds.filter(userId => userId != currentUserId)

        let users = await UserModel.findAllToAddGroupChat(friendIds, keyword);
        resolve(users);
    })
    
}
module.exports = {
    findUsersContact: findUsersContact,
    addNew: addNew,
    removeContact: removeContact,
    removeRequestContact: removeRequestContact,
    removeRequestContactReceived: removeRequestContactReceived,
    approveRequestContactReceived: approveRequestContactReceived,
    getContacts: getContacts,
    getContactsSent: getContactsSent,
    getContactsReceived: getContactsReceived,
    countAllContacts: countAllContacts,
    countAllContactsSent: countAllContactsSent,
    countAllContactsReceived: countAllContactsReceived,
    readMoreContacts: readMoreContacts,
    readMoreContactsSent: readMoreContactsSent,
    readMoreContactsReceived: readMoreContactsReceived,
    searchFriends: searchFriends,
}