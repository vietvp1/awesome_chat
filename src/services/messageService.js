import ContactModel from "../models/contactModel"
import UserModel from "../models/userModel"
import ChatGroupModel from "../models/chatGroupModel"
import MessageModel from "../models/messageModel"
import {transErrors} from "../../lang/vi"
import {app} from "../../config/app"
import _ from "lodash"
import fsExtra from "fs-extra"

const LIMIT_CONVERSATIONS_TAKEN = 25;
const LIMIT_MESSAGES_TAKEN = 30;
const LIMIT_MEMBERS_TAKEN = 19;


let getAllConversationItems = (currentUserId) => {
    return new Promise( async (resolve, reject) =>  {
        try {
            let contacts = await ContactModel.getContacts(currentUserId, LIMIT_CONVERSATIONS_TAKEN);
            let userConversationPromise = contacts.map(async (contact) => {
                if (contact.contactId == currentUserId) {
                    let getUserContact = await UserModel.getNormalUserDataById(contact.userId);
                    getUserContact.updateAt = contact.updateAt;
                    return getUserContact;
                }else{
                    let getUserContact = await UserModel.getNormalUserDataById(contact.contactId);
                    getUserContact.updateAt = contact.updateAt;
                    return getUserContact;
                }
            });
            let userConversations = await Promise.all(userConversationPromise); // ***
            let groupConversations = await ChatGroupModel.getChatGroups(currentUserId, LIMIT_CONVERSATIONS_TAKEN); // ***
            let allConversations = userConversations.concat(groupConversations);
            allConversations = _.sortBy(allConversations, (item) => {
                return -item.updateAt
            })
            
            let allConversationsToRender = []; // ***
            let lengthToGet = allConversations.length < LIMIT_CONVERSATIONS_TAKEN ? allConversations.length : LIMIT_CONVERSATIONS_TAKEN;
            if (allConversations.length) {
                for (let index = 0; index < lengthToGet; index++) {
                    allConversationsToRender.push(allConversations[index]);
                }
            }
            
            // get messages of all chat to apply in screen chat
            let allConversationWithMessagesPromise = allConversationsToRender.map( async(conversation) => {
                // conversation = conversation.toObject();
                if (conversation.members) {
                    let getMessages = await MessageModel.model.getMessagesInGroup(conversation._id, LIMIT_MESSAGES_TAKEN);
                    conversation.messages = _.reverse(getMessages);

                    // lấy data info  để render ra client danh sách thành viên nhóm/////////////////////
                    conversation.membersInfo = [];
                    let memberIds = [];
                    for(let member of conversation.members){
                        if (member.userId == currentUserId) {
                            let myInfo = await UserModel.getNormalUserDataById(currentUserId);
                            conversation.membersInfo.push(myInfo);
                        }else{
                            memberIds.push(member.userId)
                        }
                    };
                    //lấy userInfo của các thành viên khác
                    let usersInfo = await UserModel.getNormalUsersDataByIdsAndLimit(memberIds, LIMIT_MEMBERS_TAKEN);
                    for(let member of usersInfo){
                        conversation.membersInfo.push(member);
                    }
                    ////////////////////////////////////////////////////////

                } else {
                    let getMessages = await MessageModel.model.getMessagesInPersonal(currentUserId, conversation._id, LIMIT_MESSAGES_TAKEN);
                    conversation.messages = _.reverse(getMessages);
                }
                return conversation;
            })
            let allConversationWithMessages = await Promise.all(allConversationWithMessagesPromise);
            allConversationWithMessages = _.sortBy(allConversationWithMessages, (item) => {
                return -item.updateAt
            })

            // get messages of user chat to apply in screen chat
            // let userConversationWithMessagesPromise = userConversations.map( async(conversation) => {
            //     let getMessages = await MessageModel.model.getMessagesInPersonal(currentUserId, conversation._id, LIMIT_MESSAGES_TAKEN);
            //     conversation.messages = _.reverse(getMessages);
            //     return conversation;
            // })
            // let userConversationWithMessages = await Promise.all(userConversationWithMessagesPromise);
            // userConversationWithMessages = _.sortBy(userConversationWithMessages, (item) => {
            //     return -item.updateAt
            // })
            
            // // get messages of group chat to apply in screen chat
            // let groupConversationWithMessagesPromise = groupConversations.map( async(conversation) => {
            //     let getMessages = await MessageModel.model.getMessagesInGroup(conversation._id, LIMIT_MESSAGES_TAKEN);
            //     conversation.messages = _.reverse(getMessages);
                
            //     // lấy data info  để render ra client danh sách thành viên nhóm/////////////////////
            //     conversation.membersInfo = [];
            //     let memberIds = [];
            //     for(let member of conversation.members){
            //         if (member.userId == currentUserId) {
            //             let myInfo = await UserModel.getNormalUserDataById(currentUserId);
            //             conversation.membersInfo.push(myInfo);
            //         }else{
            //             memberIds.push(member.userId)
            //         }
            //     };
            //     //lấy userInfo của các thành viên khác
            //     let usersInfo = await UserModel.getNormalUsersDataByIdsAndLimit(memberIds, LIMIT_MEMBERS_TAKEN);
            //     for(let member of usersInfo){
            //         conversation.membersInfo.push(member);
            //     }
            //     ////////////////////////////////////////////////////////
            //     return conversation;
            // })
            // let groupConversationWithMessages = await Promise.all(groupConversationWithMessagesPromise);
            // groupConversationWithMessages = _.sortBy(groupConversationWithMessages, (item) => {
            //     return -item.updateAt
            // })
            
            resolve({
                allConversationWithMessages: allConversationWithMessages,
                // userConversationWithMessages: userConversationWithMessages,
                // groupConversationWithMessages: groupConversationWithMessages
            });
        } catch (error) {
            return reject(error);
        }
    })
}

let addNewTextEmoji = (sender, receivedId, messageVal, isChatGroup) => {
    return new Promise( async (resolve, reject) => {
        try {
            if (isChatGroup) {
                let getChatGroupReceiver = await ChatGroupModel.getChatGroupById(receivedId);
                if (!getChatGroupReceiver) {
                    return reject(transErrors.conversation_not_found);
                }
                let receiver = {
                    id: getChatGroupReceiver._id,// = receivedId
                    name: getChatGroupReceiver.name,
                    avatar: app.general_avatar_group_chat,
                };

                let newMessageItem = {
                    senderId: sender.id,
                    receiverId: receivedId,
                    conversationType: MessageModel.conversationTypes.GROUP,
                    messageType: MessageModel.messageTypes.TEXT,
                    sender: sender,
                    receiver: receiver,
                    text: messageVal,
                    createAt: Date.now(),
                };
                //create new message
                let newMessage = await MessageModel.model.create(newMessageItem);
                //update group chat
                await ChatGroupModel.updateWhenHasNewMessage(receivedId, getChatGroupReceiver.messageAmount + 1);
               
                resolve(newMessage);

            } else {
                let getUserReceiver = await UserModel.getNormalUserDataById(receivedId);
                if (!getUserReceiver) {
                    return reject(transErrors.conversation_not_found);
                }

                let receiver = {
                    id: getUserReceiver._id,// = receivedId
                    name: getUserReceiver.username,
                    avatar: getUserReceiver.avatar,
                };

                let newMessageItem = {
                    senderId: sender.id,
                    receiverId: receivedId,
                    conversationType: MessageModel.conversationTypes.PERSONAL,
                    messageType: MessageModel.messageTypes.TEXT,
                    sender: sender,
                    receiver: receiver,
                    text: messageVal,
                    createAt: Date.now(),
                };
                //create new message
                let newMessage = await MessageModel.model.create(newMessageItem);
                //update contact
                await ContactModel.updateWhenHasNewMessage(sender.id, getUserReceiver._id);
                resolve(newMessage);
            }
        } catch (error) {
            reject(error);
        }
    })
}

let addNewImage = (sender, receivedId, messageVal, isChatGroup) => {
    return new Promise( async (resolve, reject) => {
        try {
            if (isChatGroup) {
                let getChatGroupReceiver = await ChatGroupModel.getChatGroupById(receivedId);
                if (!getChatGroupReceiver) {
                    return reject(transErrors.conversation_not_found);
                }
                let receiver = {
                    id: getChatGroupReceiver._id,// = receivedId
                    name: getChatGroupReceiver.name,
                    avatar: app.general_avatar_group_chat,
                };

                let imageBuffer = await fsExtra.readFile(messageVal.path);
                let imageContentType = messageVal.mimetype;
                let imageName = messageVal.originalname;

                let newMessageItem = {
                    senderId: sender.id,
                    receiverId: receivedId,
                    conversationType: MessageModel.conversationTypes.GROUP,
                    messageType: MessageModel.messageTypes.IMAGE,
                    sender: sender,
                    receiver: receiver,
                    file: {data: imageBuffer, contentType: imageContentType, fileName: imageName},
                    createAt: Date.now(),
                };
                //create new message
                let newMessage = await MessageModel.model.create(newMessageItem);
                //update group chat
                await ChatGroupModel.updateWhenHasNewMessage(receivedId, getChatGroupReceiver.messageAmount + 1);
               
                resolve(newMessage);

            } else {
                let getUserReceiver = await UserModel.getNormalUserDataById(receivedId);
                if (!getUserReceiver) {
                    return reject(transErrors.conversation_not_found);
                }

                let receiver = {
                    id: getUserReceiver._id,// = receivedId
                    name: getUserReceiver.username,
                    avatar: getUserReceiver.avatar,
                };

                let imageBuffer = await fsExtra.readFile(messageVal.path);
                let imageContentType = messageVal.mimetype;
                let imageName = messageVal.originalname;

                let newMessageItem = {
                    senderId: sender.id,
                    receiverId: receivedId,
                    conversationType: MessageModel.conversationTypes.PERSONAL,
                    messageType: MessageModel.messageTypes.IMAGE,
                    sender: sender,
                    receiver: receiver,
                    file: {data: imageBuffer, contentType: imageContentType, fileName: imageName},
                    createAt: Date.now(),
                };
                //create new message
                let newMessage = await MessageModel.model.create(newMessageItem);
                //update contact
                await ContactModel.updateWhenHasNewMessage(sender.id, getUserReceiver._id);
                resolve(newMessage);
            }
        } catch (error) {
            reject(error);
        }
    })
}

let addNewAttachment = (sender, receivedId, messageVal, isChatGroup) => {
    return new Promise( async (resolve, reject) => {
        try {
            if (isChatGroup) {
                let getChatGroupReceiver = await ChatGroupModel.getChatGroupById(receivedId);
                if (!getChatGroupReceiver) {
                    return reject(transErrors.conversation_not_found);
                }
                let receiver = {
                    id: getChatGroupReceiver._id,// = receivedId
                    name: getChatGroupReceiver.name,
                    avatar: app.general_avatar_group_chat,
                };

                let attachmentBuffer = await fsExtra.readFile(messageVal.path);
                let attachmentContentType = messageVal.mimetype;
                let attachmentName = messageVal.originalname;

                let newMessageItem = {
                    senderId: sender.id,
                    receiverId: receivedId,
                    conversationType: MessageModel.conversationTypes.GROUP,
                    messageType: MessageModel.messageTypes.FILE,
                    sender: sender,
                    receiver: receiver,
                    file: {data: attachmentBuffer, contentType: attachmentContentType, fileName: attachmentName},
                    createAt: Date.now(),
                };
                //create new message
                let newMessage = await MessageModel.model.create(newMessageItem);
                //update group chat
                await ChatGroupModel.updateWhenHasNewMessage(receivedId, getChatGroupReceiver.messageAmount + 1);
               
                resolve(newMessage);

            } else {
                let getUserReceiver = await UserModel.getNormalUserDataById(receivedId);
                if (!getUserReceiver) {
                    return reject(transErrors.conversation_not_found);
                }

                let receiver = {
                    id: getUserReceiver._id,// = receivedId
                    name: getUserReceiver.username,
                    avatar: getUserReceiver.avatar,
                };

                let attachmentBuffer = await fsExtra.readFile(messageVal.path);
                let attachmentContentType = messageVal.mimetype;
                let attachmentName = messageVal.originalname;

                let newMessageItem = {
                    senderId: sender.id,
                    receiverId: receivedId,
                    conversationType: MessageModel.conversationTypes.PERSONAL,
                    messageType: MessageModel.messageTypes.FILE,
                    sender: sender,
                    receiver: receiver,
                    file: {data: attachmentBuffer, contentType: attachmentContentType, fileName: attachmentName},
                    createAt: Date.now(),
                };
                //create new message
                let newMessage = await MessageModel.model.create(newMessageItem);
                //update contact
                await ContactModel.updateWhenHasNewMessage(sender.id, getUserReceiver._id);
                resolve(newMessage);
            }
        } catch (error) {
            reject(error);
        }
    })
}

let readMoreAllChat = (currentUserId, skipPersonal, skipGroup) => {
    return new Promise( async (resolve, reject) =>  {
        try {
            let contacts = await ContactModel.readMoreContacts(currentUserId, skipPersonal, LIMIT_CONVERSATIONS_TAKEN);
            
            let userConversationPromise = contacts.map(async (contact) => {
                if (contact.contactId == currentUserId) {
                    let getUserContact = await UserModel.getNormalUserDataById(contact.userId);
                    getUserContact.updateAt = contact.updateAt;
                    return getUserContact;
                }else{
                    let getUserContact = await UserModel.getNormalUserDataById(contact.contactId);
                    getUserContact.updateAt = contact.updateAt;
                    return getUserContact;
                }
            });
            let userConversations = await Promise.all(userConversationPromise);
            
            let groupConversations = await ChatGroupModel.readMoreChatGroups(currentUserId, skipGroup, LIMIT_CONVERSATIONS_TAKEN);
            let allConversations = userConversations.concat(groupConversations);

            allConversations = _.sortBy(allConversations, (item) => {
                return -item.updateAt
            })

            let allConversationsToRender = [];
            let lengthToGet = allConversations.length < LIMIT_CONVERSATIONS_TAKEN ? allConversations.length : LIMIT_CONVERSATIONS_TAKEN;
            if (allConversations.length) {
                for (let index = 0; index < lengthToGet; index++) {
                    allConversationsToRender.push(allConversations[index]);
                }
            }
            //console.log(allConversationsToRender); nếu k có if(allConversations.length) thì allConversationsToRender bị undedine chws k  phải []
            
            // get messages to apply in screen chat
            let allConversationWithMessagesPromise = allConversationsToRender.map( async(conversation) => {
                // conversation = conversation.toObject();
                if (conversation.members) {
                    let getMessages = await MessageModel.model.getMessagesInGroup(conversation._id, LIMIT_MESSAGES_TAKEN);
                    conversation.messages = _.reverse(getMessages);

                    // lấy data info  để render ra client danh sách thành viên nhóm/////////////////////
                    conversation.membersInfo = [];
                    let memberIds = [];
                    for(let member of conversation.members){
                        if (member.userId == currentUserId) {
                            let myInfo = await UserModel.getNormalUserDataById(currentUserId);
                            conversation.membersInfo.push(myInfo);
                        }else{
                            memberIds.push(member.userId)
                        }
                    };
                    //lấy userInfo của các thành viên khác
                    let usersInfo = await UserModel.getNormalUsersDataByIdsAndLimit(memberIds, LIMIT_MEMBERS_TAKEN);
                    for(let member of usersInfo){
                        conversation.membersInfo.push(member);
                    }
                    ////////////////////////////////////////////////////////
                } else {
                    let getMessages = await MessageModel.model.getMessagesInPersonal(currentUserId, conversation._id, LIMIT_MESSAGES_TAKEN);
                    conversation.messages = _.reverse(getMessages);
                }
                return conversation;
            })

            let allConversationWithMessages = await Promise.all(allConversationWithMessagesPromise);
            allConversationWithMessages = _.sortBy(allConversationWithMessages, (item) => {
                return -item.updateAt
            })

            resolve(allConversationWithMessages);
        } catch (error) {
            return reject(error);
        }
    })
}

let readMorePersonalChat = (currentUserId, skipPersonal) => {
    return new Promise( async (resolve, reject) =>  {
        try {
            let contacts = await ContactModel.readMoreContacts(currentUserId, skipPersonal, 1);
            
            let userConversationPromise = contacts.map(async (contact) => {
                if (contact.contactId == currentUserId) {
                    let getUserContact = await UserModel.getNormalUserDataById(contact.userId);
                    getUserContact.updateAt = contact.updateAt;
                    return getUserContact;
                }else{
                    let getUserContact = await UserModel.getNormalUserDataById(contact.contactId);
                    getUserContact.updateAt = contact.updateAt;
                    return getUserContact;
                }
            });
            let userConversations = await Promise.all(userConversationPromise);

            userConversations = _.sortBy(userConversations, (item) => {
                return -item.updateAt
            })
            
            // get messages to apply in screen chat
            let userConversationWithMessagesPromise = userConversations.map( async(conversation) => {
                // conversation = conversation.toObject();
                let getMessages = await MessageModel.model.getMessagesInPersonal(currentUserId, conversation._id, LIMIT_MESSAGES_TAKEN);
                conversation.messages = _.reverse(getMessages);
                return conversation;
            })
            let userConversationWithMessages = await Promise.all(userConversationWithMessagesPromise);
            
            userConversationWithMessages = _.sortBy(userConversationWithMessages, (item) => {
                return -item.updateAt
            })
            
            resolve(userConversationWithMessages);
        } catch (error) {
            return reject(error);
        }
    })
}

let readMoreGroupChat = (currentUserId, skipGroup) => {
    return new Promise( async (resolve, reject) =>  {
        try {
            let groupConversations = await ChatGroupModel.readMoreChatGroups(currentUserId, skipGroup, LIMIT_CONVERSATIONS_TAKEN);
        
            let groupConversationWithMessagesPromise = groupConversations.map( async(conversation) => {
                let getMessages = await MessageModel.model.getMessagesInGroup(conversation._id, LIMIT_MESSAGES_TAKEN);
                conversation.messages = _.reverse(getMessages);

                // lấy data info  để render ra client danh sách thành viên nhóm/////////////////////
                conversation.membersInfo = [];
                let memberIds = [];
                for(let member of conversation.members){
                    if (member.userId == currentUserId) {
                        let myInfo = await UserModel.getNormalUserDataById(currentUserId);
                        conversation.membersInfo.push(myInfo);
                    }else{
                        memberIds.push(member.userId)
                    }
                };
                //lấy userInfo của các thành viên khác
                let usersInfo = await UserModel.getNormalUsersDataByIdsAndLimit(memberIds, LIMIT_MEMBERS_TAKEN);
                for(let member of usersInfo){
                    conversation.membersInfo.push(member);
                }
                ////////////////////////////////////////////////////////
                return conversation;
            })
            let groupConversationWithMessages = await Promise.all(groupConversationWithMessagesPromise);
            
            groupConversationWithMessages = _.sortBy(groupConversationWithMessages, (item) => {
                return -item.updateAt
            })

            resolve(groupConversationWithMessages);
        } catch (error) {
            return reject(error);
        }
    })
}

let readMore = (currentUserId, skipMessage, targetId, chatInGroup) => {
    return new Promise( async (resolve, reject) =>  {
        try {
            //message in group
            if (chatInGroup) {
                let getMessages = await MessageModel.model.readMoreMessagesInGroup(targetId, skipMessage, LIMIT_MESSAGES_TAKEN);
                
                getMessages = _.reverse(getMessages);

                return resolve(getMessages);
            } 
            //message in personal
            let getMessages = await MessageModel.model.readMoreMessagesInPersonal(currentUserId, targetId, skipMessage, LIMIT_MESSAGES_TAKEN);
            getMessages = _.reverse(getMessages);
            return resolve(getMessages);

        } catch (error) {
            return reject(error);
        }
    })
}

let findConversations = (currentUserId, keyword) => {
    return new Promise( async (resolve, reject) =>  {
        try {
            let deprecatedUserIds = [];
            let contactsByUser = await ContactModel.find({
                $and: [
                    {$or: [
                        {"userId": currentUserId},
                        {"contactId": currentUserId}
                    ]},
                    {"status": true}
                ]
            });
            
            contactsByUser.forEach((contact) => {
                deprecatedUserIds.push(contact.userId);
                deprecatedUserIds.push(contact.contactId)
            });
            deprecatedUserIds = _.uniqBy(deprecatedUserIds);
            deprecatedUserIds = deprecatedUserIds.filter(userId => userId != currentUserId)

            let users = await UserModel.getNormalUserDataByIdAndKeyword(deprecatedUserIds,keyword)
            
            let groupConversations = await ChatGroupModel.getChatGroupsByKeyword(currentUserId, keyword ,LIMIT_CONVERSATIONS_TAKEN);
            
            let conversations = users.concat(groupConversations);

            //console.log(conversations);
            resolve(conversations);
        } catch (error) {
            return reject(error);
        }
    })
}

module.exports = {
    getAllConversationItems: getAllConversationItems,
    addNewTextEmoji: addNewTextEmoji,
    addNewImage: addNewImage,
    addNewAttachment: addNewAttachment,
    readMoreAllChat: readMoreAllChat,
    readMorePersonalChat: readMorePersonalChat,
    readMoreGroupChat: readMoreGroupChat,
    readMore: readMore,
    findConversations: findConversations,
}