$(document).ready(function(){
	//	debugger
		if(localStorage.getItem("authenCookie") != "" && localStorage.getItem("authenCookie") != null){
			$.ajax({
				method:"GET",
				url: MISA.Config.loginUrl +"/api/home",
				beforeSend: function(xhr) {
					  xhr.setRequestHeader('authorization',localStorage.getItem("authenCookie"));
				},
				success: function(data, txtStatus){
					var dt = JSON.stringify(data);
					console.log(dt.status + dt.email + data);
					if(txtStatus == "success") {
						window.location.href="/home.html";
					}
				},
				error: function(){
					
				}
			})	
		}
		//Check Enter key is pressed
		$('.login-form').keypress(function (e) {
			if (e.which == 13 || e.keyCode == 13)  // the enter key code
			{
				$('#btnLogin').click();
				return false;
			}
		});
	
		//if there no token
		$('#btnLogin').on('click', function(){
			var jsonObj = {"email":$('#txtUserName').val(), "password": $('#txtPassword').val()};
			$.ajax({
				method:"POST",
				url: MISA.Config.loginUrl +"/api/login",
				contentType: "application/json",
				data: JSON.stringify(jsonObj),
				success: function(data, txtStatus, xhr){
					if(txtStatus=="success") 
						{
							localStorage.setItem("authenCookie", data.token);
							$.ajax({
								method:"GET",
								url: MISA.Config.loginUrl + "/api/home",
								beforeSend: function(xhr) {
								  xhr.setRequestHeader('authorization',localStorage.getItem("authenCookie"));
								}
							})
							.done(function(data, txtStatus,xhr){
								 if(txtStatus == "success") {
									 window.location.href="/home.html";
									 console.log(data);	
								 }
							})
						}
				},
				error: function(){
					commonJS.showFailMsg("Sai tên tài khoản hoặc mật khẩu!");
				}
			
				
			})
		})
	})
	
	$('#btnRegister').click(function(){
		window.location.href="/register.html";
	})
	
	
	function noticeAlert(stt, mes){
		//1 = success, 2 = error
		if(stt == 0) {
			$('#statusField').css("display","block");
			$('#statusField').css("background-color","red");
			$('#statusField').css("font-color","black");
			$('#statusField').text(mes);
			setTimeout(function(){$('#statusField').fadeOut(2000)}, 1000);
		}
		else if(stt == 1){
			$('#statusField').css("display","block");
			$('#statusField').css("background-color","green");
			$('#statusField').html(mes);
			setTimeout(function(){$('#statusField').fadeOut(2000)}, 1000);	
		}
	
	
	}
	