const UserModel = require('../models/userModel')
const bcrypt = require('bcryptjs')
import {transErrors} from "../../lang/vi"

const saltRounds = 10;

let updateUser = (id, item) => {
    return UserModel.findByIdAndUpdate(id, item);
};

let updatePassword = (id, dataUpdate) => {
    return new Promise( async (resolve, reject) => {
        let currentUser = await UserModel.findUserByIdToUpdatePassword(id);
        if (!currentUser) {
            return reject(transErrors.account_undefined);
        }

        let checkCurrentPassword = await currentUser.comparePassword(dataUpdate.currentPassword);
        if (!checkCurrentPassword) {
            return reject(transErrors.user_current_password_failed);
        }

        let salt = bcrypt.genSaltSync(saltRounds);
        await UserModel.findByIdAndUpdate(id, {"local.password": bcrypt.hashSync(dataUpdate.newPassword, salt)});
        resolve(true);
    })
};

module.exports = {
    updateUser: updateUser,
    updatePassword: updatePassword,
}