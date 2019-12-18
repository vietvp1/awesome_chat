import {pushSocketIdToArray, emitNotifyToArray, removeSocketIdToArray} from "../../helpers/socketHelper"
import UserModel from "../../models/userModel"

function check(arrayCheck, valueCheck) {
    for(let abc of arrayCheck){ // dùng forEach k check đc true false
        if (abc._id === valueCheck) {
            return false;
        }
    }
    return true;
}

let newMemberAdded = (io) => {
    let clients = {};
    io.on("connection", (socket) => {
        let currentUserId = socket.request.user._id;
        clients = pushSocketIdToArray(clients, currentUserId, socket.id);
        socket.request.user.chatGroupIds.forEach(group => {
            clients = pushSocketIdToArray(clients, group._id, socket.id);
        });

        socket.on("new-members-added" , async (data) => {
            // lấy data info all member để render ra phía new membes
            let allMemberIds = [];
            data.groupUpdatedMembers.members.forEach(member => allMemberIds.push(member.userId));
            let allMembersInfo = await UserModel.getNormalUsersDataById(allMemberIds);
            
            data.usersAddedInfo.forEach(newMember => {
                if (clients[newMember._id]) {
                    emitNotifyToArray(clients, newMember._id, io, "response-new-member-added-to-new-member", {
                        messages: data.messages,
                        allMembersInfo: allMembersInfo,
                        groupChat: data.groupUpdatedMembers,
                        myId: newMember._id,
                    });
                }
            })

            // lấy data info new members để render ra phía old members
            let responseToOldMembers = {
                usersAddedInfo: data.usersAddedInfo,
                groupChat: data.groupUpdatedMembers
            }
            
            data.groupUpdatedMembers.members.forEach(member => {
                if (clients[member.userId] && member.userId != currentUserId && check(data.usersAddedInfo, member.userId)) {
                    emitNotifyToArray(clients, member.userId, io, "response-new-members-added-to-old-member", responseToOldMembers);              
                }
            });

        });

        socket.on("newMember-received-group-chat", (data) => {
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

module.exports = newMemberAdded;