import UserModel from "../models/userModel"
import {transErrors, transSuccess, transMail} from "../../lang/vi"
import sendMail from "../../config/mailer"
const bcrypt = require('bcryptjs')
const uuidv4 = require('uuid/v4')

let saltRounds = 10;

let register = (email, gender, password, protocol, host) => {
    return new Promise(async (resolve, reject) =>{
        let userByEmail = await UserModel.findOne({"local.email": email })
            if(userByEmail) {
                if (userByEmail.deleteAt != null) {
                    return reject(transErrors.account_removed)
                }
                if (!userByEmail.local.isActive) {
                    return reject(transErrors.account_not_active)
                }
                return reject(transErrors.account_in_use)
            }

            let salt = bcrypt.genSaltSync(saltRounds);
            let userItem = {
                username: email.split("@")[0],
                gender: gender,
                local: {
                    email: email,
                    password: bcrypt.hashSync(password, salt),
                    verifyToken: uuidv4()
                }
            }
            const newUser = new UserModel(userItem);
            await newUser.save();
            let linkVerify = `${protocol}://${host}/verify/${newUser.local.verifyToken}`;

            //send mail
            sendMail(email, transMail.subject, transMail.template(linkVerify))
                .then(success => {
                    resolve(transSuccess.userCreated(newUser.local.email));
                })
                .catch(async (error) => {
                    //remove 
                    await UserModel.findByIdAndRemove(newUser._id)
                    console.log(error);
                    reject(transMail.send_failed);
                })
            
    })   
}

let verifyAccount = (token) => {
    return new Promise(async (resolve, reject) =>{
        let userBytoken = await UserModel.findOne({"local.verifyToken": token});
        if (!userBytoken) {
            return reject(transErrors.token_undefined)
        }
        
        await UserModel.findOneAndUpdate(
            {"local.verifyToken": token},
            {"local.isActive": true,"local.verifyToken": null}
        );
        resolve(transSuccess.account_actived)
    })
}

module.exports = {
    register : register,
    verifyAccount: verifyAccount,
}