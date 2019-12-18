function addMoreMembersToGroupChat() {
    $(`ul#group-chat-more-friends`).find('span.add-more-user').unbind("click").on("click", function() {
      
      let uid = $(this).data('uid');
      
      if ($(this).find("i").hasClass("toggleColor")) {
        $(this).find("i").removeClass("toggleColor");
        $('div.friends-added-more').find(`span[data-uid = ${uid}]`).remove();
        if (!$(`div.friends-added-more[data-uid = ${uid}]>span`).length) {
          $('div.friends-added-more').css("display", "none");
        }
        return false;
      }

      $(this).find("i").addClass("toggleColor");
      let htmlUserIsAdded = $("ul#group-chat-more-friends").find("div.find-more-user-avatar").html();
      let html = `<span data-uid="${uid}">${htmlUserIsAdded}</span>`;
      
      $('div.friends-added-more').append(html);
      $('div.friends-added-more img').addClass("image-user-added-more")
      $('div.friends-added-more').css("display", "inline-block");
      
    });
}

//tìm hết 1 đêm nhưng cuối cùng k dùng nữa.. buffer to base64 ở phía javascrip thuần
function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

function callUpdateMoreMembers(divId) {
  $(`#btn-finished-add-members-${divId}`).unbind("click").on("click", function () {
      let arrayIds = [];
      $(`div.friends-added-more[data-uid= ${divId}]`).find("span").each(function (index, item) {
          arrayIds.push({"userId": $(item).data("uid")})
      })

      let countCurrentMembers = +$(`.tab-pane[data-chat = ${divId}] div.top a.number-members`).find("span.show-number-members").text(); 
      let countMemberAfterAdd = countCurrentMembers + arrayIds.length;

      $.ajax({
        url: "/group-chat/add-more",
        type: "put",
        data: {arrayIds: arrayIds, groupChatId: divId, countCurrentMembers: countCurrentMembers},
        success: function(result) {
          // ẩn thanh kết quả tìm kiếm
          $(`div.find-users-to-add-member[data-uid = ${divId}]`).find("div#search-more-friends-results").fadeOut('fast', 'linear');
          $('div.friends-added-more').find("span").remove();

          result.data.usersAddedInfo.forEach(function (newMember) {
            let htmlNewMember = `<div class="membersList col-sm-2" data-uid="${newMember._id}">
                                  <div class="memberPanel">
                                      <div class="user-avatar">
                                          <img src="images/users/${newMember.avatar}" alt="">
                                      </div>
                                      <div class="user-name">
                                      <p class="nameOfMember">
                                        ${newMember.username}
                                      </p>
                                      </div>
                                      <div class="user-talk btn-talk-member" data-uid="${newMember._id}">
                                          Trò chuyện 
                                      </div>
                                  </div>
                                </div>`;
            
            $(`ul.list-members[data-uid = ${divId}]`).append(htmlNewMember);
          })

          // update số lượng member
          $(`.tab-pane[data-chat = ${divId}] div.top a.number-members`).find("span.show-number-members").text(countMemberAfterAdd);
          
          userTalk();
          
          socket.emit("new-members-added",{ 
              messages: result.data.messages,
              usersAddedInfo: result.data.usersAddedInfo , 
              groupUpdatedMembers: result.data.groupUpdatedMembers
            });
          
        },
        error: function(error) {
          console.log(error);
        },
      })

  })
}


// new members nhận đc response
  socket.on("response-new-member-added-to-new-member", function (response) {
      //step 1
      //step 2 handle leftside.ejs
      let subGroupChatName = response.groupChat.name;
      if (subGroupChatName.length > 15) {
          subGroupChatName = subGroupChatName.substr(0,14);
      }
      let leftSideData = `
          <a href="#uid_${response.groupChat._id}" class="room-chat" data-target="#to_${response.groupChat._id}">
              <li class="person group-chat" data-chat="${response.groupChat._id}">
                  <div class="left-avatar">
                      <img src="images/users/group-avatar-trungquandev.png" alt="">
                  </div>
                  <span class="name">
                      <span class="group-chat-name">
                          ${subGroupChatName}<span>...</span>
                      </span>
                  </span> 
                  <span class="time"></span>
                  <span class="preview"></span>
              </li>
          </a>
      `;
      $('#all-chat').find("ul").prepend(leftSideData);
      $('#group-chat').find("ul").prepend(leftSideData);

/////////////////////////////////////step 3 handle rightSide
      let rightSideData = `
      <div class="right tab-pane" data-chat="${response.groupChat._id}" id="to_${response.groupChat._id}">
          <div class="top">
              <span>To: <span class="name">${response.groupChat.name}</span></span>
              <span class="chat-menu-right">
                  <a href="#attachmentsModal_${response.groupChat._id}" class="show-attachments" data-toggle="modal">
                      Tệp đính kèm
                      <i class="fa fa-paperclip"></i>
                  </a>
              </span>
              <span class="chat-menu-right">
                  <a href="javascript:void(0)">&nbsp;</a>
              </span>
              <span class="chat-menu-right">
                  <a href="#imagesModal_${response.groupChat._id}" class="show-images" data-toggle="modal">
                      Hình ảnh
                      <i class="fa fa-photo"></i>
                  </a>
              </span>
              <span class="chat-menu-right">
                  <a href="javascript:void(0)">&nbsp;</a>
              </span>
              <span class="chat-menu-right">
                <a href="#membersModal_${response.groupChat._id}" class="number-members" data-toggle="modal">
                    <span class="show-number-members">${response.groupChat.userAmount}</span> 
                    <span style="color: #2C3E50;">Thành viên</span>
                    <i class="fa fa-users"></i>
                </a>
              </span>
              <span class="chat-menu-right">
                  <a href="javascript:void(0)">&nbsp;</a>
              </span>
              <span class="chat-menu-right">
                  <a href="javascript:void(0)" class="number-messages" data-toggle="modal">
                    <span class="show-number-messages">${response.groupChat.messageAmount}</span> 
                    <span style="color: #2C3E50;">Tin nhắn</span>
                    <i class="fa fa-comment-o"></i>
                  </a>
              </span>
          </div>

        <div class="content-chat">
            <div class="chat chat-in-group" data-chat="${response.groupChat._id}"></div>
        </div>

          <div class="write" data-chat="${response.groupChat._id}">
              <input type="text" class="write-chat chat-in-group" id="write-chat-${response.groupChat._id}" data-chat="${response.groupChat._id}">
              <div class="icons">
                  <a href="#" class="icon-chat" data-chat="${response.groupChat._id}"><i class="fa fa-smile-o"></i></a>
                  <label for="image-chat-${response.groupChat._id}">
                      <input type="file" id="image-chat-${response.groupChat._id}" name="my-image-chat" class="image-chat chat-in-group" data-chat="${response.groupChat._id}">
                      <i class="fa fa-photo"></i>
                  </label>
                  <label for="attachment-chat-${response.groupChat._id}">
                      <input type="file" id="attachment-chat-${response.groupChat._id}" name="my-attachment-chat" class="attachment-chat chat-in-group" data-chat="${response.groupChat._id}">
                      <i class="fa fa-paperclip"></i>
                  </label>
                  <a href="javascript:void(0)" id="video-chat-group">
                      <i class="fa fa-video-camera"></i>
                  </a>
              </div>
          </div>
      </div>
      `;
      $("#screen-chat").prepend(rightSideData);
// render all message////////////////////////////////////////
        //for(let message of response.messages){ 
            response.messages.forEach(function (message) {
                let abc, meOrYou;
                if (message.senderId == response.myId) {
                    meOrYou = "me"
                }else{
                    meOrYou = "you"
                }

                if (message.messageType === "text") {
                    abc = `
                        <div class="bubble ${meOrYou}" data-mess-id="${message._id}">
                                <img src="/images/users/${message.sender.avatar}"
                                class="avatar-small" title="${message.sender.name}">
                                ${message.text}
                        </div>`;
                }else if (message.messageType === "image") {
                    abc = `
                        <div class="bubble ${meOrYou} bubble-image-file" data-mess-id="${message._id}">
                                <img src="/images/users/${message.sender.avatar}"
                                class="avatar-small" title="${message.sender.name}">
                                <img src="data:${message.file.contentType}; base64, ${bufferToBase64(message.file.data.data)}" 
                                class="show-image-chat">
    
                        </div>` 
                    
                }else if (message.messageType === "file") {
                    abc = `
                        <div class="bubble ${meOrYou} bubble-attachment-file" data-mess-id="${message._id}">
                                <img src="/images/users/${message.sender.avatar}"
                                class="avatar-small" title="${message.sender.name}">
                                <a href="data:${message.file.contentType}; base64, ${bufferToBase64(message.file.data.data)}"
                                download="${message.file.fileName}">
                                    ${message.file.fileName}
                                </a>
                        </div>`
                }
    
                $(`div.chat-in-group[data-chat=${response.groupChat._id}]`).append(abc);
    
            })

        // dí vào phóng to ảnh
        zoomImageChat();
        //read more 
        readMoreMessages();

      //step 4: call function changeScreenChat
      changeScreenChat(); 

      //step 5: handle imageModal
      let imageModalData = `
              <div class="modal fade" id="imagesModal_${response.groupChat._id}" role="dialog">
                  <div class="modal-dialog modal-lg">
                      <div class="modal-content">
                          <div class="modal-header">
                              <button type="button" class="close" data-dismiss="modal">&times;</button>
                              <h4 class="modal-title">Những hình ảnh trong cuộc trò chuyện.</h4>
                          </div>
                          <div class="modal-body">
                              <div class="all-images" style="visibility: hidden;"></div>
                          </div>
                      </div>
                  </div>
              </div>
      `;
      $("body").append(imageModalData);

      //step 6: call function gridPhotos
      gridPhotos(5);

      //step 7: handle attachmentModal
      let attachmentModalData = `
          <div class="modal fade" id="attachmentsModal_${response.groupChat._id}" role="dialog">
              <div class="modal-dialog modal-lg">
                  <div class="modal-content">
                      <div class="modal-header">
                          <button type="button" class="close" data-dismiss="modal">&times;</button>
                          <h4 class="modal-title">Những file đính kèm trong cuộc trò chuyện.</h4>
                      </div>
                      <div class="modal-body">
                          <ul class="list-attachments"></ul>
                      </div>
                  </div>
              </div>
          </div>
      `;
      $("body").append(attachmentModalData);

      //step 8: handle membersModal
      let membersModalData = `
              <div class="modal fade" id="membersModal_${response.groupChat._id}" role="dialog">
              <div class="modal-dialog modal-lg">
                  <div class="modal-content">
                      <div class="modal-header">
                          <button type="button" class="close" data-dismiss="modal">&times;</button>
                          <h4 class="modal-title">Những thành viên trong cuộc trò chuyện.</h4>

                          <div class="find-users-to-add-member" data-uid="${response.groupChat._id}">
                              <a href="javascript:void(0)" class="addMembers_Button" id="addMembers_Button_${response.groupChat._id}">
                                  <i class="fa fa-search-plus"></i>
                              </a>
                              <span>
                                  <input type="text" class="form-control input-add-members" id="search-more-friends-${response.groupChat._id}" placeholder="Thêm thành viên" />
                                  <span>
                                      <button class="btn-finished-add-members" id="btn-finished-add-members-${response.groupChat._id}">Xong</button>
                                  </span>
                                  <div id="search-more-friends-results">
                                      <div class="search_more_friends_content" data-uid="${response.groupChat._id}">
                                          <div class="friends-added-more" data-uid="${response.groupChat._id}">
                                              
                                          </div>

                                          <ul id="group-chat-more-friends" data-uid="${response.groupChat._id}">
                                          </ul>
                                      </div>
                                  </div>
                              </span>
                          </div>
                      </div>
                      <div class="modal-body">
                          <ul class="list-members row" data-uid="${response.groupChat._id}" >
                  
                          </ul>
                          <hr>
                          <div class="read-more-notif">
                              <a href="javascript:void(0)">
                                  <strong>Xem thêm</strong> 
                              </a>
                              <div class="read-more-notif-spinner"></div>
                          </div>
                          <hr>
                      </div>
                  </div>
              </div>
          </div>
      `
      $("body").append(membersModalData);

   //////////// render all member////////////////////////////
        for(let member of response.allMembersInfo){ 
            if (member._id == response.myId) {
                let pos = response.allMembersInfo.indexOf(member);
                response.allMembersInfo.unshift(member);
                response.allMembersInfo.splice(pos+1 , 1)
                break;
            }
        }

        response.allMembersInfo.forEach(function (member) {
            let name, btnTalk;
            if (member._id == response.myId) {
                name = `<p class="nameOfMember myName">Tôi</p>`;
                btnTalk =``
            }else{
                name = `<p class="nameOfMember">
                            ${member.username}
                        </p>`;
                btnTalk = `<div class="user-talk btn-talk-member" data-uid="${member._id}">
                                Trò chuyện 
                            </div>`
            }
            let htmlMember = `<div class="membersList col-sm-2" data-uid="${member._id}">
                                    <div class="memberPanel">
                                        <div class="user-avatar">
                                            <img src="images/users/${member.avatar}" alt="">
                                        </div>
                                        <div class="user-name">
                                        <p class="nameOfMember">
                                            ${name}
                                        </p>
                                        </div>
                                        ${btnTalk}
                                    </div>
                                </div>`;
            $(`ul.list-members[data-uid = ${response.groupChat._id}]`).append(htmlMember);
        })

        userTalk();
      
      //step 9: emit when new member đã nhận được a group chat
      socket.emit("newMember-received-group-chat", {groupChatId: response.groupChat._id});

      //step 10:update online
      socket.emit("check-status");
    })

// old members nhận đc response////////////////////////////////////////
  socket.on("response-new-members-added-to-old-member", function (response) {
    response.usersAddedInfo.forEach(function (newMember) {
      let htmlNewMember = `<div class="membersList col-sm-2" data-uid="${newMember._id}">
                            <div class="memberPanel">
                                <div class="user-avatar">
                                    <img src="images/users/${newMember.avatar}" alt="">
                                </div>
                                <div class="user-name">
                                <p class="nameOfMember">
                                  ${newMember.username}
                                </p>
                                </div>
                                <div class="user-talk btn-talk-member" data-uid="${newMember._id}">
                                    Trò chuyện 
                                </div>
                            </div>
                          </div>`;
      $(`ul.list-members[data-uid = ${response.groupChat._id}]`).append(htmlNewMember);
    })

    // update số lượng member
    $(`.tab-pane[data-chat = ${response.groupChat._id}] div.top a.number-members`).find("span.show-number-members").text(response.groupChat.userAmount);

    userTalk();
    
  })