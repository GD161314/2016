/**
 * Created by 31211 on 2016/5/12 0012.
 */

/**
 *  @description 数据类型
 * */
define(['knockout'], function(ko) {


    /**
     * @description 区域信息
     * */
    function AreaInfo(){
        var self = this;

        /**
         *  @description 区域ID
         * */
        this.AreaId = ko.observable(0);
        /**
         *  @description 区域名称
         * */
        this.AreaName = ko.observable('');

        /**
         *  @description 区域类型 Wf： 风场 Gf:光伏 Vr: 虚拟
         * */
        this.AreaType = ko.observable('Wf');

        /**
         *  @description 包含的电场
         * */
        this.ElectricFields = ko.observableArray([]);

        
    }

    /**
     *  @description 电场状态
     * */
    function ElectricField(){
        /**
         *  @description 区域名称
         * */
        this.AreaName = ko.observable('');

        /**
         *  @description 电场ID
         * */
        this.ElectricFieldId = ko.observable('');

        /**
         *  @description 电场名称
         * */
        this.ElectricFieldName = ko.observable('');

        /**
         *  @description 电场类型 0: 风电 1： 光伏 2：小计、合计
         * */
        this.ElectricFieldType = ko.observable(0);

        /**
         *  @description 装机容量
         * */
        this.Capacity = ko.observable(0);

        /**
         *  @description 计划功率 AGC
         * */
        this.PlanActPower = ko.observable(0);

        /**
         *  @description 功率
         * */
        this.TActPower = ko.observable(0);

        /**
         *  @description 风机装机台数
         * */
        this.WTCount = ko.observable(0);

        /**
         *  @description 光伏装机台数
         * */
        this.PVCount = ko.observable(0);

        /**
         *  @description 风机并网台数
         * */
        this.RunCount = ko.observable(0);

        /**
         *  @description 光伏并网台数
         * */
        this.PVONL = ko.observable(0);



        /**
         *  @description 停机台数[StopCount, --]
         * */
        this.StopCount = ko.observable(0);

        /**
         *  @description 通讯中断台数  光伏电场: PVOFL
         */
        this.DisconnectCount = ko.observable(0);

        /**
         *  @description 光伏电场通讯中断台数  : PVOFL
         */
        this.PVOFL = ko.observable(0);

        /**
         *  @description 故障台数  
         */
        this.FaultCount = ko.observable(0);

        /**
         *  @description 光伏故障台数  
         */
        this.PVFLT = ko.observable(0);

        /**
         *  @description 总发电量
         */
        this.TotalEgyAt = ko.observable(0);

        /**
         *  @description 年发电量
         */
        this.YearEgyAt = ko.observable(0);

        /**
         *  @description 月发电量
         */
        this.MonthEgyAt = ko.observable(0);

        /**
         *  @description 日发电量
         */
        this.DayEgyAt = ko.observable(0);


        /**
         *  @description 风速
         * */
        this.WindSpeed_DevAverValue = ko.observable(0);

        /**
         *  @description 辐照度
         * */
        this.PVTSI_Aver = ko.observable(0);

        /**
         *  @description 升压站有功P MH.PwrAt.Ra.F32
         * */
        this.MH_PwrAt_Ra_F32 =  ko.observable(0);

        /**
         *  @description 升压站无功Q MH.PwrReact.Ra.F32
         * */
        this.MH_PwrReact_Ra_F32 = ko.observable(0);

        /**
        * @description 升压站id
        */
        this.TransSubstationId = ko.observable('');

        /**
         *  @description  电场状态码
         *  1.Disconnect：通讯中断；
         *  2.LimitPower：限功率；
         *  3.Offline：离线；
         *  4.Run：并网运行
         * */
        this.WfStateCode = ko.observable('Offline');

        /**
         *  @description  升压站状态码
         *  1.Online：运行；
         *  2.Fault：故障；
         *  3.其它：离线；
         * */
        this.StatusCode = ko.observable('Offline');
    }

    /**
     *  @description 设备故障信息
     * */
    function DeviceAlarmInfo(){

        /**
         *  @description 设备类型 DeviceAlarm: 升压站, PVDeviceFault: 逆变器, WTDeviceFault: 风机
         * */
        this.DeviceType = ko.observable('');

        /**
         *  @description 时间
         * */
        this.tm = ko.observable('');

        /**
         *  @description 设备id
         * */
        this.did = ko.observable('');

        /**
         *  @description 告警信息
         * */
        this.me = ko.observable('');

    }

    return {
        /**
         *  @description 区域信息
         * */
        AreaInfo:AreaInfo,

        /**
         *  @description 电场状态
         * */
        ElectricField: ElectricField,

        /**
         *  @description 告警信息
         * */
        DeviceAlarmInfo: DeviceAlarmInfo
    }
});
