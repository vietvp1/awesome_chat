$(document).ready(function () {
    $("#link-read-more-all-chat").bind("click", function () {
        let skipPersonal = $("#all-chat").find("li:not(.group-chat)").length;
        let skipGroup = $("#all-chat").find("li.group-chat").length;
        
        console.log(skipPersonal);
        console.log(skipGroup);

        $("#link-read-more-all-chat").css("display", "none");
        $(".read-more-all-chat-spinner").css("display", "inline-block");
        
        $.get(`/message/read-more-all-chat?skipPersonal=${skipPersonal}&skipGroup=${skipGroup}`, function (data){
            if (data.leftSideData.trim() === "") {
                alertify.notify("Bạn không còn cuộc trò chuyện nào nữa.", "error", 7);
                $("#link-read-more-all-chat").css("display", "inline-block");
                $(".read-more-all-chat-spinner").css("display", "none");
                return false;
            }

            //step 1: handle leftside
            $("#all-chat").find("ul").append(data.leftSideData);

            //step 2: handle scroll left
            resizeNineScrollLeft();
            nineScrollLeft();

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

            //step 9:update online
            socket.emit("check-status");
            
            //step 10: remove loading
            $("#link-read-more-all-chat").css("display", "inline-block");
            $(".read-more-all-chat-spinner").css("display", "none");
            
            //step 11: call read more messages
            readMoreMessages();
        })
    });
})