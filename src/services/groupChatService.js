import _ from "lodash";
import ChatGroupModel from "../models/chatGroupModel"

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

module.exports = {
    addNewGroup: addNewGroup,
}