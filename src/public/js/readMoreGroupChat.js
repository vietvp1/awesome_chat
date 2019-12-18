$(document).ready(function () {
    let skipGroupChat = 0;
    $("#group-chat").unbind("scroll").on("scroll", function(){
        var scrollHeight = $("#list-group-chat").height();
        var scrollPosition = $("#group-chat").height() + $("#group-chat").scrollTop();
        let skipGro = $("#group-chat").find("li.group-chat").length;
        //let thisDOM = $(this);
        // console.log(scrollHeight);
        // console.log(scrollPosition);
        // console.log($("#group-chat").scrollTop());
        // console.log(Math.floor(scrollHeight - scrollPosition));
        // console.log("----------------");

        let abc = (scrollHeight - scrollPosition);
        let scrollBottom;
        if (abc < 1 && abc > - 1) {
            scrollBottom = 0
        }
        if (scrollBottom === 0 && skipGro !== skipGroupChat) {
            let readMoreGroupChatLoading = `<img src="images/chat/loadconversation.gif" class="group-chat-loading" />`;
            $(".read-more-group-chat-spinner").append(readMoreGroupChatLoading);
            skipGroupChat = skipGro;
            
            $.get(`/message/read-more-group-chat?skipGroupChat=${skipGroupChat}`, function (data){
                if (data.leftSideData.trim() === "") {
                    alertify.notify("Bạn không còn cuộc trò chuyện nhóm nào nữa.", "error", 7);
                    $(".read-more-group-chat-spinner").find("img.group-chat-loading").remove();
                    return false;
                }
    
                //step 1: handle leftside
                $("#group-chat").find("div#list-group-chat").append(data.leftSideData);

                // nineScrollLeftUsersChat();
                resizeNineScrollLeftGroupChat();

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

                // handle membersModal
                $("body").append(data.membersModalData);
    
                //step 9:update online
                socket.emit("check-status");
                
                //step 10: remove loading
                $(".read-more-group-chat-spinner").find("img.group-chat-loading").remove();

                //step 11: call read more messages
                readMoreMessages();
            })
        }
    });
})