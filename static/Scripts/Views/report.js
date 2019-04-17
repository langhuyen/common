$(document).ready(function(){
    $('#printBtn .btn').click(function(){
        window.print();
    })
    $(document).off('click', 'table tbody tr', commonJS.rowTable_OnClick);
})
var dataReport=[];
class ReportJS {
    constructor() {
        this.initEvents();
        this.loadData();
        this.me = this;
    }
    initEvents() {

    }
    /*-----------------------------------------
     * Thực hiện load dữ liệu
     * Created by: NVLAM (08/03/2019)
     */
    loadData() {
        dataReport = [];
        this.getData();
        this.buildDataIntoTable(dataReport);
    }
    getData() {
        dataReport = [];
        var size = 100;
        commonJS.showMask($('#tblReport'));
        // $.ajax({
        //     method : "GET",
        //     url : MediaSource.Config.paymentUrl + "/getAllPage_Size:" + size,
        //     beforeSend: function(xhr) {
        //         xhr.setRequestHeader('authorization', localStorage.getItem('authenCookie'));
        //         xhr.setRequestHeader('keycompany', localStorage.getItem('workcompany'));
        //     },
        //     async: false,
        //     success : function(result, txtStatus) {
        //         setTimeout(function () {
        //             commonJS.hideMask($('.#tblReport'));
        //         }, 300);
        //         var report = result.data;
        //         sessionStorage.setItem('detailReport', JSON.stringify(report));
        //         for (var i = 0; i < report.length; i++) {
        //             dataReport.push({
        //                 ID: report[i].refID,
        //                 PostedDate : convertDate(report[i].postedDate),                    
        //                 RefDate : convertDate(report[i].refDate),
        //                 RefNo : report[i].refNoFinance,
        //                 JournalMemo : report[i].journalMemo,                               
        //                 RefTypeName : report[i].ref.refTypeName,
        //                 TotalAmount : report[i].totalAmountOC,                             
        //                 CashBookPostedDate : convertDate(payment[i].createdDate),
        //                 EmployeeName : report[i].modifiedBy,
        //             })
        //         }
        //     },
        //     error: function() {
        //         commonJS.hideMask($('#tblReport'));
        //     }
        // })
        for (var i=0; i<1000; i++) {
            dataReport.push({
                ID: '123123123',
                PostedDate : '08/03/2019',                    
                RefDate : '08/03/2019',
                RefNo : 'PT' + i,
                JournalMemo : "Phiếu thu nhân viên",                               
                RefTypeName : "Phiếu thu",
                TotalAmount : Math.floor(Math.random() * 10000001),                             
                CashBookPostedDate : '08/03/2019',
                EmployeeName : 'Nguyễn Văn Lâm',
            })
        }
    }

    buildDataIntoTable(data) {
        var table = $('#tbody-detail-report');
        table.html('');
        var column = $('#tbody-detail-report tr th');
        var rowTemplate = [];
        var fieldData = [];
        var totalAmount = Number(data[0].TotalAmount);
        rowTemplate.push('<tr class="{0}">');
        // column.each(function (index, item) {
        //     fieldData.push($(item).attr('fieldData'));
        // })
        table.append('<tr>'
        + '<td class="width-150 no-border-left no-border-top "></td>'
        + '<td class="width-150 no-border-top"></td>'
        + '<td class="width-100 no-border-top"></td>'
        + '<td class="width-100 no-border-top"></td>'
        + '<td class="text-left font-weight-bold no-border-top" fieldData="JournalMemo">Số tồn đầu kì:</td>'
        + '<td class="width-100 no-border-top"></td>'
        + '<td class="width-100 no-border-top"></td>'
        + '<td class="text-right width-150 no-border-top"></td>'.format()
        + '<td class="text-right width-150 no-border-top"></td>'.format()
        + '<td class="text-right width-150 no-border-top">{0}</td>'.format(Number(0))
        + '<td class="width-200  no-border-top"></td>');
        $.each(data, function (key, value) {
            table.append('<tr>'
                + '<td class="text-center no-border-left">{0}</td>'.format(data[key].PostedDate)
                + '<td class="text-center">{0}</td>'.format(data[key].RefDate)
                + '<td>{0}</td>'.format(data[key].RefNo)
                + '<td></td>'
                + '<td>{0}</td>'.format(data[key].JournalMemo)
                + '<td></td>'
                + '<td></td>'
                + '<td class="text-right">{0}</td>'.format(Number(data[key].TotalAmount).formatMoney())
                + '<td class="text-right"></td>'
                + '<td class="text-right">{0}</td>'.format(Number(totalAmount).formatMoney())
                + '<td>{0}</td>'.format(data[key].EmployeeName)
                + '</tr>');
            totalAmount += new Number(value.TotalAmount);
        });
        totalAmount -= Number(data[0].TotalAmount);
        table.append('<tr id = "sum">'
            + '<td colspan="7" class="font-weight-bold text-left no-border-left">Tổng cộng:</td>'
            + '<td class="font-weight-bold text-right">' + Number(totalAmount).formatMoney() + '</td>'
            + '<td class="font-weight-bold text-right"></td>'
            + '<td class="font-weight-bold text-right">' + Number(totalAmount).formatMoney() + '</td>'
            + '<td></td>'
        + '</tr>');
    }
}
var reportJS = new ReportJS();
