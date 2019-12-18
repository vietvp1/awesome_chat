import _ from "lodash";
import ChatGroupModel from "../models/chatGroupModel"
import UserModel from "../models/userModel"
import MessageModel from "../models/messageModel"

const LIMIT_MEMBERS_TAKENMORE = 20;

let addNewGroup = (currentUserId, arrayMemberIds, groupChatName) => {
    return new Promise(async (resolve, reject) => {
        try {
            //add current userId to array members (unshift là thêm vào đầu mảng, push là thêm vào cuối mảng)
            arrayMemberIds.unshift({userId: `${currentUserId}`});
            //console.log(arrayMemberIds);
            arrayMemberIds = _.uniqBy(arrayMemberIds, "userId");
            
            let newGroupItem = {
                name: groupChatName,
                userAmount: arrayMemberIds.length,
                userId: `${currentUserId}`, // để là currentUserId khi lưu vào db k vấn đề gì, nhưng cứ ghi rõ ra cho n thành kiểu string ở đây
                members: arrayMemberIds,
            };
            let newGroup = await ChatGroupModel.create(newGroupItem);
            resolve(newGroup);
        } catch (error) {
            reject(error);
        }
    })
}

let addMoreMembersForGroup = (groupChatId, arrayMemberIds, countCurrentMembers) => {
    return new Promise(async (resolve, reject) => {
        try {

            let numberOfMembers = arrayMemberIds.length + countCurrentMembers;
            await ChatGroupModel.addMoreMembersForGroup(groupChatId, arrayMemberIds, numberOfMembers);

            // lấy data info  để render ra client
            let usersAddedId = [];
            arrayMemberIds.forEach(newMember => usersAddedId.push(newMember.userId));
            let usersAddedInfo = await UserModel.getNormalUsersDataById(usersAddedId);
            
            //lấy mesage để reander ra views của các new members
            let getMessages = await MessageModel.model.getMessagesInGroup(groupChatId, 15);
            //lấy thông tin của group sau khi undate để in ra views của các new members 
            let groupUpdatedMembers = await ChatGroupModel.getChatGroupById(groupChatId);

            resolve({
                messages:  _.reverse(getMessages),
                usersAddedInfo: usersAddedInfo, 
                groupUpdatedMembers: groupUpdatedMembers
            });
        } catch (error) {
            reject(error);
        }
    })
}

let readMoreMembersInGroup = (groupChatId, currentUserId, skipNumber) => {
    return new Promise(async (resolve, reject) => {
        try {
            let groupChat = await ChatGroupModel.getChatGroupById(groupChatId);

            let memberIdsBeforeSkip = [];
            for(let member of groupChat.members){
                if (member.userId == currentUserId) {
                    memberIdsBeforeSkip.unshift(member.userId)
                }else{
                    memberIdsBeforeSkip.push(member.userId)
                }
            };

            let lengthArrMembers = memberIdsBeforeSkip.length;
            let to = skipNumber + LIMIT_MEMBERS_TAKENMORE;
            let To = (to<lengthArrMembers)?to:lengthArrMembers;

            let memberIdsAfterSkip = [];
            for (let index = skipNumber ; index < To ; index++) {
                memberIdsAfterSkip.push(memberIdsBeforeSkip[index])
            }
            
            //lấy userInfo của các thành viên khác
            let usersInfo = await UserModel.getNormalUsersDataByIdsAndLimit(memberIdsAfterSkip, LIMIT_MEMBERS_TAKENMORE);
            
            resolve(usersInfo);
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    addNewGroup: addNewGroup,
    addMoreMembersForGroup: addMoreMembersForGroup,
    readMoreMembersInGroup: readMoreMembersInGroup,
}