$(document).ready(function () {
    $('#header').on('click', '.header-user-info', headerJS.userInfo_OnClick);
    $('#header').on('click', '.user-menu-item', headerJS.userMenuItem_OnClick);
})


var headerJS = Object.create({
    userInfo_OnClick: function () {
        $(this).find('.user-menu-box').toggle();
        event.stopPropagation();
    },
    userMenuItem_OnClick: function () {
        var command = $(this).attr('command');
        switch (command) {
            case "ChangePassword":
                commonJS.showNotice("Tính năng này đang xây dựng");
                break;
            case "Logout":
                // commonJS.showNotice("Tính năng này đang xây dựng");
                localStorage.setItem("authenCookie","");
                window.location.href="/";
                break;
            default:
        }
    }
})