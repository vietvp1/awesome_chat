function readMoreMessages() {
    $(".right .chat").unbind("scroll").on("scroll", function(){
        //get the first message
        let firstMessage = $(this).find(".bubble:first");
        //get position of first message
        let currentOffset = firstMessage.offset().top;
        
        if ($(this).scrollTop() === 0) {
            let messageLoading = `<img src="images/chat/message-loading.gif" class="message-loading" />`;
            $(this).prepend(messageLoading);

            let targetId = $(this).data("chat");
            let skipMessage = $(this).find("div.bubble").length;
            let chatInGroup = $(this).hasClass("chat-in-group") ? true : false;
        
            let thisDOM = $(this);

            $.get(`/message/read-more?skipMessage=${skipMessage}&targetId=${targetId}&chatInGroup=${chatInGroup}`, function (data) {
                if (data.rightSideData.trim() === "") {
                    alertify.notify("Bạn không còn tin nhắn nào trong cuộc trò chuyện này nữa.", "error", 7);
                    thisDOM.find("img.message-loading").remove();
                    
                    return false;
                }

                //step 1: handle rightSide
                $(`.right .chat[data-chat=${targetId}]`).prepend(data.rightSideData);

                //step 2: prevent scroll
                $(`.right .chat[data-chat=${targetId}]`).scrollTop(firstMessage.offset().top - currentOffset);
                //step 3: convert emoji (video có)

                //step4: handle imageModal
                $(`#imagesModal_${targetId}`).find("div.all-images").append(data.imageModalData);

                //step 5: call function gridPhotos
                gridPhotos(5);

                //step 6: handle attachmentModal
                $(`#attachmentsModal_${targetId}`).find("div.list-attachments").append(data.attachmentModalData);

                //step 7: remove message loading
                thisDOM.find("img.message-loading").remove();

                //step 8: zoom image
                zoomImageChat();

            });
        }
    });
}

$(document).ready(function () {
    readMoreMessages();
})