let userAvatar = null;
let userInfo = {};
let originAvatarSrc = null;
let originUserInfo = {};
let userUpdatePassword = {};

function callLogout() {
    let timerInternal;
    Swal.fire({
        position: 'top-end',
        // icon: 'success',
        title: 'Tự động đăng xuất sau 5 giây.',
        html: "Thời gian: <strong></strong>",
        timer: 5000,
        onBeforeOpen: () => {
            Swal.showLoading();
            timerInternal = setInterval(() => {
                Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft()/1000);
            }, 1000);
        },
        onClose: () => {
            clearInterval(timerInternal);
        },
      }).then((result) => {
          $.get("/logout", function () {
              location.reload();
          })
      })
}

function updateUserInfo() {
    $("#input-change-avatar").bind("change", function () {
        let fileData = $(this).prop("files")[0]; // lấy dữ liệu ảnh tải lên
        let math = ["image/png", "image/ipg", "image/jpeg"];
        let limit = 1048576; // byte= 1Mb

        if ($.inArray(fileData.type, math) === -1) { // kiểm tra kiểu dữ liệu ảnh có thuộc 1 trong 3 kiểu trong mảng không
            alertify.notify("Kiểu file không hợp lệ!!!", "error", 7);
            $(this).val(null);
            return false;
        }

        if (fileData.size > limit) {
            alertify.notify("Ảnh upload tối đa là 1MB", "error", 7);
            $(this).val(null);
            return false;
        }
        
        if (typeof (FileReader) != "undefined" ) { // cần filereader để hiển thị ảnh, hầu như trình duyệt hiện đại hỗ trợ hết rôi
            let imagePreview = $("#image-edit-profile");
            imagePreview.empty();

            let fileReader = new FileReader();
            fileReader.onload = function(element){
                $("<img>", {
                    "src": element.target.result,
                    "class": "avatar img-circle",
                    "id": "user-modal-avatar",
                    "alt": "avatar",
                }).appendTo(imagePreview);
            }
            imagePreview.show();
            fileReader.readAsDataURL(fileData); // để show ảnh
            
            let formData = new FormData();
            formData.append("avatar", fileData);
            
            userAvatar = formData;

        }else{
            alertify.notify("Trình duyệt của bạn không hỗ trợ FileReader", "error", 7);
        }
        
    });

    $("#input-change-username").bind("change", function() {
        let username = $(this).val();
        let regexUsername = new RegExp(/^[\s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/)
        
        if (!regexUsername.test(username) || username.length < 3 || username.length > 17 ) {
            alertify.notify("Username giới hạn 3-17 ký tự và không được phép chứa ký tự đặc biệt.", "error", 7);
            $(this).val(originUserInfo.username);
            delete userInfo.username; // test thử
            return false;
        }

        userInfo.username = username
    })

    $("#input-change-gender-male").bind("click", function() {
        let gender = $(this).val()

        if (gender !== "male") {
            alertify.notify("Dữ liệu giới tính có vấn đề, bạn là hacker chẳng ? :D", "error", 7);
            $(this).val(originUserInfo.gender);
            delete userInfo.gender; // test thử
            return false;
        }
        userInfo.gender = gender
    })
    // ở phía client( toan bọ code trong public/js/*) thì em viết code giống anh viết trong video nhé, vì mình kh4ng build code trong thư mục public về es5 nen no khong biet arrow function la gi
    $("#input-change-gender-female").bind("click", function() {
        let gender = $(this).val()

        if (gender !== "female") {
            alertify.notify("Dữ liệu giới tính có vấn đề, bạn là hacker chẳng ? :D", "error", 7);
            $(this).val(originUserInfo.gender);
            delete userInfo.gender; // test thử
            return false;
        }
        userInfo.gender = gender
    })

    $("#input-change-address").bind("change", function() {
        let address = $(this).val()

        if (address.length < 3 || address.length > 40) {
            alertify.notify("Địa chỉ giới hạn trong khoảng 3-40 ký tự.", "error", 7);
            $(this).val(originUserInfo.address);
            delete userInfo.address; // test thử
            return false;
        }
        userInfo.address = address
    })

    $("#input-change-phone").bind("change", function() {
        let phone = $(this).val()
        let regexPhone = new RegExp(/^(0)[0-9]{9,10}$/);
        if (!regexPhone.test(phone)) {
            alertify.notify("Số điện thoại Việt Nam bắt đầu bằng số 0, giới hạn trong khoảng 10-11 ký tự.", "error", 7);
            $(this).val(originUserInfo.phone);
            delete userInfo.phone; // test thử
            return false;
        }
        userInfo.phone = phone
    })

    $("#input-change-current-password").bind("change", function() {
        let currentPassword = $(this).val()
        let regexPassword = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/);
        if (!regexPassword.test(currentPassword)) {
            alertify.notify("Mật khẩu ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, chữ số.", "error", 7);
            $(this).val(null);
            delete userUpdatePassword.currentPassword; // test thử
            return false;
        }
        userUpdatePassword.currentPassword = currentPassword;
    })

    $("#input-change-new-password").bind("change", function() {
        let newPassword = $(this).val()
        let regexPassword = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/);
        if (!regexPassword.test(newPassword)) {
            alertify.notify("Mật khẩu ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, chữ số.", "error", 7);
            $(this).val(null);
            delete userUpdatePassword.newPassword; // test thử
            return false;
        }
        userUpdatePassword.newPassword = newPassword;
    })

    $("#input-change-confirm-new-password").bind("change", function() {
        let confirmNewPassword = $(this).val()

        if (!userUpdatePassword.newPassword) {
            alertify.notify("Bạn chưa nhập mật khẩu mới!", "error", 7);
            $(this).val(null);
            delete userUpdatePassword.confirmNewPassword; // test thử
            return false;
        }

        if (confirmNewPassword !== userUpdatePassword.newPassword) {
            alertify.notify("Nhập lại mật khẩu chưa chính xác!", "error", 7);
            $(this).val(null);
            delete userUpdatePassword.confirmNewPassword; // test thử
            return false;
        }
        userUpdatePassword.confirmNewPassword = confirmNewPassword;
    })
}

function callUpdateUserAvatar() {
    $.ajax({
        url: "/user/update-avatar",
        type: "put",
        cache: false,
        contentType: false,
        processData: false,
        data: userAvatar,
        success: function(result) {
            $(".user-modal-alert-success").find("span").text(result.message);
            $(".user-modal-alert-success").css("display", "block");
            
            //update avatar at navbar
            $("#navbar-avatar").attr("src", result.imageSrc);

            //update origin avatar src
            originAvatarSrc = result.imageSrc;
            
            //reset all
            $("#input-btn-cancel-update-user").click();
        },
        error: function(error) {
            $(".user-modal-alert-error").find("span").text(error.responseText);
            $(".user-modal-alert-error").css("display", "block");

            //reset all
            $("#input-btn-cancel-update-user").click();
        },
    })
}

function callUpdateUserInfo() {
    $.ajax({
        url: "/user/update-info",
        type: "put",
        data: userInfo,
        success: function(result) {
            $(".user-modal-alert-success").find("span").text(result.message);
            $(".user-modal-alert-success").css("display", "block");
            
            //update Origin userInfo
            originUserInfo = Object.assign(originUserInfo, userInfo);

            //update username at navbar
            $("#navbar-username").text(originUserInfo.username);
            //reset all
            $("#input-btn-cancel-update-user").click();
        },
        error: function(error) {
            $(".user-modal-alert-error").find("span").text(error.responseText);
            $(".user-modal-alert-error").css("display", "block");

            //reset all
            $("#input-btn-cancel-update-user").click();
        },
    })
}

function callUpdateUserPassword() {
    $.ajax({
        url: "/user/update-password",
        type: "put",
        data: userUpdatePassword,
        success: function(result) {
            $(".user-modal-password-alert-success").find("span").text(result.message);
            $(".user-modal-password-alert-success").css("display", "block");
           
            //reset all
            $("#input-btn-cancel-update-user-password").click();

            //đăng xuất sau khi thay đổi mật khẩu thành công
            callLogout();
        },
        error: function(error) {
            $(".user-modal-password-alert-error").find("span").text(error.responseText);
            $(".user-modal-password-alert-error").css("display", "block");

            //reset all
            $("#input-btn-cancel-update-user-password").click();
        },
    })
}

$(document).ready( function() { // trang web load xong n sẽ lắng nghe những sự kiện bên trong này
    
    originAvatarSrc = $("#user-modal-avatar").attr("src");
    originUserInfo = {
        username: $("#input-change-username").val(),
        gender: ($("#input-change-gender-male").is(":checked")) ? $("#input-change-gender-male").val() : $("#input-change-gender-female").val(),
        address: $("#input-change-address").val(),
        phone: $("#input-change-phone").val(),
    };

    //update userInfo sau khi thay đổi giá trị ở trên
    updateUserInfo();

    $("#input-btn-update-user").bind("click", function() {
        if ($.isEmptyObject(userInfo) && !userAvatar ) {
            alertify.notify("Bạn phải thay đổi thông tin trước khi cập nhập dữ liệu.", "error", 7);
            return false;
        }
        if (userAvatar) {
            callUpdateUserAvatar();
        }
        if (!$.isEmptyObject(userInfo)) {
            callUpdateUserInfo();
        }

    })

    $("#input-btn-cancel-update-user").bind("click", function() {
        userAvatar = null;
        userInfo = {};
        $("#input-change-avatar").val(null);
        $("#user-modal-avatar").attr("src", originAvatarSrc);
        
        $("#input-change-username").val(originUserInfo.username);
        (originUserInfo.gender === "male") ? $("#input-change-gender-male").click() : $("#input-change-gender-female").click();
        $("#input-change-address").val(originUserInfo.address);
        $("#input-change-phone").val(originUserInfo.phone);
    })

    $("#input-btn-update-user-password").bind("click", function() {
        if (!userUpdatePassword.currentPassword || !userUpdatePassword.newPassword ||!userUpdatePassword.confirmNewPassword) {
            alertify.notify("Bạn phải thay đổi đầy đủ thông tin!", "error", 7);
            return false;
        }
        Swal.fire({
            title: 'Bạn có chắc chắn muốn thay đổi mật khẩu?',
            text: "Bạn không thể hoàn tác quá trình này!",
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#2ECC71',
            cancelButtonColor: '#ff7675',
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
          }).then((result) => {
            if (!result.value) {
                $("#input-btn-cancel-update-user-password").click();
                return false;
            }
            callUpdateUserPassword();
          })
        
    })

    $("#input-btn-cancel-update-user-password").bind("click", function() {
        userUpdatePassword = {};
        $("#input-change-current-password").val(null);
        $("#input-change-new-password").val(null);
        $("#input-change-confirm-new-password").val(null);
    })
})