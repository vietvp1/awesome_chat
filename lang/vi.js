export const transValidation = {
    email_incorrect : "Email phải có dạng example@vietanhdev.com",
    gender_incorrect : "Giới tính có vấn đề :D",
    password_incorrect : "Mật khẩu ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, chữ số.",
    password_confirmation_incorrect : "Nhập lại mật khẩu không chính xác",
    update_username: "Username giới hạn 3-17 ký tự và không được phép chứa ký tự đặc biệt.",
    update_gender: "Dữ liệu giới tính có vấn đề, bạn là hacker chẳng ? :D",
    update_address: "Địa chỉ giới hạn trong khoảng 3-40 ký tự.",
    update_phone: "Số điện thoại Việt Nam bắt đầu bằng số 0, giới hạn trong khoảng 10-11 ký tự.",
    keyword_find_user: "Lỗi từ khóa tìm kiếm.",
    message_text_emoji_incorrect: "Tin nhắn không hợp lệ. Đảm bảo tối thiểu 1 ký tự, tối đã 400 ký tự.",
    add_new_group_users_incorrect: "Một nhóm tối thiểu phải có 3 người, vui lòng chọn thêm bạn bè để thêm vào nhóm.",
    add_new_group_name_incorrect: "Vui lòng nhập tên cuộc trò chuyện, giới hạn 5-30 ký tự và không chứa các ký tự đặc biệt."
}

export const transErrors = {
    account_undefined: "Tài khoản này không tồn tại.",
    account_in_use: "Email đã được sử dụng!",
    account_removed: "Tài khoản này đã bị vô hiêu hóa",
    account_not_active: "Tài khoản đã được đăng ký nhưng chưa kích hoạt!",
    token_undefined: "Token không tồn tại!",
    login_failed: "Sai tài khoản hoặc mật khẩu!",
    server_error: "Có lỗi ở phía server, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi để báo cáo lỗi này!",
    avatar_type: "Kiểu file không hợp lệ!",
    avatar_size: "Ảnh tối ta cho phép là 1MB!",
    user_current_password_failed:  "Mật khẩu hiện tại không chính xác.",
    conversation_not_found: "Cuộc trò chuyện không tồn tại",
    image_message_type: "Kiểu file không hợp lệ!",
    image_message_size: "Ảnh tối ta cho phép là 1MB!",
    attachment_message_size: "Tệp tin đính kèm tối ta cho phép là 1MB!",

}

export const transSuccess = {
    userCreated: (userEmail) =>{
        return `Tài khoản <strong>${userEmail}</strong> đã được tạo, kiểm tra email để kích hoạt tài khoản của bạn!` 
    },
    account_actived: "Kích hoạt tài khoản thành công, bạn đã có thể đăng nhập ứng dụng!",
    loginSuccess: (username) => {
        return `Xin chào ${username}, chúc bạn một ngày tốt lành!`
    },
    logout_success: "Đăng xuất tài khoản thành công!",
    user_info_updated: "Cập nhập thông tin người dùng thành công.",
    user_password_updated: "cập nhập mật khẩu thành công."
}

export const transMail = {
    subject: "Awesome Chat: Xác nhận kích hoạt tài khoản!",
    template: (linkVerify) => {
        return `
            <h2>Bạn nhận được email này vì đã đăng ký tài khoản trên ứng dụng Awesome Chat.</h2>
            <h3>Vui lòng click vào liên kết bên dưới để xác nhận kích hoạt tài khoản!</h3>
            <h3><a href = "${linkVerify}" target ="blank" >${linkVerify}</a></h3>
            <h4>Nếu tin rắng email này là nhầm lẫn, hãy bỏ qua nó. Trân trọng!!!</h4>
        `
    },
    send_failed: "Có lỗi trong quá trình gửi email, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi,",

}