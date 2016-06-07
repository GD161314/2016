/**
 * Created by 31211 on 2016/6/7 0007.
 */
$(document).ready(function(){
    $(".leftNav li:even").click(function(i){

        $(".leftNav li").removeClass("on");
        $(this).addClass("on");
        $(this).next().addClass("on");

        $("#mainContainer").removeClass("img1");
        $("#mainContainer").removeClass("img2");
        $("#mainContainer").removeClass("img3");
        $("#mainContainer").addClass("img"  + $(this).attr("index"));

    });
});