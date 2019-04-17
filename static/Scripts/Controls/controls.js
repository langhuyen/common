$(document).ready(function () {
    controlJs.renderElement();
    $('.mcombobox[controlType="ComboboxData"] input[controltype="inputCombobox"]').focus(function () {
        this.parentElement.classList.add('focus-default');
    })
    $('.mcombobox[controlType="ComboboxData"] input[controltype="inputCombobox"]').focusout(function () {
        this.parentElement.classList.remove('focus-default');
    })
    $('body').on('blur', '.mcombobox[controlType="ComboboxData"] input[controltype="inputCombobox"]', controlJs.inputCombobox_OnBlur);
    $('body').on('click', '.mcombobox[controlType="ComboboxData"] .trigger-loadData', controlJs.showDataSelection);
    $('body').on('keydown', '[controlType="ComboboxData"] input[controltype="inputCombobox"]', controlJs.inputCombobox_OnKeyDown);
    $('body').on('keydown', '[controlType="ComboboxData"] .combobox-data-item', controlJs.comboboxDataItem_OnKeyUp);
    $('body').on('click', '[controlType="ComboboxData"] .combobox-data-item', controlJs.comboboxDataItem_OnSelect);
})

var controlJs = Object.create({
    renderElement: function () {
        // render ra các combobox:
        var comboboxs = $('mcombobox');
        $.each(comboboxs, function (index, item) {
            var type = $(item).attr('type'),
                CssClass = $(item).attr('cssclass'),
                dataIndex = $(item).attr('dataindex'),
                dataFieldValue = $(item).attr('dataFieldValue'),
                comboboxElementBody = $('<div class="mcombobox" controlType="ComboboxData"></div>');
            switch (type) {
                case "ComboboxDataPlus":
                    comboboxElementBody.append(
                        '<div class="cls-wrapControl-combobox combobox">\
                            <input type = "text" controltype = "inputCombobox" dataindex = "{0}" value = "" />\
                            <div class="combobox-arrow-select trigger-loadData"></div>\
                            <div class="combobox-add-button combobox-add-icons"></div>\
                        </div >'.format(dataIndex));

                    // Gán Event cho button thêm nếu có:
                    var event = $(item).children('EventListener').children('AddButton').attr('event'),
                        scope = $(item).children('EventListener').children('AddButton').attr('scope');
                    if (event) {
                        comboboxElementBody.on('click', '.combobox-add-button', { scope: eval(scope) }, eval(event));
                    }
                    break;
                case "ComboboxData":
                    comboboxElementBody.append(
                        '<div controltype="ComboboxData" class="cls-wrapControl-combobox combobox" style="width: 100%">\
                            <input type = "text" id = "txtCustomerGroupParent" controltype = "inputCombobox" name = "CustomerGroupParent" dataindex = "CustomerGroupParent" value = "" />\
                            <div class="combobox-arrow-select trigger-loadData"></div>\
                        </div>');
                    break;
                default:

                    break;
            }
            // Thực hiện Build dữ liệu:
            var getDataUrl = $(item).attr('getDataUrl');
            var comboboxBoundListElement = '';
            // Call service api lấy dữ liệu:
            if (getDataUrl) {
                serviceAjax.get(getDataUrl, {}, false, function (data) {
                    if (data) {
                        comboboxBoundListElement = $('<div class="comboboxData-boundlist hide-if-outside"></div>');
                        $.each(data.Data, function (index, item) {
                            var itemHTML = '<div class="combobox-data-item" item-value="{1}" >{0}</div>';
                            $(comboboxBoundListElement).append(itemHTML.format(item[dataIndex],item[dataFieldValue]));
                        })
                        comboboxBoundListElement.appendTo(comboboxElementBody);
                        //$(comboboxElement).find('input').focus();
                        //$(comboboxElement).parents('mcombobox').removeAttr();
                    }
                })
            }

            // Append HTML:
            $(item).replaceWith(comboboxElementBody);
            //$(comboboxBoundListElement).insertAfter($(comboboxElementBody));
            //$(item).append(comboboxElementBody);
        })
    },
    inputCombobox_OnBlur: function () {
        var me = this,
            itemText = $(this).val().trim(),
            itemValue,
            existData = (itemText.trim().length === 0),
            comboboxElement = $(this).parents('.mcombobox[controlType="ComboboxData"]'),// element của combobox
            comboboxInputElement = comboboxElement.children().first(); //Element nhập liệu của combobox (đã wrap các thành phần lựa chọn và không bao gồm element chứa data)
        if (comboboxElement.length > 0) {
            var comboboxDataItemElement = comboboxElement.find('.comboboxData-boundlist .combobox-data-item')
            if (!existData) {
                comboboxDataItemElement.each(function (index, item) {
                    if (item.innerText.trim().toUpperCase() === itemText.toUpperCase()) {
                        itemText = item.innerText;
                        itemValue = $(item).attr('item-value');
                        $(comboboxInputElement).find('input').val(itemText);
                        $(comboboxInputElement).find('input').attr('item-value', itemValue);
                        existData = true;
                        return true;
                    }
                })
            };
        }
        controlJs.setComboboxErrorStyle(comboboxElement, existData);
        $()
    },

    /* ---------------------------------------------------------------------------------------------
     * Set Style cho combobox khi dữ liệu nhập không có trong danh sách
     * Author: NVMANH (14/05/2018)
     */
    setComboboxErrorStyle: function (combobox, existData) {
        var comboboxInputElement = combobox.children().first();
        if (existData) {
            $(comboboxInputElement).removeClass('border-red');
            $(combobox).removeClass('error-box');
            $(combobox).removeAttr('title');
            $(combobox).parents('td').css('padding-right', '4px');
        } else {
            $(comboboxInputElement).addClass('border-red');
            $(combobox).addClass('error-box');
            $(combobox).attr('title', 'Dữ liệu không có trong danh sách');
            //$(comboboxElement).find('input').val('');
            $(comboboxInputElement).find('input').removeAttr('item-value');

            // Sửa lỗi hiển thị lệch vị trí khi combobox ở trong thẻ td:
            $(combobox).parents('td').css('padding-left', '0');
        }
    },
    /* ---------------------------------------------------------------------------------------------
     * Ẩn hiện lựa chọn cacs item trong combobox
     * Author: NVMANH (14/05/2018)
     */
    showDataSelection: function (event) {
        var comboboxElement = event.target.parentElement,
            heightCombobox = comboboxElement.offsetHeight,  // Lấy height của combobox để set độ dài cho box Data sẽ hiện thị
            widthCombobox = comboboxElement.offsetWidth,    // Lấy Width của combobox để set độ rộng cho box Data sẽ hiện thị
            offsetComboboxElement = controlJs.offset(comboboxElement),
            getDataUrl = $(comboboxElement).parents('.mcombobox').attr('getDataUrl'),
            dataIndex = $(comboboxElement).parents('.mcombobox').attr('dataIndex'),
            valueField = $(comboboxElement).parents('.mcombobox').attr('valueField');
        // Xóa toàn bộ Attributes:
        // Kiểm tra xem đã load data chưa, nếu đã load rồi thì thôi, chưa load thì load lại:
        var comboboxBoundListElement = $(comboboxElement).next('.comboboxData-boundlist');

        var entityName = $(comboboxElement).attr('entity');
        switch (entityName) {
            case "AccountObject":
                data = dataResource.AccountObject.filter(function (item) { return item.AccountObjectType == raeJS.RefType});
                break;
            case "Reason":
                data = dataResource.Reason.filter(function (item) { return item.RefType == raeJS.RefType });
                break;
            default:
        }
        if (comboboxBoundListElement.length === 1) {
            // Thực hiện lấy dữ liệu:
            comboboxBoundListElement = $('<div class="comboboxData-boundlist hide-if-outside"></div>');
            $.each(data, function (index, item) {
                var itemHTML = '<div class="combobox-data-item" item-value="{1}" tabindex="-1">{0}</div>';
                $(comboboxBoundListElement).append(itemHTML.format(item[dataIndex], item[valueField]));
                $(itemHTML).data("data", item);
            })
            comboboxBoundListElement.appendTo(comboboxElement);
            $(comboboxBoundListElement).on('click', '.combobox-data-item', function () {
                switch (entityName) {
                    case "AccountObject":
                        raeJS.accountObjectItem_OnSelect();
                        break;
                    case "Reason":
                        raeJS.reasonItem_OnSelect();
                        break;
                    default:
                }
            })
            $(comboboxElement).find('input').focus();
        }
        comboboxBoundListElement.css('top', (offsetComboboxElement.top + heightCombobox).toString() + 'px');
        comboboxBoundListElement.css('width', widthCombobox.toString() + 'px');
        comboboxBoundListElement.css('left', offsetComboboxElement.left.toString() + 'px');
        comboboxBoundListElement.toggle();
        event.stopPropagation();
        comboboxBoundListElement.children().first().focus();
    },



    /* ----------------------------------------------------------------------------------------------
     * Chọn 1 Item trong Combobox thì hiển thị thông tin và gán giá trị tương ứng cho input Combobox
     */
    comboboxDataItem_OnSelect: function (sender) {
        var itemValue = $(this).attr('item-value'),
            itemText = $(this).text();
        var currentCombobox = $(this).parents('.mcombobox[controlType="ComboboxData"]');
        // Set value và giá trị cho input:
        $(currentCombobox).find('input').attr('item-value', itemValue).val(itemText);

        controlJs.setComboboxErrorStyle($(currentCombobox), true);
    },

    /* ---------------------------------------------------------------------------------------------
     * Chọn item trong combobox bằng phím di chuyển lên xuống
     * Author: NVMANH (14/05/2018)
     */
    inputCombobox_OnKeyDown: function (sender, e) {
        if (sender.keyCode === 40) {
            controlJs.showDataSelection(sender);
        }
    },
    /*----------------------------------------------------------------------------------------------
     * Chọn item trong combobox bằng phím di chuyển lên xuống
     * Author: NVLAM (15/02/2019)
     */
    comboboxDataItem_OnKeyUp: function (sender) {
        if (sender.keyCode === 38) {
            if (sender.target.previousElementSibling !== null) {
                sender.target.previousElementSibling.focus();
            } else {
                sender.target.parentElement.parentElement.firstElementChild.focus();
                sender.target.parentElement.parentElement.firstElementChild.value = dataInput;
                if (sender.target.parentElement.parentElement.getAttribute('entity') === "AccountObject") {
                    $('#txtAccountObjectName').val("");
                    $('#txtAddress').val("");
                    $('#txtAccountDebit').val("");
                    $('#txtContactName').val("");
                } else {
                    $('#txtJournalMemo').val("");
                    $('#txtEmployeeName').val("");
                }
            }
        } else if (sender.keyCode === 40) {
            if (sender.target.nextElementSibling !== null) {
                sender.target.nextElementSibling.focus();
            }
            else {
                sender.target.parentElement.firstElementChild.focus();
            }
        } else if (sender.keyCode === 13) {
            $(this).trigger("click");
            if (sender.target.parentElement.parentElement.getAttribute('entity') === "AccountObject") {
                $('#txtReason').focus();
            }
            if (sender.target.parentElement.parentElement.getAttribute('entity') === "Reason") {
                $('input[dataindex="RefNo"]').focus();
            }
        }
        event.stopPropagation();
    },
    /* ---------------------------------------------------------------------------------------------
     * set vị trí của data hiển thị:
     * Author: NVMANH (14/05/2018)
     */
    offset: function (el) {
        var rect = el.getBoundingClientRect(),
            scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
            scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
    },
})



class Button {
    constructor(scope, width, commandName, eventHandler) {
        var eventName = 'btn{0}_OnClick'.format(commandName),
            id = 'btn{0}'.format(commandName),
            html = '<div class="btn-customer-16-body" title="{3}"><i class="btn-customer-{1} {2}"></i><div class="btn-customer-text" >{0}</div></div>';
        if (eventHandler) {
            eventName = eventName;
        }
        switch (commandName) {
            case 'Previous':
                html = html = html.format('Trước','prev-icon','btn-customer-icon-16','Mũi tên trái');
                break;
            case 'Next':
                html = html = html.format('Sau','next-icon','btn-customer-icon-16','Mũi tên phải');
                break;
            case 'Save':
                html = html.format('Cất','save-icon','btn-customer-icon-16','Ctrl + F8');
                break;
            case 'SaveAdd':
                html = html.format('Cất và thêm','saveadd-icon','btn-customer-icon-16','');
                break;
            case 'QuickEdit':
                html = html.format('Sửa nhanh','quickedit-icon','btn-customer-icon-16','')
            case 'Cancel':
                html = html.format('Hủy bỏ','cancel-icon','btn-customer-icon-16','Esc');
                break;
            // case 'Help':
            //     html = html.format('Giúp','help-icon','btn-customer-icon-16','');
            //     break;
            case 'Record':
                html = html.format('Ghi Sổ','record-icon','btn-customer-icon-16','');
                break;
            case 'Erase':
                html = html.format('Bỏ ghi','erase-icon','btn-customer-icon-16','');
                break;
            default:
                break;
        }
        this.id = id;
        if (commandName === 'Previous') {
            this.class = 'btn-customer  background-button-white';
        }
        if (commandName === 'Next') {
            this.class = 'btn-customer background-button-white';
        }
        if (commandName === 'Save') {
            this.class = 'btn-customer background-button-white';
        }
        if (commandName === 'SaveAdd') {
            this.class = 'btn-customer background-button-white';
        }
        if (commandName === 'QuickEdit') {
            this.class = 'btn-customer background-button-white';
        }
        if (commandName === 'Cancel') {
            this.class = 'btn-customer background-button-white';
        }
        // if (commandName === 'Help') {
        //     this.class = 'btn-customer background-button-white';
        // }
        if (commandName === 'Record') {
            this.class = 'btn-customer background-button-white';
        }
        if (commandName === 'Erase') {
            this.class = 'btn-customer background-button-white';
        }
        // this.class = (commandName === 'Help' ? 'btn-customer btnHelp' : 'btn-customer');
        this.width = width + 'px';
        this.html = html;
        //$('#' + this.id).bind('click', scope[eventName].bind(scope));
        //$('#' + this.id).bind('click', scope[eventName].bind(scope));
        //$('#' + this.id).click(scope[eventName].bind(scope));
        if(scope[eventName]){
            this.click = scope[eventName].bind(scope);
        }
        
    }
}


/*
 * Đối tượng Form Popup hiển thị trên chương trình 
 */
class FormPopup {
    /*
     * Khởi tạo một popup
     * @param {any} selectorDetail Xác định Element thể hiện chi tiết UI của Detail (Chỉ cần truyền ID hoặc class của Element)
     * @param {any} width (Độ rộng Popup)           
     * @param {any} height (Height của popup)
     * @param {any} showModal (Có hiển thị modal hay không)
     * @param {any} scope   (xác định đối tượng JS sẽ thao tác với các function)
     */
    constructor(selectorDetail, width, height, showModal, scope, buttons) {
        var me = scope ? eval(scope) : this;
        var selectorDetailHTML = selectorDetail ? $(selectorDetail) : '<div class="frmDetailFormDynamic"></div>';
        if (!selectorDetail) {
            $(selectorDetailHTML).appendTo('body');
        }
        if (!buttons) {
            buttons =
                [ new Button(me, 75, 'Previous'),
                new Button(me, 75, 'Next'),
                new Button(me, 75, 'Save'),
                new Button(me, 120, 'SaveAdd'),
                new Button(me, 110, 'QuickEdit'),
                new Button(me, 75, 'Record'),
                new Button(me, 75, 'Erase'),
                // new Button(me, 75, 'Help'),
                new Button(me, 75, 'Cancel'),
                ]
        }
        this.Form = $(selectorDetailHTML).dialog({
            autoOpen: false,
            //height: 250,
            width: width ? width : 680,
            dialogClass: 'form-customerDetail',
            modal: showModal ? showModal : true,
            // hide: "drop",
            resizable: false,
            buttons: buttons,
            close: function () {
                $(document).on('keydown', raeJS.keyDownRowSelect);
                //me.formRegister[0].reset();
                //$(window).lockscroll(false);
            },
            open: scope ? scope.beforeOpenDetail : function () { },
            //create: scope.frmCustomerDetail_OnCreate,
            beforeClose: scope ? scope.beforeCloseDialog : function () { },
        });
    };
    Show() {
        this.Form.dialog('open');
    };
    Close() {
        this.Form.dialog('close');
    };
    btnPrevious_OnClick() {
        alert('Previous');
    };
    btnNext_OnClick() {
        alert('Next');
    };
    btnSave_OnClick() {
        alert('Save');
    };
    btnSaveAdd_OnClick() {
        alert('SaveAdd');
    };
    btnQuickEdit_OnClick() {
        alert('QuickEdit');
    };
    btnCancel_OnClick() {
        this.Form.dialog('close');
    };
    // btnHelp_OnClick() {
    //     alert('Help');
    // };
    btnRecord_OnClick() {
        alert('record');
    }
    btnRecord_OnClick() {
        alert('erase');
    }
}


