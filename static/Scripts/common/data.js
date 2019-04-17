﻿var AccountObjectData = [];
var Reason = [];

//get data for conbobox
var getCustomerDetail = function(){
    dataResource.AccountObject = [];
    $.ajax({
        method: 'get',
        url: MISA.Config.paymentUrl + "/getCustomerDetail:2",
        beforeSend : function(xhr) {
			xhr.setRequestHeader('authorization', localStorage
                    .getItem("authenCookie"));
            xhr.setRequestHeader("keycompany", localStorage.getItem("workCompanyID"));
        },
        success: function(res){
            console.log(res);
            for (var i = 0; i < res.length; i++) {
                 if(res[i] == null) break;                    
                (function () {                        
                    dataResource.AccountObject.push({                            
                        AccountObjectNumber: 1,
                        AccountObjectCode: res[i].accountObjectID,
                        AccountObjectName: res[i].accountObjectName,
                        AccountObjectType:2,
                        Address: res[i].accountObjectAddress,
                        ContactName:res[i].accountObjectContactName                       
                    });   
                     dataResource.Reason.push({                            
                            ReasonID: res[i].journalMemo,
                            RefType: 2,
                            ReasonName: res[i].description,
                            EmployeeName: res[i].employeeName                      
                    });                   
                })(i)                 
            }
                        
        },
        error: function(){

        }
    });
    $.ajax({
        method: 'get',
        url: MISA.Config.paymentUrl + "/getCustomerDetail:1",
        beforeSend : function(xhr) {
			xhr.setRequestHeader('authorization', localStorage
                    .getItem("authenCookie"));
            xhr.setRequestHeader("keycompany", localStorage.getItem("workCompanyID"));
        },
        success: function(res){
            AccountObjectData = res;
            // console.log(AccountObjectData);
            for (var i = 0; i < AccountObjectData.length; i++) {                     
                (function () {                        
                    dataResource.AccountObject.push({                            
                        AccountObjectNumber: 1,
                        AccountObjectCode: res[i].accountObjectID,
                        AccountObjectName: res[i].accountObjectName,
                        AccountObjectType:1,
                        Address: res[i].accountObjectAddress,
                        ContactName:res[i].accountObjectContactName                       
                    });    
                    dataResource.Reason.push({                            
                        ReasonID: res[i].journalMemo,
                        RefType: 1,
                        ReasonName: res[i].description,
                        EmployeeName: res[i].employeeName                    
                    });                   
                })(i)                 
            }            
        },
        error: function(){

        }
    });
}


var dataResource = Object.create({
    AccountObject: [

       
    ],
    Reason: [
    ]

})