import {pushSocketIdToArray, emitNotifyToArray, removeSocketIdToArray} from "../../helpers/socketHelper"

let typingOff = (io) => {
    let clients = {};
    io.on("connection", (socket) => {
        let currentUserId = socket.request.user._id;
        clients = pushSocketIdToArray(clients, currentUserId, socket.id);
        socket.request.user.chatGroupIds.forEach(group => {
            clients = pushSocketIdToArray(clients, group._id, socket.id);
        });

        //when has new group chat
        socket.on("new-group-created" , (data) => {
            clients = pushSocketIdToArray(clients, data.groupChat._id, socket.id);
        });
        socket.on("member-received-group-chat", (data) => {
            clients = pushSocketIdToArray(clients, data.groupChatId, socket.id);
        });

        socket.on("user-is-not-typing" , (data) => {
            if (data.groupId) {
                let response = {
                    currentGroupId: data.groupId,
                    currentUserId: currentUserId,
                }
                if (clients[data.groupId]) {
                    emitNotifyToArray(clients, data.groupId, io, "response-user-is-not-typing", response); 
                }
            }
            if (data.contactId) {
                let response = {
                    currentUserId: currentUserId,
                }
                if (clients[data.contactId]) {
                    emitNotifyToArray(clients, data.contactId, io, "response-user-is-not-typing", response); 
                }
            }
            
        });

        socket.on("disconnect", () => {
            clients = removeSocketIdToArray(clients, currentUserId, socket);
            socket.request.user.chatGroupIds.forEach(group => {
                clients = removeSocketIdToArray(clients, group._id, socket);
            });
        });
    })
}

module.exports = typingOff;