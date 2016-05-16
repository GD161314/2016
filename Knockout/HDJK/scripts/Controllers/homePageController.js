/**
 * Created by 31211 on 2016/5/8 0008.
 */

define(['jquery', 'perfect-scrollbar-mousewheel', 'perfect-scrollbar','common','knockout' // 通用库
        // 业务模块
       ,"dataModel", "homePageViewModel", "standingBookService"
      ],
    function ($, mousewheel, scrollbar, common,ko,
                DataModel, HomePageViewModel,  standingBookService) {
        "use strict"

        /**
         *  @description 主页viewModel
         *
         * */
        var homeViewMode = null;

        /**
         *  @description 当前页索引
         * */
        var pageIndex = 0,
            /**
             *  @description 页容器ID集合
             * */
            pageIDs = ["contentContainer", "contentContainerTable"],
            /**
             *  @description 总页数
             * */
            pageCount = pageIDs.length;

        /**
         *  @description 显示时间
         * */
        function changeTime() {
            setInterval(function () {
                homeViewMode.Time((new Date()).Format("yyyy-MM-dd hh:mm:ss"));
                //homeViewMode.registerClick();
                $('#rightTopTime').css("visibility", "");
            }, 1000);
        };


        /**
         *  @description 翻页事件
         * */
        function addNextPageEvent() {

            $('#leftNav,#rightNav').click(function (e) {

                var step = e.currentTarget.id == "leftNav" ? -1 : 1;
                pageIndex = pageIndex + step;
                var count = pageCount;

                if (pageIndex < 0) {
                    pageIndex = count - 1;
                }
                else if (pageIndex >= count) {
                    pageIndex = 0;
                }

                changePageIndex();

            });
        };

        /**
         *  @description 初始化下半年故障列表、台账滚动条。
         * */
        function initScroll() {
            $('#contentContainerTable').perfectScrollbar({wheelPropagation: true});
            $('.gw-panel-body .inner-body').perfectScrollbar({wheelPropagation: true});
        }

        /**
         *  @description 改变当前页
         * */
        function changePageIndex() {
            var count = pageCount;
            var index = count - 1;

            while (index >= 0) {
                $('#' + pageIDs[index]). slideUp(200);

                index--;
            }

            $('#' + pageIDs[pageIndex]). slideDown(200);

            setTimeout(function () {
                    //更新内容溢出状态
                    $('#contentContainerTable').perfectScrollbar('update');
                },
                500
            );
        };

        /**
         *  @description 初始化viewModel
         * */
        function initViewModel(){
            homeViewMode = new HomePageViewModel();

            ko.applyBindings(homeViewMode);
        }

        /**
         *  @description 绑定台账数据
         * */
        function bindStandingBook(data)
        {
            homeViewMode.Areas(data);
        }

        function bindAlarmInfos(data){
            homeViewMode.DeviceAlarms(data.DeviceAlarms);
            homeViewMode.WTDeviceFaults(data.WTDeviceFaults);
            homeViewMode.PVDeviceFaults(data.PVDeviceFaults);
        }

        /**
         *  @description 初始化服务
         * */
        function initServices(){
            standingBookService.event.on(standingBookService.event.EventNames.BIND_DATA
                , bindStandingBook);
            standingBookService.event.on(standingBookService.event.EventNames.BIND_ALARM_DATA
                , bindAlarmInfos);

            standingBookService.init();
        }

        return {
            /**
             *  @description 初始化首页
             * */
            init: function () {

                changeTime();
                addNextPageEvent();

                initViewModel();
                initServices();

                initScroll();

            } 

        };
    }
);
