/**
 * Created by 31211 on 2016/5/12 0012.
 */
/**
 *  @description 设备台账业务逻辑 
 * */
define(['jquery', 'common', 'knockout', 'underscore', "dataModel", "homePageViewModel", "monitorServices"],
    function ($, common, ko, _,
              DataModel, HomePageViewModel,monitorServices) {
        'use strict'
        var self = null;
        /**
         *  事件列表
         * */
        var Events = {}; 
        var Areas = [];
        var typeIds = [7000000, 7000001, 7000002]; //全部、风机、光伏,不要修改其顺序

        //扩展underscore
        /**
         * @description 四舍五入
         * @param {Number} num 要取整的数值
         * @param {Number} digits 要保留的小数位
         */
        _.round = function (num, digits) {
            try {
                if (!isNaN(Number(num).toFixed(digits))) {
                    return Number(num).toFixed(digits);
                }
                else {
                    return 0;
                }
            }
            catch (e)
            {
                return 0;
            }
        };

        //baseUI.js中扩展了 String.trim方法，与ko中下面这段代码逻辑结合后，不符合本页面期望结果，所以本页面移除String.trim
        //stringTrim: function (string) {
        //return string === null || string === undefined ? '' :
        //    string.trim ?
        //        string.trim() :
        //        string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
        //},
        //baseUI.js 中的方法去掉了，字符串中所有空格，这在大部分情况下都是不合适的，建议改为去除首尾空格
        // String.prototype.trim = function ()
        //{
        //    return this.replace(/ |　/g, "");
        //}
        //
        String.prototype.trim = null;

        ko.onError = function (error) {
            console.log("knockout error", error);
        };

        /**
         *  @description 复制对象属性
         *  @param {Object} src 源对象
         *  @param {Object} des 目标对象
         * */
        function copyObject(src, des){
            // 以客户端model为准
            for (var prop in des) {
                if(des.hasOwnProperty(prop))
                {
                    //prop = prop.replace('.', '_');
                    // typeof source[key]===’object’? deepCoyp(source[key]): source[key];
                    des[prop]( src[prop]);
                }
            }
        }

        /**
         *  @description 生成告警信息 model
         * */
        function createDeviceAlarmInfos(data){
            var deviceAlarms=[], pVDeviceFaults=[], wTDeviceFaults=[];
            var descAlarms = null;
            var alarmData = null;

            for(var typeId in data)
            {
               if(data[typeId].DeviceAlarm)
               {
                   descAlarms = deviceAlarms;
                   alarmData = data[typeId].DeviceAlarm;
               }
               else if(data[typeId].WTDeviceFault)
               {
                   descAlarms = wTDeviceFaults;
                   alarmData = data[typeId].WTDeviceFault;
               }
               else if(data[typeId].PVDeviceFault)
               {
                   descAlarms = pVDeviceFaults;
                   alarmData = data[typeId].PVDeviceFault;
               }

                for(var alarmId in alarmData)
                {
                    descAlarms.push(createAlarmInfo(alarmData[alarmId]));
                }
            }

            return {
                DeviceAlarms:  deviceAlarms,
                PVDeviceFaults: pVDeviceFaults,
                WTDeviceFaults: wTDeviceFaults
            }
        }

        /**
         *  @description 创建告警信息条目
         * */
        function createAlarmInfo(dataItem)
        {
            var alarmInfo = new DataModel.DeviceAlarmInfo();

            copyObject(dataItem, alarmInfo);

            return alarmInfo;
        }

        /**
         *  @description 生成告警测试数据
         * */
        function createAlarmTestData(){
            var result = {
                7000000: {DeviceAlarm:{1:{tm:'2016-05-13 23:58:59', did:71234, me:'7000000运行状态异常'},2:{tm:'2016-05-13 23:58:59', did:71234, me:'7000000运行状态异常'}} },
                7000001: {WTDeviceFault:{1:{tm:'2016-05-13 23:58:59', did:71234, me:'7000001运行状态异常'},2:{tm:'2016-05-13 23:58:59', did:71234, me:'7000001运行状态异常'}} },
                7000002: {PVDeviceFault:{1:{tm:'2016-05-13 23:58:59', did:71234, me:'7000002运行状态异常'},2:{tm:'2016-05-13 23:58:59', did:71234, me:'7000002运行状态异常'}} }
            };

            return createDeviceAlarmInfos(result);
        }

        /**
         *  @description 更新故障列表, DeviceAlarm PVDeviceFault WTDeviceFault
         * */
        function updateAlarmData(data){

            //var result = {
            //    7000000: {DeviceAlarm:{1:{tm:'2016-05-13 23:58:59', did:71234, me:'7000000运行状态异常'},2:{tm:'2016-05-13 23:58:59', did:71234, me:'7000000运行状态异常'}} },
            //    7000001: {WTDeviceFault:{1:{tm:'2016-05-13 23:58:59', did:71234, me:'7000001运行状态异常'},2:{tm:'2016-05-13 23:58:59', did:71234, me:'7000001运行状态异常'}} },
            //    7000002: {PVDeviceFault:{1:{tm:'2016-05-13 23:58:59', did:71234, me:'7000002运行状态异常'},2:{tm:'2016-05-13 23:58:59', did:71234, me:'7000002运行状态异常'}} }
            //};

            if(data)
            {
                var deviceAlarms = {};

                for(var i in typeIds){

                    if(data[typeIds[i]])
                    {
                        //data[typeIds[i]] = result[typeIds[i]];
                        deviceAlarms[typeIds[i]]= data[typeIds[i]];
                    }
                }
                if (typeof Events[self.event.EventNames.BIND_ALARM_DATA] == "function") {

                    var alarms = createDeviceAlarmInfos(deviceAlarms);


                    Events[self.event.EventNames.BIND_ALARM_DATA](alarms);
                }
            }
        }

        /**
       * @description 获取电场状态数据
       */
        function requestFieldStatus() {

            var options = {
                enkey: 'Screen',
                enid: 7000000, 
                scid: 'HDJK', 
                pkid: 0,
                mk: '3fed1501-763c-458f-b1f5-d6318c025ef2'
            };
            //var data0 = "function=SetNewDataOrder&EnKey=Screen&EnId=140212&ScId=cc_map_Wf&PkId=Map&ModelKey=6C5002D3-1566-414a-8834-5077940C78E3";
            monitorServices.sendRequest(options, initFieldStatus, updateFieldStatus);
        }

        /**
        * @description 初始化电场状态数据
        */
        function initFieldStatus(data) {

        }

        /**
        * @description 更新电场状态数据
        */
        function updateFieldStatus(data) {


        }

        /**
        * @description 获取台账数据
        */
        function requestStandingBook() {

            var options = {
                enkey: 'Screen',
                enid: 7000000, //
                scid: 'HDJKList',//HDJKList HDJK
                pkid: 0,
                mk: '3fed1501-763c-458f-b1f5-d6318c025ef2'
                };
            //var data0 = "function=SetNewDataOrder&EnKey=Screen&EnId=140212&ScId=cc_map_Wf&PkId=Map&ModelKey=6C5002D3-1566-414a-8834-5077940C78E3";
            monitorServices.sendRequest(options, initStandingBook, updateStandingBook);
        }

        /**
        * @description 初始化电场数据，更新电场名称
        */
        function initStandingBook(data) {

            if(data && data.result && data.result.ens)
            {
                for (var i = 0; i < Areas.length; i++) {
                    var efs = Areas[i].ElectricFields();

                    for (var j = 0; j < efs.length;j++)
                    {
                        var eid = efs[j].ElectricFieldId();
                        var elecInfo = new DataModel.ElectricField();
                        var prop = "ElectricFieldName";
                        if (data.result.ens[eid])
                        {
                            efs[j][prop](data.result.ens[eid].name);
                        }
                    }
                }
            }
            requestFieldStatus();
        }

        /**
        * @description 更新台账、电场状态数据
        */
        function updateStandingBook(data) { 

            setTimeout(function(){
                updateAlarmData(data);
            }, 100);

            for (var i = 0; i < Areas.length; i++) {
                var efs = Areas[i].ElectricFields();

                for (var j = 0; j < efs.length;j++)
                {
                    var eid = efs[j].ElectricFieldId(); 
                    var elecInfo = new DataModel.ElectricField();

                    for (var prop in elecInfo)
                    {
                        if (elecInfo.hasOwnProperty(prop))
                        {
                            if (data[eid] && data[eid][prop] != undefined)
                            {
                                efs[j][prop](data[eid][prop]);
                            } 
                        }
                    }

                    if(typeIds[0] == eid)
                    {
                        calcColl(eid, efs[j], data);
                    }

                    updateTransSubstationStatus(efs[j], data);
                } 
            }
        }

        /**
         *  @description 计算总合计列
         *  @param {Number} eid 电场ＩＤ
         *  @param {Object} elecInfo 电场Model对象
         *  @param {Obejct} 实时数据
         * */
        function calcColl(eid, elecInfo, data)
        {

            if(data && data[typeIds[0]] && data[typeIds[1]] && data[typeIds[2]])
            {
                elecInfo["WTCount"](Number(_.round(data[typeIds[1]].WTCount, 0)) + Number(_.round(data[typeIds[2]].PVCount, 0)));
                elecInfo["StopCount"](_.round(data[typeIds[1]].StopCount, 0));
                elecInfo["RunCount"]( Number(_.round(data[typeIds[1]].RunCount, 0)) + Number(_.round(data[typeIds[2]].PVONL, 0)));
                elecInfo["DisconnectCount"] ( Number(_.round(data[typeIds[1]].DisconnectCount, 0)) + Number(_.round(data[typeIds[2]].PVOFL, 0)));
                elecInfo["FaultCount"]( Number(_.round(data[typeIds[1]].FaultCount, 0)) + Number(_.round(data[typeIds[2]].PVFLT, 0)));
            }
        }

        /**
        * @description 更新升压站状态数据
        */
        function updateTransSubstationStatus(elecInfo, data)
        {
            var tStationId = elecInfo.TransSubstationId();

            if (data[tStationId]) { 
                for (var prop in data[tStationId]) {
                    if (data[tStationId].hasOwnProperty(prop)) 
                    {
                        //变量名称不能用. 所以和JSON对象有不同，.用_代替
                        var propVM = prop.replace(/\./g, "_");
                        elecInfo[propVM](data[tStationId][prop]);
                    }
                }
            }
        }

        /**
        * @description 获取地区、电场树数据
        */
        function initDeviceData() {

            monitorServices.getPowerStation(initDeviceDataCallback);
        }

        /**
        * @description 初始化地区、电场
        */
        function initDeviceDataCallback(data) { 

            if (typeof Events[self.event.EventNames.BIND_DATA] == "function") { 
                
                var areas = Areas;

                for (var i in data) {
                    if (data.hasOwnProperty(i))
                    {
                        var efs = [];
                        for (var j in data[i].ElectricFields) {
                            if (data[i].ElectricFields.hasOwnProperty(j)) {
                                var electric = new DataModel.ElectricField();

                                copyObject(data[i].ElectricFields[j], electric);
                                efs.push(electric);
                            }
                        }

                        data[i].ElectricFields = [].concat(efs);

                        var area = new DataModel.AreaInfo();
                        copyObject(data[i], area);
                          
                        areas.push(area); 
                    }
                }

                Events[self.event.EventNames.BIND_DATA](areas);
            }

            requestStandingBook();
        }

        return {
            /**
             *  @description 初始服务
             * */
            init: function () {
                //发送获取数据的请求
                //得到数据后执行数据绑定回调函数
                self = this;

                initDeviceData(); 
            },

            /**
             *  @description 事件
             * */
            event: {
                /**
                 *  @description 事件名称枚举
                 * */
                EventNames:{
                    /**
                     *  @description 绑定状态数据
                     * */
                    BIND_DATA: "bindStatusData",
                    /**
                     *  @description 绑定告警数据
                     * */
                    BIND_ALARM_DATA: "bindAlarmData"
                },
                /**
                 *  @description 添加事件监听
                 * */
                on: function (eventName, handler) {
                    Events[eventName] = handler;
                }
            }
        };

    });
