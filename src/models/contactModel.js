const mongoose = require('mongoose')
let Schema = mongoose.Schema;

let ContactSchema = new Schema({
    userId: String,
    contactId: String,
    status: {type: Boolean, default: false},
    createAt: {type: Number, default: Date.now},
    updateAt: {type: Number, default: null},
    deleteAt: {type: Number, default: null}
})

ContactSchema.statics = {
    getContacts(id, limit) {
        return this.find({
            $and: [   
                {$or: [
                    {"userId": id},
                    {"contactId": id}
                ]},
                {"status": true}
            ]
        }).sort({"updateAt": -1}).limit(limit);
    },

    readMoreContacts(id, skipNumber, limit){
        return this.find({
            $and: [   
                {$or: [
                    {"userId": id},
                    {"contactId": id}
                ]},
                {"status": true}
            ]
        }).sort({"updateAt": -1}).skip(skipNumber).limit(limit);
    },

    updateWhenHasNewMessage(userId, contactId){
        return this.updateOne({
            $or: [
                {$and: [
                    {"userId": userId},
                    {"contactId": contactId}
                ]},
                {$and: [
                    {"userId": contactId},
                    {"contactId": userId}
                ]},
            ]
        }, {
            "updateAt": Date.now()
        });
    },

    getFriends(id) {
        return this.find({
            $and: [   
                {$or: [
                    {"userId": id},
                    {"contactId": id}
                ]},
                {"status": true}
            ]
        }).sort({"updateAt": -1});
    },
}

module.exports = mongoose.model('contact', ContactSchema)