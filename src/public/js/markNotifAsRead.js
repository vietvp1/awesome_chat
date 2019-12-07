function markNotificationsAsRead(targetUsers) {
    $.ajax({
        url: "/notification/mark-all-as-read",
        type: "put", // put là gửi lên server
        data: {targetUsers: targetUsers},
        success: function (result) {
            if (result) {
                targetUsers.forEach(function (uid) { // id cuả sender
                    $(".noti_content").find(`div[data-uid = ${uid}]`).removeClass("notif-readed-false");
                    $("ul.list-notifications").find(`li>div[data-uid = ${uid}]`).removeClass("notif-readed-false");
                });
                decreaseNumberNotification("noti_counter", targetUsers.length);
            }
        },
    });
}

$(document).ready(function () {
    //link at popub notifications
    $("#popup-mark-notif-as-read").bind("click", function () {
        let targetUsers = [];
        $(".noti_content").find("div.notif-readed-false").each(function (index, notification) {
            targetUsers.push($(notification).data("uid"))
        });
        if(!targetUsers.length){
            alertify.notify("Bạn không còn thông báo nào chưa đọc.", "error", 7)
            return false;
        };
        markNotificationsAsRead(targetUsers);
    });
    //link at modal notifications
    $("#modal-mark-notif-as-read").bind("click", function () {
        let targetUsers = [];
        $("ul.list-notifications").find("li>div.notif-readed-false").each(function (index, notification) {
            targetUsers.push($(notification).data("uid"))
        });
        if(!targetUsers.length){
            alertify.notify("Bạn không còn thông báo nào chưa đọc.", "error", 7)
            return false;
        };
        markNotificationsAsRead(targetUsers);
    });
})