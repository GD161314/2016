/**
 * Created by 31211 on 2016/5/12 0012.
 */

define(['knockout'], function(ko) {



    return function homePageViewModel() {
        var self = this;



        /**
         *  @description 当前时间
         * */
        this.Time = ko.observable('');

        /**
         *  @description 设备状态列表
         * */
        this.Areas = ko.observableArray([]);

        /**
         *  @description 升压站故障列表
         * */
        this.DeviceAlarms = ko.observableArray([]);

        /**
         *  @description 光伏 逆变器 故障列表
         * */
        this.PVDeviceFaults = ko.observableArray([]);

        /**
         *  @description 风机故障列表
         * */
        this.WTDeviceFaults = ko.observableArray([]);

        /**
         *  @description  CSS
         * */
        this.CSSNames = ko.observableArray(["bejCell", "dbcCell", "tlfCell", "hmCell",  "cjCell" ]);
        /**
         *  @description  Alt Row CSS
         * */
        this.CSSAltNames = ko.observableArray(["bejAltCell", "dbcAltCell", "tlfAltCell", "hmAltCell",  "cjAltCell" ]);

        /**
         *  @description 单元格样式
         * */
        this.getClass = function(i){

            var className = this.getCollCellClass(i);

            if(!className) {
                var iVrCount = this.vrAreaCount(i);
                var index = i - iVrCount;
                var len = this.CSSNames().length;

                className =  this.CSSNames()[index % len] + " leftAlign";
            }

            return className;
        };

        /**
         *  @description 获得合计行样式
         * */
        this.getCollCellClass = function(i){

            var className = '';
            var areaType = this.Areas()[i].AreaType();

            if(areaType === 'fcxj')
            {
                className = 'fcxjCell';
            }
            else  if(areaType === 'gfxj')
            {
                className = 'gfxjCell';
            }
            else  if(areaType === 'zhj')
            {
                className = 'zhjCell';
            }

            return className;
        }
        /**
         *  @description 单元格样式
         *  @param {Number} i 父索引
         *  @param {Number} j 当前索引
         * */
        this.getAltClass = function(i, j){

            var className = this.getCollCellClass(i);

            if(!className)
            {
                var iVrCount = this.vrAreaCount(i);
                var index = i - iVrCount;

                if(j % 2 == 0)
                {
                    var len = this.CSSNames().length;
                    className = this.CSSNames()[index%len];
                }
                else{
                    var len = this.CSSAltNames().length;
                    className = this.CSSAltNames()[index%len];
                }
            }

            return className;
        };

        /**
         *  @description 统计真实区域数量,未处理多行情况
         * */
        this.realAreaCount = function (){
            var areas = this.Areas();
            var count = 0;

            for(var i in areas)
            {
                if (areas.hasOwnProperty(i)) {
                    var areaType = areas[i].AreaType();

                    if (areaType === 'Gf' || areaType === 'Wf') {
                        count += 1;
                    }
                }
            }

            return count;
        }

        /**
         *  @description 统计虚拟区域数量,未处理多行情况
         *  @param {Number} pos 在此位置之前
         * */
        this.vrAreaCount = function (pos){
            var areas = this.Areas();
            var count = 0;

            for(var i=0; i<=pos && areas.length; i++)
            {
                var areaType = areas[i].AreaType();

                if(areaType !== 'Gf' && areaType  !==  'Wf')
                {
                    count +=1;
                }
            }

            return count;
        }

        /**
         *  @description 最后一个真实区域索引
         * */
        this.getLastRealAreaIndex = function(){
            var areas = this.Areas();
            var index = 0;

            for(var i in areas)
            {
                if (areas.hasOwnProperty(i))
                {
                    try {
                        var areaType = areas[i].AreaType();

                        if (areaType === 'Gf' || areaType === 'Wf') {
                            index = i;
                        }
                    }
                    catch (ex) {
                        console && console.log(ex);
                    }
                }
            }

            return index;
        }
    };
});
