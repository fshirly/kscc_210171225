define(["base","bootstrap"],function(base,bootstrap){

	function setBanner(){
    	var itemStrs="";
    	var olStrs="";
    	$.ajax({
            type:"post",
            async: false,
            url:$.base+"/liveBroadCastController/selectHomePage",
            success:function (e) {
                if(e.status==='1'){
                    var pitureList=e.data
                    $(".carousel-indicators").empty();
                    $(".carousel-inner").empty();
                    $.each(pitureList,function(i,v){
                        if(v.networkUrl){
                            if(v.networkUrl.indexOf("http")!==-1){
                                itemStrs+="<div class='item'>"+
                                    "<a target='_blank'  href='"+v.networkUrl+"'><img src='"+$.base+"/loginController/showPic?name="+v.imageUrl+"'></a>"+
                                    "</div>";
                            }
                            else{
                                itemStrs+="<div class='item'>"+
                                    "<a target='_blank' href='https://"+v.networkUrl+"'><img src='"+$.base+"/loginController/showPic?name="+v.imageUrl+"'></a>"+
                                    "</div>";
                            }
                        }
                        else{
                            itemStrs+="<div class='item'>"+
                                "<img src='"+$.base+"/loginController/showPic?name="+v.imageUrl+"'>"+
                                "</div>";
                        }
                        olStrs+="<li data-target='#myCarousel' data-slide-to='"+i+"'></li>";
                    });
                    //$(".carousel-indicators").append(olStrs);
                    $(".carousel-inner").append(itemStrs);
                    $(".item:first").addClass("active");
                    //$(".carousel-indicators").children(":first").addClass("active");
                    //如果只有一个轮播项目的时候，不显示他的指标和导航
                    if(pitureList.length>1){
                        //轮播指标
                        $("#myCarouselHome").prepend("<ol class='carousel-indicators'></ol>");
                        $(".carouselHome .carousel-indicators").append(olStrs);
                        $(".carouselHome .carousel-indicators").children(":first").addClass("active");
                        //轮播（Carousel）导航
                        $("#myCarouselHome").append("<a class='carousel-control left' data-slide='prev' href='#myCarouselHome'></a><a class='carousel-control right'  href='#myCarouselHome' data-slide='next'></a>")
                    }else{
                        $("#myCarouselHome .carousel-indicators").remove();
                        $(".carousel-control").remove();
                    }
                    $("#myCarousel .carousel-inner img").css("margin-top",function(){
                        var height = $("#myCarousel .carousel-inner").height();
                        return (height-390)/2 + "px";
                    });
                    $('#myCarousel').carousel({
                        pause: true,
                        interval: 5000
                    });

                }
            },
            error:function(){}
    	});
    }
	
	return {
		run:function(){
			setBanner();
		}
	};
});
