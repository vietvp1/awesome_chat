import {pushSocketIdToArray, emitNotifyToArray, removeSocketIdToArray} from "../../helpers/socketHelper"

let chatVideo = (io) => {
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

        socket.on("call-check-listener-online-or-not" , (data) => {
            if (clients[data.listenerId]) {
                //online
                let response = {
                    callerId: currentUserId,
                    listenerId: data.listenerId,
                    callerName: data.callerName
                };

                emitNotifyToArray(clients, data.listenerId, io, "server-request-peer-id-of-listener", response);
            }else {
                //offline
                socket.emit("server-send-listener-is-offline");
            }
            
        });

        socket.on("listener-emit-peer-id-to-server" , (data) => {
            let response = {
                callerId: data.callerId,
                listenerId: data.listenerId,
                callerName: data.callerName,
                listenerName: data.listenerName,
                listenerPeerId: data.listenerPeerId,
            };
            if (clients[data.callerId]) {
                emitNotifyToArray(clients, data.callerId, io, "server-send-peer-id-of-listener-to-caller", response);
            }
        });
        
        socket.on("caller-request-call-to-server" , (data) => {
            let response = {
                callerId: data.callerId,
                listenerId: data.listenerId,
                callerName: data.callerName,
                listenerName: data.listenerName,
                listenerPeerId: data.listenerPeerId,
            };
            if (clients[data.listenerId]) {
                emitNotifyToArray(clients, data.listenerId, io, "server-send-request-call-to-listener", response);
            }
        });

        socket.on("caller-cancel-request-call-to-server" , (data) => {
            let response = {
                callerId: data.callerId,
                listenerId: data.listenerId,
                callerName: data.callerName,
                listenerName: data.listenerName,
                listenerPeerId: data.listenerPeerId,
            };
            if (clients[data.listenerId]) {
                emitNotifyToArray(clients, data.listenerId, io, "server-send-cancel-call-to-listener", response);
            }
        });

        socket.on("listener-reject-request-call-to-server" , (data) => {
            let response = {
                callerId: data.callerId,
                listenerId: data.listenerId,
                callerName: data.callerName,
                listenerName: data.listenerName,
                listenerPeerId: data.listenerPeerId,
            };
            if (clients[data.callerId]) {
                emitNotifyToArray(clients, data.callerId, io, "server-send-reject-call-to-caller", response);
            }
        });
        
        socket.on("listener-accept-request-call-to-server" , (data) => {
            let response = {
                callerId: data.callerId,
                listenerId: data.listenerId,
                callerName: data.callerName,
                listenerName: data.listenerName,
                listenerPeerId: data.listenerPeerId,
            };
            if (clients[data.callerId]) {
                emitNotifyToArray(clients, data.callerId, io, "server-send-accept-call-to-caller", response);
            }

            if (clients[data.listenerId]) {
                emitNotifyToArray(clients, data.listenerId, io, "server-send-accept-call-to-listener", response);
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

module.exports = chatVideo;