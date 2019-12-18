function prepareForReadMoreAllChat(skipPersonalAllChat, skipGroupAllChat){
    let readMoreAllChatLoading = `<img src="images/chat/loadconversation.gif" class="all-chat-loading" />`;
            $(".read-more-all-chat-spinner").append(readMoreAllChatLoading);
            $.get(`/message/read-more-all-chat?skipPersonal=${skipPersonalAllChat}&skipGroup=${skipGroupAllChat}`, function (data){
                if (data.leftSideData.trim() === "") {
                    $(".read-more-all-chat-spinner").find("img.all-chat-loading").remove();
                    alertify.notify("Bạn không còn cuộc trò chuyện nào nữa.", "error", 7);
                    return false;
                }

                //step 1: handle leftside
                $("#all-chat").find("div#list-all-chat").append(data.leftSideData);

                //step 2: handle scroll left
                nineScrollLeftAllChat();
                resizeNineScrollLeftAllChat();

                //step 3: handle rightSide
                $("#screen-chat").append(data.rightSideData)

                //step 4: call function changeScreenChat
                changeScreenChat();

                //step 5: convert emoji (video co')

                //step 6: handle imageModal
                $("body").append(data.imageModalData);

                //step 7: call function gridPhotos
                gridPhotos(5);

                //step 8: handle attachmentModal
                $("body").append(data.attachmentModalData);

                // handle membersModal
                $("body").append(data.membersModalData);
                //step 9:update online
                socket.emit("check-status");
                
                //step 10: remove loading
                $(".read-more-all-chat-spinner").find("img.all-chat-loading").remove();

                //step 11: call read more messages
                readMoreMessages();
            })
}

$(document).ready(function () {
    let skipPersonalAllChat = 0;
    let skipGroupAllChat = 0; 
    $("#all-chat").unbind("scroll").on("scroll", function(){
        let skipPer = $("#all-chat").find("li:not(.group-chat)").length;
        let skipGro = $("#all-chat").find("li.group-chat").length;

        var scrollHeight = $("#list-all-chat").height();
        var scrollPosition = $("#all-chat").height() + $("#all-chat").scrollTop();
        let abc = (scrollHeight - scrollPosition);
        let scrollBottom;
        if (abc < 1 && abc > - 1) {
            scrollBottom = 0
        }
        // console.log(scrollHeight);
        // console.log(scrollPosition);
        // console.log(abc);
        // console.log("----------------");
        
        if (scrollBottom === 0 ) {
            if(
            ((skipPer !== skipPersonalAllChat && skipGro !== skipGroupAllChat) || 
            (skipPer !== skipPersonalAllChat && skipGro === skipGroupAllChat) ||
            (skipPer === skipPersonalAllChat && skipGro !== skipGroupAllChat)
            )) {
                skipPersonalAllChat = skipPer;
                skipGroupAllChat = skipGro;
                prepareForReadMoreAllChat(skipPersonalAllChat, skipGroupAllChat);
            }
        }
    });
})