define(["base","datatables.net"],function(base,DataTable){
    var ids=[];
    var nodesObj=[];
    var name;
    var start;
    var end;
    var treeObj;
    var loginUserId;
    var ws;
    var mtIds = [];//参与方ID组
    var systemName = "kscc管理员";//定义系统管理员

    var userName;
    var participants;
    var isAdmin;
    var participant;
    var ishost;//1主持人；2非主持
    var hospitalId;
    var mtId_old;
    var hospitalsName;
    var thisMtId;
    var sysRole;
    var timer;

    //通过相应的直播id查询直播间信息
    function setLiveRoom(){
        if($("#liveIdControlDetail").val()){
            $.ajax({
                type: "GET",
                async: false,
                url:$.base + "/liveBroadCastController/getLiveDetailTwo/"+$("#liveIdControlDetail").val(),
                contentType:"application/json",
                success:function(data){
                    $("#liveName").text(decodeURI(data.title));
                    $("#liveName").attr("title",decodeURI(data.title));
                    $("#liveStartTime").text(formatDate(data.startTime));
                    $("#liveEndTime").text(formatDate(data.endTime));
                    name = $("#liveName").attr("title");
                    start = $("#liveStartTime").text();
                    end = $("#liveEndTime").text();
                },
                error:function(){
                    alert("加载错误！");
                }
            });
        }
    }

    var messageFunction={
        mtsStatus:function (obj,confId) {
            var status=obj['mtsStatus'+confId];
            $.each(participants,function(i,v){
                var mt=status[v.mtId];
                //是否在线
                if(mt.online==1){
                    $('.circleIcon_'+v.mtId).attr("disabled",false).addClass("iconGreen");
                }else{
                    $('.circleIcon_'+v.mtId).attr("disabled",true).removeClass("iconGreen");
                }
                //静麦开麦
                if(mt.mute==0){
                    $('.shutdIcon_'+v.mtId).html("<i class='iconfont' title='静麦'>&#xe601;</i>");
                }else{
                    $('.shutdIcon_'+v.mtId).html("<i class='iconfont' title='开麦'>&#xe7f0;</i>");
                }
                //静音停止静音
                if(mt.silence==0){
                    $('.silenIcon_'+v.mtId).html("<i class='iconfont' title='静音'>&#xe62d;</i>");
                }else{
                    $('.silenIcon_'+v.mtId).html("<i class='iconfont' title='取消静音'>&#xe64a;</i>");
                }
                //选定发言取消发言
                if(mt.speaker==0&&mt.online==0){
                    $('.speakIcon_'+v.mtId).css("background","url('../images/pages/noSpeakerWhite.png') no-repeat center center");
                    $('.speakIcon_'+v.mtId).attr("title","选定发言");
                }else if(mt.speaker==0&&mt.online==1){
                    $('.speakIcon_'+v.mtId).css("background","url('../images/pages/noSpeakerGreen.png') no-repeat center center");
                    $('.speakIcon_'+v.mtId).attr("title","选定发言");
                }else if(mt.speaker==1&&mt.online==0){
                    $('.speakIcon_'+v.mtId).css("background","url('../images/pages/noSpeakerWhite.png') no-repeat center center");
                    $('.speakIcon_'+v.mtId).attr("title","取消发言");
                }else if(mt.speaker==1&&mt.online==1){
                    $('.speakIcon_'+v.mtId).css("background","url('../images/pages/speakerGreen.png') no-repeat center center");
                    $('.speakIcon_'+v.mtId).attr("title","取消发言");
                }
                var isHostIcon = '<img src="'+$.base + "/images/pages/host.png"+'" title="主持人" />';
                var isSpeakerIcon = '<img src="'+$.base + "/images/pages/speaker.png"+'" title="主讲人" />';
                if(ishost==1||sysRole==systemName){
                    $.each(participants,function(x,y){
                        var pt=status[y.mtId];
                        $('.deleIcon_'+y.mtId).removeAttr("disabled");
                        if(y.ishost==1){
                            //如果是主持人/管理员
                            if(pt.online==1){
                                //在线
                                $('.hostIcon_'+y.mtId).attr("disabled",true).removeClass("iconGreen");
                                $('.shutdIcon_'+y.mtId+',.silenIcon_'+y.mtId+',.speakIcon_'+y.mtId+',.circleIcon_'+y.mtId).removeAttr("disabled").addClass("iconGreen");
                                $('.talkIcon_'+y.mtId).attr("disabled",true).removeClass("iconGreen");

                            }else{
                                //不在线
                                $('.hostIcon_'+y.mtId+',.shutdIcon_'+y.mtId+',.silenIcon_'+y.mtId+',.speakIcon_'+y.mtId+',.circleIcon_'+y.mtId).attr("disabled",true).removeClass("iconGreen");
                                $('.lineOne,.lineTwo').attr("disabled",true);
                                $('.lineOne').removeClass("iconGreen");
                                $('.talkIcon_'+y.mtId).removeAttr("disabled").addClass("iconGreen");
                            }
                            //主持人图标
                            $('.hostIcon_'+y.mtId).parents(".buttonIfont").siblings(".dragDetail").find(".hostFlag").html(isHostIcon);
                        }else{
                            //主持人图标
                            $('.hostIcon_'+y.mtId).parents(".buttonIfont").siblings(".dragDetail").find(".hostFlag").html("");
                            if(pt.online==1){
                                //在线
                                $('.hostIcon_'+y.mtId+',.shutdIcon_'+y.mtId+',.silenIcon_'+y.mtId+',.speakIcon_'+y.mtId+',.circleIcon_'+y.mtId).removeAttr("disabled").addClass("iconGreen");
                                $('.talkIcon_'+y.mtId).attr("disabled",true).removeClass("iconGreen");
                            }else{
                                //不在线
                                $('.hostIcon_'+y.mtId+',.shutdIcon_'+y.mtId+',.silenIcon_'+y.mtId+',.speakIcon_'+y.mtId+',.circleIcon_'+y.mtId).attr("disabled",true).removeClass("iconGreen");
                                $('.lineOne,.lineTwo').attr("disabled",true);
                                $('.lineOne').removeClass("iconGreen");
                                $('.talkIcon_'+y.mtId).removeAttr("disabled").addClass("iconGreen");
                            }
                        }
                        if(y.speaker==1){
                            $('.hostIcon_'+y.mtId).parents(".buttonIfont").siblings(".dragDetail").find(".mainSpeaker").html(isSpeakerIcon);
                        }else{
                            $('.hostIcon_'+y.mtId).parents(".buttonIfont").siblings(".dragDetail").find(".mainSpeaker").html("");
                        }
                    });

                    var iconBtn="<button class='btn' title='主持人' disabled><i class='iconfont' disabled>&#xe61f;</i></button>"+
                        "<button class='btn' title='静麦' disabled><i class='iconfont' disabled>&#xe601;</i></button>"+
                        "<button class='btn' attr='' title='静音' disabled><i class='iconfont' disabled>&#xe62d;</i></button>"+
                        "<button class='btn addSpeaker' title='选定发言' disabled ></button>"+
                        "<button class='btn' title='呼叫' disabled><i class='iconfont' disabled>&#xe606;</i></button>"+
                        "<button class='btn' title='删除终端' disabled><i class='iconfont' style='color:red;'>&#xe666;</i></button>";
                    var number=(participants.length)/3;
                    var pageNumber=$("#liveCarousel .carousel-inner").find(".item").length;
                    //如果当前登录人是主持人或者系统管理员 则添加+号项
                    var  addLiStrs = "";
                    if(ishost==1||sysRole==systemName){
                        // 如果是主持人或者管理员，添加+号项——判断是否要新增一页
                        var addPartiCode = "<div class='heightFull'>"+
                            "<div class='heightFull widthFull'>"+
                            "<div class='addPartiDiv'>"+
                            "<div class='detailBannerDiv'>"+
                            "<div class='detailBgDiv'>" +
                            "<div class='addParti'></div>"+
                            "<div class='buttonIfont'>"+iconBtn+"</div>"+
                            "</div>"+
                            "</div>"+
                            "</div>"+
                            "</div>"+
                            "</div>";
                        if(Math.floor(number) == number){
                            addLiStrs="<div class='item' style='height:100%;'>" +
                                "<ul class='carouselUl carouselUl_"+(pageNumber+1)+"' style='height:100%;margin:0 auto;'>" +
                                "<li class='carousel_add carousel_"+(pageNumber+1)+" detailLi'>"+
                                addPartiCode+
                                "</li>" +
                                "</ul>" +
                                "</div>";
                            if($("#liveCarousel .carousel-inner .carousel_add").length==0){
                                $("#liveCarousel .carousel-inner").append(addLiStrs);
                                $("#liveCarouselCircle").append("<li data-target='#liveCarousel' data-slide-to='"+pageNumber+"'></li>");
                            }

                        }else{
                            addLiStrs="<li class='carousel_add detailLi'>"+addPartiCode+"</li>";
                            if($("#liveCarousel .carousel-inner li.carousel_add").length==0){
                                $("#liveCarousel .carousel-inner .item:last ul").append(addLiStrs);
                                setAddParti();
                            }
                        }
                    }
                    $('#liveCarousel').carousel({
                        pause: false,
                        interval: false,
                        wrap:false
                    });
                }else{
                    //如果不是主持人/管理员
                    $.each(participants,function(x,y){
                        var pt=status[y.mtId];
                        //只要不是主持人或者管理员，按钮一直为灰色带斜杠的图标
                        $('.speakIcon_'+v.mtId).css("background","url('../images/pages/noSpeakerWhite.png') no-repeat center center");
                        $('.speakIcon_'+v.mtId).attr("title","取消发言");
                        //主持人图标
                        if(y.ishost==1){
                            $('.hostIcon_'+y.mtId).parents(".buttonIfont").siblings(".dragDetail").find(".hostFlag").html(isHostIcon);
                        }else{
                            $('.hostIcon_'+y.mtId).parents(".buttonIfont").siblings(".dragDetail").find(".hostFlag").html("");
                        }
                        //主讲人图标
                        if(y.speaker==1){
                            $('.hostIcon_'+y.mtId).parents(".buttonIfont").siblings(".dragDetail").find(".mainSpeaker").html(isSpeakerIcon);
                        }else{
                            $('.hostIcon_'+y.mtId).parents(".buttonIfont").siblings(".dragDetail").find(".mainSpeaker").html("");
                        }
                        if(pt.online==1){
                            $('.lineOne,.lineTwo').removeAttr("disabled");
                            $('.lineOne').addClass("iconGreen");
                            $('.talkIcon_'+y.mtId).attr("disabled",true).removeClass("iconGreen");
                            $('.circleIcon_'+y.mtId).removeAttr("disabled").addClass("iconGreen");

                            if(loginUserId==y.loginId){
                                //如果是自身
                                $('.deleIcon_'+y.mtId).removeAttr("disabled");
                                $('.shutdIcon_'+y.mtId+',.silenIcon_'+y.mtId).removeAttr("disabled").addClass("iconGreen");
                                $('.hostIcon_'+y.mtId+',.speakIcon_'+y.mtId).attr("disabled",true).removeClass("iconGreen");
                            }else{
                                $('.deleIcon_'+y.mtId).attr("disabled",true);
                                $('.hostIcon_'+y.mtId+',.shutdIcon_'+y.mtId+',.silenIcon_'+y.mtId+',.speakIcon_'+y.mtId).attr("disabled",true).removeClass("iconGreen");
                            }
                        }else{
                            $('.deleIcon_'+y.mtId).attr("disabled",true);
                            $('.lineOne,.lineTwo').attr("disabled",true);
                            $('.lineOne').removeClass("iconGreen");
                            $('.circleIcon_'+y.mtId).attr("disabled",true).removeClass("iconGreen");
                            $('.hostIcon_'+y.mtId+',.shutdIcon_'+y.mtId+',.silenIcon_'+y.mtId+',.speakIcon_'+y.mtId).attr("disabled",true).removeClass("iconGreen");
                            $('.talkIcon_'+y.mtId).removeAttr("disabled").addClass("iconGreen");
                        }
                    })
                    $("#liveCarousel .carousel-inner li.carousel_add").remove();
                    var pages = $("#liveCarousel .carousel-inner .item").length;
                    var pos = $("#liveCarousel .carousel-inner .item:eq("+(pages-1)+")").find("li").length;
                    if(pos<1){
                        $("#liveCarousel .item:last").remove();
                        $("#liveCarouselCircle").find("li:last").remove();
                    }
                }
            });
        },
        switchHost:function (obj,confId) {
            var role_id=obj['switchHost'+confId];
            var ishostNow=role_id[loginUserId];
            $(".delay").addClass("disNone");
            //获取最新参与方
            participants = getNewestParticipant();
            if((ishost==2)&&(ishostNow!=ishost)){
                //由非主持人变为主持人
                setToHost();
                ishost='1';
            }
            else if((ishost==1)&&(ishostNow!=ishost)){
                //由主持人变为非主持人
                // ws.close();
                $(".menuAdmin").html("");
                var nohostStr="<button class='btn screenIcon' title='画面选看'><i class='iconfont'>&#xe626;</i><span class='liveSpan'>画面选看</span></button>"+
                    "<button class='btn subtitleIcon' title='添加字幕'><i class='iconfont'>&#xe60e;</i><span class='liveSpan'>添加字幕</span></button>"+
                    "<button class='btn recordIcon' title='会场记录'><i class='iconfont'>&#xe619;</i><span class='liveSpan'>会场记录</span></button>"+
                    "<button class='btn applySpeak' title='申请发言'><i class='iconfont'>&#xe612;</i><span class='liveSpan'>申请发言</span></button>"+
                    "<button class='btn colorSwitch' title='颜色切换'><i class='iconfont'>&#xe617;</i><span class='liveSpan'>颜色切换</span></button>"+
                    "<button class='btn outLive' title='退出直播'><i class='iconfont' style='color:red;'>&#xe605;</i><span class='liveSpan'>退出直播</span></button>";
                $(".menuAdmin").append(nohostStr);
                ishost='2';
                setChange();
            }
        },
        applySpeak:function (obj,confId) {
            var message=obj.applySpeak;
            if(message.indexOf('发言')!=-1&&message.indexOf(confId)!=-1){
                if(ishost=='1'||sysRole=='kscc管理员'){
                    base.tip({
                        label:"提示",
                        text:"<div style='text-align:center;font-size:13px;'>"+message.replace(confId,'')+"</div>"
                    });
                }
            }
        },
        apply:function (obj,confId) {
            var message=obj.apply;
            if(message.indexOf("申请延长直播")!=-1&&message.indexOf(confId)!=-1){
                var delayHosName=message.split("直播")[0].split("申请")[0];
                var delayTime1=message.split("直播")[1];
                var delayTime=delayTime1.split("分钟")[0];
                if(sysRole=='kscc管理员'){
                    var modal=base.modal({
                        label:"提示",
                        context:"<div style='text-align:center;font-size:13px;'>"+message.replace(confId,'')+"</div>",
                        textAlign:'text-align:center',
                        width:250,
                        height:80,
                        buttons:[
                            {
                                label:"同意",
                                cls:"btn btn-info",
                                clickEvent:function(){
                                    var parmas={
                                        "confId":confId,
                                        "delay_time":delayTime
                                    };
                                    var requestTip=base.requestTip({position:"center"});
                                    $.ajax({
                                        type: "post",
                                        url:  $.base + "/liveController/extendTime",
                                        data:JSON.stringify(parmas),
                                        contentType:"application/json",
                                        success: function(data){
                                            switch(data.status){
                                                case '1':
                                                    requestTip.success("延时成功！");
                                                    extendTime(delayTime);
                                                    modal.hide();
                                                    var message=confId+delayHosName+"延长直播"+delayTime+"分钟申请通过!";
                                                    message=JSON.stringify({extend:message});
                                                    ws.send(message);
                                                    break;
                                                default:
                                                    requestTip.error("延时失败！");
                                                    break;
                                            }

                                        },
                                        beforeSend:function(){
                                            requestTip.wait();
                                        },
                                        error:function(){
                                            requestTip.error();
                                        }
                                    });
                                }
                            },
                            {
                                label:"拒绝",
                                cls:"btn btn-warning",
                                clickEvent:function(){
                                    modal.hide();
                                    var message=confId+delayHosName+"延长直播"+delayTime+"分钟申请未通过!";
                                    message=JSON.stringify({extend:message});
                                    ws.send(message);
                                }
                            }
                        ]
                    });
                }
            }
        },
        extend:function (obj,confId) {
            var message=obj.extend;
            if(message.indexOf(confId)!=-1){
                var delayTime=message.split("延长直播")[1].split("分钟")[0];
                if(message.indexOf('未通过')!=-1){
                    if(ishost=="1"){
                        base.alert("延长直播"+delayTime+"分钟申请未通过");
                    }
                }else{
                    if(sysRole!='kscc管理员'){
                        base.tip({
                            label:"提示",
                            text:"<div style='text-align:center;font-size:13px;'>"+obj.extend.replace(confId,'')+"</div>"
                        });
                        setLiveRoom();
                    }
                }
            }
        },
        extendAdmin:function (obj,confId) {
            var extendAdmin=obj.extendAdmin;
            if((extendAdmin).indexOf(confId)!=-1){
                if(sysRole!='kscc管理员'){
                    base.tip({
                        label:"提示",
                        text:"<div style='text-align:center;font-size:13px;'>"+obj.extendAdmin.replace(confId,'')+"</div>"
                    });
                    setLiveRoom();
                }
            }
        },
        silence:function (obj,confId) {
            var silence=obj.silence;
            if((silence).indexOf(confId)!==-1){
                var value = silence.replace(confId, '');
                if(value=='0'){
                    var allSilenStr="<i class='iconfont'>&#xe64a;</i><span class='liveSpan'>取消静音</span>";
                    $(".allSilenIcon").attr("att",'1');
                    $(".allSilenIcon").html(allSilenStr);
                    $(".allSilenIcon").attr("title","取消静音");
                }
                else{
                    var allSilenStr="<i class='iconfont'>&#xe62d;</i><span class='liveSpan'>全场静音</span>";
                    $(".allSilenIcon").attr("att",'0');
                    $(".allSilenIcon").html(allSilenStr);
                    $(".allSilenIcon").attr("title","全场静音");
                }
            }
        },
        mute:function (obj,confId) {
            var mute=obj.mute;
            if((mute).indexOf(confId)!==-1){
                var value = mute.replace(confId, '');
                if(value=='0'){
                    var allShutStr="<i class='iconfont'>&#xe7f0;</i><span class='liveSpan'>全场开麦</span>";
                    $(".allShutIcon").attr("att",'1');
                    $(".allShutIcon").html(allShutStr);
                    $(".allShutIcon").attr("title","全场开麦");
                }
                else{
                    var allShutStr="<i class='iconfont'>&#xe601;</i><span class='liveSpan'>全场静麦</span>";
                    $(".allShutIcon").attr("att",'0');
                    $(".allShutIcon").html(allShutStr);
                    $(".allShutIcon").attr("title","全场静麦");
                }
            }
        },
        deleteParticipant:function (obj,confId) {
            var param = obj.deleteParticipant;
            var thisConfId=param.confId;
            var mtId = param.mtid;
            var isQuit = param.isQuit==false?param.isQuit:true;
            //获取最新参与方
            participants = getNewestParticipant();
            $(".totalParticipant").html(participants.length+"方参会");
            if(participants.length>1){
                if(thisConfId==confId){
                    //根据mtid,全用dom对参与方进行删除操作
                    var index=$.inArray(mtId,mtIds);
                    mtIds.splice(index,1);
                    // participants.splice(index,1);
                    delItem(mtId);
                    //退出直播间
                    if(ishost!=1&&mtId==thisMtId){
                        //退出直播间
                        quitLiveRoom();
                    }
                }
            }else{
                //退出直播间
                quitLiveRoom();

            }
        },
        addParticipant:function (obj,confId) {
            //对参与方进行新增
            var param = obj.addParticipant;
            var thisConfId=param.confId
            if(thisConfId==confId){
                //paticipant,全用dom对参与方进行新增操作
                //获取最新参与方
                participants = getNewestParticipant();
                $(".totalParticipant").html(participants.length+"方参会");
                //DOM新增
                if(participants.length>0){
                    $.each(participants,function(index,item){
                        var mtId = item.mtId;
                        if(mtIds.indexOf(mtId)==-1){
                            addItem(item); 
                            setDrag();//初始化拖拽对象
                        }
                    });
                }
            }
        },
        endLive:function(obj,confId){
            var thisConfId=obj.endLive;
            if(thisConfId==confId){
                //退出直播间
                quitLiveRoom();
            }
        },
        hostOut:function (obj,confId) {
            // var thisConfId=obj.confId
            var thisConfId = obj.hostOut;
            if(thisConfId==confId){
                //主持人退出会议，自动随机切换下个主持人，调用getCurrentParticipant，dom操作左边参与方！
                //获取最新参与方
                participants = getNewestParticipant();
                $.each(participants,function(index,item){
                    if(item.loginId == loginUserId){
                        ishost = item.ishost;
                    }
                });
                if(ishost==1){
                    setToHost();//由非主持人变成主持人
                }
            }
        },
        confAutoEnd:function (obj,confId) {
            quitLiveRoom();
        },
        switchSpeaker:function(obj,confId){
            //获取最新参与方
            participants = getNewestParticipant();
            var params = obj.switchSpeaker;
            var thisConfId=params.confId;
            var mtId = params.mtid;
            var status = params.status;
            var hospitalName = params.hospitalName;
            var requestTip=base.requestTip({
                position:"center",
                width:"auto",
                overflow:"visible"
            });
            if(thisConfId==confId){
                if(ishost==1||sysRole==systemName){
                    var speaker = "";
                    if(sysRole==1&& mtId==thisMtId){
                        speaker = "自己";
                    }else{
                        speaker = hospitalName;
                    }
                    if(status=="0"){
                        requestTip.success("选定"+speaker+"发言成功！");
                        $(".speakIcon_"+mtId).addClass("iconGreen");
                        $(".speakIcon_"+mtId).css("background","url('../images/pages/speakerGreen.png') no-repeat center center");
                        $(".speakIcon_"+mtId).attr("title","取消发言");
                        $(".speakIcon").attr("speakPStatus","0");
                        $(".speakIcon_"+mtId).attr("speakPStatus","1");
                        $("li.detailLi").each(function(index,item){
                            $(item).find(".mainSpeaker img").remove();
                        });
                        var imgUrl = $.base + "/images/pages/speaker.png";
                        $(".speakIcon_"+mtId).parents(".detailLi").find(".mainSpeaker").html('<img src="'+imgUrl+'" title="主讲人" />');
                        $.each(participants,function(i,v){
                            if(v.speaker==0&&v.online==1){
                                $('.speakIcon_'+v.mtId).css("background","url('../images/pages/noSpeakerGreen.png') no-repeat center center");
                                $('.speakIcon_'+v.mtId).attr("title","选定发言");
                            }
                        });
                    }
                    else{
                        requestTip.success("取消"+speaker+"发言成功！");
                        $(".speakIcon_"+mtId).addClass("iconGreen");
                        $(".speakIcon_"+mtId).css("background","url('../images/pages/noSpeakerGreen.png') no-repeat center center");
                        $(".speakIcon_"+mtId).attr("title","选定发言");
                        $(".speakIcon_"+mtId).attr("speakPStatus","0");
                        $("li.detailLi").each(function(index,item){
                            $(item).find(".mainSpeaker img").remove();
                        });
                    }
                }else if(ishost!=1 && mtId==thisMtId){
                    if(status=="0"){
                        requestTip.success("请您发言！");
                    }else{
                        requestTip.success("取消您发言！");
                    }
                }else if(ishost!=1 && mtId!=thisMtId){
                    if(status=="0"){
                        requestTip.success("现在由"+hospitalName+"发言！");
                    }else{
                        requestTip.success("取消"+hospitalName+"发言！");
                    }
                }
            }
        }
    }
    //获取最新参与方
    function getNewestParticipant(){
        var res = "";
        $.ajax({
            type:"post",
            url:$.base+"/liveBroadCastController/getCurrentParticipant",
            contentType:"application/json",
            async:false,
            data:JSON.stringify({
                "confId":$("#confId").val(),
                "liveId":$("#liveIdControlDetail").val(),
                'isDel':"0" //未删除
            }),
            success:function (data) {
                participants=data.data;
                res = participants;
            }
        });
        return res;
    }
    //退出直播间
    function quitLiveRoom(){
        var url=$.base+"/loginController/toLiveControlList";
        $.ajax({
            type:"GET",
            url:url,
            error:function(){
                alert("加载错误！");
            },
            success:function(e2){
                //关闭webSocket
                ws.onclose();
                //清除定时器
                clearInterval(timer);
                if(e2.indexOf('06a5bb21-b8f0-4dfd-8004-4b4e17d4f81c')!==-1){
                    window.location.href=$.base+'/loginController/toLogin'
                    return
                }
                $(".middle").html(e2);
            }
        });
    }
    //新增参与方
    function addItem(v){
        /*
         * 如果是主持人：
         *    在倒数第二个位置添加参与方
         * 如果是普通参与方：
         *   在倒数第一个位置添加参与方
         */
        //参与方ID组
        if(mtIds.length>0){
            $.each(mtIds,function(index,item){
                if(mtIds.indexOf(v.mtId)==-1){
                    mtIds.push(v.mtId);
                }
            })
        }
        var pages = $("#liveCarousel .carousel-inner .item").length;
        var pos = $("#liveCarousel .carousel-inner .item:eq("+(pages-1)+") .carouselUl").find("li").length;
        var appendHtml = "";
        var mutePStr="";
        var silencePStr="";
        var speakPStr="";
        var hostIcon = "";
        var speakerIcon = "";
        //var conversionCircuit = "";
        var ifontCircle = "";
        var speakBtn = new Object();
        //静麦开麦
        if(v.mute==0){
            mutePStr="<i class='iconfont' title='静麦'>&#xe601;</i>";
        }else{
            mutePStr="<i class='iconfont' title='开麦'>&#xe7f0;</i>";
        }
        //静音哑音
        if(v.silence==0){
            silencePStr="<i class='iconfont' title='静音'>&#xe62d;</i>";
        }else{
            silencePStr="<i class='iconfont' title='取消静音'>&#xe64a;</i>";
        }
        if(v.ishost == 1){
            hostIcon="<img src= '"+$.base+"/images/pages/host.png' title='主持人'>";
        }
        if(v.speaker == 1){
            speakerIcon="<img src= '"+$.base+"/images/pages/speaker.png' title='主讲人'>";
        }
        //判断是否在线
        if(v.online == 1){
            /*
             * 如果在线：
             *   右上角在线提示为绿色，即在线
             */
            ifontCircle="<button class='btn iconGreen circleIcon circleIcon_"+v.mtId+"'><i class='iconfont' title=''>&#xe645;</i></button>";

        }else{
            /*
             * 如果不在线：
             *   右上角在线提示为灰色，即不在线
             */
            ifontCircle="<button disabled class='btn circleIcon circleIcon_"+v.mtId+"'><i class='iconfont' title=''>&#xe645;</i></button>";
        }
        //如果为自身
        if(ishost==1||sysRole==systemName){
            (v.speaker==1)?speakBtn ={"title":"取消发言"}:speakBtn ={"title":"选定发言"};
            //判断是否在线
            if(v.online == 1){
                /*
                 * 如果在线：
                 *   右上角在线提示为绿色，即在线
                 *   操作按钮分情况讨论：
                 *        1.主持人按钮（ishost）：1——置灰，2——高亮
                 *        2.静麦/开麦按钮（mute）：1——高亮，2——置灰
                 *        3.静音/哑音按钮(silence)：1——高亮，2——置灰
                 *        4.指定发言/取消发言按钮：1——发言，0——不可发言
                 */
                //右上角在线提示为绿色
                ifontCircle="<button class='btn iconGreen circleIcon circleIcon_"+v.mtId+"'><i class='iconfont' title=''>&#xe645;</i></button>";
                //设置按钮初始化

                /*
                 * 如果登录人是主持人/管理员：
                 *    本身主持人按钮为灰色（不可点击），其他人为绿色（可点击），表示主持人有权限切换主持人
                 *    选定发言和取消发言均为绿色（可点击），表示主持人有权限指定谁为主讲人，且主讲人只有一个
                 */
                if(v.ishost==1){
                    hostBtn ={"disabled":"disabled","cls":"disable"};
                }else{
                    hostBtn ={"disabled":"enabled","cls":"iconGreen"};
                }
                speakBtn.disabled = "enabled";
                speakBtn.cls = "iconGreen";
                callBtn ={"disabled":"disabled","cls":"disable"};
                muteBtn ={"disabled":"enabled","cls":"iconGreen"};
                silenceBtn ={"disabled":"enabled","cls":"iconGreen"};
                ifont="<button "+hostBtn.disabled+" class='btn hostIcon "+hostBtn.cls+" hostIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' title='主持人'><i class='iconfont'>&#xe61f;</i></button>"+
                    "<button "+muteBtn.disabled+" class='btn shutdIcon "+muteBtn.cls+" shutdIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' mutePStatus='"+v.mute+"'>"+mutePStr+"</button>"+
                    "<button "+silenceBtn.disabled+" class='btn silenIcon "+silenceBtn.cls+" silenIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' silencePStatus='"+v.silence+"'>"+silencePStr+"</button>"+
                    "<button "+speakBtn.disabled+" class='btn speakIcon "+speakBtn.cls+" speakIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' speakPStatus='"+v.speaker+"' title='"+speakBtn.title+"'></button>"+
                    "<button "+callBtn.disabled+" class='btn talkIcon "+callBtn.cls+" talkIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' title='呼叫'><i class='iconfont'>&#xe606;</i></button>"+
                    "<button class='btn deleIcon deleIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' att2='"+v.id+"' hospitalName='"+v.hospitalName+"' title='删除终端'><i class='iconfont' style='color:red;'>&#xe666;</i></button>";

            }else{
                /*
                 * 如果不在线：
                 *   右上角在线提示为灰色，即不在线
                 *   操作按钮只需设置呼叫和删除可点击
                 */
                ifontCircle="<button disabled class='btn circleIcon circleIcon_"+v.mtId+"'><i class='iconfont' title=''>&#xe645;</i></button>";
                ifont="<button disabled class='btn hostIcon hostIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' title='主持人'><i class='iconfont'>&#xe61f;</i></button>"+
                    "<button disabled class='btn shutdIcon shutdIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' mutePStatus='"+v.mute+"'>"+mutePStr+"</button>"+
                    "<button disabled class='btn silenIcon silenIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' silencePStatus='"+v.silence+"'>"+silencePStr+"</button>"+
                    "<button disabled class='btn speakIcon speakIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' speakPStatus='"+v.speaker+"' title='"+speakBtn.title+"'></button>"+
                    "<button class='btn talkIcon iconGreen talkIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"'  hospitalName='"+v.hospitalName+"' title='呼叫'><i class='iconfont'>&#xe606;</i></button>"+
                    "<button class='btn deleIcon deleIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' att2='"+v.id+"' hospitalName='"+v.hospitalName+"' title='删除终端'><i class='iconfont' style='color:red;'>&#xe666;</i></button>";
            }

        }else{
            if(loginUserId==v.loginId){
                ifont="<button disabled class='btn hostIcon hostIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"'  hospitalName='"+v.hospitalName+"' title='主持人'><i class='iconfont'>&#xe61f;</i></button>"+
                    "<button class='btn iconGreen shutdIcon shutdIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' mutePStatus='"+v.mute+"'>"+mutePStr+"</button>"+
                    "<button class='btn iconGreen silenIcon silenIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' silencePStatus='"+v.silence+"'>"+silencePStr+"</button>"+
                    "<button disabled class='btn speakIcon speakIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' speakPStatus='"+v.speaker+"' title=''></button>"+
                    "<button disabled class='btn talkIcon talkIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"'  hospitalName='"+v.hospitalName+"' title='呼叫'><i class='iconfont'>&#xe606;</i></button>"+
                    "<button class='btn deleIcon deleIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' att2='"+v.id+"' hospitalName='"+v.hospitalName+"' title='删除终端'><i class='iconfont' style='color:red;'>&#xe666;</i></button>";

            }else{
                ifont="<button disabled class='btn hostIcon hostIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"'  hospitalName='"+v.hospitalName+"' title='主持人'><i class='iconfont'>&#xe61f;</i></button>"+
                    "<button disabled class='btn shutdIcon shutdIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' mutePStatus='"+v.mute+"'>"+mutePStr+"</button>"+
                    "<button disabled class='btn silenIcon silenIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' silencePStatus='"+v.silence+"'>"+silencePStr+"</button>"+
                    "<button disabled class='btn speakIcon speakIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' speakPStatus='"+v.speaker+"' title=''></button>"+
                    "<button disabled class='btn talkIcon talkIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"'  hospitalName='"+v.hospitalName+"' title='呼叫'><i class='iconfont'>&#xe606;</i></button>"+
                    "<button disabled class='btn deleIcon deleIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' att2='"+v.id+"' hospitalName='"+v.hospitalName+"' title='删除终端'><i class='iconfont' style='color:red;'>&#xe666;</i></button>";
            }
        }
        //判断是否是自家医院
//        if(v.hospitalId==hospitalId){
//            conversionCircuit="<button class='btn lineOne_"+v.mtId+" lineOne' title='线路一'><i class='iconfont'>&#xe61a;</i>"+
//                "<button class='btn lineTwo_"+v.mtId+" lineTwo' title='线路二'><i class='iconfont'>&#xe61a;</i>";
//        }
        appendHtml = "<li class='carousel_2 detailLi'>"+
            "<div class='heightFull'>"+
            "<div class='heightFull widthFull'>"+
            "<div class='detailBannerLi' >"+
            "<div class='detailBannerDiv'>"+
            "<div class='detailBgDiv'>"+
            "<div class='dragDetail' uid='"+v.mtId+"' uv='"+v.hospitalName+"'>"+
            "<div class='pull-left hostFlag'>"+hostIcon+"</div>"+
            "<div class='pull-left mainSpeaker'>"+speakerIcon+"</div>"+
            "<span style='float:right;'>"+ifontCircle+"</span>"+
            "<div class='detailParti' title='"+v.hospitalName+"'>"+v.hospitalName+"</div>"+
            "</div>"+
            "<div class='buttonIfont'>"+ifont+"</div>"+
            "</div>"+
            "</div>"+
            "</div>"+
            //"<div class='conversionCircuit'>"+conversionCircuit+"</div>"+
            "</div>"+
            "</div>"+
            "</li>";
        var curPage = pages-1;
        if(ishost == 1 || sysRole ==systemName){
            //如果是主持人，则在加号之前添加
            if( pos%3 > 0){
                $("#liveCarousel .carousel-inner").find("li.carousel_add").before(appendHtml);
            }else{
                var addHtml = $("#liveCarousel").find("li.carousel_add").html();
                var nextPage = "<div class='item' style='height: 100%;'><ul class='carouselUl detailLi'><li class='carousel_"+ pages +" detailLi carousel_add'>"+addHtml+"</li></ul></div>";
                $("#liveCarousel .carousel-inner").append(nextPage);
                $("#liveCarousel .carousel-inner ul:eq("+curPage+")").find("li.carousel_add").remove();
                $("#liveCarousel .carousel-inner ul:eq("+curPage+")").append(appendHtml);
                $("#liveCarouselCircle").append('<li data-target="#liveCarousel" data-slide-to="'+pages+'"></li>');
            }
        }else{
            //如果不是主持人，则添加在最后一页的最后一个
            if( pos%3 > 0){
                $("#liveCarousel .carousel-inner").find("ul:eq("+curPage+")").append(appendHtml);
            }else{
                var nextPage = "<div class='item' style='height: 100%;'><ul class='carouselUl carouselUl_"+(pages+1)+"'>"+appendHtml+"</ul></div>";
                $("#liveCarousel .carousel-inner").append(nextPage);
                //liveCarouselCircle
                $("#liveCarouselCircle").append('<li data-target="#liveCarousel" data-slide-to="'+pages+'"></li>');
            }
        }
        setAddParti();
    }
    //删除参与方
    function delItem(mtId){
        $("#liveCarousel .carousel-inner li").each(function(index,item){
            if($(item).find(".hostIcon").attr("att1")==mtId){
                var curPage = Math.ceil((index+1)/3)-1;
                var curPos = index%3;
                var nexts = $(this).parents(".item").nextAll();
                if(nexts.length>0){
                    $.each(nexts,function(i1,o1){
                        var nextLi = $(o1).find("li")[0];
                        moveItem(curPage,curPos,nextLi);
                    })
                }

                $(this).remove();
               // $(".totalParticipant").html($(".totalParticipant").html()-1);


            }
        });
    }
    //移动参与方
    function moveItem(curPage,curPos,nextLi){
        $("#liveCarousel .carousel-inner .item:eq("+curPage+") ul").append(nextLi);
        if($("#liveCarousel .carousel-inner .item:eq("+(curPage+1)+") li:eq(0)").length==0){
            //删除最后一页
            $("#liveCarousel .carousel-inner .item:eq("+(curPage+1)+")").remove();
            //最后一页删除后，将翻页定位到倒数第二页
            $("#liveCarousel .carousel-inner .item").removeClass("active");
            $("#liveCarousel .carousel-inner .item:eq("+curPage+")").addClass("active");
            //删除最后一页页码
            $("#liveCarouselCircle").find("li:eq("+(curPage+1)+")").remove();
            //最后一页删除后，将翻页定位到倒数第二页
            $("#liveCarouselCircle").find("li").removeClass("active");
            $("#liveCarouselCircle").find("li:eq("+curPage+")").addClass("active");
        }
        // $("#liveCarousel .carousel-inner .item:eq("+(curPage+1)+") li:eq(0)").remove();
    }
    //根据当前登录人配置菜单
    function userId(){
        $.ajax({
            type:"post",
            async: false,
            url:$.base+"/liveBroadCastController/getUserId",
            success:function (data) {
                loginUserId=data.id;
                userName=data.userName;
                hospitalId=data.hospitalId;
                if(data.roleName===systemName){
                    sysRole=data.roleName;
                    isAdmin=true;
                    $(".menuAdmin").html("");
                    var adminStr="<button class='btn screenIcon' title='画面选看'><i class='iconfont'>&#xe626;</i><span class='liveSpan'>画面选看</span></button>"+
                        "<button class='btn synthesisIcon' title='画面合成'><i class='iconfont'>&#xe644;</i><span class='liveSpan'>画面合成</span></button>"+
                        "<button class='btn allShutIcon'></button>"+
                        "<button class='btn allSilenIcon'></button>"+
                        "<button class='btn subtitleIcon' title='添加字幕'><i class='iconfont'>&#xe60e;</i><span class='liveSpan'>添加字幕</span></button>"+
                        "<button class='btn delayIcon' title='延长直播'><i class='iconfont'>&#xe60d;</i><span class='liveSpan'>延长直播</span></button>"+
                        "<button class='btn videoIcon' title='录像状态'><i class='iconfont'>&#xe62e;</i><span class='liveSpan'>录像状态</span></button>"+
                        "<button class='btn recordIcon' title='会场记录'><i class='iconfont'>&#xe619;</i><span class='liveSpan'>会场记录</span></button>"+
                        "<button class='btn colorSwitch' title='颜色切换'><i class='iconfont'>&#xe617;</i><span class='liveSpan'>颜色切换</span></button>"+
                        "<button class='btn outLive' title='退出直播'><i class='iconfont' style='color:red;'>&#xe605;</i><span class='liveSpan'>退出直播</span></button>"+
                        "<button class='btn endLive' title='结束直播'><i class='iconfont' style='color:red;'>&#xe61b;</i><span class='liveSpan'>结束直播</span></button>";
                    $(".menuAdmin").append(adminStr);
                    $(".addSelectPar").before("<span class='parListSele'>为     <select class='form-control partiList'></select>  选看画面</span>");
                    $(".addColor").before("<span class='parListColor'>为     <select class='form-control partiListColor'></select>  设置颜色</span>");
                    $(".addVideo").before("<span class='parListVideo'>为     <select class='form-control partiListVideo'></select>  设置开启关闭录像</span>");
                    $(".addSubtitlePar").before("<span class='parListSubtitle'>为     <select class='form-control partiListSubtitle'></select>  添加字幕</span>");
                }
                else{
                    $.ajax({
                        type:"POST",
                        async: false,
                        url:$.base+"/liveController/getParticipant",
                        dataType:'json',
                        contentType:"application/json",
                        data:JSON.stringify({
                            id:loginUserId,
                            liveId:$("#liveIdControlDetail").val()
                        }),
                        success:function (data) {
                            participant=data;
                            ishost=participant.ishost
                            thisMtId=data.mtId;

                            if(participant.ishost==1){
                                sysRole='1';
                                $(".menuAdmin").html("");
                                var hostStr="<button class='btn screenIcon' title='画面选看'><i class='iconfont'>&#xe626;</i><span class='liveSpan'>画面选看</span></button>"+
                                    "<button class='btn synthesisIcon' title='画面合成'><i class='iconfont'>&#xe644;</i><span class='liveSpan'>画面合成</span></button>"+
                                    "<button class='btn allShutIcon'></button><button class='btn allSilenIcon'></button>"+
                                    "<button class='btn subtitleIcon' title='添加字幕'><i class='iconfont'>&#xe60e;</i><span class='liveSpan'>添加字幕</span></button>"+
                                    "<button class='btn recordIcon' title='会场记录'><i class='iconfont'>&#xe619;</i><span class='liveSpan'>会场记录</span></button>"+
                                    "<button class='btn applyExtendTime' title='申请延时'><i class='iconfont'>&#xe611;</i><span class='liveSpan'>申请延时</span></button>"+
                                    "<button class='btn colorSwitch' title='颜色切换'><i class='iconfont'>&#xe617;</i><span class='liveSpan'>颜色切换</span></button>"+
                                    "<button class='btn outLive' title='退出直播'><i class='iconfont' style='color:red;'>&#xe605;</i><span class='liveSpan'>退出直播</span></button>"+
                                    "<button class='btn endLive' title='结束直播'><i class='iconfont' style='color:red;'>&#xe61b;</i><span class='liveSpan'>结束直播</span></button>";
                                $(".menuAdmin").append(hostStr);
                            }else{
                                $(".menuAdmin").html("");
                                var nohostStr="<button class='btn screenIcon' title='画面选看'><i class='iconfont'>&#xe626;</i><span class='liveSpan'>画面选看</span></button>"+
                                    "<button class='btn subtitleIcon' title='添加字幕'><i class='iconfont'>&#xe60e;</i><span class='liveSpan'>添加字幕</span></button>"+
                                    "<button class='btn recordIcon' title='会场记录'><i class='iconfont'>&#xe619;</i><span class='liveSpan'>会场记录</span></button>"+
                                    "<button class='btn applySpeak' title='申请发言'><i class='iconfont'>&#xe612;</i><span class='liveSpan'>申请发言</span></button>"+
                                    "<button class='btn colorSwitch' title='颜色切换'><i class='iconfont'>&#xe617;</i><span class='liveSpan'>颜色切换</span></button>"+
                                    "<button class='btn outLive' title='退出直播'><i class='iconfont' style='color:red;'>&#xe605;</i><span class='liveSpan'>退出直播</span></button>";
                                $(".menuAdmin").append(nohostStr);
                            }
                        }
                    })
                }
                setCarousel(hospitalId);//设置轮播
            }
        });
    };

    //由非主持人变为主持人
    function setToHost(){
        $.ajax({
            type: "post",
            async: true,
            url:  $.base + "/liveBroadCastController/getMeetingInfo",
            contentType:"application/json",
            data:JSON.stringify({
                "confId":$("#confId").val()
            }),
            dataType: "json",
            success: function(data){
                if(data.status=='1'){
                    $(".menuAdmin").html("");
                    var hostStr="<button class='btn screenIcon' title='画面选看'><i class='iconfont'>&#xe626;</i><span class='liveSpan'>画面选看</span></button>"+
                        "<button class='btn synthesisIcon' title='画面合成'><i class='iconfont'>&#xe644;</i><span class='liveSpan'>画面合成</span></button>"+
                        "<button class='btn allShutIcon'></button><button class='btn allSilenIcon'></button>"+
                        "<button class='btn subtitleIcon' title='添加字幕'><i class='iconfont'>&#xe60e;</i><span class='liveSpan'>添加字幕</span></button>"+
                        "<button class='btn recordIcon' title='会场记录'><i class='iconfont'>&#xe619;</i><span class='liveSpan'>会场记录</span></button>"+
                        "<button class='btn applyExtendTime' title='申请延时'><i class='iconfont'>&#xe611;</i><span class='liveSpan'>申请延时</span></button>"+
                        "<button class='btn colorSwitch' title='颜色切换'><i class='iconfont'>&#xe617;</i><span class='liveSpan'>颜色切换</span></button>"+
                        "<button class='btn outLive' title='退出直播'><i class='iconfont' style='color:red;'>&#xe605;</i><span class='liveSpan'>退出直播</span></button>"+
                        "<button class='btn endLive' title='结束直播'><i class='iconfont' style='color:red;'>&#xe61b;</i><span class='liveSpan'>结束直播</span></button>";
                    $(".menuAdmin").append(hostStr);
                    var mute=data.data.mute;//静麦开麦
                    var silence=data.data.silence;//静音停止静音
                    $(".allShutIcon").attr("att",mute);
                    $(".allSilenIcon").attr("att",silence);
                    if(mute==0){//0给他静麦  1给他开麦
                        $(".allShutIcon").html("<i class='iconfont'>&#xe601;</i><span class='liveSpan'>全场静麦</span>");
                        $(".allShutIcon").attr("title","全场静麦");
                    }else{
                        $(".allShutIcon").html("<i class='iconfont'>&#xe7f0;</i><span class='liveSpan'>全场开麦</span>");
                        $(".allShutIcon").attr("title","全场开麦");
                    }
                    if(silence==0){
                        $(".allSilenIcon").html("<i class='iconfont'>&#xe62d;</i><span class='liveSpan'>全场静音</span>");
                        $(".allSilenIcon").attr("title","全场静音");
                    }else{
                        $(".allSilenIcon").html("<i class='iconfont'>&#xe64a;</i><span class='liveSpan'>取消静音</span>");
                        $(".allSilenIcon").attr("title","取消静音");
                    }
                    setChange();
                }
            }
        });
    }

    function wsFunction(ws){
        var confId=$("#confId").val();
        ws.onopen = function () {
            console.log("webSocket服务已开启");
            setWS();//不在直播间，关闭ws
        }
        ws.onmessage = function (event) {
            var message = event.data;

            var obj=eval("("+message+")");
            var uniqueKey;
            var type;
            for (var key in obj){
                uniqueKey=key;
            }
            if(uniqueKey.indexOf(confId)!==-1){
                type=uniqueKey.replace(confId,'')
            }else{
                type=uniqueKey
            }
            messageFunction[type](obj, confId);
        }

        ws.onerror = function (evt) {
            ws.close();
            console.log('websocket error', evt);
        }
        ws.onclose = function (evt) {
            ws.close();
            console.log('websocket is closed', evt);
        }
    }

    function setWS(){
        $("#bottomLi li,#topLi li").off().on("click",function(){
            var url=$(this).find("a").attr("att");
            $("#topLi li,#bottomLi li").removeClass("active");
            $(this).addClass("active");
            if(url){
                $.ajax({
                    type:"GET",
                    url:url,
                    async:false,
                    error:function(){
                        alert("加载错误！");
                    },
                    success:function(data){
                        $(".middle").html("");
                        if(data.indexOf('06a5bb21-b8f0-4dfd-8004-4b4e17d4f81c')!==-1){
                            window.location.href=$.base+'/loginController/toLogin'
                            return
                        }
                        $(".middle").html(data);
                    }
                });
            }
            var activeBottomLi=$("#bottomLi li.active span").text();
            var activeTopLi=$("#topLi li.active i").attr("alt");
            if(activeBottomLi!="直播管理"&&activeTopLi!="直播管理"){
                //关闭webSocket
                ws.onclose();
                console.log('WS is closed! ');
            }else{
                if(!$("#liveName").html()){
                    //关闭webSocket
                    ws.onclose();
                    console.log('WS is closed!');
                }
            }
        });
    }

    /**
     * 时间戳转化为固定格式日期
     * @param m
     * @returns {string}
     */
    function add0(m){return m<10?'0'+m:m }
    function formatDate(now) {
        var time = new Date(now);
        var year=time.getFullYear();
        var month=time.getMonth()+1;
        var date=time.getDate();
        var hour=time.getHours();
        var minute=time.getMinutes();
        var second=time.getSeconds();
        return year+'-'+add0(month)+'-'+add0(date)+' '+add0(hour)+':'+add0(minute);
    }
    //延时当前直播剩余时间
    function counter() {
        var remindTime = $("#liveEndTime").text(); //当前直播间的结束时间
        var str=remindTime.toString().replace(/-/g,"/");
        var endTime = new Date(str);

        var date = new Date();
        /*转换成秒*/
        var time = (endTime - date) / 1000;

        var day = Math.floor(time / (24 * 60 * 60));

        var hour = Math.floor(time % (24 * 60 * 60) / (60 * 60));

        var minute = Math.floor(time % (24 * 60 * 60) % (60 * 60) / 60);

        // var second = Math.floor(time % (24 * 60 * 60) % (60 * 60) % 60);

        var countDownObj={
            "day" :  day,
            "hour" :  hour,
            "minute" :  minute
        }
        return countDownObj;
    }
    //加载左边参与方
    function setCarousel(hospitalId){
        $("#liveCarouselCircle").empty();
        $("#liveCarousel .carousel-inner").empty();
        $.ajax({
            type: "GET",
            url:$.base + "/liveBroadCastController/getLiveDetailTwo/"+$("#liveIdControlDetail").val(),
            contentType:"application/json",
            success: function(data){
                var mute=data.mute;//静麦开麦
                var silence=data.silence;//静音停止静音
                $(".allShutIcon").attr("att",mute);
                $(".allSilenIcon").attr("att",silence);
                if(mute==1){
                    $(".allShutIcon").html("<i class='iconfont'>&#xe7f0;</i><span class='liveSpan'>全场开麦</span>");
                    $(".allShutIcon").attr("title","全场开麦");
                }else{
                    $(".allShutIcon").html("<i class='iconfont'>&#xe601;</i><span class='liveSpan'>全场静麦</span>");
                    $(".allShutIcon").attr("title","全场静麦");
                }
                if(silence==1){
                    $(".allSilenIcon").html("<i class='iconfont'>&#xe64a;</i><span class='liveSpan'>取消静音</span>");
                    $(".allSilenIcon").attr("title","取消静音");
                }else{
                    $(".allSilenIcon").html("<i class='iconfont'>&#xe62d;</i><span class='liveSpan'>全场静音</span>");
                    $(".allSilenIcon").attr("title","全场静音");
                }
                var lis="";
                participants=data.participants;
                $("#confId").val(data.confId);
                var url="ws://"+$.base.substr(7)+"/websocket/"+data.confId;
                //校验web socket是否在正常状态
                if (ws) {
                    ws.close();
                    /*setInterval(function(){
                     if (ws.readyState !== 1) {
                     ws = new WebSocket(url)
                     }
                     }, 6000)*/
                }
                ws= new WebSocket(url);
                wsFunction(ws);
                if(data.participants){
                    $(".totalParticipant").html(data.participants.length+"方参会");//直播管理左上角显示几家参与方
                }
                $.each(data.participants,function(i,v){
                    var ifont=""; //按钮图标集
                    var ifontCircle="";//是否在线原点
                    //var conversionCircuit="";//线路一、二图标
                    var hostIcon="";//主持人图标
                    var speakerIcon="";//主讲人图标
                    //参与方ID组
                    if(mtIds.length>0){
                        $.each(mtIds,function(index,item){
                            if(mtIds.indexOf(v.mtId)==-1){
                                mtIds.push(v.mtId);
                            }
                        })
                    }else{
                        mtIds.push(v.mtId);
                    }


                    //会场第一主持人就是默认进入直播间的主讲人
                    if(v.ishost == 1){
                        $("#speakerMain").val(v.hospitalName);//改变前的医院名称
                        mtId_old = v.mtId;//改变前的mtid
                        hostIcon="<img src= '"+$.base+"/images/pages/host.png' title='主持人'>";
                    }
                    if(v.speaker == 1){
                        speakerIcon="<img src= '"+$.base+"/images/pages/speaker.png' title='主讲人'>";
                    }
                    var mutePStr="";
                    var silencePStr="";
                    var speakPStr="";
                    //静麦开麦
                    if(v.mute==0){
                        mutePStr="<i class='iconfont' title='静麦'>&#xe601;</i>";
                    }else{
                        mutePStr="<i class='iconfont' title='开麦'>&#xe7f0;</i>";
                    }
                    //静音哑音
                    if(v.silence==0){
                        silencePStr="<i class='iconfont' title='静音'>&#xe62d;</i>";
                    }else{
                        silencePStr="<i class='iconfont' title='取消静音'>&#xe64a;</i>";
                    }
                    var hostBtn = new Object(),
                        muteBtn =  new Object(),
                        silenceBtn =  new Object(),
                        speakBtn = new Object(),
                        callBtn = new Object();
                    if(ishost==1||sysRole==systemName){
                        (v.speaker==1)?speakBtn ={"title":"取消发言"}:speakBtn ={"title":"选定发言"};
                        //判断是否在线
                        if(v.online == 1){
                            /*
                             * 如果在线：
                             *   右上角在线提示为绿色，即在线
                             *   操作按钮分情况讨论：
                             *        1.主持人按钮（ishost）：1——置灰，2——高亮
                             *        2.静麦/开麦按钮（mute）：1——高亮，2——置灰
                             *        3.静音/哑音按钮(silence)：1——高亮，2——置灰
                             *        4.指定发言/取消发言按钮：1——发言，0——不可发言
                             */
                            //右上角在线提示为绿色
                            ifontCircle="<button class='btn iconGreen circleIcon circleIcon_"+v.mtId+"'><i class='iconfont' title=''>&#xe645;</i></button>";
                            //设置按钮初始化

                            /*
                             * 如果登录人是主持人/管理员：
                             *    本身主持人按钮为灰色（不可点击），其他人为绿色（可点击），表示主持人有权限切换主持人
                             *    选定发言和取消发言均为绿色（可点击），表示主持人有权限指定谁为主讲人，且主讲人只有一个
                             */
                            if(v.ishost==1){
                                hostBtn ={"disabled":"disabled","cls":"disable"};
                            }else{
                                hostBtn ={"disabled":"enabled","cls":"iconGreen"};
                            }
                            speakBtn.disabled = "enabled";
                            speakBtn.cls = "iconGreen";
                            callBtn ={"disabled":"disabled","cls":"disable"};
                            muteBtn ={"disabled":"enabled","cls":"iconGreen"};
                            silenceBtn ={"disabled":"enabled","cls":"iconGreen"};
                            ifont="<button "+hostBtn.disabled+" class='btn hostIcon "+hostBtn.cls+" hostIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' title='主持人'><i class='iconfont'>&#xe61f;</i></button>"+
                                "<button "+muteBtn.disabled+" class='btn shutdIcon "+muteBtn.cls+" shutdIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' mutePStatus='"+v.mute+"'>"+mutePStr+"</button>"+
                                "<button "+silenceBtn.disabled+" class='btn silenIcon "+silenceBtn.cls+" silenIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' silencePStatus='"+v.silence+"'>"+silencePStr+"</button>"+
                                "<button "+speakBtn.disabled+" class='btn speakIcon "+speakBtn.cls+" speakIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' speakPStatus='"+v.speaker+"' title='"+speakBtn.title+"'></button>"+
                                "<button "+callBtn.disabled+" class='btn talkIcon "+callBtn.cls+" talkIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"'  hospitalName='"+v.hospitalName+"' title='呼叫'><i class='iconfont'>&#xe606;</i></button>"+
                                "<button class='btn deleIcon deleIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' att2='"+v.id+"' hospitalName='"+v.hospitalName+"' title='删除终端'><i class='iconfont' style='color:red;'>&#xe666;</i></button>";

                        }else{
                            /*
                             * 如果不在线：
                             *   右上角在线提示为灰色，即不在线
                             *   操作按钮只需设置呼叫和删除可点击
                             */
                            ifontCircle="<button disabled class='btn circleIcon circleIcon_"+v.mtId+"'><i class='iconfont' title=''>&#xe645;</i></button>";
                            ifont="<button disabled class='btn hostIcon hostIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"'  hospitalName='"+v.hospitalName+"' title='主持人'><i class='iconfont'>&#xe61f;</i></button>"+
                                "<button disabled class='btn shutdIcon shutdIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' mutePStatus='"+v.mute+"'>"+mutePStr+"</button>"+
                                "<button disabled class='btn silenIcon silenIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' silencePStatus='"+v.silence+"'>"+silencePStr+"</button>"+
                                "<button disabled class='btn speakIcon speakIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' speakPStatus='"+v.speaker+"' title='"+speakBtn.title+"'></button>"+
                                "<button class='btn talkIcon iconGreen talkIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"'  hospitalName='"+v.hospitalName+"' title='呼叫'><i class='iconfont'>&#xe606;</i></button>"+
                                "<button class='btn deleIcon deleIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' att2='"+v.id+"'  hospitalName='"+v.hospitalName+"' title='删除终端'><i class='iconfont' style='color:red;'>&#xe666;</i></button>";
                        }
                    }else{
                        /*
                         * 如果登录人不是主持人/管理员：
                         *    只能操作自身
                         */
                        //判断是否在线
                        if(v.online == 1){
                            /*
                             * 如果在线：
                             *   右上角在线提示为绿色，即在线
                             */
                            ifontCircle="<button class='btn iconGreen circleIcon circleIcon_"+v.mtId+"'><i class='iconfont' title=''>&#xe645;</i></button>";

                        }else{
                            /*
                             * 如果不在线：
                             *   右上角在线提示为灰色，即不在线
                             */
                            ifontCircle="<button disabled class='btn circleIcon circleIcon_"+v.mtId+"'><i class='iconfont' title=''>&#xe645;</i></button>";
                        }
                        //如果为自身
                        if(loginUserId==v.loginId){
                            ifont="<button disabled class='btn hostIcon hostIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"'  hospitalName='"+v.hospitalName+"' title='主持人'><i class='iconfont'>&#xe61f;</i></button>"+
                                "<button class='btn iconGreen shutdIcon shutdIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' mutePStatus='"+v.mute+"'>"+mutePStr+"</button>"+
                                "<button class='btn iconGreen silenIcon silenIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' silencePStatus='"+v.silence+"'>"+silencePStr+"</button>"+
                                "<button disabled class='btn speakIcon speakIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' speakPStatus='"+v.speaker+"' title='"+speakBtn.title+"'></button>"+
                                "<button disabled class='btn talkIcon talkIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' title='呼叫'><i class='iconfont'>&#xe606;</i></button>"+
                                "<button class='btn deleIcon deleIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' att2='"+v.id+"' hospitalName='"+v.hospitalName+"' title='删除终端'><i class='iconfont' style='color:red;'>&#xe666;</i></button>";

                        }else{
                            ifont="<button disabled class='btn hostIcon hostIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' title='主持人'><i class='iconfont'>&#xe61f;</i></button>"+
                                "<button disabled class='btn shutdIcon shutdIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' mutePStatus='"+v.mute+"'>"+mutePStr+"</button>"+
                                "<button disabled class='btn silenIcon silenIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' silencePStatus='"+v.silence+"'>"+silencePStr+"</button>"+
                                "<button disabled class='btn speakIcon speakIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' speakPStatus='"+v.speaker+"' title='"+speakBtn.title+"'></button>"+
                                "<button disabled class='btn talkIcon talkIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' hospitalName='"+v.hospitalName+"' title='呼叫'><i class='iconfont'>&#xe606;</i></button>"+
                                "<button disabled class='btn deleIcon deleIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' att2='"+v.id+"' hospitalName='"+v.hospitalName+"' title='删除终端'><i class='iconfont' style='color:red;'>&#xe666;</i></button>";

                        }
                    }


                    //判断是否是自家医院
//                    if(v.hospitalId==hospitalId){
//                        conversionCircuit="<button class='btn lineOne_"+v.mtId+" lineOne' title='线路一'><i class='iconfont'>&#xe61a;</i>"+
//                            "<button class='btn lineTwo_"+v.mtId+" lineTwo' title='线路二'><i class='iconfont'>&#xe61a;</i>";
//                    }
                    var index=Math.ceil((i+1)/3);
                    //判断医院是否有自己的图片
                    if(v.hasOwnProperty('logourl')){
                        var url = v.logourl!="" ? $.base+"/loginController/showPic?name="+v.logourl : $.base+"/images/pages/changePic.png";
                    }else {
                        var url = $.base+"/images/pages/changePic.png";
                    }
                    lis+="<li class='carousel_"+index+" detailLi'>"+
                        "<div class='heightFull'>"+
                        "<div class='heightFull widthFull'>"+
                        "<div class='detailBannerLi' >"+ //'"+$.base+"/images/pages/changePic.png'
                        "<div class='detailBannerDiv' style='background:url("+url+") no-repeat;background-size:100% 100%'>"+
                        "<div class='detailBgDiv'>"+
                        "<div class='dragDetail' uid='"+v.mtId+"' uv='"+v.hospitalName+"'>"+
                        "<div class='pull-left hostFlag'>"+hostIcon+"</div>"+
                        "<div class='pull-left mainSpeaker'>"+speakerIcon+"</div>"+
                        "<span style='float:right;'>"+ifontCircle+"</span>"+
                        "<div class='detailParti' title='"+v.hospitalName+"'>"+v.hospitalName+"</div>"+
                        "</div>"+
                        "<div class='buttonIfont'>"+ifont+"</div>"+
                        "</div>"+
                        "</div>"+
                        "</div>"+
                        //"<div class='conversionCircuit'>"+conversionCircuit+"</div>"+
                        "</div>"+
                        "</div>"+
                        "</li>";
                });
                var liLen = data.participants.length;
                //如果是主持人或系统管理员，则添加+项
                if(sysRole==systemName||sysRole==1){
                    var path=$.base;
                    var iconBtn="<button class='btn' title='主持人' disabled><i class='iconfont' disabled>&#xe61f;</i></button>"+
                        "<button class='btn' title='静麦' disabled><i class='iconfont' disabled>&#xe601;</i></button>"+
                        "<button class='btn' attr='' title='静音' disabled><i class='iconfont' disabled>&#xe62d;</i></button>"+
                        "<button class='btn addSpeaker' title='选定发言' disabled ></button>"+
                        "<button class='btn' title='呼叫' disabled><i class='iconfont' disabled>&#xe606;</i></button>"+
                        "<button class='btn' title='删除终端' disabled><i class='iconfont' style='color:red;'>&#xe666;</i></button>";


                    //如果当前登录人是主持人或者系统管理员 则添加+号项
                    var addItemStrs = "";
                    liLen = liLen+1;
                    addItemStrs="<li class='carousel_add carousel_"+Math.ceil(liLen/3)+" detailLi'>"+
                        "<div class='heightFull'>"+
                        "<div class='heightFull widthFull'>"+
                        "<div class='addPartiDiv'>"+
                        "<div class='detailBannerDiv'>"+
                        "<div class='detailBgDiv'>" +
                        "<div class='addParti'></div>"+
                        "<div class='buttonIfont'>"+iconBtn+"</div>"+
                        "</div>"+
                        "</div>"+
                        "</div>"+
                        "</div>"+
                        "</div>"+
                        "</li>";

                }
                lis+=addItemStrs;
                $("#liveCarousel .carousel-inner").append(lis);
                var itemLen = Math.ceil(liLen/3);
                for (var i=0;i<itemLen;i++){
                    $(".carousel_"+(i+1)).wrapAll("<ul class='carouselUl carouselUl_"+(i+1)+"'></ul>");
                    $(".carouselUl_"+(i+1)).wrap("<div class='item' style='height:100%;'></div>");
                    $("#liveCarouselCircle").append("<li data-target='#liveCarousel' data-slide-to='"+i+"'></li>");
                }
                $(".item:first").addClass("active");
                $("#liveCarouselCircle").children(":first").addClass("active");

                $('#liveCarousel').carousel({
                    pause: true,
                    interval: false,
                    wrap:false
                });
                setDrag();//初始化拖拽对象
                setPartiClick();//参与方点击事件
                setAddParti();//添加参与方模态框
            },
            error:function(e){}
        });
    };

    function setAddParti(){
        $(".carousel-inner").on("click",".addPartiDiv",function(){
            $("#selectModal").modal('show');
            $("#selectNum").text('0');
            setZTreeModel();
        });
    }

    var setting = {
        view: {
            selectedMulti:true,
        },
        data: {
            simpleData: {
                enable: true,
                pIdKey: "pid"
            }
        }
    };
    function setZtree(zNodes){
        require(["bootstrap","ztreeCore","ztreeExcheck","ztreeExedit"],function(){
            $.fn.zTree.init($("#treeDemo1"), setting, zNodes);
            treeObj = $.fn.zTree.getZTreeObj("treeDemo1");
            //treeObj.expandAll(true);
            setLi();
            setSelect();
            //searchTree();//模态框医院列表数据搜索
        });
    }
    //模态框里的树渲染
    function setZTreeModel(){
        participants = getNewestParticipant();
        //获得医院列表数据
        var hospitalIds=[]
        $.each(participants,function (i,v) {
            hospitalIds.push(v.hospitalId)
        })
        $.ajax({
            type: "post",
            async: true,
            url:  $.base + "/hospital/screenHospital",
            contentType:"application/json",
            data:JSON.stringify({
                "hospitalIds":hospitalIds
            }),
            dataType: "json",
            success: function(data){
                var zNodes =data;
                setZtree(zNodes);//渲染医院列表
            }
        });
    }
    function setLi(){
        if($("#selectResult li").length>0){
            $("#selectResult li").click(function(){
                $(this).addClass("cur").siblings().removeClass("cur");
            });
        }
    }
    //搜索
    function searchTree(startTime,endTime){
        $("#searchBtnModel").unbind().on("click",function(){
            $.ajax({
                url:$.base+"/hospital/screenHospital",
                type:"POST",
                contentType:"application/json",
                dateType:"json",
                data:JSON.stringify(
                    {
                        "name":$("#searchParticipantModal").val(),
                        "startTime":startTime,
                        "endTime":endTime,
                        //"confId":$("#confId").val(),
                    }
                ),
                success:function(data){
                    var zNodes =data;
                    setZtree(zNodes,startTime,endTime);//渲染医院列表
                    setLi();
                },
                error:function(data){}
            });
        });
    }

    //左右选择框
    function setSelect(){
        //从左往右单选
        $("#LTRSingle").unbind().on("click",function(){
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo1");
            var sNodes = treeObj.getSelectedNodes();
            console.log(sNodes);
            if (sNodes.length > 0) {
                var node = sNodes[0].getParentNode();
            }
            var importId;var importName;var newvoid;
            if(node!=null){
                importId=node.id;
                importName=node.name;
                newvoid = node.newvoidNum;
                //mtId = node.mtId;
            }
            else{
                importId=sNodes[0].id;
                importName=sNodes[0].name;
                newvoid=sNodes[0].newvoidNum;
                //mtId = sNodes[0].mtId;
            }
            if(importId){
                if(ids.length==0){
                    ids.push(importId);
                    nodesObj.push({
                        "hospitalId":importId,
                        "hospitalName":importName,
                        "serialNumber":3,
                        "newVoidNum":newvoid,
                        "account":newvoid,
                        "account_type": 5,
                        "bitrate": 4096,
                        "protocol": 0,
                        "forced_call": 0,
                    });
                    /*exObj.push({
                     "mtId":mtId,
                     });*/
                    $("#selectResult").append("<li att='"+importId+"' class='partisLimodal'><span class='iconfont iconfontList'>&#xe61e;</span><span class='selectSpan' title='"+importName+"'>"+importName+"</span></li>");
                }
                else{
                    if($.inArray(importId,ids)==-1){
                        ids.push(importId);
                        nodesObj.push({
                            "hospitalId":importId,
                            "hospitalName":importName,
                            "serialNumber":3,
                            "newVoidNum":newvoid,
                            "account":newvoid,
                            "account_type": 5,
                            "bitrate": 4096,
                            "protocol": 0,
                            "forced_call": 0,
                        });
                        /*exObj.push({
                         "mtId":mtId,
                         });*/
                        $("#selectResult").append("<li att='"+importId+"' class='partisLimodal'><span class='iconfont iconfontList'>&#xe61e;</span><span class='selectSpan' title='"+importName+"'>"+importName+"</span></li>");
                    }
                }
                $("#selectNum").text($("#selectResult").find("li").length);
                setLi();
            }
        });

        //从右往左单选
        $("#RTLSingle").unbind().on("click",function(){
            setLi();
            var selectLiId=$("#selectResult li.cur").attr("att");
            var index=$.inArray(parseInt(selectLiId),ids);
            ids.splice(index,1);
            nodesObj.splice(index,1);
            $("#selectResult li.cur").remove();
            $("#selectNum").text($("#selectResult").find("li").length);
        });

        //模态框确定按钮（新增c）
        var mts=[];
        $(".selectBtn").unbind().on("click",function(){
           $.each(nodesObj,function(i,v){
                var obj={};
                for(key in v){
                    if(key!=='hospitalName'&& key !=='newVoidNum' && key !=='hospitalId' && key !='serialNumber'){
                        obj[key]=v[key]
                    }
                }
                mts.push(obj);
            });
            var params={
                "liveId":$("#liveIdControlDetail").val(),
                "creatorId":loginUserId,
                "searchParticipant":nodesObj,
                "confId":$("#confId").val(),
                "params":{
                    "mts":mts
                }
            };

            var confId = $("#confId").val();
            var requestTip=base.requestTip({position:"center"});
            $.ajax({
                type: "post",
                async: true,
                url:  $.base + "/liveController/inviteParticipant",
                contentType:"application/json",
                data:JSON.stringify(params),
                success: function(data){
                    switch(data.status){
                        case '1':
                            requestTip.success("成功！");

                            ws.send(JSON.stringify({addParticipant:{confId: $("#confId").val(),participant:data.data}}))
                            //reQuestMtid();
                            //setCarousel();
                            $('#selectModal').modal('hide');
                            break;
                        default:
                            requestTip.error("失败！");
                            break;
                    }
                }
            });
        });

        //关闭模态框
        $('#selectModal').on('hidden.bs.modal', function () {
            $("#selectResult").empty();
            ids=[];
            nodesObj=[];
        });
    }

    //参与方列表操作按钮控制
    function setPartiClick(){
        //主持人
        $(".carousel-inner").unbind().on("click",".hostIcon",function(){
            var _this = this;
            var hospitalNameNow=$(_this).attr("hospitalName");//现在的医院名称
            var confId=$(_this).attr("att");
            var mt_id=$(_this).attr("att1");
            var modal = base.modal({
                label: "提示",
                context: "<div style='text-align:center;font-size:13px;'>确定把主持人权限切换给"+hospitalNameNow+"吗？</div>",
                textAlign:'text-align:center',
                width: 250,
                height: 80,
                buttons: [
                    {
                        label: "确定",
                        cls: "btn btn-info",
                        clickEvent: function () {
                            var params={
                                "hospitalNameEx":$("#speakerMain").val(),
                                "hospitalNameNow":hospitalNameNow,
                                "confId":confId,
                                "mtIdOld":mtId_old,
                                "params":{
                                    "mt_id":mt_id
                                }
                            }
                            var requestTip=base.requestTip({position:"center"});
                            $.ajax({
                                type: "POST",
                                url:$.base + "/liveController/switchHost",
                                data:JSON.stringify(params),
                                contentType:"application/json",
                                success: function(data){
                                    switch(data.status){
                                        case '1':
                                            $("#speakerMain").val(hospitalNameNow);
                                            requestTip.success("切换主持人成功！");
                                            break;
                                        default:
                                            requestTip.error("切换主持人失败！");
                                            break;
                                    }
                                },
                                beforeSend:function(){
                                    requestTip.wait();
                                },
                                error:function(){
                                    requestTip.error();
                                }
                            });
                            modal.hide();
                        }
                    },
                    {
                        label: "取消",
                        cls: "btn btn-warning",
                        clickEvent: function () {
                            modal.hide();
                        }
                    }
                ]
            });
        });
        //静麦
        $(".carousel-inner").on("click",".shutdIcon",function(){
            var _thisShut = this;
            var confId=$(this).attr("att");
            var mt_id=$(this).attr("att1");
            var status=$(this).attr("mutePStatus");
            var shutdStatus=$(this).find("i").attr("title");
            var shutdStr="";
            var params={
                "confId":confId,
                "mtId":mt_id,
                "params":{
                    "value":status==0?1:0
                }
            }
            var requestTip=base.requestTip({position:"center"});
            $.ajax({
                type: "POST",
                url:$.base + "/liveController/mute",
                data:JSON.stringify(params),
                contentType:"application/json",
                success: function(data){
                    if(data.status=='1'){
                        if(status=="0"){
                            requestTip.success("静麦成功！");
                            $(_thisShut).addClass("iconGreen");
                            shutdStr="<i class='iconfont' title='开麦'>&#xe7f0;</i>";
                            $(_thisShut).html(shutdStr);
                            $(_thisShut).attr("mutePStatus","1");
                        }
                        else{
                            requestTip.success("开麦成功！");
                            $(_thisShut).addClass("iconGreen");
                            shutdStr="<i class='iconfont' title='静麦'>&#xe601;</i>";
                            $(_thisShut).html(shutdStr);
                            $(_thisShut).attr("mutePStatus","0");
                        }
                    }
                    else{
                        requestTip.error();
                    }
                },
                beforeSend:function(){
                    requestTip.wait();
                },
                error:function(){
                    requestTip.error();
                }
            });
        });
        //静音
        $(".carousel-inner").on("click",".silenIcon",function(){
            var _thisSilen = this;
            var confId=$(this).attr("att");
            var mt_id=$(this).attr("att1");
            var status=$(this).attr("silencePStatus");
            var silenStatus=$(this).find("i").attr("title");
            var silenStr="";
            var params={
                "confId":confId,
                "mtId":mt_id,
                "params":{
                    "value":status==0?1:0
                }
            }
            var requestTip=base.requestTip({position:"center"});
            $.ajax({
                type: "POST",
                url:$.base + "/liveController/silence",
                data:JSON.stringify(params),
                contentType:"application/json",
                success: function(data){
                    if(data.status=='1'){
                        if(status=="0"){
                            requestTip.success("静音成功！");
                            $(_thisSilen).addClass("iconGreen");
                            silenStr="<i class='iconfont' title='取消静音'>&#xe64a;</i>";
                            $(_thisSilen).html(silenStr);
                            $(_thisSilen).attr("silencePStatus","1");
                        }
                        else{
                            requestTip.success("取消静音成功！");
                            $(_thisSilen).addClass("iconGreen");
                            silenStr="<i class='iconfont' title='静音'>&#xe62d;</i>";
                            $(_thisSilen).html(silenStr);
                            $(_thisSilen).attr("silencePStatus","0");
                        }
                    }
                    else{
                        requestTip.error();
                    }
                },
                beforeSend:function(){
                    requestTip.wait();
                },
                error:function(){
                    requestTip.error();
                }
            });
        });
        //指定发言人
        $(".carousel-inner").on("click",".speakIcon",function(){
            var _thisSpeak = this;
            var confId=$(this).attr("att");
            var mt_id=$(this).attr("att1");
            //获取此mtId上的发言人状态，若为发言人则取消，
            // 传空字符串，若不为空，则指定他为发言人，正常传参
            var status=$(this).attr("speakPStatus");
            var hospitalName = $(this).attr("hospitalName");
            var speakStr="";
            participants = getNewestParticipant();
            var params={
                "participants":participants,
                "confId":confId,
                "params":{
                    "mt_id":status=='1'?'':mt_id
                }
            }
            var requestTip=base.requestTip({position:"center"});
            $.ajax({
                type: "POST",
                url:$.base + "/liveController/chooseSpeaker",
                data:JSON.stringify(params),
                contentType:"application/json",
                success: function(data){
                    switch(data.status){
                        case '1':
                            if(data.status=='1'){
                                ws.send(JSON.stringify({switchSpeaker:{confId:confId,mtid:mt_id,status:status,hospitalName:hospitalName}}));
                            }
                            break;
                        default:
                            requestTip.error();
                            break;
                    }
                },
                // beforeSend:function(){
                //     requestTip.wait();
                // },
                error:function(){
                    requestTip.error();
                }
            });
        });
        //呼叫
        $(".carousel-inner").on("click",".talkIcon",function(){
            var confId=$(this).attr("att");
            var mt_id=$(this).attr("att1");
            var hospitalName=$(this).attr("hospitalName");
            var params={
                "confId":confId,
                "hospitalName":hospitalName,
                "params":{
                    "mts":[{
                        "mt_id":mt_id
                    }]
                }
            }
            var requestTip=base.requestTip({position:"center"});
            $.ajax({
                type: "POST",
                url:$.base + "/liveController/callParticipant",
                data:JSON.stringify(params),
                contentType:"application/json",
                success: function(data){

                    switch(data.status){
                        case '1':
                            requestTip.success("呼叫成功！");
                            break;
                        default:
                            requestTip.error("呼叫失败！");
                            break;
                    }
                },
                beforeSend:function(){
                    requestTip.wait();
                },
                error:function(){
                    requestTip.error();
                }
            });
        });
        //删除终端
        $(".carousel-inner").on("click",".deleIcon",function(){
            var _thisDele=this;
            var confId = $("#confId").val();
            var mt_id=$(this).attr("att1");
            var delayId=$(this).attr("att2");
            var hospitalName=$(this).attr("hospitalName");
            var thisIsHost = $(_thisDele).parents(".detailBgDiv").find(".hostFlag img").length;//如果删除的这个是主持人的话
            var params={
                "hospitalName":hospitalName,
                "id":delayId,
                "isDel":1,//软删除参与方
                "confId":confId,
                "num":participants.length,
                "liveId":$("#liveIdControlDetail").val(),
                "params":{
                    "mts":[{
                        "mt_id":mt_id
                    }]
                }
            };
            if(participants.length>2) {
                delParticipant(mt_id,thisIsHost,confId,params);
            }else{
                var modal = base.modal({
                    label: "提示",
                    context: "<div style='text-align:center;font-size:13px;'>该会议还有两个参与方，删除该参与方后，会议即将被挂断，是否继续？</div>",
                    textAlign:'text-align:center',
                    width: 250,
                    height: 80,
                    buttons: [
                        {
                            label: "确定",
                            cls: "btn btn-info",
                            clickEvent: function () {
                                delParticipant(mt_id,thisIsHost,confId,params);
                                modal.hide();
                            }
                        },
                        {
                            label: "取消",
                            cls: "btn btn-warning",
                            clickEvent: function () {
                                modal.hide();
                            }
                        }
                    ]
                });
            }
        });
    }
    //删除数据库中的参与方
    function delParticipant(mt_id,thisIsHost,confId,params){
        var requestTip=base.requestTip({position:"center"});
        if ((ishost == 1&& mt_id == thisMtId)||(sysRole==systemName&&thisIsHost==1)) {
            //如果是主持人或者管理员删除主持人，则提示“请先将主持人权限切换给其他参与方”
            var modal = base.modal({
                label: "提示",
                context: "<div style='text-align:center;font-size:13px;'>请先将主持人权限切换给其他参与方</div>",
                textAlign:'text-align:center',
                width: 250,
                height: 80,
                buttons: [
                    {
                        label: "确定",
                        cls: "btn btn-info",
                        clickEvent: function () {
                            modal.hide();
                        }
                    }
                ]
            });
        } else if ((ishost != 1&& mt_id == thisMtId)){
            //如果不是主持人，删掉了自己，则提示“退出后不能参加该会议，确认退出？”，确定后退出直播间
            var modal = base.modal({
                label: "提示",
                context: "<div style='text-align:center;font-size:13px;'>退出后不能参加该会议，确认退出？</div>",
                textAlign:'text-align:center',
                width: 250,
                height: 80,
                buttons: [
                    {
                        label: "确认",
                        cls: "btn btn-info",
                        clickEvent: function () {
                            $.ajax({
                                type: "POST",
                                url: $.base + "/liveController/deleteParticipant",
                                data: JSON.stringify(params),
                                contentType: "application/json",
                                success: function (data) {

                                    switch (data.status) {
                                        case '1':
                                            requestTip.success("删除成功！");
                                            ws.send(JSON.stringify({deleteParticipant: {confId: confId, mtid: mt_id,isQuit: true}}));
                                            modal.hide();
                                            break;
                                        default:
                                            requestTip.error("删除失败！");
                                            break;
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
                    },
                    {
                        label: "取消",
                        cls: "btn btn-warning",
                        clickEvent: function () {
                            modal.hide();
                        }
                    }
                ]
            });
        } else if ((ishost == 1&& mt_id !== thisMtId)||(sysRole==systemName&&thisIsHost!=1)){
            //如果是主持人或系统管理员，删除普通参与方，则提示“确定删除该参与方吗？”，并将其退出直播间
            var modal = base.modal({
                label: "提示",
                context: "<div style='text-align:center;font-size:13px;'>确定删除该参与方吗？</div>",
                textAlign:'text-align:center',
                width: 250,
                height: 80,
                buttons: [
                    {
                        label: "确认",
                        cls: "btn btn-info",
                        clickEvent: function () {
                            $.ajax({
                                type: "POST",
                                url: $.base + "/liveController/deleteParticipant",
                                data: JSON.stringify(params),
                                contentType: "application/json",
                                success: function (data) {

                                    switch (data.status) {
                                        case '1':
                                            requestTip.success("删除成功！");
                                            ws.send(JSON.stringify({deleteParticipant: {confId: confId,mtid: mt_id,isQuit: false}}));
                                            modal.hide();
                                            break;
                                        default:
                                            requestTip.error("删除失败！");
                                            break;
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
                    },
                    {
                        label: "取消",
                        cls: "btn btn-warning",
                        clickEvent: function () {
                            modal.hide();
                        }
                    }
                ]
            });
        }
    }
    //会场记录表格
    function setTableRecord(){
        $("#tblRecord").DataTable({
            "searching":false,
            "lengthChange":false,
            "autoWidth":false,
            "serverSide":true,
            "paging":true,
            "stateSave":true,
            "ordering":false,
            "bRetrieve": true,
            "language":{"url":$.base+"/js/lib/chinese.json"},
            "ajax":{
                "type":"post",
                "url":$.base+"/kscc/liveOperationLog/liveFbsLiveParticiList",
                "contentType":"application/json",
                "data": function ( d ) {
                    var params={
                        "pageNo": d.start/d.length+1,
                        "pageSize": d.length,
                        "param":{
                            "id": $("#liveIdControlDetail").val()
                        }
                    };
//	                           $.extend(d,params);
                    return JSON.stringify(params);
                }
            },
            "columns":[
                {"title":"时间", "data":"operationTime","sWidth":"20%"},
                {"title":"操作人", "data":"operateMan","sWidth":"20%"},
                {"title":"操作内容", "data":"operationContent","sWidth":"60%"}
            ],
            "columnDefs":[
                {
                    "render":function(data,type,row,meta){
                        if(data != null && data != ''){
                            return data.substr(0,16);
                        }
                    },
                    "targets":0
                },
                {
                    "render":function(data,type,row,meta){
                        return "<div class='text-left operateContentDiv'>"+row.operationContent+"</div>"
                    },
                    "targets":2
                }
            ],
            "drawCallback":function (setting) {
                //形成表格之后再进行调操作内容的宽度
                var len=$(".operateContentDiv").eq(0).text().length;//字符的个数
                var height="";//判断有没有折行
                $(".operateContentDiv").each(function (index,item) {
                    var itemLen;
                    var height = $(item).parent().height();
                    if(height<20){//说明没有折行
                        itemLen = $(item).text().length
                    }
                    if(itemLen>len){
                        len = itemLen;
                    }
                });
                //将最长的长度，作为操作内容的长度
                $(".operateContentDiv").width(len*16).css("margin","0 auto")
            }
        });
    };

    //设置按钮点击/切换
    function setChange(){
        //全场哑音
        $(".allShutIcon").unbind().on("click",function(){
            var confId = $("#confId").val();
            var status=$(".allShutIcon").attr("att");
            var allShutStatus=$(".allShutIcon").attr("title");
            var allShutStr="";
            var params={
                "confId":confId,
                "params":{
                    "value":status==0?1:0
                }
            }
            var requestTip=base.requestTip({position:"center"});
            $.ajax({
                type: "POST",
                url:$.base + "/liveController/allMute",
                data:JSON.stringify(params),
                contentType:"application/json",
                success: function(data){
                    switch(data.status){
                        case '1':

                            if(status=="0"){
                                requestTip.success("全场静麦成功！");
                                allShutStr="<i class='iconfont'>&#xe7f0;</i><span class='liveSpan'>全场开麦</span>";
                                $(".allShutIcon").attr("att",'1');
                                $(".allShutIcon").html(allShutStr);
                                $(".allShutIcon").attr("title","全场开麦");
                                $(".shutdIcon").attr("mutePStatus","1");
                                $(".shutdIcon").html("<i class='iconfont' title='开麦'>&#xe7f0;</i>");
                                ws.send(JSON.stringify({mute:confId+'0'}))
                            }
                            else{
                                requestTip.success("全场开麦成功！");
                                allShutStr="<i class='iconfont'>&#xe601;</i><span class='liveSpan'>全场静麦</span>";
                                $(".allShutIcon").attr("att",'0');
                                $(".allShutIcon").html(allShutStr);
                                $(".allShutIcon").attr("title","全场静麦");
                                $(".shutdIcon").attr("mutePStatus","0");
                                $(".shutdIcon").html("<i class='iconfont' title='静麦'>&#xe601;</i>");
                                ws.send(JSON.stringify({mute:confId+'1'}))
                            }
                            break;
                        default:
                            requestTip.error();
                            break;
                    }
                },
                beforeSend:function(){
                    requestTip.wait();
                },
                error:function(){
                    requestTip.error();
                }
            });
        });

        //全场静音
        $(".allSilenIcon").unbind().on("click",function(){
            var confId = $("#confId").val();
            var status=$(".allSilenIcon").attr("att");
            var allSilenStatus=$(".allSilenIcon").attr("title");
            var allSilenStr="";
            var params={
                "confId":confId,
                "params":{
                    "value":status==0?1:0
                }
            }
            var requestTip=base.requestTip({position:"center"});
            $.ajax({
                type: "POST",
                url:$.base + "/liveController/allSilence",
                data:JSON.stringify(params),
                contentType:"application/json",
                success: function(data){

                    switch(data.status){
                        case '1':

                            if(status=="0"){
                                requestTip.success("全场静音成功！");
                                allSilenStr="<i class='iconfont'>&#xe64a;</i><span class='liveSpan'>取消静音</span>";
                                $(".allSilenIcon").attr("att",'1');
                                $(".allSilenIcon").html(allSilenStr);
                                $(".allSilenIcon").attr("title","取消静音");
                                $(".silenIcon").attr("silencePStatus","1");
                                $('.silenIcon').html("<i class='iconfont' title='取消静音'>&#xe64a;</i>");
                                ws.send(JSON.stringify({silence:confId+'0'}))
                            }
                            else{
                                requestTip.success("取消全场静音成功！");
                                allSilenStr="<i class='iconfont'>&#xe62d;</i><span class='liveSpan'>全场静音</span>";
                                $(".allSilenIcon").attr("att",'0');
                                $(".allSilenIcon").html(allSilenStr);
                                $(".allSilenIcon").attr("title","全场静音");
                                $(".silenIcon").attr("silencePStatus","0");
                                $('.silenIcon').html("<i class='iconfont' title='静音'>&#xe62d;</i>");
                                ws.send(JSON.stringify({silence:confId+'1'}))
                            }
                            break;
                        default:
                            requestTip.error();
                            break;
                    }
                },
                beforeSend:function(){
                    requestTip.wait();
                },
                error:function(){
                    requestTip.error();
                }
            });
        });

        //点击添加字幕
        $(".subtitleIcon").unbind().on("click",function(){
            $(".subtitle").removeClass("disNone");
            $(".subtitle").siblings().addClass("disNone");
            $(".detailBannerLi").removeClass("backColor");
            var requestTip=base.requestTip({position:"center"});
            var confId = $("#confId").val();
            if($(".parListSubtitle")){
                var container=".partiListSubtitle";
                getPartiList(container,confId);//select下拉框获得数据
                $(".partiListSubtitle").off().on("change",function(){
                    getSubtitleData(confId);//获得之前各家医院字幕结果
                });
            }else{
                getSubtitleData(confId);//获得之前各家医院颜色字幕结果
            }
            //提交
            $(".subtitleSubmit").off().on("click",function(){
            	base.form.validate({ 
                    form:$("#subtitleForm"), 
                    passCallback:function(){
                        var params;
                        if(isAdmin){
                            var want;
                            $.each(participants,function (index,item) {
                               want=item;
                            })
                            params = {
                                "liveId":want.liveId,
                                "ip": $(".partiListSubtitle").find("option:selected").attr("ip"),
                                "port":$(".partiListSubtitle").find("option:selected").attr("port"),
                                "word": $("#subtitleContent").val()
                            };
                        }
                        else{
                            var want;
                            $.each(participants,function (index,item) {
                                if(item.hospitalId===participant.hospitalId){
                                    want=item;
                                }
                            })
                            params = {
                                "liveId": want.liveId,
                                "ip": want.ip,
                                "port":want.port,
                                "word": $("#subtitleContent").val()
                            };
                        }
                        var requestTip=base.requestTip({position:"center"});
                        $.ajax({
                            type: "post",
                            url:  $.base + "/loginController/getBmpImage",
                            data:JSON.stringify(params),
                            dataType:'json',
                            contentType:"application/json",
                            success: function(data){
                                switch(data.status){
                                    case '1':
                                    	requestTip.success("添加字幕成功")
                                        break;
                                    default:
                                        requestTip.error("添加字幕失败")
                                        break;
                                }
                            },
                            beforeSend:function(){
                                requestTip.wait();
                            },
                            error:function(){
                                requestTip.error();
                            }
                        });
                    
                    }
            	});
            });
            //取消
            $(".subtitleCancel").off().on("click",function(){
                $("#scrollType").val("");
                $("#subtitleContent").val("");
            });
        });

        //点击画面合成
        $(".synthesisIcon").off().on("click",function(){
            $(".synthesis").removeClass("disNone");
            $(".synthesis").siblings().addClass("disNone");
            var confId = $("#confId").val();
            $(".detailBannerLi").removeClass("backColor");
            dragObj.init($(".dragBox"));
            setDragNum();//点击左侧右侧拖拽画面变化
            getPicSyn(confId);//获得先前合成的画面情况
            //提交画面合成
            $(".synthesisSubmit").off().on("click",function(){
                var mtIds=[];
                var picLength=$(".dragNumUl li.dragNumLi").attr("att");
                var selectLength=$(".synthesisRegion .dragBoxDiv_"+picLength+" .dragBox i").length;
                var requestTip=base.requestTip({position:"center"});
                for(var i=0;i<selectLength;i++){
                    mtIds.push(
                        {
                            "mt_id":$(".synthesisRegion .dragBoxDiv_"+picLength+" .dragBox:nth-child("+(i+1)+")  div").attr("uid"),
                            "chn_idx": i,
                            "member_type": 1
                        });
                }
                if(mtIds.length===0){
                    requestTip.error("请选择需要和成的画面");
                }else{
                    var layout = picLength === "2" ? 2 : picLength === "3" ? 4 : picLength === "4" ? 5 : void(0);
                    participants = getNewestParticipant();
                    var params={
                        participants:participants,
                        confId:confId,
                        params:{
                            "mode":1,
                            "voice_hint": 1,
                            "broadcast": 1,
                            "layout": layout,
                            "show_mt_name": 1,
                            "members": mtIds
                        }
                    }
                    $.ajax({
                        type: "POST",
                        url:$.base + "/liveController/pictureSynthesiss",
                        data:JSON.stringify(params),
                        contentType:"application/json",
                        success: function(data){
                            switch(data.status){
                                case '1':
                                    requestTip.success("画面合成成功！");
                                    $(".detailBannerLi").css("background","#00479d");
                                    $(".dragBoxDiv_"+picLength+"").siblings().find(".dragBox").html("");
                                    dragObj.init($(".dragBox"));
                                    break;
                                case '-1':
                                    requestTip.error("合成失败："+data.tips);
                                    break;
                            }
                        },
                        beforeSend:function(){
                            requestTip.wait();
                        },
                        error:function(){
                            requestTip.error();
                        }
                    });
                }
            });
        });
        //取消画面合成
        $('.synthesisCancel').off().on("click",function(){
            participants = getNewestParticipant();
            var confId = $("#confId").val();
            var params={
                confId:confId,
                participants:participants
            }
            var requestTip=base.requestTip({position:"center"});
            $.ajax({
                type: "POST",
                url:$.base + "/liveController/cancelPictureSynthesiss",
                data:JSON.stringify(params),
                contentType:"application/json",
                success: function(data){
                    switch(data.status){
                        case '1':
                            requestTip.success("取消画面合成成功！");
                            $(".dragBoxDiv .dragBox").html("");
                            $(".detailBannerLi").css("background","#00479d");
                            dragObj.init($(".dragBox"));
                            break;
                        case '-1':
                            requestTip.error("取消合成失败："+data.tips);
                            break;
                    }
                },
                beforeSend:function(){
                    requestTip.wait();
                },
                error:function(){
                    requestTip.error();
                }
            });
        });
        //点击画面选看
        $(".screenIcon").off().on("click",function(){
            $(".screen").removeClass("disNone");
            $(".screen").siblings().addClass("disNone");
            $(".detailBannerLi").removeClass("backColor");
            var requestTip=base.requestTip({position:"center"});
            dragObj.init($(".dragBox"));
            var confId = $("#confId").val();

            if($(".parListSele")){
                var container=".partiList";
                getPartiList(container,confId);//select下拉框获得数据
                $(".partiList").off().on("change",function(){
                    getScreenData(confId);
                });
            }else{
                getScreenData(confId);
            }

            $(".screenSubmit").off().on("click",function(){
                var srcMtId=$(".screen .dragBox div").attr("uid");
                if(!srcMtId){
                    requestTip.error("请选择要选看的医院");
                }else{
                    var mtValue=$(".partiList").find("option:selected").val();
                    if(!mtValue){
                        mtValue=thisMtId;
                    }
                    participants = getNewestParticipant();
                    var params={
                        participants:participants,
                        confId:confId,
                        params:{
                            "mode": 1,
                            "src": {
                                "type": 1,
                                "mt_id": srcMtId
                            },
                            "dst": {
                                "mt_id":mtValue
                            }
                        }
                    }
                    var requestTip=base.requestTip({position:"center"});
                    $.ajax({
                        type: "post",
                        url:  $.base + "/liveController/choosePicture",
                        data:JSON.stringify(params),
                        contentType:"application/json",
                        success: function(data){
                            switch(data.status){
                                case '1':
                                    requestTip.success("画面选看成功！");
                                    $(".detailBannerLi").css("background","#00479d");
                                    dragObj.init($(".dragBox"));
                                    break;
                                default:
                                    requestTip.error(data.tips);
                                    break;
                            }
                        },
                        beforeSend:function(){
                            requestTip.wait();
                        },
                        error:function(){
                            requestTip.error();
                        }
                    });
                }
            });
            //取消画面选看
            $(".screenCancel").off().on("click",function(){

                var currentMtId;
                if(sysRole==systemName){
                    currentMtId=$(".partiList").val();
                }else{
                    currentMtId=thisMtId;
                }
                participants = getNewestParticipant();
                var params={
                    participants:participants,
                    confId:confId,
                    mtId:currentMtId
                }
                var requestTip=base.requestTip({position:"center"});
                $.ajax({
                    type: "post",
                    url:  $.base + "/liveController/cancelChoosePicture",
                    data:JSON.stringify(params),
                    contentType:"application/json",
                    success: function(data){
                        switch(data.status){
                            case '1':
                                requestTip.success("取消画面选看成功！");
                                $(".dragBoxOne").html("");
                                $(".detailBannerLi").css("background","#00479d");
                                $(".screen .dragBox").html("");
                                $(".parListSele .partiList").val("");
                                dragObj.init($(".dragBox"));
                                break;
                            default:
                                requestTip.error(data.tips);
                                break;
                        }
                    },
                    beforeSend:function(){
                        requestTip.wait();
                    },
                    error:function(){
                        requestTip.error();
                    }
                });
            });
        });

        //开启关闭录像
        $(".videoIcon").off().on("click",function(){
            $(".videoMani").removeClass("disNone");
            $(".videoMani").siblings().addClass("disNone");
            $(".detailBannerLi").removeClass("backColor");
            var requestTip=base.requestTip({position:"center"});
            var confId = $("#confId").val();
            if($(".parListVideo")){
                var container=".partiListVideo";
                getPartiList(container,confId);//select下拉框获得数据
                $(".partiListVideo").off().on("change",function(){
                    getVideoData(confId);//获得之前各家医院颜色选看结果
                });
            }else{
                getVideoData(confId);//获得之前各家医院颜色选看结果
            }
        });

        //录像设置提交
        $(".videoSubmit").off().on("click",function(){
            var schId=$(".videoDivs input[type='radio']:checked").val();
            var confId = $("#confId").val();
            if(!schId){
                requestTip.error("请选择要设置的状态");
            }else{
                var mtId =$(".partiListVideo").find("option:selected").val();
                if(!mtId){
                    mtId=thisMtId;
                }
                participants = getNewestParticipant();
                var params={
                    participants:participants,
                    confId:confId,
                    mtId:mtId,
                    mode:schId
                }
                var requestTip=base.requestTip({position:"center"});
                $.ajax({
                    type: "post",
                    url:  $.base + "/liveController/startOrcancelVideo",
                    data:JSON.stringify(params),
                    contentType:"application/json",
                    success: function(data){
                        switch(data.status){
                            case '1':
                                requestTip.success("录像状态设置成功！");
                                break;
                            default:
                                requestTip.error(data.tips);
                                break;
                        }
                    },
                    beforeSend:function(){
                        requestTip.wait();
                    },
                    error:function(){
                        requestTip.error();
                    }
                });
            }

        });
        //录像设置取消
        $(".videoCancel").off().on("click",function(){
            var currentMtId;
            if(sysRole==systemName){
                currentMtId=$(".partiListVideo").val();
            }else{
                currentMtId=thisMtId;
            }
            var confId = $("#confId").val();
            participants = getNewestParticipant();
            var params={
                participants:participants,
                confId:confId,
                mtId:currentMtId
            }
            var requestTip=base.requestTip({position:"center"});
            $.ajax({
                type: "post",
                url:  $.base + "/liveController/cancelChoosePicture",
                data:JSON.stringify(params),
                contentType:"application/json",
                success: function(data){
                    switch(data.status){
                        case '1':
                            requestTip.success("取消录像设置成功！");
                            $(".parListVideo .partiListVideo").val("");
                            $(".videoDivs input[type='radio']").val("");
                            break;
                        default:
                            requestTip.error();
                            break;
                    }
                },
                beforeSend:function(){
                    requestTip.wait();
                },
                error:function(){
                    requestTip.error();
                }
            });

        });

        //颜色切换
        $(".colorSwitch").off().on("click",function(){
            $(".colorSelect").removeClass("disNone");
            $(".colorSelect").siblings().addClass("disNone");
            $(".detailBannerLi").removeClass("backColor");
            var requestTip=base.requestTip({position:"center"});
            var confId = $("#confId").val();
            if($(".parListColor")){
                var container=".partiListColor";
                getPartiList(container,confId);//select下拉框获得数据

                $(".partiListColor").off().on("change",function(){
                    getColorData(confId);//获得之前各家医院颜色选看结果
                });
            }else{
                getColorData(confId);//获得之前各家医院颜色选看结果
            }
        });
        //颜色选看提交
        $(".colorSubmit").off().on("click",function(){
            var schId=$(".colorDivs input[type='radio']:checked").val();
            var confId = $("#confId").val();
            if(!schId){
                requestTip.error("请选择要设置的颜色");
            }else{
                var mtId =$(".partiListColor").find("option:selected").val();
                if(!mtId){
                    mtId=thisMtId;
                }
                participants = getNewestParticipant();
                var params={
                    participants:participants,
                    confId:confId,
                    mtId:mtId,
                    SchID:schId
                }
                var requestTip=base.requestTip({position:"center"});
                $.ajax({
                    type: "post",
                    url:  $.base + "/liveController/switchImage",
                    data:JSON.stringify(params),
                    contentType:"application/json",
                    success: function(data){
                        switch(data.status){
                            case '1':
                                requestTip.success("颜色设置成功！");
                                break;
                            default:
                                requestTip.error(data.tips);
                                break;
                        }
                    },
                    beforeSend:function(){
                        requestTip.wait();
                    },
                    error:function(){
                        requestTip.error();
                    }
                });
            }

        });
        //颜色选看取消
        $(".colorCancel").off().on("click",function(){
            var currentMtId;
            if(sysRole==systemName){
                currentMtId=$(".partiListColor").val();
            }else{
                currentMtId=thisMtId;
            }
            var confId = $("#confId").val();
            participants = getNewestParticipant();
            var params={
                participants:participants,
                confId:confId,
                mtId:currentMtId
            }
            var requestTip=base.requestTip({position:"center"});
            $.ajax({
                type: "post",
                url:  $.base + "/liveController/cancelChoosePicture",
                data:JSON.stringify(params),
                contentType:"application/json",
                success: function(data){
                    switch(data.status){
                        case '1':
                            requestTip.success("取消颜色设置成功！");
                            $(".parListColor .partiListColor").val("");
                            $(".colorDivs input[type='radio']").val("");
                            break;
                        default:
                            requestTip.error();
                            break;
                    }
                },
                beforeSend:function(){
                    requestTip.wait();
                },
                error:function(){
                    requestTip.error();
                }
            });

        });

        //管理员点击直播延时
        $(".delayIcon").unbind().on("click",function(){
            var confId = $("#confId").val();
            $(".delay").removeClass("disNone");
            $(".delay").siblings().addClass("disNone");
            $(".detailBannerLi").removeClass("backColor");
            $("#tipDelay").hide();

            setInterval(function(){
                var returnObj=counter();
                var countDownstr = returnObj.day + "天" + returnObj.hour + "时" + returnObj.minute + "分";
                $("#remainingTime").text(countDownstr);
            }, 1000); //设置当前直播剩余时间

            $("#customMin").off().change(function(){
                $(".delayDivs input[type='radio']:eq(3)").attr("checked","checked");
            });

            //提交
            $(".delaySubmit").unbind().on("click",function(){
                var requestTip=base.requestTip({position:"center"});
                var delay_time=$(".delayDivs input[type='radio']:checked").val();
                if(delay_time){
                    if(delay_time==0){
                        delay_time=$("#customMin").val();
                        var r=/^[0-9]*[1-9][0-9]*$/;
                        var flag=r.test(delay_time);
                        if(!flag){
                            $("#tipDelay").show();
                            return
                        }else{
                            $("#tipDelay").hide();
                        }
                        if(delay_time<10||delay_time>180){
                            $("#tipDelay").show();
                            return
                        }else{
                            $("#tipDelay").hide();
                        }
                    }

                    if(sysRole==systemName){
                        var parmas={
                            "confId":confId,
                            "delay_time":delay_time
                        };

                        $.ajax({
                            type: "post",
                            url:  $.base + "/liveController/extendTime",
                            data:JSON.stringify(parmas),
                            contentType:"application/json",
                            success: function(data){
                                switch(data.status){
                                    case '1':
                                        requestTip.success("延时成功！");
                                        var message=confId+"管理员延长直播"+delay_time+"分钟";
                                        message=JSON.stringify({extendAdmin:message});
                                        ws.send(message);
                                        extendTime(delay_time);
                                        $("#tipDelay").hide();
                                        break;
                                    default:
                                        requestTip.error("延时失败！");
                                        break;
                                }
                            },
                            beforeSend:function(){
                                requestTip.wait();
                            },
                            error:function(){
                                requestTip.error();
                            }
                        });
                    }
                }else{
                    requestTip.error("请选择要延长的时间！");
                }
            });

            //取消
            $(".delayCancel").unbind().on("click",function(){
                $("input[type='radio']").attr("checked",false);
                $("#customMin").val("");
            });
        });

        //退出直播
        $(".outLive").unbind().on("click",function(){
            base.confirm({
                label:"提示",
                text:"<div style='text-align:center;font-size:13px;'>确定退出直播吗?</div>",
                textAlign:'text-align:center',
                confirmCallback:function(){
                    if(thisMtId){
                        var confId=$('#confId').val()
                        var data={confId:confId,ishost:ishost,params:{mts:[{mt_id:thisMtId}]},liveId:$("#liveIdControlDetail").val()}
                        var requestTip=base.requestTip({position:"center"});
                        $.ajax({
                            type: "post",
                            url:  $.base + "/liveController/getOutMeeting",
                            async:false,
                            data:JSON.stringify(data),
                            dataType:'json',
                            contentType:"application/json",
                            success: function(e1){
                                if(e1.status==='1'){
                                    if(e1.data){
                                        ws.send(JSON.stringify({hostOut:confId}))
                                    }
                                    //退出直播间
                                    quitLiveRoom();
                                }
                                else{
                                    //requestTip().error(e1.tips)
                                    base.requestTip({position:"center",width:350}).error(e1.tips);
                                }
                            },
                            error:function(){
                                requestTip.error();
                            }
                        });
                    }
                    else{
                        //退出直播间
                        quitLiveRoom();
                    }
                }
            });
        });

        //结束直播
        $(".endLive").unbind().on("click",function(){
            var confId = $("#confId").val();
            base.confirm({
                label:"提示",
                text:"<div style='text-align:center;font-size:13px;'>确定结束直播吗?</div>",
                textAlign:'text-align:center',
                confirmCallback:function(){
                    var requestTip=base.requestTip({position:"center"});
                    $.ajax({
                        type: "post",
                        url:  $.base + "/liveController/endLive",
                        data:JSON.stringify({confId:confId}),
                        dataType:'json',
                        contentType:"application/json",
                        success: function(data){
                            if(data.status=='1'){
                                requestTip.success("结束直播成功！");
                                ws.send(JSON.stringify({endLive:confId}))
                                //退出直播间
                                quitLiveRoom();
                            }else{
                                requestTip.error("结束直播失败！");
                            }
                        },
                        beforeSend:function(){
                            requestTip.wait();
                        },
                        error:function(){
                            requestTip.error();
                        }
                    });
                }
            });
        });

        //点击会场记录
        $(".recordIcon").unbind().on("click",function(){
            $(".record").removeClass("disNone");
            $(".record").siblings().addClass("disNone");
            $(".detailBannerLi").removeClass("backColor");
            $("#tblRecord").dataTable().fnDestroy();
            setTableRecord();
        });

        //点击申请发言
        $(".applySpeak").unbind().on("click",function () {
            var confId=$('#confId').val()
            var _this = this;
            hospitalsName = $("#userName").text() //获取当前医院
            var message=confId+hospitalsName+"申请发言!";
            message=JSON.stringify({applySpeak:message});
            ws.send(message);
            var requestTip=base.requestTip({position:"center"});
            requestTip.success("申请发言发送成功！");

            param={
                "hospitalsName":hospitalsName,
                "confId":confId
            }
            $.ajax({
                type: "post",
                url:  $.base + "/kscc/liveOperationLog/insertApplySpeakLog",
                data:JSON.stringify(param),
                contentType:"application/json",
                success: function(data){

                }
            });
        });

        //主持人点击申请直播延时
        $(".applyExtendTime").unbind().on("click",function () {
            var confId=$('#confId').val();
            var _this = this;
            $(".delay").removeClass("disNone");
            $(".delay").siblings().addClass("disNone");
            $(".detailBannerLi").removeClass("backColor");
            $("#tipDelay").hide();

            //设置当前直播剩余时间
            setInterval(function(){
                var returnObj=counter();
                var countDownstr = returnObj.day + "天" + returnObj.hour + "时" + returnObj.minute + "分";
                $("#remainingTime").text(countDownstr);
            }, 1000);

            $("#customMin").off().change(function(){
                $(".delayDivs input[type='radio']:eq(3)").attr("checked","checked");
            });

            //提交
            $(".delaySubmit").unbind().on("click",function(){
                var requestTip=base.requestTip({position:"center"});
                var delay_time=$(".delayDivs input[type='radio']:checked").val();
                if(delay_time){
                    //延时直播时间，产生消息信息
                    markMessages(delay_time);

                    if(delay_time==0){
                        delay_time=$("#customMin").val();
                        var r=/^[0-9]*[1-9][0-9]*$/;
                        var flag=r.test(delay_time);
                        if(!flag){
                            $("#tipDelay").show();
                            return
                        }else{
                            $("#tipDelay").hide();
                        }
                        if(delay_time<10||delay_time>180){
                            $("#tipDelay").show();
                            return
                        }else{
                            $("#tipDelay").hide();
                        }
                    }

                    requestTip.success("延时申请发送成功！");
                    hospitalsName = $("#userName").text() //获取当前医院
                    var message=confId+hospitalsName+"申请延长直播"+delay_time+"分钟";
                    message=JSON.stringify({apply:message});
                    ws.send(message);
                }
            });
            //取消
            $(".delayCancel").unbind().on("click",function(){
                $("input[type='radio']").attr("checked",false);
                $("#customMin").val("");
            });
        });
    }

    //更新直播间页面结束时间
    function extendTime(time){
        var delay_time=$(".delayDivs input[type='radio']:checked").val();
        if(delay_time==0){
            delay_time=$("#customMin").val();
        }else{
            delay_time=time;
        }
        param={
            "liveId":$("#liveIdControlDetail").val(),
            "timeExpand":delay_time
        }
        $.ajax({
            type: "post",
            url:  $.base + "/liveBroadCastController/updateEndTime",
            data:JSON.stringify(param),
            contentType:"application/json",
            success: function(data){
                $("#liveEndTime").text(data);
            }
        });
    }
    // 延时产生消息信息
    function markMessages(time) {
        var delay_time=$(".delayDivs input[type='radio']:checked").val();
        if(delay_time==0){
            delay_time=$("#customMin").val();
        }else{
            delay_time=time;
        }
        param={
            "liveId":$("#liveIdControlDetail").val(),
            "timeExpand":delay_time
        }
        $.ajax({
            type: "post",
            url:  $.base + "/messageContorller/markExtendMessages",
            data:JSON.stringify(param),
            contentType:"application/json",
            success: function(data){
                //$("#liveEndTime").text(data);
            }
        });
    }

    //获取消息信息数量
    function getMessageLiveNum() {
        param={
            //"liveId":$("#liveIdControlDetail").val(),
            //"addressee":-1,
            "status":1 //未读信息
        }
        $.ajax({
            type: "post",
            url:  $.base + "/messageContorller/queryExtendCount",
            data:JSON.stringify(param),
            contentType:"application/json",
            success: function(data){
                if(data!=0){
                    $(".msgNum").show();
                    $(".msgNum").text(data)
                }else{
                    $(".msgNum").hide();
                }
            }
        });
    }
    //加载select框数据
    function getPartiList(container,confId){
        var requestTip=base.requestTip({position:"center"});
        $.ajax({
            type: "GET",
            url:$.base + "/liveBroadCastController/getLiveDetailTwo/"+$("#liveIdControlDetail").val(),
            contentType:"application/json",
            success: function(data){
                var partiOptions=data.participants;
                $(container).empty();
                $.each(partiOptions,function(i,v){
                    $("<option value='"+v.mtId+"' ip='"+v.ip+"' port='"+v.port+"'>"+v.hospitalName+"</option>").appendTo(container);
                });
                if(container==".partiList"){
                    getScreenData(confId);
                }else if(container==".partiListVideo"){
                    getVideoData(confId);
                }else if(container==".partiListColor"){
                    getColorData(confId);
                }else if(container==".partiListSubtitle"){
                    getSubtitleData(confId);
                }
            },
            error:function(){}
        });
    }
    //加载之前画面选看的结果
    function getScreenData(confId){

        var requestTip=base.requestTip({position:"center"});
        $.ajax({
            type: "post",
            url:  $.base + "/liveController/getChoosePicture",
            data:JSON.stringify({confId:confId,hospitalId:hospitalId}),
            contentType:"application/json",
            success: function(data){
                switch(data.status){
                    case '1':

                        if(data.data){
                            var parVal=$(".partiList option:selected").val();

                            var selectedPar="";
                            if(parVal){
                                $.each(data.data,function(i,v){
                                    dragObj.init($(".dragBox"));//初始化拖拽对象
                                    if(parVal==v.dst){
                                        selectedPar="<i class='fa fa-trash-o removedragPickTools' style='font-size:14px;cursor:pointer;float:right;margin:2px;' title='移除'></i>"+
                                            "<div uid='"+v.src+"' style='float:left;width:100%;text-align:center;font-size:14px;padding-top:122px'>"+v.srcHospitalName+"</div>";
                                        $(".screen .dragBox").html("");
                                        $(".screen .dragBox").append(selectedPar);
                                    }
                                });
                            }else{
                                dragObj.init($(".dragBox"));//初始化拖拽对象
                                selectedPar="<i class='fa fa-trash-o removedragPickTools' style='font-size:14px;cursor:pointer;float:right;margin:2px;' title='移除'></i>"+
                                    "<div uid='"+data.data[0].dst+"' style='float:left;width:100%;text-align:center;font-size:14px;padding-top:122px'>"+data.data[0].dstHospitalName+"</div>";
                                $(".screen .dragBox").html("");
                                $(".screen .dragBox").append(selectedPar);
                            }
                        }else{
                            dragObj.init($(".dragBox"));//初始化拖拽对象
                        }
                        break;
                    default:
                        requestTip.error(data.tips);
                        break;
                }
            },
            error:function(){
                requestTip.error();
            }
        });
    }

    //点击左侧几画面然后右边拖拽区域变化
    function setDragNum(){
        $(".dragNumUl li").on("click",function(){
            $(this).siblings().removeClass("dragNumLi");
            $(this).addClass("dragNumLi");
            var dragNum=parseInt($(this).attr("att"));
            $(".synthesisRegion .dragBoxDiv_"+dragNum+"").removeClass("disNone");
            $(".synthesisRegion .dragBoxDiv_"+dragNum+"").siblings().addClass("disNone");
            dragObj.init($(".dragBox"));
        });
    }
    
    //加载之前画面合成的结果
    function getPicSyn(confId){
        var requestTip=base.requestTip({position:"center"});
        $.ajax({
            type: "post",
            url:  $.base + "/liveController/getPictureSynthesiss",
            data:JSON.stringify({confId:confId}),
            contentType:"application/json",
            success: function(data){
                switch(data.status){
                    case '1':
                        if(data.data){
                            var synthPar=data.data;
                            var screenObj=participants;
                            var dragLength;
                            $.each(data.data,function(i,v){
                            	if(v.layout){
                            		if(v.layout=="2"){
                            			dragLength=2;
                            		}else if(v.layout=="4"){
                            			dragLength=3;
                            		}else if(v.layout=="5"){
                            			dragLength=4;
                            		}
                            	}
                            });
                            
                            var selectedPar="";
                            $(".synthesisRegion .dragBoxDiv_"+dragLength+"").html("");
                            $.each(synthPar,function(i,v){
                                $.each(screenObj,function(x,y){
                                    if(v.mtId==y.mtId){
                                        selectedPar+="<div class='dragBox'><i class='fa fa-trash-o removedragPickTools' style='font-size:14px;cursor:pointer;float:right;margin:2px;' title='移除'></i>"+
                                            "<div uid='"+y.mtId+"' style='float:left;width:100%;text-align:center;font-size:14px;padding-top:22px'>"+y.hospitalName+"</div></div>";
                                    }
                                });
                            });
                            $(".synthesisRegion .dragBoxDiv_"+dragLength+"").append(selectedPar);
                            if((synthPar.length-1)<dragLength){
                                for(var i=0;i<(dragLength-(synthPar.length-1));i++){
                                    $(".synthesisRegion .dragBoxDiv_"+dragLength+"").append("<div class='dragBox'></div>");
                                }
                            }
                            dragObj.init($(".dragBox"));
                        }
                        break;
                    default:
                        requestTip.error(data.tips);
                        break;
                }
            },
            error:function(){
                requestTip.error();
            }
        });
    }
    
    //加载之前各家医院录像设置结果
    function getVideoData(confId){
        var requestTip=base.requestTip({position:"center"});
        $.ajax({
            type: "post",
            url:  $.base + "/liveController/getSwitchMode",
            data:JSON.stringify(participants),
            contentType:"application/json",
            success: function(data){
                switch(data.status){
                    case '1':
                        if(data.data){
                        	$(".videoDivs input").prop("checked",false);
                            var parVal=$(".partiListVideo option:selected").val();
                            $(".videoDivs input[value='"+data.data[parVal]+"']").prop("checked","true");
                        }
                        break;
                    default:
                        requestTip.error(data.tips);
                        break;
                }
            },
            error:function(){
                requestTip.error();
            }
        });
    }

    //加载之前各家医院颜色选看结果
    function getColorData(confId){
        var requestTip=base.requestTip({position:"center"});
        participants = getNewestParticipant();
        $.ajax({
            type: "post",
            url:  $.base + "/liveController/getSwitchImage",
            data:JSON.stringify(participants),
            contentType:"application/json",
            success: function(data){
                switch(data.status){
                    case '1':
                        if(data.data){
                            $(".colorDivs input").prop("checked",false);
                            var parVal=$(".partiListColor option:selected").val();
                            if(parVal){
                            	$(".colorDivs input[value='"+data.data[parVal]+"']").prop("checked",true);
                            }else{
                            	$(".colorDivs input[value='"+data.data.schId+"']").prop("checked",true);
                            }
                        }
                        break;
                    default:
                        requestTip.error(data.tips);
                        break;
                }
            },
            error:function(){
                requestTip.error();
            }
        });
    }
    
    //加载之前各家医院字幕结果
    /*function getSubtitleData(confId){
        var requestTip=base.requestTip({position:"center"});
        participants = getNewestParticipant();
        $.ajax({
            type: "post",
            url:  $.base + "/liveController/getBmpImageInfo",
            data:JSON.stringify(participants),
            contentType:"application/json",
            success: function(data){
                switch(data.status){
                    case '1':
                        if(data.data){
                            var parVal=$(".partiListSubtitle option:selected").val();
                            
                        }
                        break;
                    default:
                        requestTip.error(data.tips);
                        break;
                }
            },
            error:function(){
                requestTip.error();
            }
        });
    }*/

    var dragObj;
    function setDrag(){
        dragObj=base.dragPickBox({
            items:$(".dragDetail"),
            boxes:$(".dragBox"),
            msg:"请将要选看的医院从左侧拖拽至该处",
            clickEvent:function(obj){
                $(".detailBannerLi").css("background","#00479d");
                $(obj).parents(".detailBannerLi").css("background","rgb(2,250,78)");
            }
        });
    }

    //30、10分钟倒计时提示

    function setTimeTip(){
        setInterval(function(){
            var returnObj=counter();
            var flag=false;
            if((returnObj.day==0)&&(returnObj.hour==0)&&((returnObj.minute==30)||(returnObj.minute==10))){
                if(flag==false){

                    var activeBottomLi=$("#bottomLi li.active span").text();
                    var activeTopLi=$("#topLi li.active i").attr("alt");
                    var liveObj=$("#liveName").attr("title");
                    if((activeBottomLi=="直播管理"||activeTopLi=="直播管理")&&liveObj){
                        base.tip({
                            label:"提示",
                            text:"<div style='text-align:center;font-size:13px;'>直播还剩<span>"+returnObj.minute+"</span>分钟，如需延时请申请！</div>"
                        });
                        $(".modal").hide();
                        $(".modal-backdrop").css("display","none");
                        flag=true;
                    }
                }else{
                    flag=false;
                }
            }
        }, 60000);
    }
    return {
        run:function(){
            setLiveRoom();
            userId();
            setTableRecord();//设置会场记录
            setChange();//设置点击切换
            /*一分钟刷新一下消息数量*/
            timer = setInterval(getMessageLiveNum,6000);
            setTimeTip();
        }
    };
})