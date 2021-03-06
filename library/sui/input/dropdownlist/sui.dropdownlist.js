define(["avalon", "text!./sui.dropdownlist.html", "css!../sui-input-common.css", "css!../textbox/sui.textbox.css", "css!./sui.dropdownlist.css"], function (avalon, template) {

    var _interface = function () {
    };

    avalon.component("sui:dropdownlist", {
        //内部变量
        _focusing: false,
        _msg: "",
        _showNoticeImage: false,
        _textWidth: 0, //文本框宽度
        _listHeight: 0, //最大高度
        _tempValue: [], //临时值
        _isHover: false, //是否移动
        _tempData: [], //临时数据,用于保存初始数据
        //内部方法
        _blur: _interface,
        _focus: _interface,
        _keyup: _interface,
        _keydown: _interface,
        _itemClick: _interface,
        _mouseover: _interface,
        onInit: _interface, //必须定义此接口
        onChange: _interface, //值修改时触发外部事件
        check: _interface,
        setFocus: _interface,
        getValue: _interface,
        _close: _interface,
        _checkboxClick: _interface,
        _setCurrent: _interface,
        //配置项
        did: "",
        title: "",
        value: [],
        data: [],
        msg: "该项为必填项",
        require: false,
        disabled: false,
        readonly: false,
        visible: true,
        isShowMsg: true,
        width: 0,
        height: 0,
        theme: "default",
        styleType: "normal",
        isShowNoticeImage: false,
        isMultiple: false, //是否多选
        filterColumns: ["text"], //过滤字段
        valueColumn: "id", //值列
        displayColumn: "text",//控件显示值
        titleColumns: [], //多列标题
        widthColumns: [], //多列列宽
        displayColumns: ["text"], //单选显示文本
        //模板
        $template: template,
        //替换自定义标签
        $replace: 0,
        $construct: function (defaultConfig, vmConfig, eleConfig) {
            var options = avalon.mix(defaultConfig, vmConfig, eleConfig)
            if (options.width == 0)
            {
                options.width = 152
                options._textWidth = (152 - 25);
            }
            if (options.data.length > 8)
            {
                options._listHeight = 8 * 25;
            }
            else
            {
                options._listHeight = "";
            }
            return options
        },
        $init: function (vm) {
            vm._msg = vm.msg;
            vm.title = vm.title + "：";
            vm._tempData = vm.data;
            if (vm.require && vm.value.length == 0)
            {
                vm.msg = "*";
            }
            else
            {
                vm.msg = "";
            }
            //监控属性
            vm.$watch("value.length", function (n, o) {
                //vm.onChange(n, o)
                vm.check()
            })
            //监测data是否变化
            vm.$watch("data", function (n, o) {
                vm._tempData = vm.data;
                if (vm.data.length > 8)
                {
                    vm._listHeight = 8 * 25;
                }
                else
                {
                    vm._listHeight = "";
                }
            })
        },
        $ready: function (vm, element) {
            //给文本框赋初值。
            avalon.each(vm.data, function (index, item) {
                if (vm.value.indexOf(item.id) >= 0)
                {
                    if (vm.inputid && vm.isMultiple == false)
                    {
                        vm._tempValue = item[vm.displayColumn];
                        document.getElementById(vm.inputid).value = item[vm.displayColumn];
                    }
                }
            })

            vm.onInit(vm);

            var arr = [
                [document, "click", function (e) {
                        var target = e.target;
                        var container = document.getElementById("dropdownlist-container-" + vm.inputid)
                        if (vm._focusing && (container.contains(target)))
                        {

                        }
                        else
                        {
                            if (!vm.check())
                            {
                                //如果不正确清空value值
                                //vm.value = "";
                            }
                            vm._close();
                        }
                    }]
                        ,
                [document, "keydown", function (e) {
                        var target = e.target;
                        if (vm._focusing && (!target.id || (target.id && target.id != vm.inputid)))
                        {
                            document.getElementById(vm.inputid).focus();
                        }
                        avalon.log(e.target)
                        avalon.unbind(arr[1][0], arr[1][1], arr[1][2])
                    }]
            ]
            vm.check = function ()
            {
                if (vm.require && vm.value.length == 0)
                {
                    vm.msg = vm._msg;
                    vm._showNoticeImage = true;
                    return false
                }
                else
                {
                    vm.msg = "";
                    vm._showNoticeImage = false;
                    return true;
                }
                return true;
            }
            vm._blur = function (e)
            {

            }
            vm._focus = function (e)
            {
                avalon.bind(arr[1][0], arr[1][1], arr[1][2])
                vm._isHover = false;
                if (vm.inputid)
                {
                    avalon.bind(arr[0][0], arr[0][1], arr[0][2])
                    if (!vm.readonly)
                    {
                        document.getElementById(vm.inputid).value = "";
                    }
                }
                vm._focusing = true;

            }
            vm._keydown = function (e)
            {
                //按tab键关键列表
                if (e.which == 9)
                {
                    vm._focusing = false;
                }
                if (e.which == 27)
                {
                    //vm._setCurrent();
                    //清空选项
                    vm._tempValue = "";
                    vm.value.removeAll();

                    vm._focusing = false;
                    e.target.blur();
                    vm.check();
                }
            }
            vm._keyup = function (e)
            {
                //前端过滤
                if (!vm.readonly)
                {
                    var tmpv = e.target.value;
                    var tmparr = [];
                    avalon.each(vm.data, function (index, item) {
                        if (item.text.indexOf(tmpv) >= 0)
                        {
                            tmparr.push(item);
                        }
                    })
                    vm._tempData = tmparr;
                }
            }
            vm._mouseover = function (e)
            {
                vm._isHover = true;
            }
            vm._close = function ()
            {
                vm._setCurrent();

                vm._focusing = false;
                if (vm.inputid)
                {
                    avalon.unbind(arr[0][0], arr[0][1], arr[0][2])
                }

            }
            vm._itemClick = function (e, index)
            {
                if (!vm.isMultiple)
                {
                    vm.value.removeAll()
                    vm.value.push(vm._tempData[index][vm.valueColumn]);
                    vm._tempValue = vm._tempData[index][vm.displayColumn];

                    vm._isHover = false;
                    vm._focusing = false;
                    vm._tempData = vm.data
                }
                else
                {
                    var tmpchecked = document.getElementById("sui-input-dropdownlist-" + vm.inputid + "-" + index).checked;
                    if (tmpchecked)
                    {
                        document.getElementById("sui-input-dropdownlist-" + vm.inputid + "-" + index).checked = false;
                        if (vm.value.indexOf(vm._tempData[index][vm.valueColumn]) >= 0)
                        {
                            vm.value.splice(vm.value.indexOf(vm._tempData[index][vm.valueColumn]), 1)
                        }
                    }
                    else
                    {
                        document.getElementById("sui-input-dropdownlist-" + vm.inputid + "-" + index).checked = true;
                        if (vm.value.indexOf(vm._tempData[index][vm.valueColumn]) < 0)
                        {
                            vm.value.push(vm._tempData[index][vm.valueColumn])
                        }
                    }

                }
            }
            vm._checkboxClick = function ()
            {
//                if(event.preventDefault)
//                {
//               event.preventDefault();
//                }
                event.cancelBubble = true;
            }
            vm._setCurrent = function ()
            {
                //关闭时向文本框赋值，如果选上的话
                if (!vm.isMultiple)
                {
                    document.getElementById(vm.inputid).value = vm._tempValue;
                }
                else
                {
                    if (vm.value.length == vm.data.length)
                    {
                        vm._tempValue = "全部";
                    }
                    else
                    {
                        var tempstr = "";
                        avalon.each(vm.data, function (index, item) {
                            if (vm.value.indexOf(item[vm.valueColumn]) >= 0)
                            {
                                tempstr = tempstr + item[vm.displayColumn] + ";"
                            }
                        })
                        vm._tempValue = tempstr;
                    }

                    document.getElementById(vm.inputid).value = vm._tempValue;
                    //document.getElementById(vm.inputid).value = vm.value.sort().join(";")
                    vm._tempData = vm.data;
                }
            }
            vm.setFocus = function ()
            {
                if (vm.inputid)
                {
                    var target = document.getElementById(vm.inputid)
                    target.focus();
                    vm._focusing = true;
                }
            }
            vm.getValue = function ()
            {
                if (vm.check())
                {
//                    return vm.isShowSecond ? vm.value : vm.value + ":00";
                }
                else
                {
                    throw vm.msg;
                }
            }
        },
        $dispose: function (vm, element)
        {
            element.innerHTML = "";
        }

    })


    return avalon
})

//
