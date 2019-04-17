$(document).ready(function(){
		if(localStorage.getItem("authenCookie") != "" && localStorage.getItem("authenCookie") != null){
			$.ajax({
				method: "GET",
				url:MISA.Config.loginUrl+"/api/home",
				beforeSend: function(xhr) {
				      xhr.setRequestHeader('authorization',localStorage.getItem("authenCookie"));
				},
				success: function(data, status, xhr){
					$('#user-info').text((data.email).split("@")[0]);
					//ajax goi company
					$.ajax({
						method:"GET",
						url:MISA.Config.loginUrl+"/api/getCompanyUser",
						beforeSend: function(xhr){
							xhr.setRequestHeader('authorization',localStorage.getItem("authenCookie"));
						},
						success: function(data){
							console.log(data);	
							appendCompany(data);
							initGoToWorkspaceOncClickEvent();
							
						},
						error: function(err){
							console.log("chua co cong ty nao");
						}
					})
				},
				error: function(err, stt, xhr){
					window.location.href="/";
				}
			})	
		}
		else{
			window.location.href="/";
		}
	//get Enter addBtn
	$('#tb-company-add').keypress(function (e) {
		if (e.which == 13 || e.keyCode == 13)  // the enter key code
		{
			$('#addBtn').click();
			return false;
		}
	});
})

//add more company
//lúc ấn vào button thêm sẽ gửi về server. 
$('#addBtn').click(function(){
	var comData = {"companyName": $('#companyName').val(),
					"address":$('#companyAddress').val(),
					"companyTaxNumber":$('#companyTaxNumber').val()};
	console.log(comData.companyName);
	let totalCompany = Number(localStorage.getItem("totalCompany"));
	$
	$.ajax({
		method: "POST",
		url: MISA.Config.loginUrl+"/api/addCompany",
		contentType:"application/json",
		beforeSend: function(xhr) {
			xhr.setRequestHeader("authorization", localStorage.getItem("authenCookie"));
		},
		data: JSON.stringify(comData),
		success: function(data, txtStatus, xhr){
			console.log(xhr.status);
			if(xhr.status == 200){
				localStorage.setItem("totalCompany", Number(totalCompany) + Number(1));
				noticeAlert(1, "Thêm công ty làm việc thành công!");
				$('#tb-company tbody').append(
	                    '<tr>'    
	                        +'<td>' + (totalCompany + 1) + '</td>'
	                        +'<td>' + comData.companyName + '</td>'
	                        +'<td style="display: none;">' + comData.companyTaxNumber + '</td>'
	                        +'<td>'
	                            +'<button type="button" class="btn btn-primary goToWorkspace">'
	                                +'Đi đến không gian làm việc'
	                            +'</button>'
	                            +'<button type="button" class="btn btn-warning" id="editCompany">'
	                                +'Chỉnh sửa thông tin'
	                            +'</button>'
	                        +'</td>'
	                    +'</tr>')
	              initGoToWorkspaceOncClickEvent();
			}
		},
		error: function(data, txtStatus, xhr){
			if(data.status == 406){
				noticeAlert(0, "Cá nhân đã làm cho công ty này!");
			}
			if(data.status == 200){
				noticeAlert(0, "xảy ra lỗi khi thêm chứng từ!");
			}
		}
	})
})


//go to work space

//init  event for goToWorkspace
function initGoToWorkspaceOncClickEvent(){
		$('.goToWorkspace').on('click', function(){
			var workCompanyId = $(this).parents('tr').find("td:eq(2)").text();
			console.log(workCompanyId);
			localStorage.setItem("workCompanyID", workCompanyId);
			console.log(localStorage.getItem("workCompanyID"));
			window.location.href="/rae.html";
		})
}

//logout
$('#btnLogout').click(function(){
	localStorage.setItem("authenCookie","");
	window.location.href="/";
})

//add company popup
//$('#btnAdd').click(function(){
//	$('#popupAdd').show();
//})

$(document).ready(function () {
    $(document).click(function () {
        var target = event.target;
        if (!$(target).hasClass('hide-if-outside')) {
            $('.hide-if-outside').hide();
        }
    })
});

$('#btnAdd').click(function(){
	$('.add-section').show('fast');
	$('#btnAdd').hide();
})

$('#cancelBtn').click(function(){
	$('.add-section').hide('slow');
	$('#btnAdd').show();
})
//alert

//append function

function appendCompany(data){
	var index = 1;
	var i=0;
	while(data[i] != null){
		$('#tb-company tbody').append(
                    '<tr>'    
                        +'<td>' + index + '</td>'
                        +'<td>' + data[i].companyName + '</td>'
                        +'<td style="display: none;">' + data[i].companyTaxNumber + '</td>'
                        +'<td>'
                            +'<button type="button" class="btn btn-primary goToWorkspace">'
                                +'Đi đến không gian làm việc'
                            +'</button>'
                            +'<button type="button" class="btn btn-warning" id="editCompany">'
                                +'Chỉnh sửa thông tin'
                            +'</button>'
                        +'</td>'
                    +'</tr>')
		i = i + 1;
		index++;
	}
	localStorage.setItem("totalCompany", i);
}

function noticeAlert(stt, mes){
	//1 = success, 2 = error
	if(stt == 0) {
		commonJS.showFailMsg(mes);
	}
	else if(stt == 1){
		commonJS.showSuccessMsg(mes);
	}
}
