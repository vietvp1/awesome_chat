import {pushSocketIdToArray, emitNotifyToArray, removeSocketIdToArray} from "../../helpers/socketHelper"

let newGroupChat = (io) => {
    let clients = {};
    io.on("connection", (socket) => {
        let currentUserId = socket.request.user._id;
        clients = pushSocketIdToArray(clients, currentUserId, socket.id);
        socket.request.user.chatGroupIds.forEach(group => {
            clients = pushSocketIdToArray(clients, group._id, socket.id);
        });

        socket.on("new-group-created" , (data) => {
            clients = pushSocketIdToArray(clients, data.groupChat._id, socket.id);

            let response = {
                groupChat: data.groupChat
            };

            data.groupChat.members.forEach(member => {
                if (clients[member.userId] && member.userId != currentUserId) {
                    emitNotifyToArray(clients, member.userId, io, "response-new-group-created", response);
                }
            });
        });

        socket.on("member-received-group-chat", (data) => {
            clients = pushSocketIdToArray(clients, data.groupChatId, socket.id);
        });

        socket.on("disconnect", () => {
            clients = removeSocketIdToArray(clients, currentUserId, socket);
            socket.request.user.chatGroupIds.forEach(group => {
                clients = removeSocketIdToArray(clients, group._id, socket);
            });
        });
    })
}

module.exports = newGroupChat;