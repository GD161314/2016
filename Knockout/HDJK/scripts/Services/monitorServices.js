/**
 * Created by 31211 on 2016/5/12 0012.
 */
/**
 *  @description 实时数据服务
 * */
define(['jquery', 'GD_baseUI', 'GD_canvasNew'],
    function ($, UI) {

        var self = this;

        /**
         *  @description 发送请求
         *  @param {Object} options 选项
         *  @param {function} initCallBack 初始化回调函数
         *  @param {function} updateCallBack 更新数据回调函数
        */
        function sendRequest(options, initCallBack, updateCallBack) {
            var enkey = options.enkey, enid = options.enid, scid = options.scid, pkid = options.pkid, mk = options.mk;

            var data0 = "function=SetNewDataOrder&EnKey=" + enkey + "&EnId=" + enid + "&ScId=" + scid + "&PkId=" + (pkid != null ? pkid : "") + "&ModelKey=" + (mk != null ? mk : "");
            //var data0 = "function=SetNewDataOrder&EnKey=Screen&EnId=140212&ScId=cc_map_Wf&PkId=Map&ModelKey=6C5002D3-1566-414a-8834-5077940C78E3";
            UI.Ajax({
                data: data0,
                events: {
                    id: scid + "_" + enid + "_" + pkid,
                    sync: UI.Monitor,
                    init: function (re) {
                        try {
                            initCallBack && initCallBack(re);
                            return true;
                        }
                        catch (e) {
                            console && console.log(e);
                        }

                        Base.returnPlay();
                    },
                    watch: function (data, time) {
                        return function (data, time) {

                            updateCallBack && updateCallBack(data, time);

                            Base.returnPlay();
                        }
                    }()
                }
            });
        }

        /**
        *   @description 初始化电场信息
        */
        function getPowerStation(callback) {
            $.getJSON("PowerStationTree.json", {}, function (jsonData) {

                callback && callback(jsonData);

                Base.returnPlay();
            }

            );

        };

        return {

            /**
            *   @description 初始化电场信息
            */
            getPowerStation: getPowerStation,

            /**
             * @description 发送数据请求
             *  @param {Object} options 选项
             *  @param {function} initCallBack 初始化回调函数
             *  @param {function} updateCallBack 更新数据回调函数
             */
            sendRequest: sendRequest
        }
    });