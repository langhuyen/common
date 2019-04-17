$(document).ready(function () {
    $('#btnRegister').on('click', loginJS.doRegister);
    // $('#txtContactMobile').keydown(function(){
    //     return commonJS.isNumberKey(EventTarget);
    // })
    //Check Enter key is pressed
    $('#formRegister').keypress(function (e) {
        if (e.which == 13 || e.keyCode == 13)  // the enter key code
        {
            $('#btnRegister').click();
            return false;
        }
    });
})

function checkEmpty(){
    if ( ($('#txtContactMobile').val() === "") || ($('#txtContactEmail').val() === "") || ($('#txtPassword').val() === "") || ($('#txtRePassword').val() === "") ) 
        return false;
    else return true;
}

function checkPhone(sender, e) {
    let phone = sender.val();
    let filter_phone = /([(+]*[0-9]+[()+. -]*){8,}$/;
    let that = this;
    if (!phone) {
        return false;
    } else if (!filter_phone.test(phone)) {
        validationJS.showError(sender, "Số điện thoại không hợp lệ!");
        
        return false;
    } else {
        validationJS.hideError(sender);
        return true;
    }
}

function checkEmail(sender, e) {
    let email = sender.val();
    let filter_email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let that = this;
    if (!email) {
        return false;
    } else if (!filter_email.test(email)) {
        validationJS.showError(sender, "Email không hợp lệ!");
        return false;
    } else {
        validationJS.hideError(sender);
        return true;
    }
}

function checkPassword(sender, e) {
    let password = sender.val();
    // let filter_pass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/;
    let filter_pass = /^.{8,}$/;
    let that = this;
    if (!password) {
        return false;
    } else if (!filter_pass.test(password)) {
        validationJS.showError(sender, "Mật khẩu phải có ít nhất 8 kí tự!");
        return false;
    } else {
        validationJS.hideError(sender);
        return true;
    }
}

function checkRePassword(sender, e) {
    if(!($('#txtPassword').val() === $('#txtRePassword').val())) {
        validationJS.showError(sender, "Mật khẩu không trùng khớp!");
        return false;
    } else {
        validationJS.hideError(sender);
        return true;
    }
}

function checkValid() {
    if ( checkPhone($('#txtContactMobile')) && checkEmail($('#txtContactEmail')) && checkPassword($('#txtPassword')) && checkRePassword($('#txtRePassword')) && checkEmpty() ){
        return true;
    } else return false;
}

/**
 * Object JS phục vụ cho trang Login
 */
var loginJS = Object.create({
    /*
     * Hàm xử lý khi nhấn Button Đăng ký
     * Created by: NVMANH (28/12/2018) 
     * */
    doRegister: function () {
        //Check if is valid
        if (checkValid()){
            var jsondata = {contactMobile: $('#txtContactMobile').val(), 
                    contactEmail: $('#txtContactEmail').val(), 
                    password: $('#txtPassword').val()};
            $.ajax({
                method:"POST",
                url: MISA.Config.loginUrl+"/api/register",
                contentType:"application/json",
                data: JSON.stringify(jsondata),                     
                success: function(data, textStatus, xhr){
                    $('#register-error').hide();
                    if(textStatus=="success") {
                        noticeAlert(1,"Đăng kí thành công. Đang chuyển tới trang đăng nhập!");
                        // commonJS.showSuccessMsg("Đăng kí thành công!Chuyển tới đăng nhập!");
                        setTimeout(function(){
                            window.location.href="/";
                        }, 2000)
                        
                    }
                },
                error: function(data, txtStatus, xhr){
                    if(data.status == 409){
                        $('#register-error').html("<li>Tài khoản đã tồn tại!</li>");
                        $('#register-error').addClass('red-color');
                    }    
                    else {
                        $('#register-error').html("<li>Lỗi đăng kí. Vui lòng thử lại</li>");
                        $('#register-error').addClass('red-color');
                    }
                        
                }
                        
            });
        } else {
            $('#register-error').html("<li>Lỗi đăng kí. Vui lòng thử lại!</li>");
            $('#register-error').addClass('red-color');
        }
    }
})

function noticeAlert(stt, mes){
	//1 = success, 2 = error
	if(stt == 0) {
		commonJS.showFailMsg(mes);
	}
	else if(stt == 1){
		commonJS.showSuccessMsg(mes);
	}
}