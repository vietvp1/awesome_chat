const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
let Schema = mongoose.Schema;

let UserSchema = new Schema({
    username: String,
    gender: {type : String, default: "male"},
    phone: {type: String, default: null},
    address: {type: String, default: null},
    avatar: {type: String, default: "avatar-default.jpg"},
    role: {type: String, default: "user"},
    local: {
        email: {type: String, trim: true},
        password: String,
        isActive: {type: Boolean, default:false},
        verifyToken: String,
    },
    facebook: {
        uid: String,
        token: String,
        email:{type: String, trim: true}
    },
    google: {
        uid: String,
        token: String,
        email:{type: String, trim: true}
    },
    createAt: {type: Number, default: Date.now},
    udateAt: {type: Number, default: null},
    deleteAt: {type: Number, default: null}
})

UserSchema.statics = {
    findUserByIdToUpdatePassword(id) {
        return this.findById(id);
    },

    findUserByIdForSessionToUse(id) {
        return this.findById(id, {"local.password": 0});
    },

    //lấy 1 user
    getNormalUserDataById(id) {
        return this.findById(id, {_id: 1, username: 1, address: 1, avatar: 1});
    },

    //lấy nhiều user by array id and keyword
    getNormalUserDataByIdAndKeyword(friendIds, keyword){
        return this.find({
            $and: [
                {"_id": {$in: friendIds}},
                {"local.isActive": true},
                {$or: [
                    {"username": {"$regex": new RegExp(keyword, "i")}},
                    // {"local.email": {"$regex": new RegExp(keyword, "i")}},
                    // {"facebook.email": {"$regex": new RegExp(keyword, "i")}},
                    // {"google.email": {"$regex": new RegExp(keyword, "i")}}
                ]}
            ]
        }, {_id: 1, username: 1, address: 1, avatar: 1});
    },

    //lấy nhiều user by array id 
    getNormalUsersDataById(UserIds){
        return this.find({
            $and: [
                {"_id": {$in: UserIds}},
                {"local.isActive": true},
            ]
        }, {_id: 1, username: 1, address: 1, avatar: 1});
    },

    //lấy nhiều user by array id và có giới hạn limit
    getNormalUsersDataByIdsAndLimit(UserIds, limit){
        return this.find({
            $and: [
                {"_id": {$in: UserIds}},
                {"local.isActive": true},
            ]
        }, {_id: 1, username: 1, address: 1, avatar: 1}).limit(limit);
    },

}

UserSchema.methods = {
    comparePassword(password){
        return bcrypt.compare(password, this.local.password); // return promise true or false
    }
}

module.exports = mongoose.model('user', UserSchema)