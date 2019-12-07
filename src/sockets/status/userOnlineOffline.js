import {pushSocketIdToArray, emitNotifyToArray, removeSocketIdToArray} from "../../helpers/socketHelper"

let userOnlineOffline = (io) => {
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

        socket.on("check-status", () => {
            let listUsersOnline = Object.keys(clients);
            //step 1: emit to user after login or f5 web page
            socket.emit("server-send-list-users-online", listUsersOnline);

            //step 2: emit to all another users when has new user online
            socket.broadcast.emit("server-send-when-new-user-online", currentUserId);
        });

        socket.on("disconnect", () => {
            clients = removeSocketIdToArray(clients, currentUserId, socket);
            socket.request.user.chatGroupIds.forEach(group => {
                clients = removeSocketIdToArray(clients, group._id, socket);
            });
            //step 3:
            socket.broadcast.emit("server-send-when-new-user-offline", currentUserId);
        });
    })
}

module.exports = userOnlineOffline;