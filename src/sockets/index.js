import addNewContact from "./contact/addNewContact"
import removeRequestContact from "./contact/removeRequestContact"
import removeRequestContactReceived from "./contact/removeRequestContactReceived"
import approveRequestContactReceived from "./contact/approveRequestContactReceived"
import removeContact from "./contact/removeContact"
import chatTextEmoji from "./chat/chatTextEmoji"
import chatImage from "./chat/chatImage"
import chatAttachment from "./chat/chatAttachment"
import chatVideo from "./chat/chatVideo"
import typingOn from "./chat/typingOn"
import typingOff from "./chat/typingOff"
import userOnlineOffline from "./status/userOnlineOffline"
import newGroupChat from "./group/newGroupChat"
import newMemberAdded from "./group/newMemberAdded"



let initSockets = (io) => {
    addNewContact(io);
    removeRequestContact(io);
    removeRequestContactReceived(io);
    approveRequestContactReceived(io);
    removeContact(io);
    chatTextEmoji(io);
    chatImage(io);
    chatAttachment(io);
    chatVideo(io);
    typingOn(io);
    typingOff(io);
    userOnlineOffline(io);
    newGroupChat(io);
    newMemberAdded(io);
}

module.exports = initSockets