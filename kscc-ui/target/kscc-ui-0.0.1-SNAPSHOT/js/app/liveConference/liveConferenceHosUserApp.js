define(["base", "datatables.net"], function (base, DataTable) {
    var loginUserId = '';
    function userId() {
        $.ajax({
            type: "post",
            async: false,
            url: $.base + "/liveBroadCastController/getUserId",
            success: function (data) {
                loginUserId = data.id;
            }
        });
    };
    
    function viewLiveDetail(liveId) {
        $.ajax({
            type: "GET",
            async: false,
            url: $.base + "/liveBroadCastController/getLiveDetail/" + liveId,
            contentType: "application/json",
            success: function (data) {
                var value = data.filePath;
                var fileName = data.fileName;
                //$('#a1').attr('href', '../fileUpload/download?fileUrl=' + value + '&fileName=' + fileName);
                $("#liveNameView").text(data.title);//直播名称
                $("#liveNameView").attr("title", data.title);
                $("#liveStartTimeView").text(formatDate(data.startTime));//直播开始时间
                $("#liveEndTimeView").text(formatDate(data.endTime));//直播结束时间
                $("#departmentView").text(data.departmentName);//科室名字
                $("#linkManView").text(data.linkMan);//联系人
                $("#phoneView").text(data.phone);//联系方式
                $("#emailView").text(data.email);//邮箱地址
                $("#hospitalURLView").text(data.hospitalWebsite);//医院网址
                $("#hospitalURLView").attr("title", data.hospitalWebsite);
                $("#liveIntroductionView").text(data.liveIntroduction);//直播简介
                $("#liveIntroductionView").attr("title", data.liveIntroduction);

                $("#enclosureView").text('');//附件
                var aElement = $('#a1')
                if(value){
                    aElement.click(function () {
                        $('#fileName_bak').val(fileName);
                        $('#fileUrl_bak').val(value);
                        $("#fileupdown").submit();
                    })
                    aElement.attr('title',fileName);
                    aElement.html(fileName);
                }else{
                    aElement.attr('href','#');
                    aElement.html("无附件");
                    aElement.attr('title','');
                    aElement.css({"cursor":"default","color":"rgb(69, 69, 69)"});
                }

                var hostParams = data.participants;//参与方数据
                $("#liveParticipantView").empty();
                $.each(hostParams, function (i, v) {
                    if (v.serialNumber == 1) {
                        $("#liveParticipantView").append("<li att='" + v.id + "' class='participantsLi'><span class='iconfont iconfontList'>&#xe61e;</span><span class='controlParti' title='" + v.hospitalName + "'>" + v.hospitalName + "</span><span class='iconfont iconfontImg' style='color:#ee453b;' title='第一主持人'>&#xe61c;</span></li>");
                    } else if (v.serialNumber == 2) {
                        $("#liveParticipantView").append("<li att='" + v.id + "' class='participantsLi'><span class='iconfont iconfontList'>&#xe61e;</span><span class='controlParti' title='" + v.hospitalName + "'>" + v.hospitalName + "</span></li>");//<span class='iconfont iconfontImg' title='第二主持人'>&#xe61c;</span>
                    } else {
                        $("#liveParticipantView").append("<li att='" + v.id + "' class='participantsLi'><span class='iconfont iconfontList'>&#xe61e;</span><span class='controlParti' title='" + v.hospitalName + "'>" + v.hospitalName + "</span></li>");
                    }
                });
                searchMain(hostParams);
            }
        });
    }

    /**
     * 时间戳转化为固定格式日期
     * @param m
     * @returns {string}
     */
    function add0(m) {
        return m < 10 ? '0' + m : m
    }

    function formatDate(now) {
        var time = new Date(now);
        var year = time.getFullYear();
        var month = time.getMonth() + 1;
        var date = time.getDate();
        var hour = time.getHours();
        var minute = time.getMinutes();
        var second = time.getSeconds();
        return year + '-' + add0(month) + '-' + add0(date) + ' ' + add0(hour) + ':' + add0(minute);
    }

    //页面参与方列表搜索框
    function searchMain(nodesObj) {
        $("#searchBtnView").on("click", function () {
            var condition = $("#searchParticipantView").val();
            $("#liveParticipantView").empty();
            var container = [];
            $.each(nodesObj, function (i, v) {
                if (v.hospitalName.indexOf(condition) > -1) {
                    container.push(v);
                }
            });
            $.each(container, function (i, v) {
                if (v.serialNumber == 1) {
                    $("#liveParticipantView").append("<li att='" + v.id + "' class='participantsLi'><span class='iconfont iconfontList'>&#xe61e;</span><span class='controlParti' title='" + v.hospitalName + "'>" + v.hospitalName + "</span><span class='iconfont iconfontImg' style='color:#ee453b;' title='第一主持人'>&#xe61c;</span></li>");
                }
                else if (v.serialNumber == 2) {
                    $("#liveParticipantView").append("<li att='" + v.id + "' class='participantsLi'><span class='iconfont iconfontList'>&#xe61e;</span><span class='controlParti' title='" + v.hospitalName + "'>" + v.hospitalName + "</span>");//<span class='iconfont iconfontImg' title='第二主持人'>&#xe61c;</span></li>
                }
                else {
                    $("#liveParticipantView").append("<li att='" + v.id + "' class='participantsLi'><span class='iconfont iconfontList'>&#xe61e;</span><span class='controlParti' title='" + v.hospitalName + "'>" + v.hospitalName + "</span></li>");
                }
            });
        });
    }

    function setTabChange() {
        $('#myTab a').click(function (e) {
            e.preventDefault();//阻止a链接的跳转行为
            $(this).tab('show');//显示当前选中的链接及关联的content
            if ($(this).html() == "我的直播") {
                setReservationLive();
            }
            else if ($(this).html() == "我的申请") {
                setApplicationLive();
            }
            else if ($(this).html() == "我的受邀") {
                setInvitedLive();
            }
            else if ($(this).html() == "历史记录") {
                setTableHis();
            }
        });
    }

    //我的直播
    function setReservationLive() {
        $.ajax({
            type: "POST",
            async: false,
            url: $.base + "/liveBroadCastController/myLiveBroadcast",
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify({
                approvalStatus: '1',
                userId: loginUserId,
                playStatus: '0',
                isDel: '0',
                participation: '1'
            }),
            success: function (data) {
                var liveCon = data.data;
                var lis = "";
                $("#carouselCircleReservation").empty();
                $("#innerReservation").empty();
                
                $.each(liveCon, function (i, v) {
                    var divs = "";var picPath="";
                    if (v.userId == loginUserId) {
                        divs = "<div att='" + v.id + "' class='reservationView'><i class='iconfont' title='介绍'>&#xe64c;</i><span class='infoSpan'>介绍</span></div>" +
                            "<div att='" + v.id + "' class='reservationEdit'><i class='iconfont' title='修改'>&#xe608;</i><span class='infoSpan'>修改</span></div>" +
                            "<div att='" + v.id + "' class='reservationStart'><i class='iconfont' title='开始'>&#xe61a;</i><span class='infoSpan'>开始</span></div>" +
                            "<div att='" + v.id + "' class='reservationEnd'><i class='iconfont' title='取消'>&#xe610;</i><span class='infoSpan'>取消</span></div>";
                    }
                    else {
                        divs = "<div att='" + v.id + "' class='reservationView' style='border-bottom:0px;'><i class='iconfont' title='介绍'>&#xe64c;</i><span class='infoSpan'>介绍</span></div>";
                    }
                    if(v.picturePath){
                    	picPath=$.base+"/loginController/showPic?name="+v.picturePath;
                    }else{
                    	picPath=$.base+"/images/pages/changePic.png";
                    }
                    var index = Math.ceil((i + 1) / 4);
                    lis += "<li class='carousel_" + index + " bannerLi'>" +
                        "<div class='bannerDiv' style='background:url("+picPath+") no-repeat;-moz-background-size:100% 100%; background-size:100% 100%'>" +
                        "<div class='bgDiv'>" +
                        "<div class='titleH'>" + v.title + "</div>" +
                        "<div class='startTimeH'>" + (v.startTime).substr(0,16) + "</div>" +
                        "<div class='btnDiv'>" + divs + "</div>" +
                        "</div>" +
                        "</div>" +
                        "</li>";
                });
                $("#innerReservation").append(lis);
                for (var i = 0; i < Math.ceil(liveCon.length / 4); i++) {
                    $("#innerReservation .carousel_" + (i + 1) + "").wrapAll("<ul class='carouselUl_" + (i + 1) + "'></ul>");
                    $("#innerReservation .carouselUl_" + (i + 1) + "").wrap("<div class='item'></div>");
                    $("#carouselCircleReservation").append("<li data-target='#myCarouselReservation' data-slide-to='" + i + "'></li>");
                }
                $("#innerReservation .item:first").addClass("active");
                $("#carouselCircleReservation").children(":first").addClass("active");
                $('#myCarouselReservation').carousel({
                    pause: true,
                    interval: false
                });
                setReservationClick();
                setShowOrHide();
                setScroll($('#myCarouselReservation'));
            }
        });
    }

    function setReservationClick() {
        //我的直播查看
        $(".reservationView").on("click", function () {
            var liveId = $(this).attr("att");
            $(this).attr({"data-toggle": "modal", "data-target": "#liveViewModal"});
            $("#searchParticipantView").val("");
            viewLiveDetail(liveId);
        });

        //我的直播编辑
        $(".reservationEdit").on("click", function () {
            var liveEditId = $(this).attr("att");

            $("#liveIdEdit").val(liveEditId);
            $("#siteEdit").val("/loginController/toLiveConferenceHosUser");
            $("#indexEdit").val("0");
            var url = $.base + "/loginController/toEditLiveBroadcast";
            $.ajax({
                type: "GET",
                url: url,
                error: function () {
                    alert("加载错误！");
                },
                success: function (data) {
                    if (data.indexOf('06a5bb21-b8f0-4dfd-8004-4b4e17d4f81c') !== -1) {
                        window.location.href = $.base + '/loginController/toLogin'
                        return
                    }
                    $(".middle").html(data);
                }
            });
        });

        //开始直播弹框
        $(".reservationStart").on("click", function () {
            var startLiveId = $(this).attr("att");
            base.confirm({
                label: "提示",
                text: "<div style='text-align:center;font-size:13px;'>确定开始此直播?</div>",
                textAlign:'text-align:center',
                confirmCallback: function () {
                    var requestTip = base.requestTip({position: "center"});
                    $.ajax({
                        url: $.base + "/liveBroadCastController/startLive/" + startLiveId,
                        type: "GET",
                        contentType: "application/json",
                        success: function (data) {
                            if (data.status === "1") {
                                setReservationLive();//刷新已预约直播
                                requestTip.success();
                            }
                        },
                        beforeSend: function () {
                            requestTip.wait();
                        },
                        error: function () {
                            requestTip.error();
                        }
                    });
                }
            });
        });

        //取消直播弹框
        $(".reservationEnd").on("click", function () {
            var endLiveId = $(this).attr("att");
            base.confirm({
                label: "提示",
                text: "<div style='text-align:center;font-size:13px;'>确定开始此直播?</div>",
                textAlign:'text-align:center',
                confirmCallback: function () {
                    var requestTip = base.requestTip({position: "center"});
                    $.ajax({
                        url: $.base + "/liveBroadCastController/cancelLive/" + endLiveId,
                        type: "get",
                        contentType: "application/json",
                        success: function (data) {
                            setReservationLive();//刷新已预约直播
                            requestTip.success();
                        },
                        beforeSend: function () {
                            requestTip.wait();
                        },
                        error: function () {
                            requestTip.error();
                        }
                    });
                }
            });
        });
    }

    //申请的直播
    function setApplicationLive() {
        var data = {
            approvalStatus: "0",
            userId: loginUserId,
            isDel:"0"
        };

        $.ajax({
            type: "post",
            async: false,
            data: JSON.stringify(data),
            url: $.base + "/liveBroadCastController/queryLiveBroadcast",
            contentType: "application/json",
            success: function (data) {
                //'0待审批，1通过2拒绝
                var liveCon = data.data;
                var lis = "";
                $("#carouselCircleApplication").empty();
                $("#innerApplication").empty();
                $.each(liveCon, function (i, v) {
                    var divs = "";var picPath="";
                    if (v.approvalStatus == 0) {
                        divs = "<div att='" + v.id + "' class='applicationView'><i class='iconfont' title='介绍'>&#xe64c;</i><span class='infoSpan'>介绍</span></div>" +
                            "<div att='" + v.id + "' class='applicationEdit' style='border-bottom:0px;'><i class='iconfont' title='修改'>&#xe608;</i><span class='infoSpan'>修改</span></div>";
                    }
                    else {
                        divs = "<div att='" + v.id + "' class='applicationView' style='border-bottom:0px;'><i class='iconfont' title='介绍'>&#xe64c;</i><span class='infoSpan'>介绍</span></div>";
                    }
                    if(v.picturePath){
                    	picPath=$.base+"/loginController/showPic?name="+v.picturePath;
                    }else{
                    	picPath=$.base+"/images/pages/changePic.png";
                    }
                    var index = Math.ceil((i + 1) / 4);
                    lis += "<li class='carousel_" + index + " bannerLi'>" +
                        "<div class='bannerDiv' style='background:url("+picPath+") no-repeat;-moz-background-size:100% 100%; background-size:100% 100%'>" +
                        "<div class='bgDiv'>" +
                        "<div class='appNoApproval'>已申请，待审核</div>"+
                        "<div class='titleH'>" + v.title + "</div>" +
                        "<div class='startTimeH'>" + (v.startTime).substr(0,16) + "</div>" +
                        "<div class='btnDiv'>" + divs + "</div>" +
                        "</div>" +
                        "</div>" +
                        "</li>";
                });
                $("#innerApplication").append(lis);
                for (var i = 0; i < Math.ceil(liveCon.length / 4); i++) {
                    $("#innerApplication .carousel_" + (i + 1) + "").wrapAll("<ul class='carouselUl_" + (i + 1) + "'></ul>");
                    $("#innerApplication .carouselUl_" + (i + 1) + "").wrap("<div class='item'></div>");
                    $("#carouselCircleApplication").append("<li data-target='#myCarouselApplication' data-slide-to='" + i + "'></li>");
                }
                $("#innerApplication .item:first").addClass("active");
                $("#carouselCircleApplication").children(":first").addClass("active");
                $('#myCarouselApplication').carousel({
                    pause: true,
                    interval: false
                });
                setApplicationClick();
                setShowOrHide();
                setScroll($('#myCarouselApplication'));
            }
        });
    }

    function setApplicationClick() {
        //申请的直播查看
        $(".applicationView").on("click", function () {
            var liveViewId = $(this).attr("att");
            $(this).attr({"data-toggle": "modal", "data-target": "#liveViewModal"});
            $("#searchParticipantView").val("");
            viewLiveDetail(liveViewId);
        });

        //申请的直播编辑
        $(".applicationEdit").on("click", function () {
            var liveEditId = $(this).attr("att");
            $("#liveIdEdit").val(liveEditId);
            $("#siteEdit").val("/loginController/toLiveConferenceHosUser");
            $("#indexEdit").val("1");
            var url = $.base + "/loginController/toEditLiveBroadcast";
            $.ajax({
                type: "GET",
                url: url,
                error: function () {
                    alert("加载错误！");
                },
                success: function (data) {
                    if (data.indexOf('06a5bb21-b8f0-4dfd-8004-4b4e17d4f81c') !== -1) {
                        window.location.href = $.base + '/loginController/toLogin'
                        return
                    }
                    $(".middle").html(data);
                    ;
                }
            });
        });
    }

    //受邀直播
    function setInvitedLive() {
        var data = {
            userId: loginUserId,
            participation: '0',
            playStatus: '0',
            approvalStatus: '1',
            isDel: '0'
        };
        $.ajax({
            type: "post",
            async: false,
            url: $.base + "/liveBroadCastController/inviteLive",
            data: JSON.stringify(data),
            contentType: "application/json",
            success: function (data) {
                var liveCon = data.data;
                var lis = "";
                $("#carouselCircleInvited").empty();
                $("#innerInvited").empty();
                $.each(liveCon, function (i, v) {
                	var picPath="";
                	if(v.picturePath){
                    	picPath=$.base+"/loginController/showPic?name="+v.picturePath;
                    }else{
                    	picPath=$.base+"/images/pages/changePic.png";
                    }
                    var index = Math.ceil((i + 1) / 4);
                    lis += "<li class='carousel_" + index + " bannerLi'>" +
                        "<div class='bannerDiv' style='background:url("+picPath+") no-repeat;-moz-background-size:100% 100%; background-size:100% 100%'>" +
                        "<div class='bgDiv'>" +
                        "<div class='titleH'>" + v.title + "</div>" +
                        "<div class='startTimeH'>" + (v.startTime).substr(0,16) + "</div>" +
                        "<div class='btnDiv'>" +
                        "<div att='" + v.id + "' class='invitedView'><i class='iconfont' title='介绍'>&#xe64c;</i><span class='infoSpan'>介绍</span></div>" +
                        "<div att='" + v.id + "' class='invitedAgree'><i class='iconfont' title='参与'>&#xe648;</i><span class='infoSpan'>参与</span></div>" +
                        "<div att='" + v.id + "' class='invitedDisagree' style='border-bottom:0px;'><i class='iconfont' title='拒绝'>&#xe99c;</i><span class='infoSpan'>拒绝</span></div>";
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</li>";
                });
                $("#innerInvited").append(lis);
                for (var i = 0; i < Math.ceil(liveCon.length / 4); i++) {
                    $("#innerInvited .carousel_" + (i + 1) + "").wrapAll("<ul class='carouselUl_" + (i + 1) + "'></ul>");
                    $("#innerInvited .carouselUl_" + (i + 1) + "").wrap("<div class='item'></div>");
                    $("#carouselCircleInvited").append("<li data-target='#myCarouselInvited' data-slide-to='" + i + "'></li>");
                }
                $("#innerInvited .item:first").addClass("active");
                $("#carouselCircleInvited").children(":first").addClass("active");
                $('#myCarouselInvited').carousel({
                    pause: true,
                    interval: false
                });
                setInvitedClick();
                setShowOrHide();
                setScroll($('#myCarouselInvited'));
            }
        });
    }

    function setInvitedClick() {
        //受邀直播查看
        $(".invitedView").on("click", function () {
            var liveId = $(this).attr("att");
            $(this).attr({"data-toggle": "modal", "data-target": "#liveViewModal"});
            $("#searchParticipantView").val("");
            viewLiveDetail(liveId);
        });

        //参与
        $(".invitedAgree").on("click", function () {
            var agreeId = $(this).attr("att");
            base.confirm({
                label: "提示",
                text: "<div style='text-align:center;font-size:13px;'>确定参与此直播?</div>",
                textAlign:'text-align:center',
                confirmCallback: function () {
                    var requestTip = base.requestTip({position: "center"});
                    $.ajax({
                        url: $.base + "/liveBroadCastController/agreeOrNot",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({participant: '1', userId: loginUserId, liveId: agreeId}),
                        success: function (data) {
                            setInvitedLive();
                            requestTip.success();
                        },
                        beforeSend: function () {
                            requestTip.wait();
                        },
                        error: function () {
                            requestTip.error();
                        }
                    });
                }
            });
        });
        //拒绝
        $(".invitedDisagree").on("click", function () {
            var disagreeId = $(this).attr("att");
            base.confirm({
                label: "提示",
                text: "<div style='text-align:center;font-size:13px;'>确定拒绝此直播?</div>",
                textAlign:'text-align:center',
                confirmCallback: function () {
                    var requestTip = base.requestTip({position: "center"});
                    $.ajax({
                        url: $.base + "/liveBroadCastController/agreeOrNot",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({participant: '2', userId: loginUserId, liveId: disagreeId}),
                        success: function (data) {
                            setInvitedLive();
                            requestTip.success();
                        },
                        beforeSend: function () {
                            requestTip.wait();
                        },
                        error: function () {
                            requestTip.error();
                        }
                    });
                }
            });
        });
    }

    function setShowOrHide() {
        $(".bannerDiv").mouseover(function () {
            $(this).find(".btnDiv").show();
        });

        $(".bannerDiv").mouseleave(function () {
            $(this).find(".btnDiv").hide();
        });
    }

    function setScroll($container){
		var height = parseInt($(".middleContent").height()-65) ;
		$container.height(height);
		var divHeight=$container.find(".bannerLi").height();
		$container.find(".item").css({"margin-top":(height-divHeight)/2,"margin-bottom":(height-divHeight)/2});
	 }
    
    //历史记录
    function setTableHis() {
        $("#tblHistory").DataTable({
            "searching": false,
            "lengthChange": false,
            "autoWidth": false,
            "serverSide": true,
            "paging": true,
            "stateSave":true,
            "ordering": false,
            "bRetrieve": true,
            "language": {"url": $.base + "/js/lib/chinese.json"},
            "ajax": {
                "type": "POST",
                "url": $.base + "/liveBroadCastController/getLiveBroadcast",
                "contentType": "application/json",
                "data": function (d) {
                    var params = {
                        "pageNo": d.start / d.length + 1,
                        "pageSize": d.length,
                        "param": {
                            "status": $("#liveType").find("option:selected").val(),//直播类型
                            "userId": loginUserId
                        }
                    };
                    return JSON.stringify(params);
                }
            },
            "columns": [
                {"title": "序号", "data": "", "sWidth": "5%"},
                {"title": "直播名称", "data": "title", "sWidth": "30%"},
                {"title": "直播类型", "data": "liveType", "sWidth": "25%"},
                {"title": "直播开始时间", "data": "startTime", "sWidth": "25%"},
                {"title": "操作", "data": "operate", "sWidth": "15%"}
            ],
            "columnDefs": [
                {
                    "render": function (data, type, row, meta) {
                        return meta.row + 1;
                    },
                    "targets": 0
                },
                {
                    "render": function (data, type, row, meta) {
                        var html = "";
                        html = "<span class='widthLength widthLengthEx' title='" + row.title + "'>" + row.title + "</span>";
                        return html;
                    },
                    "targets": 1
                },
                {
                    "render": function (data, type, row, meta) {
                        if (data != null && data != '') {
                            return data.substr(0, 16);
                        }
                    },
                    "targets": 3
                },
                {
                    "render": function (data, type, row, meta) {
                        var phone = row.mobilePhone ? row.mobilePhone : row.telePhone;
                        var html = "";
                        html = "<div class='clearfix'>" +
                            "<div style='display:inline-block;'><button class='btn btn-link liveViewHis' attr='" + row.id + "' ><i class='iconfont' title='查看' style='color:#00479d;'>&#xe609;</i></button></div>" +
                            "</div>";
                        return html;
                    },
                    "targets": 4
                }
            ],

            "drawCallback": function (setting) {
                //历史记录查看
                $(".liveViewHis").on("click", function () {
                    var liveId = $(this).attr("attr");
                    $(this).attr({"data-toggle": "modal", "data-target": "#liveViewModal"});
                    $("#searchParticipantView").val("");
                    viewLiveDetail(liveId);
                });
                setScrollTab();
            }
        });
    };
    
    function setScrollTab(){
    	var height = parseInt($(".middleContent").height()-100) ;
		$(".tHistory").height(height); 
    	base.scroll({
            container:".tHistory"
        });
    }

    function setPage() {
   
    	//获得从第几个tab跳转
        var index = $("#indexEdit").val();
        if(index){
        	$('#myTab li:eq(' + index + ') a').tab('show');
        	switch(index)
        	{
        	case "0":
        	  setReservationLive();
        	  break;
        	case "1":
        	  setApplicationLive();
        	  break;
        	case "2":
        	  setInvitedLive();
        	  break;
        	case "3":
        	  setTableHis();
          	  break;
        	}
        }else{
        	$('#myTab li:eq(0) a').tab('show');
        	setReservationLive();
        }

        //审批状态搜索
        $("#searchBtnApp").on("click", function () {
            setApplicationLive();
        });

        //审批状态重置
        $("#resetBtnApp").on("click", function () {
            $("#approvalStatus").val("");//审批状态
        });

        //历史记录搜索
        $("#searchBtnHis").on("click", function () {
            $("#tHistory").html("<table id='tblHistory' class='table table-striped kscc-grid'></table>");
            setTableHis();
        });

        //历史记录重置
        $("#resetBtnHis").on("click", function () {
            $("#liveType").val("");//直播类型
        });
    };

    return {
        run: function () {
            userId();
            //setReservationLive();//已预约直播
            // setApplicationLive();//申请的直播
            //setInvitedLive();//受邀直播
            // setTableHis();//历史记录
            setPage();
            setTabChange();
        }
    };
});
