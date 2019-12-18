function findConversations(element) {
    if (element.which === 13 || element.type === "click") {
        let keyword = $(".searchBox").val();
        let regexKeyword = new RegExp(/^[\s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/ );

        if (!keyword.length) {
            alertify.notify("Chưa nhập nội dung tìm kiếm.", "error", 7);
            return false;
        }

        if (!regexKeyword.test(keyword)) {
            alertify.notify("Lỗi từ khóa tìm kiếm.", "error", 7);
            return false;
        }

        $.get(`/message/find-conversations/${keyword}`, function (data) {

            $("div.search_content ul").html(data);

            $("#search-results").css("display", "block");

            $(".main-content").click(function() {
                $('#search-results').fadeOut('fast', 'linear');
            });
            
            changeScreenChat();
            //  // Thêm người dùng vào danh sách liệt kê trước khi tạo nhóm trò chuyện
            // addFriendsToGroup();
        })
    }
}

$(document).ready(function () {
    $(".searchBox").bind("keypress", findConversations);
})