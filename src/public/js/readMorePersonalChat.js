$(document).ready(function () {
    let skipPersonal = 0;
    $("#user-chat").unbind("scroll").on("scroll", function(){
        var scrollHeight = $("div#list-personal-chat").height();
        var scrollPosition = $("#user-chat").height() + $("#user-chat").scrollTop();
        let skip = $("div#list-personal-chat").find("li").length;
        //let thisDOM = $(this);
        // console.log(scrollHeight);
        // console.log(scrollPosition);
        // console.log($("#user-chat").scrollTop());
        // console.log(Math.floor(scrollHeight - scrollPosition));
        // console.log("----------------");

        let abc = (scrollHeight - scrollPosition);
        let scrollBottom;
        if (abc < 1 && abc > - 1) {
            scrollBottom = 0
        }
        if (scrollBottom === 0 && skip !== skipPersonal) {
            let readMoreUserChatLoading = `<img src="images/chat/loadconversation.gif" class="user-chat-loading" />`;
            $(".read-more-user-chat-spinner").append(readMoreUserChatLoading);
            skipPersonal = skip;
            
            $.get(`/message/read-more-personal-chat?skipPersonal=${skipPersonal}`, function (data){
                if (data.leftSideData.trim() === "") {
                    alertify.notify("Bạn không còn cuộc trò chuyện cá nhân nào nữa.", "error", 7);
                    $(".read-more-user-chat-spinner").find("img.user-chat-loading").remove();
                    return false;
                }
    
                //step 1: handle leftside
                $("div#list-personal-chat").append(data.leftSideData);
                
                // nineScrollLeftUsersChat();
                resizeNineScrollLeftUsersChat();

                //step 3: handle rightSide
                $("#screen-chat").append(data.rightSideData)
    
                //step 4: call function changeScreenChat
                changeScreenChat();
    
                //step zoom image
                zoomImageChat();
    
                //step 6: handle imageModal
                $("body").append(data.imageModalData);
    
                //step 7: call function gridPhotos
                gridPhotos(5);
    
                //step 8: handle attachmentModal
                $("body").append(data.attachmentModalData);
    
                //step 9:update online
                socket.emit("check-status");
                
                //step 10: remove loading
                $(".read-more-user-chat-spinner").find("img.user-chat-loading").remove();

                //step 11: call read more messages
                readMoreMessages();
            })
        }
    });
})