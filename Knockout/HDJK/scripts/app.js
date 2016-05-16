/**
 * Created by 31211 on 2016/5/12 0012.
 */

/**
 * @description 配置模块基础信息
 * */
require.config({
    baseUrl: "./scripts",
    paths: {
        'jquery': ['/js/jquery.min'],
        // 滚动条插件
        'perfect-scrollbar': ['/js/jquery/plugins/perfect-scrollbar/perfect-scrollbar-0.4.1.min'],
        'perfect-scrollbar-mousewheel': ['/js/jquery/plugins/perfect-scrollbar-0.4.1.with-mousewheel.min'],
        // 通用库
        'common': ['../js/util'],
        'underscore': ['/js/underscore-min'],
        // mvvm框架库
        'knockout': ['/js/knockout-3.4.0.debug'],

        //Goldwind 框架
        'GD_base1.1': ['../js/base1.1'],
        'GD_baseUI': ['/js/baseUI'],
        'GD_runlog': ['/js/runlog'],
        'GD_canvasNew': ['/js/layout/canvasNew'],

        // controller
        'homePageController': ['Controllers/homePageController'],
        // model
        'dataModel': ['Model/DataModel'],
        // viewModel
        'homePageViewModel': ['ViewModel/homePageViewModel'],
        // services
        'standingBookService': ['Services/standingBookService'],
        'monitorServices': ['Services/monitorServices']
    },
    shim: {
        'perfect-scrollbar-mousewheel': ['jquery'],
        'perfect-scrollbar': ['jquery', 'perfect-scrollbar-mousewheel'],
        'underscore': {
            exports: '_'
        }, 
        'GD_canvasNew': {
            deps: ['GD_base1.1', 'GD_baseUI']
        },
        'GD_baseUI': {
            exports: 'UI'
        }
    }
})
;

/**
 * @description 初始化
 *, 'domReady'domReady
 * */
require(['jquery', 'homePageController'], function ($, homePage) {
    "use strict"

    $(document).ready(function () {
        homePage.init();
    })

});
