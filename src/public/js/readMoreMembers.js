function readMoreMembers(divId) {
    let skipNumber = 0;
    $(`#link-read-more-members-${divId}`).bind("click", function () {
        let skip = $(`ul.list-members[data-uid = ${divId}]`).find("div.membersList").length;
        if (skip !== skipNumber) {
            skipNumber = skip;
            $(`#link-read-more-members-${divId}`).css("display", "none");
            $(`.read-more-members-spinner[data-uid = ${divId}]`).css("display", "inline-block");
            $.get(`/group-chat/read-more?skipNumber=${skipNumber}&uid=${divId}`, function (members){
                if (!members.length) {
                    alertify.notify("Không còn thành viên nào nữa.", "error", 7);
                    $(`#link-read-more-members-${divId}`).css("display", "inline-block");
                    $(`.read-more-members-spinner[data-uid = ${divId}]`).css("display", "none");
                    return false;
                }
                members.forEach(function(member) {
                    let htmlMember = `<div class="membersList col-sm-2" data-uid="${member._id}">
                                            <div class="memberPanel">
                                                <div class="user-avatar">
                                                    <img src="images/users/${member.avatar}" alt="">
                                                </div>
                                                <div class="user-name">
                                                <p class="nameOfMember">
                                                    ${member.username}
                                                </p>
                                                </div>
                                                <div class="user-talk btn-talk-member" data-uid="${member._id}">
                                                    Trò chuyện 
                                                </div>
                                            </div>
                                        </div>`;
                
                    $(`ul.list-members[data-uid = ${divId}]`).append(htmlMember);
                })
                $(`#link-read-more-members-${divId}`).css("display", "inline-block");
                $(`.read-more-members-spinner[data-uid = ${divId}]`).css("display", "none");
            })
        }
    });
}