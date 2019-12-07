function imageChat(divId) {
    $(`#image-chat-${divId}`).unbind("change").on("change", function () {
        let fileData = $(this).prop("files")[0]; // lấy dữ liệu ảnh tải lên
        let math = ["image/png", "image/ipg", "image/jpeg"];
        let limit = 1048576; // byte= 1Mb

        if ($.inArray(fileData.type, math) === -1) { // kiểm tra kiểu dữ liệu ảnh có thuộc 1 trong 3 kiểu trong mảng không
            alertify.notify("Kiểu file không hợp lệ!!!", "error", 7);
            $(this).val(null);
            return false;
        }

        if (fileData.size > limit) {
            alertify.notify("Ảnh upload tối đa là 1MB", "error", 7);
            $(this).val(null);
            return false;
        }

        let targetId = $(this).data("chat");
        let isChatGroup = false;

        let messageformData = new FormData();
        messageformData.append("my-image-chat", fileData);
        messageformData.append("uid", targetId);

        if ($(this).hasClass("chat-in-group")) {
            messageformData.append("isChatGroup", true);  
            isChatGroup = true;
        }

        $.ajax({
            url: "/message/add-new-image",
            type: "post",
            cache: false,
            contentType: false,
            processData: false,
            data: messageformData,
            success: function(data) {
                let dataToEmit = {
                    message: data.message
                };   

                // Step1 handle mesage data before show
                let messageOfMe = $(`<div class="bubble me bubble-image-file" data-mess-id="${data.message._id}"></div>`);
               
                let imageChat = `<img src="data:${data.message.file.contentType}; base64, ${bufferToBase64(data.message.file.data.data)}" 
                                class="show-image-chat">`;
                 // trong video có converEmojiMessage = emojione.toImage(messageOfMe.html())
                if (isChatGroup) {
                    let senderAvatar =  `<img src="/images/users/${data.message.sender.avatar}"
                                         class="avatar-small" title="${data.message.sender.name}"/>`;
                    messageOfMe.html(`${senderAvatar} ${imageChat}`);
                    
                    increaseNumberMessageGroup(divId);
                    dataToEmit.groupId = targetId;
                } else {
                    messageOfMe.html(imageChat);

                    dataToEmit.contactId = targetId;
                } 
                
                //Step2 là apppend to screen
                $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);
                nineScrollRight(divId);

                //Step3 remove all data input
                //Step4 change data preview and time in leftSide
                $(`.person[data-chat = ${divId}]`).find("span.time").removeClass("message-time-realtime")
                .html(moment(data.message.createAt).locale("vi").startOf("seconds").fromNow());
                $(`.person[data-chat = ${divId}]`).find("span.preview").html("Hình ảnh...");

                //Step5 move conversation to the top
                $(`.person[data-chat = ${divId}]`).on("vietanhdev.moveConversationToTheTop", function() {
                    let dataToMove = $(this).parent();
                    $(this).closest("ul").prepend(dataToMove);
                    $(this).off("vietanhdev.moveConversationToTheTop");
                });
                $(`.person[data-chat = ${divId}]`).trigger("vietanhdev.moveConversationToTheTop");

                //Step6 Emit realtime
                socket.emit("chat-image", dataToEmit);
                
                //step9: add to modal image
                let imageChatToAddModal = `<img src="data:${data.message.file.contentType}; base64, ${bufferToBase64(data.message.file.data.data)}">`;
                $(`#imagesModal_${divId}`).find("div.all-images").append(imageChatToAddModal);

            },
            error: function(error) {
                alertify.notify(error.responseText, "error", 7);
            },
        })

    })
}

$(document).ready(function () {
    socket.on("response-chat-image", function (response) {
        let divId = "";
        // Step 1
        let messageOfYou = $(`<div class="bubble you bubble-image-file" data-mess-id="${response.message._id}"></div>`);
        let imageChat = `<img src="data:${response.message.file.contentType}; base64, ${bufferToBase64(response.message.file.data.data)}" 
                                class="show-image-chat">`;

        if (response.currentGroupId) {
            let senderAvatar =  `<img src="/images/users/${response.message.sender.avatar}"
                                    class="avatar-small" title="${response.message.sender.name}"/>`;
            messageOfYou.html(`${senderAvatar} ${imageChat}`);
            
            divId = response.currentGroupId;

            if (response.currentUserId !== $("#dropdown-navbar-user").data("uid") ) {
                increaseNumberMessageGroup(divId);
            }
            
        } else {
            messageOfYou.html(imageChat);
            divId = response.currentUserId;
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
         $(`.person[data-chat = ${divId}]`).find("span.preview").html("Hình ảnh...")

        //Step5 move conversation to the top
        $(`.person[data-chat = ${divId}]`).on("vietanhdev.moveConversationToTheTop", function() {
            let dataToMove = $(this).parent();
            $(this).closest("ul").prepend(dataToMove);
            $(this).off("vietanhdev.moveConversationToTheTop");
        });
        $(`.person[data-chat = ${divId}]`).trigger("vietanhdev.moveConversationToTheTop");

        //step9: add to modal image
        if (response.currentUserId !== $("#dropdown-navbar-user").data("uid") ) {
            let imageChatToAddModal = `<img src="data:${response.message.file.contentType}; base64, ${bufferToBase64(response.message.file.data.data)}">`;
            $(`#imagesModal_${divId}`).find("div.all-images").append(imageChatToAddModal);
        }
    });
})