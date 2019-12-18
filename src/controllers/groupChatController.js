import {validationResult} from"express-validator/check"
import {groupChat} from "../services/index"
import {bufferToBase64} from "../helpers/clientHelper" 


let addNewGroup = async (req, res) => {
    let errorArr = [];
    let validationErrors = validationResult(req)
    
    if (!validationErrors.isEmpty()) {
        let errors = Object.values(validationErrors.mapped());
        errors.forEach(item => {
            errorArr.push(item.msg)
        })
        console.log(errorArr);
        return res.status(500).send(errorArr)
    }

    try {
        let currentUserId = req.user._id;
        let arrayMemberIds = req.body.arrayIds;
        let groupChatName = req.body.groupChatName;

        let newGroupChat = await groupChat.addNewGroup(currentUserId, arrayMemberIds, groupChatName);
        return res.status(200).send({groupChat: newGroupChat});
    } catch (error) {
        return res.status(500).send(error);
    }
}

let addMoreMembersForGroup = async (req, res) => {
    try {
        let arrayMemberIds = req.body.arrayIds;
        let groupChatId = req.body.groupChatId;
        let countCurrentMembers = +(req.body.countCurrentMembers);

        let data = await groupChat.addMoreMembersForGroup(groupChatId, arrayMemberIds, countCurrentMembers);
        return res.status(200).send({
            data: data
        });
    } catch (error) {
        return res.status(500).send(error);
    }
}

let readMoreMembersInGroup = async (req, res) => {
    try {
        let skipNumber = +(req.query.skipNumber)
        let groupChatId = req.query.uid;
        let currentUserId = req.user._id;

        let moreMembers = await groupChat.readMoreMembersInGroup(groupChatId, currentUserId, skipNumber);
        return res.status(200).send(moreMembers);
    } catch (error) {
        return res.status(500).send(error);
    }
}

module.exports = {
    addNewGroup: addNewGroup,
    addMoreMembersForGroup: addMoreMembersForGroup,
    readMoreMembersInGroup: readMoreMembersInGroup,
}