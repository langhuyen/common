/* Version 09/03/2019*/
$(document).ready(function(){
    if(localStorage.getItem("authenCookie") != "" && localStorage.getItem("authenCookie") != null){
        $.ajax({
            method: "GET",
            url:MISA.Config.loginUrl+"/api/home",
            beforeSend: function(xhr) {
                  xhr.setRequestHeader('authorization',localStorage.getItem("authenCookie"));
            },
            success: function(data, status, xhr){
                $('.user-info').text((data.email).split("@")[0]);
                //ajax goi company
            },
            error: function(err, stt, xhr){
                window.location.href="/";
            }
        })  
    }
    else{
            window.location.href="/";
        }
        
    })
    $('.toolbar-item').click(function(){
        getCustomerDetail();
    });
   
    $('#addtr').on('keydown', function() {
        if (event.keyCode === 13) {
            $('#addtr').trigger('click');
            }
    })
    /*----------------------------------------------------------------------
     * Tính năng thay đổi cách filter
     * Created by NVLAM (27/02/2019)
     */
    $('.btn-select-filter').click(function() {
        if ($(this).html() == "&gt;=") {
            $(this).html("&lt;=");
        } else $(this).html("&gt;=");
        filterFunc();
    })
    $('#addtr').on('click', function(){
        //them moi status =3
        $('#tbodyRAEDetail-popup').append(`<tr indexInvoice="${indexInvoiceGlobal}" statusInvoice="3">`
        +'<td style="display:flex"><button style="" role="removeInvoice" class="btn btn-danger">x</button><input style="margin-left: 5px;"></td>'
        +'<td><input></td>'
        +'<td><input></td>'
        +'<td class="text-right"><input></td>'
        +'<td><input></td>'
        +'<td><input></td>'
        +'<td><input></td>'
        +'<td><input></td>'
        +'</tr>');
        $('button[role="removeInvoice"]').on('click', function(){
            //danh dau xoa phan biệt với invoice từ server xóa bằng cách xem xet refID và status=2 
            var index=$(this).parents('tr').attr("indexInvoice");
        invoicesGlobal[index].status=2;//danh dau bi xoa
        $(this).parents('tr').remove();
    });
        $('#tbodyRAEDetail-popup').children().last().children().first().children().last().focus();
        //them moi vao 
        indexInvoiceGlobal++;
        var voiceNew = {
            "refDetailID": "",
            "discription": "",
            "amountOC": 0,
            "amount": 0,
            "accountObjectID": "",
            "sortOrder": 0,
            "status": 3
        }
        invoicesGlobal.push(voiceNew);
        var addtrPosition = $('#addtr').position().top + $('#addtr').height() + 27;
        var $table = $('#frmRAEDetail .rae-detail-box');
        var tableHeight = $table.height();
        var currentScroll = $table.scrollTop();
        if (addtrPosition > tableHeight) {
            var scrollAmount = addtrPosition - tableHeight + 27;
            $('#frmRAEDetail .rae-detail-box').scrollTop(currentScroll + scrollAmount);
        }
    })
    $('.fa-calendar-alt').click(function(){ 
        $(this).siblings().first().focus();
    })
        // $( "#txtAccountObjectCode").autocomplete({
            //     source: dataResource.AccountObject.AccountObjectCode
            // });

    var fakeData = [];
    var totalRecord = 0;
    var totalPage = 0;
    var endRecord = 0;
    var startRecord = 1;
    var indexInvoiceGlobal=0;
    //invoicesGlobal chứa dữ liệu của server
    var invoicesGlobal=[];
    var RefUpdate={};
    var raeDate = new DateControll();

    /////////////
    /*
        showDetail()
        This function show Detail box for add, edit, duplicate Expense or Receipt Ref
    */

var showDetail=function(){
    var RAEDetail=[];
    //vị trí bản ghi trong sessionStorage
    var indexRef= $('.rowSelected').attr("indexref");
    var refData=JSON.parse(sessionStorage.getItem("detailRef"));            //get array of ref
    if(indexRef == null) return;
    var raeRef=refData[parseInt(indexRef)];                                 //get ref based on index
    if(raeRef.invoices==null) return;
    var invoices=raeRef.invoices;
    // Lấy Detail từ Service:
    invoices.forEach(function(invoice){
        var detail = {
            JournalMemo:invoice.discription,                                //Diễn giải
            CreditAmount: invoice.amount,                                   //TK Có
            DebitAmount: 0,                                                 //TK Nợ
            TotalAmount: invoice.amountOC,                                  //Số tiền
            AccountObject: raeRef.accountObjectID,                          //Mã đối tượng (CTY MISA)
            AccountObjectName: raeRef.accountObjectName,                    //Tên đối tượng (Công ty cổ phần MIS)
            DepartmentName: raeRef.accountObjectAddress,                        //Đơn vị
            StatisCode: "Mã thống kê",                                      //Mã thống kê
        } 
        RAEDetail.push(detail);
    })

    // Buid dữ liệu Detail:
    var tbody = $('#tbodyRAEDetail');
    tbody.html('');

    // Lấy thông tin các cột dữ liệu:
    var column = $('table#tblRAEDetail .gridHeader th');
    var rowTemplate = [];
    var fieldData = [];
    rowTemplate.push('<tr class="{0}">');
    column.each(function (index, item) {
        fieldData.push($(item).attr('fieldData'));
    })
    RAEDetail.forEach(function (item, index) {
        var htmlItem = [];
        htmlItem.push('<tr class="{0}">'.format(index % 2 === 0 ? '' : 'row-highlight'));
        fieldData.forEach(function (valueField, indexField) {
            if (indexField === 0) {
                htmlItem.push('<td class="no-border-left" >{0}</td>'.format(item[valueField]));
            } else if (indexField === 1 || indexField === 7){
                htmlItem.push('<td class="no-border-left" >{0}</td>'.format(item[valueField]));
            } else if (indexField === 3) {
                htmlItem.push('<td class="text-right" >{0}</td>'.format(Number(item[valueField]).formatMoney()));
            }
            else {
                htmlItem.push('<td>{0}</td>'.format(item[valueField]));
            }
        })
        htmlItem.push('</tr>');
        tbody.append(htmlItem.join(""));
    });
}

/*
    getPageHome()
    This function is for Home Paging 25 50 100
    //Hàm láy trả về size bản ghi đầu tiên và tổng số bản ghi có
    //This function return fakeData to buildDataIntoTable() func. Change attributes in fakeData to change info displayed in Table Master
*/

var getPageHome = function() {
    // code ajax
    fakeData=[];
	var page = $('#currentPage').val();
    var size = $('#inputTotalRecord').val();
    commonJS.showMask($('.frmCustomerList'));
	$.ajax({
		method : "GET",
		url : MISA.Config.paymentUrl + "/getAllPage_Size:" + size,
		beforeSend : function(xhr) {
			xhr.setRequestHeader('authorization', localStorage
                    .getItem("authenCookie"));
            xhr.setRequestHeader("keycompany", localStorage.getItem("workCompanyID"));
        },
        async:false,
		success : function(result, txtStatus) {
			totalRecord = result.totalRecord;
			if (totalRecord == 0) {
				$("#totalRecord").html("0");
				$("#totalPage").html("0");
				$('#startRecord').html("0");
				$('#endRecord').html("0");
				commonJS.hideMask($('.frmCustomerList'));
				return;
            }
            var payment = result.data;
            //lưu dữ liệu dưới 
            sessionStorage.setItem("detailRef", JSON.stringify(payment));
			for (var i = 0; i < payment.length; i++) {
				fakeData.push({
					ID : payment[i].refID,
					PostedDate : raeDate.convertDate(payment[i].postedDate),                    
					RefDate : raeDate.convertDate(payment[i].refDate),
					RefNo : payment[i].refNoFinance,
					JournalMemo : payment[i].journalMemo,                               //Diễn giải   ??? What JournalMemo
					RefTypeName : payment[i].ref.refTypeName,
					TotalAmount : payment[i].totalAmountOC,                             //Số tiền    
					AccountObjectName : payment[i].accountObjectName,
					ReasonTypeName : payment[i].journalMemo,                            //Lý do thu/chi
					CashBookPostedDate : raeDate.convertDate(payment[i].createdDate),
                    RefNoFiance : payment[i].refNoFinance,
                    IsPostedFinance : payment[i].isPostedFinance,
					DepartmentName : payment[i].accountObjectAddress
				})
            }
			endRecord = 0;
			startRecord = 1;
			if (totalRecord == 0) {
				totalPage = 1;
				startRecord = 0;
			} else if (totalRecord % size == 0) {
				totalPage = parseInt(totalRecord / size);
			} else {
				totalPage = parseInt(totalRecord / size) + 1;
			}
			if (size > totalRecord) {
				endRecord = totalRecord;
			} else
				endRecord = size;
            $("#totalPage").html(totalPage);
			$('#startRecord').html(startRecord);
			$('#endRecord').html(endRecord);
            $("#totalRecord").html(totalRecord);
            setTimeout(function () {
                commonJS.hideMask($('.frmCustomerList'));
            }, 300);
		},
		error: function(){
			commonJS.hideMask($('.frmCustomerList'));
		}
	})
}

/*
    getPage()
    This function is for Paging from users input or button next page
*/

var getPage = function() {
    
	totalPage = 0;
	// code ajax
	fakeData = [];
    var page = $('#currentPage').val();
    var size = $('#inputTotalRecord').val();
    commonJS.showMask($('.frmCustomerList'));
	$.ajax({
		method : "GET",
		url : MISA.Config.paymentUrl + "/getPage/page:" + page + "_size:" + size,
		beforeSend : function(xhr) {
			xhr.setRequestHeader('authorization', localStorage
                    .getItem("authenCookie"));
            xhr.setRequestHeader("keycompany", localStorage.getItem("workCompanyID"));
        },
        async:false,
		success : function(result, txtStatus) {
			var payment = result;
            sessionStorage.setItem("detailRef", JSON.stringify(payment));
			for (var i = 0; i < result.length; i++) {
				fakeData.push({
					ID : payment[i].refID,
					PostedDate : raeDate.convertDate(payment[i].postedDate),
					RefDate : raeDate.convertDate(payment[i].refDate),
					RefNo : payment[i].refNoFinance,
					JournalMemo : payment[i].journalMemo,
					RefTypeName : payment[i].ref.refTypeName,
					TotalAmount : payment[i].totalAmountOC,
                    AccountObjectName : payment[i].accountObjectName,
                    IsPostedFinance : payment[i].isPostedFinance,
					ReasonTypeName : payment[i].journalMemo,
					CashBookPostedDate : raeDate.convertDate(payment[i].createdDate),
					RefNoFiance : payment[i].refNoFinance,
					DepartmentName : payment[i].accountObjectName
				})
			}
			startRecord = size * (page - 1) + 1;
			if (size * page >= totalRecord) {
				endRecord = totalRecord;
			} else
				endRecord = size * (page);
			$('#startRecord').html(startRecord);
            $('#endRecord').html(endRecord);
            setTimeout(function () {
                commonJS.hideMask($('.frmCustomerList'));
            }, 300)
		}
	})
}

/** Notes:
 *  //editMode = 1 : Adding Mode (clear detail table)
    //editMode = 2 : Editing Mode (send request to get data and build form)
    //editMode = 3 : Duplicating Mode
    //RefType = 1 Receipt ,= 2 Expense
 */

class ReceiptsAndExpensesJS {
    constructor() {
        this.RefType = null;
        this.initDetailForm();
        this.initEvents();
        this.loadData();
        this.me = this;
        this.editMode = null;
        
    };
    /*
     * Thiết lập form chi tiết
     */
    initDetailForm() {
        this.DetailForm = new FormPopup('#frmRAEDetail', 800, null, true, this);
    };

    initEvents() {
        /////handle click from users
        $('#tblCustomerList').on('click', { scope: '#tbodyRAE tr' }, this.rowRAE_OnClick.bind());
        $(document).on('dblclick', '#tbodyRAE tr', {},  this.rowRAE_OnDblClick.bind(this));
        //$('#tblCustomerList').on('click', { scope: '#btnAdd' }, this.btnAdd_OnClick.bind(this));
        //$('#btnAdd').click(this.btnAdd_OnClick.bind(this));
        $(document).on('keydown',this.keyDownRowSelect.bind(this));
        /////handle button on toolbar-body (Toolbar on Table Master)
        $('#btnAddReceipt').on('click', { refType: enumeration.RefType.Receipt }, this.btnAdd_OnClick.bind(this));
        $('#btnAddEx').on('click', { refType: enumeration.RefType.Expense }, this.btnAdd_OnClick.bind(this));
        $('#frmRAEDetail').on('keyup',this.dialog_OnKeyDown.bind(this));
        // $(document).on('click', '#btnPrevious', this.btnPrevious_OnClick.bind(this));
        // $(document).on('click', '#btnNext', this.btnNext_OnClick.bind(this));
        // $(document).on('click', '#btnSave', this.btnSave_OnClick.bind(this));
        // $(document).on('click', '#btnSaveAdd', this.btnSaveAdd_OnClick.bind(this));
        //$(document).on('click', '#btnCancel', this.btnCancel_OnClick.bind(this));
        $(document).on('click', '#btnPause', this.btnPause_OnClick.bind(this));
        // $('.ui-dialog-buttonpane').on('keyup',this.btn_OnKeyUp.bind(this));
        $('#btnEdit').on('click', { refType: enumeration.RefType.Expense }, this.btnEdit_OnClick.bind(this));
        $('#btnDelete').on('click', this.btnDelete_OnClick.bind(this));
        $('#btnDuplicate').on('click', this.btnDuplicate_OnClick.bind(this));
        $('#btnRefresh').on('click', this.btnRefresh_OnClick.bind(this));
        $('#btnCharge').on('click', this.btnCharge_OnClick.bind(this));
        $('#btnDiscard').on('click', this.btnDiscard_OnClick.bind(this));
        //$(document).on('click','#frmRAEDetail #btnCancel', function(){alert(1)});
        $('#tbarRefresh').on('click', this.tbarRefresh_OnClick.bind(this));
        $('#currentPage').on('keyup', this.currentPage_OnChange.bind(this));
        // $('.record-select-item').on('click', this.size_OnChange.bind(this));
    };

    /*
     * Thực hiện load page
     * Created by: TTHuyen (26/01/2019)
     */

    currentPage_OnChange(event){
        event.preventDefault();
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Trigger the button element with a click
           // fakeData=[];
            getPage();
            this.buildDataIntoTable(fakeData);
        }
    }


    /*
     * Thực hiện load dữ liệu màn hình danh sách.
     * Created by: NVMANH (22/01/2019)
     */
    loadData() {
        fakeData=[];
        getPageHome(); //Hàm láy trả về size bản ghi đầu tiên và tổng số bản ghi có
        this.buildDataIntoTable(fakeData);
    };

    // Build dữ liệu lên bảng:
    buildDataIntoTable(data) {
        var table = $('#tbodyRAE');
        table.html('');
        // Lấy thông tin các cột dữ liệu:
        var column = $('#tblCustomerList .gridHeader th');
        var rowTemplate = [];
        var fieldData = [];
        rowTemplate.push('<tr class="{0}">');
        column.each(function (index, item) {
            fieldData.push($(item).attr('fieldData'));
        })
        data.forEach(function (item, index) {
            var htmlItem = [];
            htmlItem.push('<tr indexRef="{0}" class="{1}" refTypeName={2}  isPostedFinance={3}>'.format(index, index % 2 === 0 ? '' : 'row-highlight', item.RefTypeName, item.isPostedFinance));
            fieldData.forEach(function (valueField, indexField) {
                if (indexField === 7 || indexField === 1) htmlItem.push('<td class="{1}">{0}</td>'.format(item[valueField],"text-center"));
                else if (indexField === 4) htmlItem.push('<td class="{1}">{0}</td>'.format(Number(item[valueField]).formatMoney(),"text-right"));
                else if (indexField === 0) {
                    htmlItem.push('<td class="no-border-left {1}" >{0}</td>'.format(item[valueField],"text-center"));
                } else {
                    htmlItem.push('<td>{0}</td>'.format(item[valueField]));
                }
            })
            htmlItem.push('</tr>');
            table.append(htmlItem.join(""));
        });

        // Chọn dòng đầu tiên:

        commonJS.setFirstRowSelected($('#tblCustomerList'));
        //hiển thị chi tiết dòng đầy tiên
        
        this.rowRAE_OnClick();
        if ($(this).hasClass('delete-write')){
            $('#btnDiscard').attr('disabled','disabled');
            $('#btnCharge').removeAttr('disabled');
        } else {
            $('#btnCharge').attr('disabled','disabled');
            $('#btnDiscard').removeAttr('disabled');
        }
    };
    //append data vào đầu bảng
    prependDataIntoTable(data) {
        var table = $('#tbodyRAE');
        // Lấy thông tin các cột dữ liệu:
        var column = $('#tblCustomerList .gridHeader th');
        var rowTemplate = [];
        var fieldData = [];
        rowTemplate.push('<tr class="{0}">');
        column.each(function (index, item) {
            fieldData.push($(item).attr('fieldData'));
        })
        data.forEach(function (item, index) {
            var htmlItem = [];
            htmlItem.push('<tr indexRef=' + index + ' class="{0}" isPostedFinance={1}>'.format(index % 2 === 0 ? '' : 'row-highlight', Number(0)));
            fieldData.forEach(function (valueField, indexField) {
                if (indexField === 3) {htmlItem.push('<td class="no-border-left {1}" >{0}</td>'.format(item[valueField], "text-right"));}
                else
                if (indexField === 0) {
                    htmlItem.push('<td class="no-border-left" >{0}</td>'.format(item[valueField]));
                } else {
                    htmlItem.push('<td>{0}</td>'.format(item[valueField]));
                }
            })
            htmlItem.push('</tr>');
            table.prepend(htmlItem.join(""));
        });
        // Chọn dòng đầu tiên:
        commonJS.setFirstRowSelected($('#tblCustomerList'))
      this.rowRAE_OnClick();
    };

    /*
     * Thực hiện trước khi mở form
     * Created by: NVMANH (22/01/2019)
     */
    beforeOpenDetail() {
        $(document).off('keydown', this.keyDownRowSelect);      
        $('.text-required').removeClass('required-border');	
        $('.text-required').next('.error-box').remove();
        $('.combobox').removeClass('border-red');
        $('.mcombobox').removeClass('error-box');
        $('.combobox').removeAttr('title');

        //sua
        if (raeJS.editMode == 2) {
            RefUpdate={};
            invoicesGlobal=[];
            $('#tbodyRAEDetail-popup').empty();
            // Thực hiện lấy dữ liệu:
            var RAEDetail=[];
            //vị trí bản ghi trong sessionStorage
            var indexRef= $('.rowSelected').attr("indexref");
            var refData=JSON.parse(sessionStorage.getItem("detailRef"));
            var raeRef=refData[parseInt(indexRef)];
            RefUpdate=raeRef;
            //đổ dữ liệu
            var dataMasterFake = {
                AccountObjectNumber: raeRef.accountObjectID,
                AccountObjectCode: raeRef.accountObjectID,
                AccountObjectName: raeRef.accountObjectName,
                AccountObjectType: 2,                       //??
                Address: raeRef.accountObjectAddress,          
                ContactName: raeRef.accountObjectContactName,
                ReasonID: 1,                                //??
                RefType: raeRef.ref.refTypeID,
                ReasonName: raeRef.journalMemo,
                Description: raeRef.invoices.discription,
                EmployeeName:raeRef.modifiedBy,             //??
                PostedDate: raeDate.convertDate(raeRef.postedDate),
                RefDate: raeDate.convertDate(raeRef.refDate),
                RefNo: raeRef.refNoFinance,
                modifiedDate: raeRef.modifiedDate,
                isPostedFinance: $('.rowSelected').attr('isPostedFinance')
            }
            
            // Bind thông tin dữ liệu master (for editing mode)
            var dataIndexs = $('input[dataindex]');
            if (dataIndexs && dataIndexs.length > 0) {
                $.each(dataIndexs, function (index, item) {
                    var dataIndex = $(item).attr('dataindex');
                    var dataType = $(item).attr('data-type');
                    if (dataType == 'Date') {
                        $(item).datepicker({dateFormat:"dd/mm/yy"}).datepicker("setDate",dataMasterFake[dataIndex]);
                    } else {
                        $(item).val(dataMasterFake[dataIndex]);
                    }
                });
            }
            // Bind thông tin dữ liệu detail (for editing mode)
            var invoices=raeRef.invoices;
            indexInvoiceGlobal=0;
            if(invoices==null){         
                return;
            }
            invoicesGlobal=invoices;
            //Diễn giải -  TK Nợ  - TK Có - Số tiền - Đối tượng - Tên đối tượng - Đơn vị - Mã thống kê
            invoices.forEach(function(invoice,index){
                var div=`<tr indexInvoice="${index}" statusInvoice="${invoice.status}" >
                            <td style="display:flex;">
                                <button role="removeInvoice" class="btn btn-danger">x</button>
                                <input fileDataInvoice="journalMemo" value="${invoice.discription}">
                            </td>
                            <td><input fileDataInvoice=""  value="${invoice.amount}"></td>
                            <td><input fileDataInvoice="" value="${invoice.amount}"></td>
                            <td><input fileDataInvoice="" value="${Number(invoice.amountOC).formatMoney()}" class="text-right"></td>
                            <td><input fileDataInvoice="" value="${invoice.accountObjectID}"></td>
                            <td><input fileDataInvoice="" value="${invoice.accountObjectName}"></td>
                            <td><input fileDataInvoice="" value="${invoice.accountObjectAddress}"></td>
                            <td><input fileDataInvoice="" value=""></td>
                            </tr>`;
                $('#tbodyRAEDetail-popup').append(div);
                $('button[role="removeInvoice"]').on('click', function(){
                    //set trang thai cua invoice tuong ung trong invoicesGlobal
                    var index=$(this).parents('tr').attr("indexInvoice");
                    invoicesGlobal[index].status=2;//danh dau bi xoa
                    $(this).parents('tr').remove();
                });
                var x=$("tr[indexinvoice='"+index+"']");
                $("tr[indexInvoice='"+index+"']").on('keyup',function(){      
                    invoicesGlobal[index].status=1;//danh dau bi thay đổi;
                })
                indexInvoiceGlobal++;
            })
        } else if(raeJS.editMode == 3) {
            //Thực hiện bind dữ liệu để nhân bản
            //nhân bản
            RefUpdate={};
            invoicesGlobal=[];
            $('#tbodyRAEDetail-popup').empty();
            // Thực hiện lấy dữ liệu:
            var RAEDetail=[];
            //vị trí bản ghi trong sessionStorage
            var indexRef= $('.rowSelected').attr("indexref");
            var refData=JSON.parse(sessionStorage.getItem("detailRef"));
            var raeRef=refData[parseInt(indexRef)];
            RefUpdate=raeRef;
            //đổ dữ liệu
            var dataMasterFake = {
                AccountObjectNumber: raeRef.accountObjectID,
                AccountObjectCode: raeRef.accountObjectID,
                AccountObjectName: raeRef.accountObjectName,
                AccountObjectType: 2,                       //??
                Address: raeRef.accountObjectAddress,          
                ContactName: raeRef.accountObjectContactName,
                ReasonID: 1,                                //??
                RefType: raeRef.ref.refTypeID,
                ReasonName: raeRef.journalMemo,
                Description: raeRef.invoices.discription,
                EmployeeName:raeRef.modifiedBy,             //??
                PostedDate: raeDate.convertDate(raeRef.postedDate),
                RefDate: raeDate.convertDate(raeRef.refDate),
                RefNo: raeRef.refNoFinance,
                modifiedDate: raeRef.modifiedDate,
                isPostedFinance: raeRef.isPostedFinance
            }
            // Bind thông tin dữ liệu master:
            var dataIndexs = $('input[dataindex]');
            if (dataIndexs && dataIndexs.length > 0) {
                $.each(dataIndexs, function (index, item) {
                    var dataIndex = $(item).attr('dataindex');
                    var dataType = $(item).attr('data-type');
                    if (dataType == 'Date') {
                        $(item).datepicker({dateFormat:"dd/mm/yy"}).datepicker("setDate",dataMasterFake[dataIndex]);
                    } else {
                        $(item).val(dataMasterFake[dataIndex]);
                    }
                });
            }
        // Bind thông tin dữ liệu detail:
            var invoices=raeRef.invoices;
            indexInvoiceGlobal=0;
            if(invoices==null){
                return;
            }
            invoicesGlobal=invoices;
            invoices.forEach(function(invoice,index){
                var div=`<tr indexInvoice="${index}" statusInvoice="${invoice.status}" >
                            <td style="display:flex;">
                                <button role="removeInvoice" class="btn btn-danger">x</button>
                                <input fileDataInvoice="journalMemo" value="${invoice.discription}">
                            </td>
                            <td><input fileDataInvoice=""  value="3221"></td>
                            <td><input fileDataInvoice="" value="1112"></td>
                            <td><input fileDataInvoice="" value="${Number(invoice.amountOC).formatMoney()}" class="text-right"></td>
                            <td><input fileDataInvoice="" value="${invoice.accountObjectID}"></td>
                            <td><input fileDataInvoice="" value="${invoice.accountObjectID}"></td>
                            <td><input fileDataInvoice="" value="${invoice.accountObjectID}"></td>
                            <td><input fileDataInvoice="" value=""></td>
                            </tr>`;
                $('#tbodyRAEDetail-popup').append(div);
                $('button[role="removeInvoice"]').on('click', function(){
                    //set trang thai cua invoice tuong ung trong invoicesGlobal
                    var index=$(this).parents('tr').attr("indexInvoice");
                    invoicesGlobal[index].status=2;//danh dau bi xoa
                    $(this).parents('tr').remove();
                });
                var x=$("tr[indexinvoice='"+index+"']");
                $("tr[indexInvoice='"+index+"']").on('keyup',function(){
                    
                    invoicesGlobal[index].status=1;//danh dau bi thay đổi;
                })
                indexInvoiceGlobal++;
            
            })

            //focus vao 
            $('input[dataindex="RefNo"]').focus();
        }
        
    };


    // Chọn 1 bản ghi trong danh sách:
    // show loading effect in Detail box
    rowRAE_OnClick() {
        commonJS.showMask($('.frmCustomerDetail .rae-detail-box'));
        setTimeout(function () {
           showDetail();
        }, 300)
        setTimeout(function () {
            commonJS.hideMask($('.frmCustomerDetail .rae-detail-box'));
        }, 300)
    };

    /*
     * Event double click a row in tbodyRAE  ---- Viewing Mode
    */

    rowRAE_OnDblClick() {
        this.editMode = 2;
        //identify receipt or expense
        if ($('.rowSelected').attr('refTypeName') == "Thu") {
            this.RefType = 1;
        } else {
            this.RefType = 2;
        }
        this.detailFormOnBeforeOpen(arguments);
        this.DetailForm.Show();
        // $('#btnCancel').focus();
        $('#btnSave').attr('disabled', true);
        $('#btnPause').attr('disabled', true);
        $('#frmRAEDetail input').attr('disabled', true);
        $('#frmRAEDetail #addtr').attr('disabled', true);
        $('.ui-dialog-buttonset #btnSaveAdd').attr('disabled', true);
        $('.ui-dialog-buttonset #btnPause').attr('disabled', true);
        $('#frmRAEDetail .detail-info input').attr('disabled', 'disabled');
        $('.combobox-arrow-select').hide();
        $('button[role="removeInvoice"]').attr('disabled', true);
        $('#frmRAEDetail .detail-info input').attr('disabled', true);
        $('#btnQuickEdit').attr('disabled',true);
        $('.ui-dialog').focus();
    };

    /*
     * thay đổi giao diện form trước khi mở
     */
    detailFormOnBeforeOpen(args) {
        if($('#tbodyRAE').children().first().hasClass('rowSelected') && $('#currentPage').val() == 1) {
            $('#btnNext').attr('disabled',true);
        }
        if($('#tbodyRAE').children().last().hasClass('rowSelected') && $('#currentPage').val() == $('#totalPage').html()) {
            $('#btnPrevious').attr('disabled',true);
        }
        // if (args[0].data.refType !== undefined) {
        //     var refType = args[0].data.refType;
        //     this.RefType = refType;
        // }
        if (this.RefType == enumeration.RefType.Receipt) {
            $("span.ui-dialog-title").text('Phiếu thu');
            $('.title-form-detail').text('Phiếu thu');
            $('#lblReason').text('Lý do thu');
            $('#lblAccountObjectContactName').text('Người nộp');
            $('#lblEmployee').text('Nhân viên thu');
        } else {
            $("span.ui-dialog-title").text('Phiếu chi');
            $('.title-form-detail').text('Phiếu chi');
            $('#lblAccountObjectContactName').text('Người nhận');
            $('#lblReason').text('Lý do chi');
            $('#lblEmployee').text('Nhân viên chi');
        }
    };
    /*--------------------------------------------
     * Chức năng enter kích hoạt nút đang focus
     * Created by: NVLAM (20/02/2019)
     */
    // btn_OnKeyUp (event) {
    //     debugger
    //     if(event.keyCode === 13) {
    //         $(this).trigger('click');
    //     }
    // }

    /* ----------------------------------------------------------------------------
     * Nút trở về chứng từ gần nhất trong tương lai
     * Created bt: NVLAM (15/02/2019)
     */
    btnNext_OnClick(){
        var currentRow = $('.rowSelected');
        if($('#tbodyRAE').children().first().hasClass('rowSelected') && $('#currentPage').val() == 1) {
            $('#btnNext').attr('disabled',true);
        }
        if (!$('#tbodyRAE').children().first().hasClass('rowSelected')){
            raeJS.selectRow(currentRow.prev());
            this.DetailForm.Close();
            $('.rowSelected').trigger('dblclick');
        } else {
            $('.tbar-page-prev').trigger('click');
            this.DetailForm.Close();
            $('.rowSelected').trigger('dblclick');
        }
    }
    /* ----------------------------------------------------------------------------
     * Nút chuyển đến chứng từ gần nhất trong quá khứ
     * Created bt: NVLAM (15/02/2019)
     */
    btnPrevious_OnClick(){
        var currentRow = $('.rowSelected');
        if (!$('#tbodyRAE').children().last().hasClass('rowSelected')){
            raeJS.selectRow(currentRow.next());
            this.DetailForm.Close();
            $('.rowSelected').trigger('dblclick');  
            } else {
                $('.tbar-page-next').trigger('click');
                this.DetailForm.Close();
                $('.rowSelected').trigger('dblclick');
            }
    }

    /**
     * Thực hiện thêm mới
     */
    btnAdd_OnClick() {
        this.editMode = 1;
        this.RefType = arguments[0].data.refType;
        this.detailFormOnBeforeOpen(arguments);
        $('#btnPrevious').attr('disabled','true');
        $('#btnNext').attr('disabled','true');
        $('#tbodyRAEDetail-popup').empty();
        $('#btnQuickEdit').attr('disabled',true);
        $('#PostedDate').datepicker({dateFormat:"dd/mm/yy"}).datepicker("setDate",new Date());
        $('#RefDate').datepicker({dateFormat:"dd/mm/yy"}).datepicker("setDate",new Date());
        //Ajax lấy số chứng từ tự sinh để thêm hoặc nhân bản 
        var refType_selected = this.RefType;
        $.ajax({
            method:"get",
            url: MISA.Config.paymentUrl + "/generateRefNoFinance/" + refType_selected,
            beforeSend: function(xhr){
                xhr.setRequestHeader("keycompany",localStorage.getItem("workCompanyID"));
                xhr.setRequestHeader('authorization',localStorage.getItem("authenCookie"));
            },
            success: function(data){
                $('input[dataindex="RefNo"]').val(data);  
            }
        });
        indexInvoiceGlobal=0;
        invoicesGlobal=[];
        this.DetailForm.Show();
    };

    btnEdit_OnClick() {
        this.editMode = 2;
        if ($('.rowSelected').attr('refTypeName') == "Thu") {
            this.RefType = 1;
        } else {
            this.RefType = 2;
        }
        $('#tbodyRAEDetail-popup').empty();
        // $('#PostedDate').datepicker({dateFormat:"dd/mm/yy"}).datepicker("setDate",new Date());
        // $('#RefDate').datepicker({dateFormat:"dd/mm/yy"}).datepicker("setDate",new Date());
        // arguments[0].data.refType = ($(".rowSelected").find("td:eq(8)").text().toLowerCase() == "thu") ? 1 : 2;
        this.detailFormOnBeforeOpen(arguments);
        this.DetailForm.Show();
        this.detailFormOnBeforeOpen(arguments);
        $('input[dataindex="RefNo"]').attr('disabled', true);
        $('#tbodyRAEDetail-popup input').attr('disabled',true);
        $('#tbodyRAEDetail-popup td:first-child input').attr('disabled',false);
        // $('#tbodyRAEDetail-popup input:first-child').attr('disabled',false);
    };

    /*-------------------------------------------------------------
     * Nút sửa nhanh
     * Created by NVLAM (20/02/2019)
     */
    btnQuickEdit_OnClick() {
        this.editMode = 2;
        $('.combobox-arrow-select').hide();
        $('#txtAccountObjectCode').attr('disabled', true);
        $('#txtReason').attr('disabled', true);
        $('#PostedDate').attr('disabled',true);
        $('#RefDate').attr('disabled',true);
    }
    /**
     * Thực hiện CẤT:
     */
    btnSave_OnClick() {
        if (this.editMode ==1){
            /// Chế độ thêm mới 
            var invoices = [];
            $('#tbodyRAEDetail-popup').find('tr').each(function(){
                invoices.push({
                    "discription":$(this).children('td:eq(0)').children('input').val(),
                    "amount":$(this).children('td:eq(2)').children('input').val(), 
                    "amountOC":$(this).children('td:eq(3)').children('input').val(),
                    "accountObjectID":$(this).children('td:eq(4)').children('input').val()
                })
            });
            console.log(invoices);
            var refTypeID = this.RefType;
            var refTypeName = "Thu";
            if (refTypeID == 2) refTypeName = "Chi";
            var ref = {"refTypeID": refTypeID, "refTypeName": refTypeName};
            var data = {"ref":ref,
                "invoices":invoices,
                "refDate": raeDate.convertDateToAdd($('input[dataindex="RefDate"]').val()),             //Ngày chứng từ 
                "postedDate": raeDate.convertDateToAdd($('input[dataindex="PostedDate"]').val()),       //Ngày hoạch toán
                "refNoFinance": $('input[dataindex="RefNo"]').val(),                            //Số chứng từ
                "accountObjectID": $('#txtAccountObjectCode').val(),                            //ID đối tượng (CTY MISA)
                "accountObjectName": $('#txtAccountObjectName').val(),                          //Tên đối tượng (Công ty CP MISA)
                "accountObjectAddress": $('#txtAddress').val(),                                 //Chi nhánh    (địa chỉ)
                "accountObjectContactName": $('#txtContactName').val(),                         //Người nộp/nhận
                "reasonTypeID": $('#txtReason').val(),                                          //ID lý do
                "journalMemo": $('#txtReasonName').val(),                                       //Tên lý do
                "documentInclude": "documentInclude3.doc",                                  //useless?
                "exchangeRate": null,                                                       //useless?
                "editVersion": new Date(),                                                  //useless?
                "isPostedFinance": Number(0),                              
                "refOrdef": totalRecord + 1,                                                    //Tổng số record (hiện thông tin)
                "createdDate": new Date(),                                                  //useless?
                "createdBy": "created Person",                                              //useless?
                "modifiedDate": new Date(),                                                        //modifiedDate for sorting record
                "modifiedBy": "modified Person"                                             //useless?
            };
            console.log(data);
            if (data.refNoFinance != '') {
                $.ajax({
                    method:"post",
                    url: MISA.Config.paymentUrl + "/addRef",
                    contentType: "application/json; charset=utf-8",
                    beforeSend:function(xhr){
                        xhr.setRequestHeader("authorization", localStorage.getItem("authenCookie"));
                        xhr.setRequestHeader("keycompany", localStorage.getItem("workCompanyID"));
                    },
                    data: JSON.stringify(data),
                    success: function(result, txtStatus, xhr){
                        console.log(result);
                        ////// prepend latest added record to master ---------- PROBLEM: must be refreshed
                        if(!result.error){
                            $('#tbodyRAE').prepend(
                                '<tr indexref="" class="" isPostedFinance ="{0}">'.format(data.isPostedFinance)
                                    +'<td class="no-border-left text-center">'+ raeDate.convertDate(data.refDate)+'</td>'
                                    +'<td class="text-center">' + raeDate.convertDate(data.postedDate) + '</td>'
                                    +'<td>' + data.refNoFinance + '</td>'
                                    +'<td>' + data.journalMemo + '</td>'
                                    +'<td class="text-right">' + result.totalAmount + '</td>'
                                    +'<td>' + data.accountObjectName + '</td>'
                                    +'<td>' + data.journalMemo + '</td>'
                                    +'<td class="text-center">' + raeDate.convertDate(data.createdDate)+ '</td>'
                                    +'<td>' + data.ref.refTypeName + '</td>'
                                    +'<td>' + data.refNoFinance + '</td>'
                                    +'<td>' + data.accountObjectName +'</td>'   
                                +'</tr>');
                            
                            $('#tbodyRAE').find('tr:eq(1)').removeClass("rowSelected");            
                            // ReceiptsAndExpensesJS.initEvents();  

                            commonJS.setFirstRowSelected($('#tblCustomerList'));
                            $('.rowSelected').addClass('delete-write');
                            commonJS.showSuccessMsg('Thêm hóa đơn thành công');
                            setTimeout(function(){
                                $('.ui-dialog-titlebar-close').trigger('click');
                            }, 700)
                            
                        }
                        else{
                            commonJS.showFailMsg("Thêm hóa đơn không thành công");
                            $('.ui-dialog-titlebar-close').trigger('click');
                            $('.tbar-refresh').trigger('click');
                            // commonJS.showSuccessMsg('Thêm hóa đơn thành công');
                        }
                        
                    },
                    error: function(err){
                        console.log(err);
                        commonJS.showFailMsg("Thêm hóa đơn không thành công");
                    }
                })
            } else {
                $('.text-required').trigger('blur');
                commonJS.showFailMsg("Thêm hóa đơn không thành công");
            }
        } else if(this.editMode == 2){                 ///////btnSave for edit
            //che do sửa
            //xet du  lieu tu bien chua invoicesGlobal
            //invoicesData dữ liệu đc gửi lên
            var invoicesData=[]; 
            var sortOrder=0;
            if(RefUpdate==null){
                return;
            }
            invoicesGlobal.forEach(function(invoice,index){
                if(invoice.refDetailID.trim().length!=0&&invoice.status==0){
                    sortOrder++;
                    invoice.sortOrder=sortOrder;
                    invoicesData.push(invoice);
                }else if(invoice.refDetailID.trim().length!=0&&invoice.status==2){
                  
                    invoice.sortOrder=sortOrder;
                    invoicesData.push(invoice);
                }else if(invoice.refDetailID.trim().length!=0&&invoice.status==1){
                    //dữ liệu đã bị sửa
                    sortOrder++;

                    if($("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(3)').children('input').val().trim().length==0){
                        commonJS.showFailMsg("Không được bỏ trống");
                    return;
                    }
                    //lấy lại các trường sửa
                    invoice.discription=$("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(0)').children('input').val();
                    invoice.amountOC=$("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(3)').children('input').val();
                    invoice.accountObjectID=$("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(4)').children('input').val();
                    invoice.sortOrder=sortOrder;
                    invoicesData.push(invoice);
                }else if(invoice.refDetailID.trim().length==0&&invoice.status==3){
                    //them mới 
                    sortOrder++;

                    if($("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(3)').children('input').val().trim().length==0){
                        commonJS.showFailMsg("Không được bỏ trống");
                    return;
                    }
                    //lấy lại các trường sửa
                    invoice.discription=$("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(0)').children('input').val();
                    invoice.amountOC=$("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(3)').children('input').val();
                    invoice.accountObjectID=$("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(4)').children('input').val();
                    invoice.sortOrder=sortOrder;
                    invoicesData.push(invoice);
                }
            })

            if($('input[dataindex="RefDate"]').val().length==0||$('input[dataindex="PostedDate"]').val().length==0){
                commonJS.showFailMsg("Không được bỏ trống");
                return;
            }

            ///////////////Assign new data
            RefUpdate.refDate= raeDate.convertDateToAdd($('input[dataindex="RefDate"]').val());
            RefUpdate.postedDate= raeDate.convertDateToAdd($('input[dataindex="PostedDate"]').val());
            RefUpdate.refNoFinance= $('input[dataindex="RefNo"]').val();
            RefUpdate.accountObjectID= $('#txtAccountObjectCode').val();
            RefUpdate.accountObjectName= $('#txtAccountObjectName').val();
            RefUpdate.accountObjectAddress=$('#txtAddress').val();
            RefUpdate.accountObjectContactName=$('#txtContactName').val();
            RefUpdate.reasonTypeID=$('#txtReason').val();
            RefUpdate.journalMemo=$('#txtReasonName').val();
            RefUpdate.editVersion=new Date();
            RefUpdate.modifiedDate=new Date();
            RefUpdate.isPostedFinance= Number(0);
            RefUpdate.modifiedBy=$('#txtEmployeeName').val();
            RefUpdate.invoices=invoicesData;

            $.ajax({
                method:"post",
                url: MISA.Config.paymentUrl + "/updateRef",
                contentType: "application/json; charset=utf-8",
                beforeSend:function(xhr){
                    xhr.setRequestHeader("authorization", localStorage.getItem("authenCookie"));
                    xhr.setRequestHeader("keycompany", localStorage.getItem("workCompanyID"));
                },
                data: JSON.stringify(RefUpdate),
                async:false,
                success: function(result, txtStatus, xhr){
                  
                    if(result.message){
                        $('.ui-dialog-titlebar-close').trigger('click');
                        $('.tbar-refresh').trigger('click');
                        commonJS.showSuccessMsg("Sửa hóa đơn thành công");
                    }
                },
                error: function(err){
                    console.log(err);
                    commonJS.showFailMsg("Sửa hóa đơn không thành công");
                }
            })
        } else if(this.editMode ==3){                ///////btnSave for duplicate
            var invoicesData=[]; 
            var sortOrder=0;
            if(RefUpdate==null){
                return;
            }
            invoicesGlobal.forEach(function(invoice,index){
                if(invoice.refDetailID.trim().length!=0&&invoice.status==0){
                    sortOrder++;
                    invoice.sortOrder=sortOrder;
                    invoicesData.push(invoice);
                }else if(invoice.refDetailID.trim().length!=0&&invoice.status==2){
                    invoice.sortOrder=sortOrder;
                    invoicesData.push(invoice);
                }else if(invoice.refDetailID.trim().length!=0&&invoice.status==1){
                    //dữ liệu đã bị sửa
                    sortOrder++;
                    if($("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(3)').children('input').val().trim().length==0){
                        commonJS.showFailMsg("Không được bỏ trống");
                    return;
                    }
                    //lấy lại các trường sửa
                    invoice.discription=$("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(0)').children('input').val();
                    invoice.amountOC=$("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(3)').children('input').val();
                    invoice.accountObjectID=$("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(4)').children('input').val();
                    invoice.sortOrder=sortOrder;
                    invoicesData.push(invoice);
                }else if(invoice.refDetailID.trim().length==0&&invoice.status==3){
                    //them mới 
                    sortOrder++;
                    if($("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(3)').children('input').val().trim().length==0){
                        commonJS.showFailMsg("Không được bỏ trống");
                    return;
                    }
                    //lấy lại các trường sửa
                    invoice.discription=$("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(0)').children('input').val();
                    invoice.amountOC=$("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(3)').children('input').val();
                    invoice.accountObjectID=$("#tbodyRAEDetail-popup").children('tr:eq(0)').children('td:eq(4)').children('input').val();
                    invoice.sortOrder=sortOrder;
                    invoicesData.push(invoice);
                }
            })

            if($('input[dataindex="RefDate"]').val().length==0||$('input[dataindex="PostedDate"]').val().length==0){
                commonJS.showFailMsg("Không được bỏ trống");
                return;
            }

            ///////////////Assign new data
            RefUpdate.refID="";
            RefUpdate.refDate= raeDate.convertDateToAdd($('input[dataindex="RefDate"]').val());
            RefUpdate.postedDate= raeDate.convertDateToAdd($('input[dataindex="PostedDate"]').val());
            RefUpdate.refNoFinance= $('input[dataindex="RefNo"]').val();
            RefUpdate.accountObjectID= $('#txtAccountObjectCode').val();
            RefUpdate.accountObjectName= $('#txtAccountObjectName').val();
            RefUpdate.accountObjectAddress=$('#txtAddress').val();
            RefUpdate.accountObjectContactName=$('#txtContactName').val();
            RefUpdate.reasonTypeID=$('#txtReason').val();
            RefUpdate.journalMemo=$('#txtReasonName').val();
            RefUpdate.editVersion=new Date();
            RefUpdate.createdDate=new Date();
            // RefUpdate.isPostFinance = 
            RefUpdate.createdBy=$('#txtEmployeeName').val();
            RefUpdate.modifiedDate=new Date();
            RefUpdate.modifiedBy=$('#txtEmployeeName').val();
            RefUpdate.invoices=invoicesData;

            $.ajax({
                method:"post",
                url: MISA.Config.paymentUrl + "/addRef",
                contentType: "application/json; charset=utf-8",
                beforeSend:function(xhr){
                    xhr.setRequestHeader("authorization", localStorage.getItem("authenCookie"));
                    xhr.setRequestHeader("keycompany", localStorage.getItem("workCompanyID"));
                },
                data: JSON.stringify(RefUpdate),
                async:false,
                success: function(result, txtStatus, xhr){
                    if(result.message){
                        commonJS.showSuccessMsg("Nhân bản hóa đơn thành công");                      
                        $('.ui-dialog-titlebar-close').trigger('click');
                        $('.tbar-refresh').trigger('click');
                    }
                },
                error: function(err){
                    console.log(err);
                    commonJS.showFailMsg("Nhân bản hóa đơn không thành công");
                }
            })
        }
    };
    //------------------------------------------------------------------
    /* 
        Thuc hien xoa
        Created by NVLam
    */
    btnDelete_OnClick(event){
        if($('#tbodyRAE').find('tr').hasClass("rowSelected")== true){
            commonJS.showConfirm('Bạn có chắc chắn muốn xóa', deleteRef);
        }
    }
    /* -------------------------------------------------------------------
     * Nhấn button Cất và thêm mới
     * Created by: NVMANH (20/05/2018)
     */
    btnSaveAdd_OnClick(event) {
        var invoices = [];
        $('#tbodyRAEDetail-popup').find('tr').each(function(){
                invoices.push({
                    "discription":$(this).children('td:eq(0)').children('input').val(),
                    "amount":$(this).children('td:eq(2)').children('input').val(), 
                    "amountOC":$(this).children('td:eq(3)').children('input').val(),
                    "accountObjectID":$(this).children('td:eq(4)').children('input').val()
                })
        });
        console.log(invoices);
        //example
         // "discription": "Huyen",
         //        "amountOC": 1000,
         //        "amount": 1004,
         //        "accountObjectID": "accountObjectID5",
         //        "sortOrder": 425
        var refTypeID = this.RefType; 
        var refTypeName = "Thu";
        if(refTypeID == 2) refTypeName = "Chi";
        var ref = {"refTypeID": refTypeID, "refTypeName": refTypeName};
            var data = {"ref":ref,
                "invoices":invoices,
                "refDate": raeDate.convertDateToAdd($('input[dataindex="RefDate"]').val()),             //Ngày chứng từ 
                "postedDate": raeDate.convertDateToAdd($('input[dataindex="PostedDate"]').val()),       //Ngày hoạch toán
                "refNoFinance": $('input[dataindex="RefNo"]').val(),                            //Số chứng từ
                "accountObjectID": $('#txtAccountObjectCode').val(),                            //ID đối tượng (CTY MISA)
                "accountObjectName": $('#txtAccountObjectName').val(),                          //Tên đối tượng (Công ty CP MISA)
                "accountObjectAddress": $('#txtAddress').val(),                                 //Chi nhánh
                "accountObjectContactName": $('#txtContactName').val(),                         //Người nộp/nhận
                "reasonTypeID": $('#txtReason').val(),                                          //ID lý do
                "journalMemo": $('#txtReasonName').val(),                                       //Tên lý do
                "documentInclude": "documentInclude3.doc",                                  //useless?
                "exchangeRate": null,                                                       //useless?
                "editVersion": new Date(),                                         //useless?
                "refOrdef": totalRecord + 1,                                                    //Tổng số record (hiện thông tin)
                "createdDate": new Date(),                                                  //useless?
                "createdBy": "created Person",                                              //useless?
                "modifiedDate": new Date(),                                                        //modifiedDate for sorting record
                "modifiedBy": "modified Person",                                             //useless?
                "isPostedFinance": Number(0)
            };
        $.ajax({
            method:"post",
            url: MISA.Config.paymentUrl + "/addRef",
            contentType: "application/json; charset=utf-8",
            beforeSend:function(xhr){
                xhr.setRequestHeader("authorization", localStorage.getItem("authenCookie"));
                xhr.setRequestHeader("keycompany", localStorage.getItem("workCompanyID"));
            },
            data: JSON.stringify(data),
            success: function(result, txtStatus, xhr){
                console.log(result);
                //prepend master
                if(!result.error){
                    $('#tbodyRAE').prepend(
                        '<tr indexref="" class="" isPostedFinance="">'.format(data.isPostedFinance)
                            +'<td class="no-border-left text-center">'+ raeDate.convertDate(data.refDate) + '</td>'
                            +'<td class="text-center">'+ raeDate.convertDate(data.postedDate) + '</td>'
                            +'<td>' + data.refNoFinance + '</td>'
                            +'<td>' + data.journalMemo + '</td>'
                            +'<td class="text-right">' + result.totalAmount + '</td>'
                            +'<td>' + data.accountObjectName + '</td>'
                            +'<td>' + data.journalMemo + '</td>'
                            +'<td class="text-center>' + raeDate.convertDate(data.createdDate) + '</td>'
                            +'<td>' + data.ref.refTypeName + '</td>'
                            +'<td>' + data.refNoFinance + '</td>'
                            +'<td>' + data.accountObjectName +'</td>'   
                        +'</tr>');            
                    $('#tbodyRAE').find('tr:eq(1)').removeClass("rowSelected");  
                    commonJS.setFirstRowSelected($('#tblCustomerList'));
                    $('.rowSelected').addClass('delete-write');
                    $('.btnRefresh').trigger('click');
                    commonJS.showSuccessMsg('Thêm hóa đơn thành công');
                    $('.text-required').removeClass('required-border');	
                    $('.text-required').next('.error-box').remove();
                    
                    setTimeout(function(){
                        $('.general-voucher-info').find('input').each(function(){
                             $(this).val('');
                        });
                    },800);
                    editMode=1;//danh dau them mơi
                }
                else{
                    commonJS.showFailMsg("Lỗi khi thêm hóa đơn");
                }
            },
            error: function(err){
                commonJS.showFailMsg("Lỗi khi thêm hóa đơn");
            }
        })
    };
    /* --------------------------------------------------------------------
     * Nút ghi sổ
     * Created by NVLAM (28/03/2018)
     */
    btnCharge_OnClick(event) {
        var indexRef = $('.rowSelected').attr("indexref");
        var refData = JSON.parse(sessionStorage.getItem("detailRef"));
        var refID = refData[parseInt(indexRef)].refID;
        $.ajax({
            method:"POST",
            url: MISA.Config.paymentUrl + "/write:{" + refID + "}",
            contentType: "application/json; charset=utf-8",
            beforeSend: function(xhr){
                xhr.setRequestHeader("authorization", localStorage.getItem("authenCookie"));
                xhr.setRequestHeader("keycompany", localStorage.getItem("workCompanyID"));
            },
            data: JSON.stringify(refData),
            success: function(result, txtStatus, xhr){
                console.log(result);
                $('.rowSelected').removeClass('.delete-write');
                commonJS.showSuccessMsg("Ghi sổ thành công ")
            },
            error: function(err){
                console.log(err);
                commonJS.showFailMsg("Ghi sổ không thành công");
            }
        })
    }
    /* ----------------------------------------------------------------------
     * Nút bỏ ghi sổ
     * Created by NVLAM (30/03/2018)
     */
    btnDiscard_OnClick(event) {
        var indexRef= $('.rowSelected').attr("indexref");
        var refData=JSON.parse(sessionStorage.getItem("detailRef"));
        var refID=refData[parseInt(indexRef)].refID;
        $.ajax({
            method:"POST",
            url: MISA.Config.paymentUrl + "/deleteWrite:{" + refID + "}",
            contentType: "application/json; charset=utf-8",
            beforeSend: function(xhr){
                xhr.setRequestHeader("authorization", localStorage.getItem("authenCookie"));
                xhr.setRequestHeader("keycompany", localStorage.getItem("workCompanyID"));
            },
            data: JSON.stringify(refData),
            success: function(result, txtStatus, xhr){
                console.log(result);
                $('.rowSelected').addClass('.delete-write');
                commonJS.showSuccessMsg("Bỏ ghi sổ thành công ")
            },
            error: function(err){
                console.log(err);
                commonJS.showFailMsg("Bỏ ghi sổ không thành công");
            }
        })
    }
    /*-------------------------------------------------------------------
     * Nhấn button Ghi sổ trong form
     * Created by: NVLAM (13/03/2019)
     */
    btnRecord_OnClick(){
        var indexRef= $('.rowSelected').attr("indexref");
        var refData=JSON.parse(sessionStorage.getItem("detailRef"));
        var refID=refData[parseInt(indexRef)].refID;
        $.ajax({
            method:"POST",
            url: MISA.Config.paymentUrl + "/write:{" + refID + "}",
            contentType: "application/json; charset=utf-8",
            beforeSend: function(xhr){
                xhr.setRequestHeader("authorization", localStorage.getItem("authenCookie"));
                xhr.setRequestHeader("keycompany", localStorage.getItem("workCompanyID"));
            },
            data: JSON.stringify(refData),
            success: function(result, txtStatus, xhr){
                console.log(result);
                $('.rowSelected').removeClass('.delete-write');
                commonJS.showSuccessMsg("Ghi sổ thành công ")
            },
            error: function(err){
                console.log(err);
                commonJS.showFailMsg("Ghi sổ không thành công");
            }
        })
    }
    /*-------------------------------------------------------------------
     * Nhấn bút button bỏ ghi trong form
     * Created by: NVLAM (30/03/2019)
     */
    btnErase_OnClick() {
        var indexRef= $('.rowSelected').attr("indexref");
        var refData=JSON.parse(sessionStorage.getItem("detailRef"));
        var refID=refData[parseInt(indexRef)].refID;
        $.ajax({
            method:"POST",
            url: MISA.Config.paymentUrl + "/deleteWrite:{" + refID + "}",
            contentType: "application/json; charset=utf-8",
            beforeSend: function(xhr){
                xhr.setRequestHeader("authorization", localStorage.getItem("authenCookie"));
                xhr.setRequestHeader("keycompany", localStorage.getItem("workCompanyID"));
            },
            data: JSON.stringify(refData),
            success: function(result, txtStatus, xhr){
                console.log(result);
                $('.rowSelected').addClass('.delete-write');
                commonJS.showSuccessMsg("Bỏ ghi sổ thành công ")
            },
            error: function(err){
                console.log(err);
                commonJS.showFailMsg("Bỏ ghi sổ không thành công");
            }
        })
    }
    btnCancel_OnClick(event) {
        $('.text-required').removeClass('required-border');	
        $('.text-required').next('.error-box').remove();
        $('.combobox').removeClass('border-red');
        $('.mcombobox').removeClass('error-box');
        $('.combobox').removeAttr('title');
        this.DetailForm.Close();
    };

    btnHelp_OnClick(event) {
        commonJS.showSuccessMsg("Tính năng đang được xây dựng");
    };
    /* -------------------------------------------------------------------
     * Nhấn button Hoãn
     * Created by: NVLAM (14/02/2018)
     */
    btnPause_OnClick(event) {
        //check if Pause or Continue
        if ($('#btnPause .btn-customer-text').text() == "Hoãn") {
            //if Pause: disable all input and button and change text to Tiep tuc
            $('#btnSave').attr('disabled', true);
            $('#frmRAEDetail input').attr('disabled', true);
            $('#frmRAEDetail #addtr').attr('disabled', true);
            $('.ui-dialog-buttonset #btnSaveAdd').attr('disabled', true);
            $('.combobox-arrow-select').hide();
            $('button[role="removeInvoice"]').attr('disabled', true);
            $('#frmRAEDetail .detail-info input').attr('disabled', true);
            $('#btnPause .btn-customer-text').text('Tiếp tục');
        } else {
            //if Continue: enable all and change text
            $('button[disabled="disabled"]').removeAttr('disabled');
            $('#frmRAEDetail input').removeAttr('disabled');
            $('button[role="removeInvoice"]').attr('disabled', false);
            $('.combobox-arrow-select').show();
            $('#btnPause .btn-customer-text').text('Hoãn');
        }
    }
    btnRefresh_OnClick(event){
        fakeData = [];
        getPageHome();
        $('#currentPage').val(1);
       this.buildDataIntoTable(fakeData);
    }
    /* -------------------------------------------------------------------
     * Nhấn button nhân bản
     * Created by: NVMANH (20/05/2018)
     */
    btnDuplicate_OnClick(event){
        //editMode=3 chế độ  duplicate
        this.editMode = 3;
        if ($('.rowSelected').attr('refTypeName') == "Thu") {
            this.RefType = 1;
        } else {
            this.RefType = 2;
        }
        $('#tbodyRAEDetail-popup').empty();
        // $('#PostedDate').datepicker({dateFormat:"dd/mm/yy"}).datepicker("setDate",new Date());
        // $('#RefDate').datepicker({dateFormat:"dd/mm/yy"}).datepicker("setDate",new Date());
        var refType_selected = this.RefType;
        $.ajax({
            method:"get",
            url: MISA.Config.paymentUrl + "/generateRefNoFinance/" + refType_selected,
            beforeSend: function(xhr){
                xhr.setRequestHeader("keycompany",localStorage.getItem("workCompanyID"));
                xhr.setRequestHeader('authorization',localStorage.getItem("authenCookie"));
            },
            success: function(data){
                $('input[dataindex="RefNo"]').val(data);  
            }
        }); 
        this.DetailForm.Show();
        this.detailFormOnBeforeOpen(refType_selected);
        $('#btnQuickEdit').attr('disabled',true);
    } 
    /*------------------------------------------------
     * Di chuyển lên xuống dòng bằng phím mũi tên và chọn dòng bằng enter
     * Created bt: NVLAM (21/02/2019)
     */
    keyDownRowSelect() {
        var currentRow = $('.rowSelected');
        switch (event.keyCode) {
            //Nút F2
            case 113:
            $('#btnEdit').trigger('click');
            return false;
            //Phím Delete
            case 46:
            $('#btnDelete').trigger('click');
            return false;
            //Phím Insert
            case 45:
            $('#btnEdit').trigger('click');
            return false;
            //Mũi tên xuống
            case 40:
            raeJS.selectRow(currentRow.next());
            $(".rowSelected").trigger("click");
            return false;
            //Mũi tên lên
            case 38:
            raeJS.selectRow(currentRow.prev());
            $(".rowSelected").trigger("click");
            return false;
            //Phim Enter
            case 13:
            // event.preventDefault();
            if (!$('#currentPage').is(":focus")) {
                $(".rowSelected").trigger('dblclick');
            } else return false;
        }
    }
    /* -------------------------------------------------------------------
    * Nhấn button  tbarRefresh
    * Created by: Huyen (20/05/2018)
    */
    tbarRefresh_OnClick(event){
        fakeData=[];
        getPageHome();
        getPage();
        this.buildDataIntoTable(fakeData);
    }
    accountObjectItem_OnSelect() {
        // Lấy thông tin đối tượng được chọn:
        var accountObjectCode = $(event.target).attr('item-value');
        var accounts = dataResource.AccountObject.filter(function (e) { return e.AccountObjectCode == accountObjectCode });
        if (accounts && accounts.length > 0) {
            var account = accounts[0];
            $('#txtAccountObjectName').val(account.AccountObjectName);
            $('#txtAddress').val(account.Address);
            $('#txtAccountDebit').val(account.AccountObjectNumber);
            $('#txtContactName').val(account.ContactName);
        }
    };
    reasonItem_OnSelect() {
        // Lấy thông tin đối tượng được chọn:
        var reasonId = $(event.target).attr('item-value');
        var reasons = dataResource.Reason.filter(function (e) { return e.ReasonID == reasonId });
        if (reasons && reasons.length > 0) {
            var reason = reasons[0];
            $('#txtReasonName').val(reason.ReasonName);
            $('#txtEmployeeName').val(reason.EmployeeName);
        }
    };
    beforeCloseDialog() {
        $('#frmRAEDetail input').val(null);
        $('button[disabled="disabled"]').removeAttr('disabled');
        $('#frmRAEDetail input').removeAttr('disabled');
        $('button[role="removeInvoice"]').attr('disabled', false);
        $('.text-required').removeClass('required-border');	
        $('.text-required').removeClass('required-border');	
        $('.text-required').next('.error-box').remove();
        $('.combobox-arrow-select').show();
    }
    /*------------------------------------------------------------------
     * Phím tắt trước sau trong form
     * Created by NVLAM (15/02/2019)
     */
    dialog_OnKeyDown(sender) {
        //Phím tắt nút trước
        if(sender.keyCode === 37){
            $('#btnPrevious').trigger('click');
        };
        //Phím tắt nút trước
        if(sender.keyCode === 39){
            $('#btnNext').trigger('click');
        }
        //Phím tắt nút save
        if(sender.keyCode === 119 && sender.ctrlKey) {
            $('#btnSave').trigger('click');
        }
        //Phím tắt thêm dòng ở detail
        if(sender.keyCode === 45 && sender.ctrlKey) {
            $('#addtr').trigger('click');
        }
        //Phím tắt xóa dòng detail
        if(sender.keyCode === 46 && sender.ctrlKey) {
            if($('#tbodyRAEDetail-popup').children().hasClass('rowSelected')) {
                $('#tbodyRAEDetail-popup .rowSelected button').trigger('click');
            }
        }
    }
    /* ------------------------------------------------------------------------
     * Tính năng chọn dòng
     * Created by: NVLAM (16/02/2019)
     */
    selectRow(newRow) {
        newRow = $(newRow);
 
        // Thoát ra nếu không có hàng nào mới
        if (newRow.length === 0) {
            if (event.keyCode === 38) $('.cls-gridPanel').scrollTop(0);
            return;
        }
        // Bỏ chọn dòng trước đó
        var oldRow = $('.rowSelected');
        oldRow.removeClass('rowSelected');
 
        // Chọn một dòng mới
        newRow.addClass('rowSelected');
        var rowTop = newRow.position().top;
        var rowBottom = rowTop + newRow.height();
        var $table = $('.cls-gridPanel');
        var tableHeight = $table.height();
        var currentScroll = $table.scrollTop();
        var theadHeight = $('.cls-gridPanel thead').height();
        if (rowTop < theadHeight) {
            // Cuộn lên trên
            $('.cls-gridPanel').scrollTop(currentScroll - (theadHeight - rowTop));
        }
        else if (rowBottom > tableHeight) {
            // Cuộn xuống dưới
            var scrollAmount = rowBottom - tableHeight + 17;
            $('.cls-gridPanel').scrollTop(currentScroll + scrollAmount);
        }
    }
}
var raeJS = new ReceiptsAndExpensesJS();
    /*----------------------------------------------------------------------
     * Tính năng thay đổi cách filter
     * Created by NVLAM (27/02/2019)
     */

    /*
    * multifield filter
    * create by Quan Nguyen
    * 22/3/2019
    */

    $('input[elementtype="filterInput"]').blur(function(){
        filterFunc();
    })
/* Xoa chung tu*/
    function deleteRef(){
        $('tbodyRAEDetail').empty();
        var indexRef= $('.rowSelected').attr("indexref");
        var refData=JSON.parse(sessionStorage.getItem("detailRef"));
        var raeRef=refData[parseInt(indexRef)];
        if(raeRef==null) return;
        var data={refID:raeRef.refID}
        $.ajax({
                method:"post",
                url: MISA.Config.paymentUrl + "/deleteRef",
                contentType: "application/json; charset=utf-8",
                beforeSend:function(xhr){
                    xhr.setRequestHeader("authorization", localStorage.getItem("authenCookie"));
                    xhr.setRequestHeader("keycompany", localStorage.getItem("workCompanyID"));
                },
                data: JSON.stringify(data),
                success: function(result, txtStatus, xhr){
                    if(result.message){
                        commonJS.showSuccessMsg('Xóa hóa đơn thành công');
                        $('.rowSelected').remove();
                        $('.tbar-refresh').trigger('click');
                    }else{
                        commonJS.showFailMsg('Xóa hóa đơn không thành công');
                    }         
                },

                error: function(err){
                    console.log(err);
                    // alert("Xóa hóa đơn không thành công");
                }
            })
    }
    function filterFunc(){
        var dataToFilter=[];
        $('#filterElement').find('input[elementtype="filterInput"]').each(function(){
            if($(this).val() != ""){
                var columnName = $(this).attr("fieldname");
                var dataFilter = $(this).val();
                var dataType;
                var typeArrange = $(this).parents('.gridPanel-header-item-filter').children('a').html();
                //arrange = 1 thi sap xep tang dan
                var arrange = (typeArrange == "&gt;=") ? 1 : 0;
                if(columnName == "createdDate" || columnName == "postedDate" || columnName == "modifiedDate" || columnName == "refDate"){
                    //định dạng lại ngày tháng để chuyển về back-end
                    var dateRevert = dataFilter.split("/");
                    var dd = (dateRevert[0].length == 1) ? ('0' + dateRevert[0]) : (dateRevert[0]);
                    var mm = (dateRevert[1].length == 1) ? ('0' + dateRevert[1]) : (dateRevert[1]);
                    var yyyy = dateRevert[2];
                    dataFilter=yyyy + "-" + mm + "-" + dd;
                    dataType = "date";
                }
                else if(columnName == 'refNoFinance'){
                    dataType = 'stringExactly';
                }
                else if(columnName == "refTypeName"){
                    columnName = "ref.refTypeName";
                    dataType = "stringExactly";
                }
                else if(columnName == "totalAmount"){
                    columnName = "totalAmountOC";
                    dataType = "double";
                }
                else{//string  columnName == 'journalMemo' || columnName == 'accountObjectName' || columnName == 'reasonTypeID'
                    if(columnName == "reasonTypeID") columnName = "journalMemo";
                    dataType = "string";
                }
                dataToFilter.push({columnName: columnName, dataFilter: dataFilter, 
                                    dataType: dataType, arrange: arrange});
            }
        })
        console.log(dataToFilter);
        if(dataToFilter!=null && dataToFilter !=""){
                $.ajax({
                        method: "post",
                        url: MISA.Config.paymentUrl + "/filterPaymentReceipt",
                        contentType:"application/json; charset:utf-8;",
                        beforeSend: function(xhr){
                            xhr.setRequestHeader('authorization', localStorage.getItem("authenCookie"));
                            xhr.setRequestHeader("keycompany", localStorage.getItem("workCompanyID"));
                        },
                        data: JSON.stringify(dataToFilter),
                        success: function(response, status, xhr){
                            var res = response;
                                var payment=res.result;
                                fakeData = [];
                                var total = $('#inputTotalRecord').val();
                                $('#totalRecord').text(res.totalRecord);
                                for(i = 0; i < total; i++){
                                    if(payment[i] == null) break;
                                    fakeData.push({ID : payment[i].refID,
                                                    PostedDate : raeDate.convertDate(payment[i].postedDate),
                                                    RefDate : raeDate.convertDate(payment[i].refDate),
                                                    RefNo : payment[i].refNoFinance,
                                                    JournalMemo : payment[i].journalMemo,
                                                    RefTypeName : payment[i].ref.refTypeName,
                                                    TotalAmount : payment[i].totalAmountOC,
                                                    AccountObjectName : payment[i].accountObjectName,
                                                    ReasonTypeName : payment[i].journalMemo,
                                                    CashBookPostedDate : raeDate.convertDate(payment[i].createdDate),
                                                    RefNoFiance : payment[i].refNoFinance,
                                                    DepartmentName : payment[i].accountObjectName
                                            });
                                }
                                raeJS.buildDataIntoTable(fakeData);
                        },
                        error: function(xhr){
                            console.log("server error!");
                        }
                })
        }
        else{
            $('#btnRefresh').trigger('click');
        }
    }
    /*------------------------------------------------------------
     *  Tính năng chuyển trang
     *  Created by: NVLAM (28/01/2019)
     */
    $('#arrow-combo-trigger').click(function(){
        $('#numberRecordSelection').toggle();
        event.stopPropagation() ;
    })
    $(document).on('click','.record-select-item',function(){
        var number = $(this).html();
       $("#inputTotalRecord").val(number);
       $("#inputTotalRecord").val(number+"");
       getPageHome();
       raeJS.buildDataIntoTable(fakeData);
    })
    function checkTbar(){
        if ($('#currentPage').val() == $('#totalPage').html()) {
            $('.tbar-page-next').parent().addClass('tbar-item-disabled');
            $('.tbar-page-last').parent().addClass('tbar-item-disabled');
            $('.tbar-page-next').parent().removeClass('tbar-item-control-active');
            $('.tbar-page-last').parent().removeClass('tbar-item-control-active');
        }  else {
            $('.tbar-page-next').parent().removeClass('tbar-item-disabled');
            $('.tbar-page-last').parent().removeClass('tbar-item-disabled');
            $('.tbar-page-next').parent().addClass('tbar-item-control-active');
            $('.tbar-page-last').parent().addClass('tbar-item-control-active');
        }
        
        if ($('#currentPage').val() == 1) {
            $('.tbar-page-first').parent().addClass('tbar-item-disabled');
            $('.tbar-page-prev').parent().addClass('tbar-item-disabled');
            $('.tbar-page-first').parent().removeClass('tbar-item-control-active');
            $('.tbar-page-prev').parent().removeClass('tbar-item-control-active');
                        
        }  else {
            $('.tbar-page-first').parent().removeClass('tbar-item-disabled');
            $('.tbar-page-prev').parent().removeClass('tbar-item-disabled');
            $('.tbar-page-first').parent().addClass('tbar-item-control-active');
            $('.tbar-page-prev').parent().addClass('tbar-item-control-active');
        }
    }
    checkTbar();
    //Sang trang tiếp thep
    $('.tbar-page-next').click(function(){
        $('.cls-gridPanel').scrollTop(0);
        var recentPage = $('#currentPage').val();
        var totalPage = $('#totalPage').html();
        if(+recentPage < +totalPage){
            $('#currentPage').val(Number(recentPage)+Number(1));
            getPage();
            raeJS.buildDataIntoTable(fakeData);
            checkTbar();
        }
    })
    
    //Về trang trước
    $('.tbar-page-prev').click(function(){
        $('.cls-gridPanel').scrollTop(0);
        var recentPage = $('#currentPage').val();
        var totalPage = $('#totalPage').html();
        if(+recentPage > 1){
            $('#currentPage').val(Number(recentPage)-Number(1));
            getPage();
            raeJS.buildDataIntoTable(fakeData);
            checkTbar();
        }
    })
    
    //Chuyển đến trang cuối cùng
    $('.tbar-page-last').click(function(){
        $('.cls-gridPanel').scrollTop(0);
        var recentPage = $('#currentPage').val();
        var totalPage = $('#totalPage').html();
        if(+recentPage < +totalPage){
            $('#currentPage').val(Number(totalPage));
            getPage();
            raeJS.buildDataIntoTable(fakeData);
            checkTbar();
        }
    })
    
    //Chuyển đến trang đầu tiên
    $('.tbar-page-first').click(function(){
        $('.cls-gridPanel').scrollTop(0);
        var recentPage = $('#currentPage').val();
        if(+recentPage > 1){
            $('#currentPage').val(Number(1));
            getPage();
            raeJS.buildDataIntoTable(fakeData);
            checkTbar();
        }
    })
