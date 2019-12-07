function textAndEmojiChat(divId) {
    $(".emojionearea").unbind("keyup").on("keyup", function (element) {
        let currentEmojioneArea = $(this);
        if (element.which === 13) {
            let targetId = $(`#write-chat-${divId}`).data("chat");
            let messageVal = $(`#write-chat-${divId}`).val();
            
            if (!targetId.length || !messageVal.length) {
                return false;
            }
            
            let dataTextEmojiForSend = {
                uid: targetId,
                messageVal: messageVal,
            }

            if ($(`#write-chat-${divId}`).hasClass("chat-in-group")) {
                dataTextEmojiForSend.isChatGroup = true;
            }

            //call send message
            $.post("/message/add-new-text-emoji", dataTextEmojiForSend, function(data) {
                let dataToEmit = {
                    message: data.message
                };
                
                // Step1 handle mesage data before show
                let messageOfMe = $(`<div class="bubble me" data-mess-id="${data.message._id}"></div>`);
               
                 // trong video có converEmojiMessage = emojione.toImage(messageOfMe.html())
                if (dataTextEmojiForSend.isChatGroup) {
                    let senderAvatar =  `<img src="/images/users/${data.message.sender.avatar}"
                                         class="avatar-small" title="${data.message.sender.name}"/>`;
                    messageOfMe.html(`${senderAvatar} ${data.message.text}`);
                    
                    increaseNumberMessageGroup(divId);
                    dataToEmit.groupId = targetId;
                } else {
                    messageOfMe.text(data.message.text);
                    dataToEmit.contactId = targetId;
                }

                //Step2 là apppend to screen
                $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);
                nineScrollRight(divId);

                //Step3 remove all data input
                $(`#write-chat-${divId}`).val("");
                currentEmojioneArea.find(".emojionearea-editor").text("");
                //Step4 change data preview and time in leftSide
                $(`.person[data-chat = ${divId}]`).find("span.time").removeClass("message-time-realtime")
                .html(moment(data.message.createAt).locale("vi").startOf("seconds").fromNow());
                $(`.person[data-chat = ${divId}]`).find("span.preview").html(data.message.text) // emojione.toImage(data.message.text)

                //Step5 move conversation to the top
                $(`.person[data-chat = ${divId}]`).on("vietanhdev.moveConversationToTheTop", function() {
                    let dataToMove = $(this).parent();
                    $(this).closest("ul").prepend(dataToMove);
                    $(this).off("vietanhdev.moveConversationToTheTop");
                });
                $(`.person[data-chat = ${divId}]`).trigger("vietanhdev.moveConversationToTheTop");

                //Step6 Emit realtime
                socket.emit("chat-text-emoji", dataToEmit);

                //step7 Emit romove typing real-time
                typingOff(divId)

                //step 8 nếu thằng này có typing thi xóa n ngay lập tực
                let checkTyping =  $(`.chat[data-chat = ${divId}]`).find("div.bubble-typing-gif");
                if (checkTyping.length) {
                    checkTyping.remove();
                }

            }).fail(function(response) {
                alertify.notify(response.responseText, "error", 7);
            });
        }
    })
}

$(document).ready(function () {
    socket.on("response-chat-text-emoji", function (response) {
        let divId = "";
        //Step1
        let messageOfYou = $(`<div class="bubble you" data-mess-id="${response.message._id}"></div>`);

        if (response.currentGroupId) {
            let senderAvatar =  `<img src="/images/users/${response.message.sender.avatar}"
                                    class="avatar-small" title="${response.message.sender.name}"/>`;
            messageOfYou.html(`${senderAvatar} ${response.message.text}`);
            
            divId = response.currentGroupId;

            if (response.currentUserId !== $("#dropdown-navbar-user").data("uid") ) {
                increaseNumberMessageGroup(divId);
            }
            
        } else {
            messageOfYou.text(response.message.text);
            divId = response.currentUserId
        }

        //Step2 là apppend to screen
        if (response.currentUserId !== $("#dropdown-navbar-user").data("uid") ) {
            $(`.right .chat[data-chat=${divId}]`).append(messageOfYou);
            nineScrollRight(divId);
            $(`.person[data-chat = ${divId}]`).find("span.time").addClass("message-time-realtime");
        }
        
        //Step4 change data preview and time in leftSide
        $(`.person[data-chat = ${divId}]`).find("span.time")
        .html(moment(response.message.createAt).locale("vi").startOf("seconds").fromNow());
        $(`.person[data-chat = ${divId}]`).find("span.preview").html(response.message.text) // emojione.toImage(data.message.text)
        
        //Step5 move conversation to the top
        $(`.person[data-chat = ${divId}]`).on("vietanhdev.moveConversationToTheTop", function() {
            let dataToMove = $(this).parent();
            $(this).closest("ul").prepend(dataToMove);
            $(this).off("vietanhdev.moveConversationToTheTop");
        });
        $(`.person[data-chat = ${divId}]`).trigger("vietanhdev.moveConversationToTheTop");
    })
})