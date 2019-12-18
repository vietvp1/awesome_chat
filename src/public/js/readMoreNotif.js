$(document).ready(function () {
    $(".scroll-notif").unbind("scroll").on("scroll", function(){
        // $.fn.scrollBottom = function(scroll){
        //     if(typeof scroll === 'number'){
        //       window.scrollTo(0,$(document).height() - $(window).height() - scroll);
        //       return $(document).height() - $(window).height() - scroll;
        //     } else {
        //       return $(document).height() - $(window).height() - $(window).scrollTop();
        //     }
        //   }
        
        var scrollHeight = $(".list-notifications").height();
        var scrollPosition = $(".scroll-notif").height() + $(".scroll-notif").scrollTop();
        let skipNumber = $("div.list-notifications").find("li").length;

        // $("#link-read-more-notif").css("display", "none");
        if ((scrollHeight - scrollPosition) / scrollHeight === 0) {
            $(".read-more-notif-spinner").css("display", "inline-block");
            $.get(`/notification/read-more?skipNumber=${skipNumber}`, function (notifications){
                if (!notifications.length) {
                    alertify.notify("Bạn đã hết thông báo.", "error", 7);
                    //$("#link-read-more-notif").css("display", "inline-block");
                    $(".read-more-notif-spinner").css("display", "none");
                    return false;
                }
                notifications.forEach(function(notification) {
                    $("div.list-notifications").append(`<li>${notification}</li>`);// modal notif
                })
                //$("#link-read-more-notif").css("display", "inline-block");
                $(".read-more-notif-spinner").css("display", "none");
            })
        }
    });
})