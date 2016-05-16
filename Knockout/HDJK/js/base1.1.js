//////////////////////////////////
//          页面基类            //
//////////////////////////////////
//默认数据是systemData;
var Page = {
    //枚举
    dict: {
        linkType:
        {
            script: 'text/javascript',
            template: 'text/template',
            css: 'text/css'
        },
        sizeType:
       {
           ge1920_1080: 3,//大于等于1920  1080 现场常用分辨率
           ge1280_800: 2,//1280 800   1366 * 768，一般办公常用分辨率
           less_1280_800: 1// 不常用 
       }
    },
    //公共函数
    base: {
        //连接文件
        linkfile: function (id, url, type, callback) {
            // 创建一个新的标签
            var linkType = Page.dict.linkType;
            alert(url);
            switch (type) {
                case linkType.css:
                    {
                        var node = document.createElement("link");
                        if (typeof (id) != undefined && id != undefined) node.id = id;
                        node.type = type;
                        node.async = true;
                        node.rel = "stylesheet";
                        node.onload = function () { callback(); };
                        node.href = url;
                        document.getElementsByTagName("head")[0].appendChild(node);
                        break;
                    }
                case linkType.script:
                    {
                        var node = document.createElement("script");
                        if (typeof (id) != undefined && id != undefined) node.id = id;
                        node.type = type;
                        node.async = true;
                        node.onload = function () { callback(); };
                        node.src = url;
                        document.getElementsByTagName("head")[0].appendChild(node);
                        break;
                    }
                    //同步加载html模版
                case linkType.template:
                    {
                        var node = document.createElement("script");
                        if (typeof (id) != undefined && id != undefined) node.id = id;
                        node.type = 'text/javascript';
                        //【注意】chrome 的 text/html不支持load事件，所以都改成script的
                        node.async = true;
                        node.onload = function () {
                            if ($(this).attr("src")) {
                                $.ajax(
                                   $(this).attr("src"),
                                   {
                                       async: false,
                                       context: this,
                                       success: function (data) {
                                           $(this).html(data);
                                           callback();
                                           // document.querySelector("#svgContainer").innerHTML = data;

                                       }
                                   }
                               );
                            }

                        };
                        $(node).attr("src", url);
                        document.getElementsByTagName("head")[0].appendChild(node);
                        break;
                    }
            }
        },

    },
    //实例对象
    createNew: function () {
        var page = {};
        //页面加载是否回传
        page.isPostBack = false;
        //页面加载的循环间隔
        page.pageLoadInterval = 1000;
        //页面循环加载的次数
        page.pageLoadCount = 0;
        //页面打开时间;
        page.startTime = (new Date()).toLocaleString();
        //判断页面是否隐藏
        page.isFocus = function () {
            if (window.frameElement != null)
                return window.frameElement.style.display == 'block';
            else
                return true;
        };
        //只要获取一次，isStarted就为true了
        page.isStarted = false;
        page.size = {
            width: window.screen.width,
            height: window.screen.height
        };
        //判断是否有数据,
        page.hasData = function () {
            var isok = typeof (systemData) != "undefined" && JSONLength(systemData) > 3;
            if (isok && !page.isStarted) {
                page.pageLoadCount = 0;
                page.isStarted = true;
            }
            return isok;
        }
        page.sizeType = null;
        page.getSizeType = function () {
            var h = page.size.height;
            if (h >= 1080)
                page.sizeType = Page.dict.sizeType.ge1920_1080;
            else if (h >= 768)
                page.sizeType = Page.dict.sizeType.ge1280_800;
            else
                page.sizeType = Page.dict.sizeType.less_1280_800;
        }
        page.ieVersion = $.browser.version;
        page.isIE = $.browser.msie;
        //判断是否在运行，有别于isStarted
        page.isRun = true;
        page.show = function () {
            $("[content]").css({ "position": "relative", "top": "0" });
        };
        page.hidden = function () {
            $("[content]").css({ "position": "relative", "top": "-10000em" });
        };
        page.linkCss = function (css) {
            $("<link>").attr({ rel: "stylesheet", type: "text/css", href: css }).appendTo("head");
        };
        page.run = function () {
            page.isRun = true;
        }
        page.stop = function () {
            page.isRun = false;
        }
        page.initHandle = function () {
            setTimeout(page.pageLoadHandle, page.pageLoadInterval);
        };
        //交给前端处理的初次事件
        page.init = function () { };
        page.preInitHandle = function () { page.init(); page.initHandle(); };
        //Dom缓存，缓存机制，lable和table缓存，其他不chart和any不缓存
        page.cacheDom = {};
        page.hasCacheDom = false;
        //数据缓存,缓存机制，lable,table,chart,any都缓存,只有修改换的时候才更新
        page.cacheData = {};
        page.hasCacheData = false;
        //页面加载数据函数
        page.fill = function (data) {
            //创建dom缓存
            if (!page.hasCacheDom)
                createCacheDom();
            //填充数据
            windowFill(data);
            //创建数据缓存
            createCacheData();
            function windowFill(data) {
                for (var child in data) {
                    if (data[child].any != null && data[child].any != undefined)
                        fill(child, data);
                    if (data[child].lables != null && data[child].lables != undefined)
                        fillLable(child, data);
                    if (data[child].tables != null && data[child].tables != undefined)
                        fillTable(child, data);
                    if (data[child].charts != null && data[child].charts != undefined)
                        fillChart(child, data);
                }
            }
            //创建dom缓存
            function createCacheDom() {
                //初始化缓存dom 
                for (var child in data) {
                    page.cacheDom[child] = {};
                    if (data[child].lables) {
                        page.cacheDom[child]["lables"] = [];
                        for (var i = 0; i < data[child].lables.content.length; i++) {
                            var selector = "._" + child + " ._lb" + i;
                            page.cacheDom[child]["lables"].push($(selector));
                        }
                    }

                    if (data[child].tables) {
                        page.cacheDom[child]["tables"] = [];
                        for (var i = 0; i < data[child].tables.length; i++) {

                            var domArray = [];
                            var x = data[child].tables[i].start[0];
                            var y = data[child].tables[i].start[1];
                            var row = data[child].tables[i].content.length;//表格数组的宽
                            var column = data[child].tables[i].content[0].length;//表格数组的长
                            var selector = "._" + child + " ._tb" + i;
                            for (var l = y; l < row + y; l++) {

                                var itemArray = [];
                                for (var m = x; m < column + x; m++) {
                                    itemArray.push($(selector + " tr:eq(" + l + ") td:eq(" + m + ")"));
                                }
                                domArray.push(itemArray);
                            }
                            page.cacheDom[child]["tables"].push(domArray);
                        }
                    }
                }
                page.hasCacheDom = true;
            }
            //创建数据缓存
            function createCacheData() {
                page.cacheData = data;
                page.hasCacheData = true;
            }
            function fillLable(name, data) {
                var interval = 1;

                if (typeof (data[name].lables.interval) != undefined)
                    interval = data[name].lables.interval;
                if (page.pageLoadCount % interval == 0) {
                    for (var i = 0; i < data[name].lables.content.length; i++) {
                        //验证缓存数据是否修改，并绑定 
                        if (!page.hasCacheData || (page.cacheData[name].lables.content[i] != data[name].lables.content[i])) {
                            //var selector = "._" + name + " ._lb" + i;
                            var dom = page.cacheDom[name].lables[i];
                            dom.html(data[name].lables.content[i]);
                        }
                    }
                }
            }
            function fillTable(name, data) {
                for (var i = 0; i < data[name].tables.length; i++) {
                    //检查时间
                    var interval = 1;
                    if (data[name].tables[i].interval != undefined)
                        interval = data[name].tables[i].interval;
                    if (page.pageLoadCount % interval == 0) {
                        //验证缓存数据是否修改，绑定数据
                        if (!page.hasCacheData || (page.cacheData[name].tables[i].content != data[name].tables[i].content)) {
                            //var selector = "._" + name + " ._tb" + i;

                            //var x = data[name].tables[i].start[0];
                            //var y = data[name].tables[i].start[1];
                            //table.fill(selector, data[name].tables[i].content, x, y);
                            var domArray = page.cacheDom[name].tables[i];
                            var table = Table.createNew();
                            table.fillWithCache(data[name].tables[i].content, domArray);

                        }
                    }
                }

            }
            function fillChart(name, data) {
                for (var i = 0; i < data[name].charts.length; i++) {
                    //检查时间
                    var interval = 1;
                    if (data[name].charts[i].interval != undefined)
                        interval = data[name].charts[i].interval;
                    if (page.pageLoadCount % interval == 0) {
                        //验证缓存数据是否修改，绑定数据
                        if (!page.hasCacheData || (page.cacheData[name].charts[i] != data[name].charts[i])) {
                            var selector = "._" + name + " ._ct" + i;
                            var config = data[name].charts[i].config;
                            var res = $.extend(ChartOption[config], data[name].charts[i]);
                            $(selector).highcharts(res);
                        }
                    }
                }

            }
            function fill(name, data) {
                for (var i = 0; i < data[name].any.length; i++) {
                    if (!page.hasCacheData || (page.cacheData[name].any[i].content != data[name].any[i].content)) {
                        var selector = "._" + name + " ._any" + i;
                        var anyid = $(selector).attr("id");
                        var script = data[name].any[i].method;
                        script = script + "('" + anyid + "','" + JSON.stringify(data[name].any[i].content) + "')";
                        eval(script);
                    }
                }
            }
        };
        page.isTestData = false;
        //cmd检测对象
        page.cmd;
        //加载检测cmd
        page.initCMD = function () {
            if (typeof (page.cmd) == "undefined") {
                page.cmd = new CMD();
                page.cmd.init();
            }
            function CMD() {
                this.cmdObj;
                this.codeObj;
                var write = function (content, name) {
                    var title = new Date();
                    title = title.Format("hh:mm:ss");
                    title = title + "命令:" + name + "<br/>";
                    content = content + "<br/>";
                    cmd.codeObj.html(title + content + this.codeObj.html());
                }
                this.write = write;
                var clear = function () {
                    cmd.codeObj.html("");
                }
                this.clear = clear;
                var cmd = this;
                this.cmdJSON = {
                    'cmd': {
                        id: 'cmd',
                        fn: function () {
                            cmd.codeObj.show();
                            cmd.cmdObj.css("background-color", "white");
                            cmd.write("", this.id);
                        },
                        intro: "开启cmd"
                    },
                    'close': {
                        id: 'close',
                        fn: function () {
                            cmd.codeObj.hide();
                            cmd.cmdObj.css("background-color", "transparent");
                            cmd.write("", this.id);
                        },
                        intro: "关闭cmd"
                    },
                    'stop': {
                        id: 'stop',
                        fn: function () {
                            page.stop();
                            cmd.write("", this.id);
                        },
                        intro: "停止循环"
                    },
                    'help': {
                        id: 'help',
                        fn: function () {
                            var help = "--------------<br/>";
                            help += "帮助文档<br/>";
                            help += "--------------<br/>";
                            for (var it in cmd.cmdJSON) {
                                help += cmd.cmdJSON[it].id + "<br/>";
                                help += cmd.cmdJSON[it].intro + "<br/>";
                            }
                            cmd.write(help, this.id);
                        },
                        intro: "帮助文档"
                    },
                    'run': {
                        id: 'run',
                        fn: function () {
                            page.run();
                            cmd.write("", this.id);
                        },
                        intro: "启动循环"
                    },
                    'restart': {
                        id: 'restart',
                        fn: function () {
                            page.begin();
                            cmd.write("", this.id);
                        },
                        intro: "重新启动循环"
                    },
                    'checkdata': {
                        id: 'checkdata',
                        fn: function () {


                            var res = [];
                            res = getitem('', standardData.ModelData, "", res);
                            function getitem(name, item, pathStr, arr) {
                                var path = pathStr.split("~");
                                var sysValue = "var theValue=systemData";
                                var sysValue;
                                for (var i = 0 ; i < path.length; i++) {
                                    var val = path[i] == "" ? "" : "['" + path[i] + "']";
                                    sysValue += val;
                                }
                                try {
                                    eval(sysValue);
                                    var showValue = theValue.toString().trim() == "null" ? "<span style='color:red'>" + theValue + "</span>" : theValue;
                                    arr.push(pathStr + "  ： " + typeOf(item) + "," + showValue);
                                }
                                catch (e) {
                                    arr.push(pathStr + "  ： " + typeOf(item) + ",<span style='color:red'>" + e.message + "</span>");
                                }

                                if (typeOf(item) == "object") {
                                    for (var cName in item) {
                                        var cItem = item[cName];
                                        var preword = pathStr != "" ? pathStr + "~" : "";
                                        var cPathStr = preword + cName;
                                        getitem(cName, cItem, cPathStr, arr);
                                    }
                                }
                                return arr;
                            }

                            // var res = DataCheck(systemData);
                            cmd.write(res.join("<br/>"), this.id);
                        },
                        intro: "检查数据"
                    },
                    'testdata': {
                        id: 'testdata',
                        fn: function () {
                            page.isTestData = true;
                            page.stop();
                            page.fill(DataConverter(standardData.ModelData));

                            cmd.write("", this.id);
                        },
                        intro: "运行测试数据"
                    },
                    'realdata': {
                        id: 'realdata',
                        fn: function () {
                            page.isTestData = false;
                            page.run()
                            cmd.write("", this.id);
                        },
                        intro: "运行（实际-模拟）数据"
                    },
                    'clear': {
                        id: 'clear',
                        fn: function () {
                            cmd.clear();
                            cmd.write("", this.id);
                        },
                        intro: "清除cmd"
                    },
                    '对象查看': {
                        id: '--对象查看',
                        fn: function () {
                        },
                        intro: "输入page,或者page.size等等，查看page对象"
                    },
                    'js解析器': {
                        id: '--解析器',
                        fn: function () {
                        },
                        intro: "输入执行javascript,jquery等"
                    },

                };

                this.init = function () {
                    //创建cmd 
                    if ($("#cmd").length == 0) {
                        cmd.cmdObj = $("<input type='text' id='cmd'>");
                        cmd.cmdObj.attr("style", "background-color:transparent;border:none;position:absolute;z-index:120000;height:25px;top:0;left:0");
                        cmd.cmdObj.appendTo("body");
                    }
                    else
                        cmd.cmdObj = $("#cmd");

                    if ($("#code").length == 0) {
                        cmd.codeObj = $("<div id='code' ></div>");
                        cmd.codeObj.attr("style", "background-color:black;color:lightgreen;position:absolute;z-index:100;width:420px;height:600px;left:0;top:0;top:25px;;display:none;overflow:scroll;font-family:Arial;white-space:nowrap;");
                        cmd.codeObj.appendTo("body");
                    }
                    else
                        cmd.codeObj = $("#code");


                    //增加事件
                    cmd.cmdObj.unbind('keydown');
                    cmd.cmdObj.bind('keydown', { "cmdsender": cmd.cmdObj, "setting": cmd.cmdJSON }, (function (e) {
                        if (e.keyCode == 13) {
                            checkcmd(e.data.cmdsender, e.data.setting);
                            window.event.keyCode = false;
                        }
                        e.stopPropagation();
                    }));
                    function checkcmd(sender, setting) {
                        var comand = sender.val();
                        var cmdItem = setting[comand];
                        if (cmdItem != undefined)
                            cmdItem.fn();
                        else {
                            try {
                                eval("var sn=JSON.stringify(" + comand + ")");
                                cmd.write(sn, "javascript");
                            }
                            catch (e) {
                                alert(e.message);
                            }
                        }

                    }
                }
            }
        }
        page.begin = function () {
            //得到窗口初始的类i型，sizeType就可以用了
            //page.getSizeType();
            page.beginHandle();
            page.preInitHandle();
        };
        //初次加载完成，未做任何操作
        page.beginHandle = function () {
            $(document).ready(function () {
                $(window).resize(function () {
                    page.windowSizeChange();
                });
                page.getSizeType();
            });
        };
        page.windowSizeChange = function () { };
        //默认的pageload方法，可以重写
        page.pageLoad = function () {
            //验证数据是否获取  
            //cmd挪到这里(原在init里)是因为湖北大屏cmd加载不进去，原因未知，以后细查
            page.initCMD();//加载cmd
            if (page.hasData()) {
                try {
                    if (page.isFocus() && JSONHasChild(systemData))
                        page.fill(DataConverter(systemData));
                }
                catch (e) {
                    page.cmd.write(e.message, "运行错误");
                }
            }
        }
        //系统默认加载的
        //page.pageLoad = function () {};
        page.pageLoadHandle = function () {

            if (page.isRun) {
                try {
                    page.pageLoad();
                }
                catch (e) {
                    page.cmd.write(e.message, "运行错误");
                }
            }
            page.isPostBack = true;
            page.pageLoadCount += 1;
            setTimeout(page.pageLoadHandle, page.pageLoadInterval);
            //    }
            //catch(e){}
        };


        return page;
    },
};

//////////////////////////////////
//          时间控件            //
//////////////////////////////////
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
var Clock = {
    createNew: function () {
        var clock = {};
        clock.getDate = (new Date()).Format("yyyy年MM月dd日");
        clock.getWeek = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六")[(new Date()).getDay()];
        clock.getTime = (new Date()).Format("hh:mm:ss");
        return clock;
    }
};

//////////////////////////////////
//          表格控件            //
//////////////////////////////////
var Table = {
    createNew: function () {
        var table = {};
        table.fill = function (selector, array, a, b) {
            if (array != null && array != undefined) {
                var row = array.length;
                var column = array[0].length;
                for (var i = b; i < row + b; i++) {
                    for (var j = a; j < column + a; j++) {

                        $(selector + " tr:eq(" + i + ") td:eq(" + j + ")").html(array[i - b][j - a]);
                    }
                }
            }
        };
        //从数据缓冲中复制
        table.fillWithCache = function (array, tableCache) {
            for (var i = 0; i < tableCache.length; i++) {
                for (var j = 0; j < tableCache[0].length; j++) {
                    var dom = tableCache[i][j].html(array[i][j]);
                }
            }
        }
        return table;
    }
};
//////////////////////////////////
//         字符串操作           //
//////////////////////////////////
String.prototype.format = function (arguments) {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = this;

    // start with the second argument (i = 1)
    for (var i = 0; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp("\\{" + i + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }
    return theString;
}

//////////////////////////////////
//          转换方法            //
//////////////////////////////////
//c()方法  与 f()和t()方法的区别
//c方法适合返回的数据需要继续操作，如chart中的数据，处理完毕后还要显示
//缺点，返回的都是float型，如 1.30，返回的是1.3，不太美观。
//f()和t()方法，f方法纯做处理，保留小数位，和默认数交给了t方法
//缺点，返回的是字符串，操作不便，但1.30就是1.30
//字符串转换
String.prototype.i = function (char) {
    var res = i(this, char);
    return res;
}
Number.prototype.i = function () {
    return parseInt(this);
}
//num，保留的小数点，coeff,位数,char替换字符
String.prototype.f = function (coeff, nullValue) {
    var res = f(this, coeff, nullValue);
    return res;
}
String.prototype.t = function (num, char) {
    var res = t(this, num, char);
    return res;
}
//新增加的c函数，处理效果更好
String.prototype.c = function (coeff, num, nullValue) {
    var res = c(this, coeff, num, nullValue);
    return res;
}
//num，保留的小数点，coeff,位数,coeff=4
Number.prototype.f = function (coeff) {
    var res = f(this, coeff);
    return res;
}
Number.prototype.t = function (num, char) {
    var res = t(this, num, char);
    return res;
}
//新增加的c函数，处理效果更好
Number.prototype.c = function (coeff, num, nullValue) {
    var res = c(this, coeff, num, nullValue);
    return res;
}
Array.prototype.f = function (coeff, nullValue) {
    var res = f(this, coeff, nullValue);
    return res;
}
Array.prototype.t = function (num, char) {
    var res = t(this, num, char);
    return res;
}
//新增加的c函数，处理效果更好
Array.prototype.c = function (coeff, num, nullValue) {
    var res = c(this, coeff, num, nullValue);
    return res;
}
//取值方法。默认systemData
function d(id, name2, name1) {
    var res;
    try {
        if (typeof (name1) == "undefined")
            res = systemData[id][name2];
        else
            res = systemData[id][name2][name1];
    }
    catch (e) {
        res = "";
    }
    if (typeof (res) == "undefined")
        res = "";
    return res;
}
//转化成数字的基础函数
function f(sender, coeff, nullValue) {
    var type = typeOf(sender);
    //当不存在的时候显示的值 
    switch (type) {
        case "array":
            {
                var res = [];
                for (var i = 0; i < sender.length; i++) {
                    var item = sender[i];
                    item = convert(item, coeff, nullValue);
                    res.push(item);
                }
                return res;
            }
        case "number":
            {
                return convert(sender, coeff, nullValue);
            }
        case "string":
            {
                return convert(sender, coeff, nullValue);
            }
        default: {
            return "";
        }
    }
    function convert(val, coeff, nullValue) {
        var res = val;
        if (!isEmpty(val)) {
            res = parseFloat(val);
            if (!isEmpty(coeff))
                res = res / Math.pow(10, coeff);
            return res;
        }
        else if (isEmpty(val) && typeof (nullValue) != "undefined") {
            return nullValue;
        }
        else
            return "";
    }
}
//当为undefinde，NaN，"",null的时候, 设置默认值,num缩小的位数
function t(sender, num, char) {
    var nan = typeof (char) == "undefined" ? "--" : char;
    var type = typeOf(sender);
    //当不存在的时候显示的值 
    switch (type) {
        case "array":
            {
                var res = [];
                for (var i = 0; i < sender.length; i++) {
                    var item = convert(sender[i], num);
                    res.push(item);
                }
                return res;
            }
        case "number":
            {
                return convert(sender, num);
            }
        case "string":
            {
                return convert(sender, num);
            }
        default: {
            return nan;
        }
    }
    function convert(val, num) {
        if (!isEmpty(val) && !isEmpty(num)) {
            var res;
            res = parseFloat(val);
            res = toFixed(res, num);
            return res;
        }
        else
            return nan;
    }

}
//新增加的c函数，处理效果更好
function c(sender, coeff, num, nullValue) {
    var type = typeOf(sender);
    //当不存在的时候显示的值 
    switch (type) {
        case "array":
            {
                var res = [];
                for (var i = 0; i < sender.length; i++) {
                    var item = sender[i];
                    //数组中有空值，则是0
                    item = convert(item, coeff, num, 0);
                    res.push(item);
                }
                return res;
            }
        case "number":
            {
                return convert(sender, coeff, num, nullValue);
            }
        case "string":
            {
                return convert(sender, coeff, num, nullValue);
            }
        default: {
            return "";
        }
    }
    function convert(val, coeff, num, nullValue) {
        var res = val;
        if (!isEmpty(val)) {
            res = parseFloat(val);
            if (!isEmpty(coeff) && coeff != 0)
                res = res / Math.pow(10, coeff);
            if (!isEmpty(num) && num != 0)
                res = parseFloat(toFixed(res, num));
            return res;
        }
        else if (isEmpty(val) && typeof (nullValue) != "undefined") {
            return nullValue;
        }
        else
            return "--";
    }
}
//当为undefinde，NaN，"",null的时候
function isEmpty(sender) {
    var ok = typeof (sender) == "undefined" || isNaN(sender) || (sender == "" && sender !== 0);
    return ok;
}
function i(sender, char) {
    var nan = isEmpty(char) ? "--" : char;
    if (isEmpty(sender))
        return nan;
    return parseInt(sender);
}
///类型判断
function typeOf(value) {
    if (null === value) {
        return 'null';
    }

    var type = typeof value;
    if ('undefined' === type || 'string' === type) {
        return type;
    }

    var typeString = Object.prototype.toString.call(value);
    switch (typeString) {
        case '[object String]':
            return 'string';
        case '[object Number]':
            return 'number';
        case '[object Array]':
            return 'array';
        case '[object Date]':
            return 'date';
        case '[object Boolean]':
            return 'boolean';
        case '[object Function]':
            return 'function';
        case '[object RegExp]':
            return 'regexp';
        case '[object Object]':
            if (undefined !== value.nodeType) {
                if (3 == value.nodeType) {
                    return (/\S/).test(value.nodeValue) ? 'textnode' : 'whitespace';
                } else {
                    return 'element';
                }
            } else {
                return 'object';
            }
        default:
            return 'unknow';
    }
}

//得到json的子节点数
function JSONLength(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
//判断json是否有子节点
function JSONHasChild(obj) {
    var isHas = false, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            isHas = true;
            break;
        }
    }
    return isHas;
}
//原生的toFixed会四舍五入
function toFixed(val, num) {
    //效率高
    var res = (parseInt(val * Math.pow(10, num)) / Math.pow(10, num)).toString();
    var p = res.lastIndexOf(".");
    var current = p > -1 ? res.length - p - 1 : 0;//当前位数
    res = current > 0 ? res : res + ".";
    for (var i = 0; i < num - current; i++) {
        res += "0";
    }
    return res;
}