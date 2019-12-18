function configAddMembersInGroup(divId) {
    $(`#addMembers_Button_${divId}`).unbind("click").on("click", function () {
      $(`#search-more-friends-${divId}`).fadeToggle('fast', 'linear');
      $(`#btn-finished-add-members-${divId}`).fadeToggle('fast', 'linear');
      return false;
    })
    $(".main-content").click(function() {
      $(`#search-more-friends-${divId}`).fadeOut('fast', 'linear');
      $(`#btn-finished-add-members-${divId}`).fadeOut('fast', 'linear');
    });
  }

function findMoreFriendsToAddGroup(divId) {
    $(`#search-more-friends-${divId}`).bind("keypress", function (element) {
        if (element.which === 13 || element.type === "click") {
            let keyword = $(`#search-more-friends-${divId}`).val();
            let regexKeyword = new RegExp(/^[\s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/ );
    
            if (!keyword.length) {
                alertify.notify("Chưa nhập nội dung tìm kiếm.", "error", 7);
                return false;
            }
    
            if (!regexKeyword.test(keyword)) {
                alertify.notify("Lỗi từ khóa tìm kiếm.", "error", 7);
                return false;
            }
            
            if (!$(`div.friends-added-more[data-uid = ${divId}]>span`).length) {
                $('div.friends-added-more').css("display", "none");
            }
            //let targetId = $(this).data("uid");

            $.get(`/contact/find-more-friends-to-add-groupChat/${keyword}?uid=${divId}`,function (data) {
                if (!data) {
                    alertify.notify("Chúng tôi không tìm thấy kết quả nào để hiển thị.", "error", 7)
                    return false;
                }

                $(`div.search_more_friends_content[data-uid =${divId}] ul`).html(data);

                $(`div.find-users-to-add-member[data-uid = ${divId}]`).find("div#search-more-friends-results").css("display", "block");

                $(".modal-body").click(function() {
                    $(`div.find-users-to-add-member[data-uid = ${divId}]`).find("div#search-more-friends-results").fadeOut('fast', 'linear');
                    $('div.friends-added-more').find("span").remove();
                    $('div.friends-added-more').css("display", "none");
                });
                $(".main-content").click(function() {
                    $(`div.find-users-to-add-member[data-uid = ${divId}]`).find("div#search-more-friends-results").fadeOut('fast', 'linear');
                    $('div.friends-added-more').find("span").remove();
                    $('div.friends-added-more').css("display", "none");
                });
                
                //Thêm người dùng vào danh sách liệt kê trước khi thêm thành viên
                addMoreMembersToGroupChat();

                callUpdateMoreMembers(divId);
            })
        }
    });

}
