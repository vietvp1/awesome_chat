const mongoose = require('mongoose')
let Schema = mongoose.Schema;

let ChatGroupSchema = new Schema({
    name: String,
    userAmount: {type: Number, min: 3, max: 200},
    messageAmount: {type: Number, default: 0},
    userId: String,
    members: [ 
        {userId: String}
    ],
    createAt: {type: Number, default: Date.now},
    updateAt: {type: Number, default: Date.now},
    deleteAt: {type: Number, default: null}
})

ChatGroupSchema.statics = {
    getChatGroups(userId, limit){
        return this.find({
            "members" : {$elemMatch: {"userId": userId}}
        }).sort({"updateAt": -1}).limit(limit);
    },

    getChatGroupById(id) {
        return this.findById(id);
    },

    updateWhenHasNewMessage(id, newMessageAmount){
        return this.findByIdAndUpdate(id, {
            "messageAmount": newMessageAmount,
            "updateAt": Date.now(),
        });
    },

    getChatGroupIdsByUser(userId){
        return this.find({
            "members" : {$elemMatch: {"userId": userId}}
        }, {_id: 1});
    },

    readMoreChatGroups(userId, skip, limit){
        return this.find({
            "members" : {$elemMatch: {"userId": userId}}
        }).sort({"updateAt": -1}).skip(skip).limit(limit);
    },
}

module.exports = mongoose.model('chat-group', ChatGroupSchema)