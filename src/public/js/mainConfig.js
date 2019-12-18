/**
 * Created by https://trungquandev.com's author on 25/02/2018.
 */

const socket = io();

//all-chat nineScroll
function nineScrollLeftAllChat() {
  $('#all-chat').niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
}
function resizeNineScrollLeftAllChat() {
  $("#all-chat").getNiceScroll().resize();
}

//users chat scroll
function nineScrollLeftUsersChat() {
  $('#user-chat').niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
}
function resizeNineScrollLeftUsersChat() {
  $("#user-chat").getNiceScroll().resize();
}

//group chat scroll
function nineScrollLeftGroupChat() {
  $('#group-chat').niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
}
function resizeNineScrollLeftGroupChat() {
  $("#group-chat").getNiceScroll().resize();
}

function nineScrollRight(divId) {
  $(`.right .chat[data-chat = ${divId}]`).niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
  $(`.right .chat[data-chat = ${divId}]`).scrollTop($(`.right .chat[data-chat = ${divId}]`)[0].scrollHeight);
}

function enableEmojioneArea(divId) {
  $(`#write-chat-${divId}`).emojioneArea({
    standalone: false,
    pickerPosition: 'top',
    filtersPosition: 'bottom',
    tones: false,
    autocomplete: false,
    inline: true,
    hidePickerOnBlur: true,
    search: false,
    shortnames: false,
    events: {
      keyup: function(editor, event) {
        // gán giá trị thay đổi vào thẻ input đã bị ẩn
        $(`#write-chat-${divId}`).val(this.getText());
      },
      click: function () {
        //bật lắng nghe DOM cho việc chat tin nhắn văn bản + emoji
        textAndEmojiChat(divId);
        //bật chức năng người dùng đang gõ trò chuyện
        typingOn(divId);
      },
      blur: function () {
        typingOff(divId);
      }
    },
  });
  $('.icon-chat').bind('click', function(event) {
    event.preventDefault();
    $('.emojionearea-button').click();
    $('.emojionearea-editor').focus();
  });
}

function spinLoaded() {
  $('.master-loader').css('display', 'none');
}

function spinLoading() {
  $('.master-loader').css('display', 'block');
}

function ajaxLoading() {
  $(document)
    .ajaxStart(function() {
      spinLoading();
    })
    .ajaxStop(function() {
      spinLoaded();
    });
}

function showModalContacts() {
  $('#show-modal-contacts').click(function() {
    $(this).find('.noti_contact_counter').fadeOut('slow');
  });
}

function configNotification() {
  $('#noti_Button').click(function() {
    $('#notifications').fadeToggle('fast', 'linear');
    $('.noti_counter').fadeOut('slow');
    return false;
  });
  $(".main-content").click(function() {
    $('#notifications').fadeOut('fast', 'linear');
  });
}

function gridPhotos(layoutNumber) {
  $(".show-images").unbind("click").on("click" , function () {
    let href = $(this).attr("href");
    let modalImagesId = href.replace("#", "")

    let originDataImage = $(`#${modalImagesId}`).find("div.modal-body").html();

    let countRows = Math.ceil($(`#${modalImagesId}`).find('div.all-images>img').length / layoutNumber);
    let layoutStr = new Array(countRows).fill(layoutNumber).join("");
    
    $(`#${modalImagesId}`).find('div.all-images').photosetGrid({
      highresLinks: true,
      rel: 'withhearts-gallery',
      gutter: '2px',
      layout: layoutStr,
      onComplete: function() {
        $(`#${modalImagesId}`).find('.all-images').css({
          'visibility': 'visible'
        });
        $(`#${modalImagesId}`).find('.all-images a').colorbox({
          photo: true,
          scalePhotos: true,
          maxHeight: '90%',
          maxWidth: '90%'
        });
      }
    });

    //bắt sự kiện đóng modal
    $(`#${modalImagesId}`).on('hidden.bs.modal', function () {
      $(this).find("div.modal-body").html(originDataImage);
    })

  })
  
}

function flashMasterNotify() {
  let notify = $(".master-success-message").text();
  if (notify.length) {
    alertify.notify(notify, "success", 7);
  }
}

function changeTypeChat() {
  $("#select-type-chat").bind("change", function () {
    let optionSelected = $("option:selected", this);
    optionSelected.tab("show");

    resizeNineScrollLeftUsersChat();
    if ($(this).val() === "user-chat") {
      $(".create-group-chat").hide();
      
    }else{
      
      $(".create-group-chat").show();
    }

  })
}

function changeScreenChat() {
  $('.room-chat').unbind("click").on("click", function () {
    let divId = $(this).find("li").data("chat");

    $(".person").removeClass("active")
    $(`.person[data-chat = ${divId}]`).addClass("active")
    $(this).tab("show")
    // cấu hình thanh cuộn bên box chat rightSide.js mỗi khi click chuột vào 1 cuộc trò chuyện cụ thể
    nineScrollRight(divId);

    // Bật emoji, tham số truyền vào là id của box nhập nội dung tin nhắn
    enableEmojioneArea(divId);

    // Bật lắng nghe dom cho việc nhắn tin nhắn hình ảnh
    imageChat(divId);

    // Bật lắng nghe dom cho việc nhắn tin nhắn file
    attachmentChat(divId);

    // Bật lắng nghe dom cho việc video chat
    videoChat(divId);

    //icon add more member
    configAddMembersInGroup(divId);

    findMoreFriendsToAddGroup(divId);

    readMoreMembers(divId);
  })
}

function bufferToBase64(buffer) {
  return btoa(
      new Uint8Array(buffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
}

function zoomImageChat() {
  let abc = `
    <div id="img-chat-modal">
        <span class="close">&times;</span>
        <img id="img-chat-modal-content">
    </div>
  `
  $(".show-image-chat").unbind("click").on("click", function () {
    $(this).parent().append(abc)
    $(this).parent().find("div").css("display", "block");
    $(this).parent().find("div img").attr("src", $(this)[0].src);

    $(this).parent().find("div").on("click", function () {
      $(this).remove();
    })
  })
}
  
function userTalk() {
  $(".user-talk").unbind("click").on("click", function () {
    let dataChat = $(this).data("uid");
    $("ul.people").find(`a[href="#uid_${dataChat}"]`).click();
    $(this).closest("div.modal").modal("hide");
  })
}



$(document).ready(function() {
  // Hide số thông báo trên đầu icon mở modal contact
  showModalContacts();

  // Bật tắt popup notification
  configNotification();

  // Cấu hình thanh cuộn
  nineScrollLeftAllChat();
  resizeNineScrollLeftAllChat();
  
  nineScrollLeftUsersChat();
  nineScrollLeftGroupChat();

  // Icon loading khi chạy ajax
  ajaxLoading();

  // Hiển thị hình ảnh grid slide trong modal tất cả ảnh, tham số truyền vào là số ảnh được hiển thị trên 1 hàng.
  // Tham số chỉ được phép trong khoảng từ 1 đến 5
  gridPhotos(5);

  // flash message ở màn hình master
  flashMasterNotify();

  //thay đổi kiểu trò chuyện
  changeTypeChat();

  //thay đổi màn hình chat
  changeScreenChat();

  //click vào từng ảnh tron cuộc trò chuyện thì phóng to ảnh lên
  zoomImageChat();

  //click vào trò chuyện trong modal contact thì di chuyển đến cuộc trò chuyện
  userTalk();


  //click vào phần tử đầu tiên khi load trang web
  if ($("ul.people").find("a").length) {
    $("ul.people").find("a")[0].click();
  }

  if (!$("div.people").find("a").length) {
    Swal.fire({
      title: 'Bạn chưa có bạn bè, hãy tìm kiếm bạn bè để trò chuyện?',
      type: 'info',
      showCancelButton: false,
      confirmButtonColor: '#2ECC71',
      confirmButtonText: 'Xác nhận',  
    }).then((result) => {
      $("#contactsModal").modal("show");
    })
  }

  $("#video-chat-group").bind('click', function () {
    alertify.notify("Không khả dụng tính năng này với nhóm trò chuyện, thử lại với trò chuyện cá nhân.", "error" , 7);
  })
});
