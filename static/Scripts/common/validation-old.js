﻿$(document).ready(function () {
    $('.text-required').on('blur', validationJS.requiredValidation);
    $('.check-phone').on('blur', validationJS.checkPhone);
    $('.check-email').on('blur', validationJS.checkEmail);
    $('.check-password').on('blur', validationJS.checkPassword);
    $('.check-re-password').on('blur', validationJS.checkRePassword);
})

var validationJS = Object.create({
    requiredValidation: function (sender, e) {
        if (!$(this).val()) {
            $(this).addClass('required-border');
            $(this).parent().attr('title', "Thông tin này không được để trống");
            $(this).parent().addClass('wrap-control');
            var nextElement = $(this).next();
            if (!$(nextElement).hasClass('box-required-after')) {
                $(this).after('<div class="box-required-after">*</div>');
            }
            return false;
        } else {
            $(this).removeClass('required-border');
            $(this).next('.box-required-after').remove();
            $(this).parent().removeAttr('title');
            return true;
        }
    },
    showError: function(that, err) {
        $(that).addClass('required-border');
        $(that).parent().attr('title', err);
        $(that).parent().addClass('wrap-control');
        var nextElement = $(that).next();
        if (!$(nextElement).hasClass('error-box')) {
            $(that).after('<div class="error-box"></div>');
        }
    }, 
    hideError: function(that) {
        $(that).removeClass('required-border');
        $(that).next('.error-box').remove();
        $(that).parent().removeAttr('title');
    },
    checkPhone: function (sender, e) {
        let phone = $(this).val();
        let filter_phone = /([(+]*[0-9]+[()+. -]*){8,}$/;
        let that = this;
        if (!phone) {
            return false;
        } else if (!filter_phone.test(phone)) {
            validationJS.showError(that, "Số điện thoại không hợp lệ!");
            return false;
        } else {
            validationJS.hideError(that);
            return true;
        }
    },
    checkEmail: function (sender, e) {
        let email = $(this).val();
        let filter_email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let that = this;
        if (!email) {
            return false;
        } else if (!filter_email.test(email)) {
            validationJS.showError(that, "Email không hợp lệ!");
            return false;
        } else {
            validationJS.hideError(that);
            return true;
        }
    },
    checkPassword: function (sender, e) {
        let password = $(this).val();
        // let filter_pass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/;
        let filter_pass = /^.{8,}$/;
        let that = this;
        if (!password) {
            return false;
        } else if (!filter_pass.test(password)) {
            validationJS.showError(that, "Mật khẩu phải có ít nhất 8 kí tự!");
            return false;
        } else {
            validationJS.hideError(that);
            return true;
        }
    },
    checkRePassword: function (sender, e) {
        let that = this;
        if(!($('#txtPassword').val() === $('#txtRePassword').val())) {
            validationJS.showError(that, "Mật khẩu không trùng khớp!");
            return false;
        } else {
            validationJS.hideError(that);
            return true;
        }
    }
})