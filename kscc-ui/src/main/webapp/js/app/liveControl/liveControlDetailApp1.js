define(["base","datatables.net"],function(base,DataTable){
        var ids=[];
        var nodesObj=[];
        var participantObj;
        var exObj;
        var treeObj;
	    var loginUserId;
	    var ws;
	    //通过相应的直播id查询直播间信息
		function setLiveRoom(){
			if($("#liveIdControlDetail").val()){
				$.ajax({
	                type: "GET",
	                async: false,
	                url:$.base + "/liveBroadCastController/getLiveDetail/"+$("#liveIdControlDetail").val(),
	                contentType:"application/json",
					success:function(data){
						$("#liveName").text(decodeURI(data.title));
						$("#liveStartTime").text(formatDate(data.startTime));
				 	    $("#liveEndTime").text(formatDate(data.endTime));
					},
	                error:function(){
	                    alert("加载错误！");
	                }
				});
			}
		}
		
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
 	    var adminName;
 	    var messageFunction={
 	    	online:function (obj,confId) {
                var status=obj['mtsStatus'+confId];
    	            	$.each(participants,function(i,v){
    	                    var mt=status[v.mtId];
    	                    if(mt.mute==0){
    	                        $('.shutdIcon_'+v.mtId).html("<i class='iconfont' title='静麦'>&#xe601;</i>");
    	                    }else{
    	                        $('.shutdIcon_'+v.mtId).html("<i class='iconfont' title='开麦'>&#xe7f0;</i>");
    	                    }
    	                    if(mt.silence==0){
    	                        $('.silenIcon_'+v.mtId).html("<i class='iconfont' title='静音'>&#xe62d;</i>");
    	                    }else{
    	                        $('.silenIcon_'+v.mtId).html("<i class='iconfont' title='停止静音'>&#xe64a;</i>");
    	                    }
    	                    if(mt.online==1){
    	                        $('.circleIcon_'+v.mtId).attr("disabled",false).addClass("iconGreen");
    	                    }else{
    	                        $('.circleIcon_'+v.mtId).attr("disabled",true).removeClass("iconGreen");
    	                    }

    	                    if(loginUserId==v.loginId||adminName=="kscc管理员"){
    	                        if(v.ishost=="1"||adminName=="kscc管理员"){
    	                            $.each(participants,function(x,y){
    	                                var pt=status[y.mtId];
    	                                if(pt.online==1){
    	                                    $('.hostIcon_'+y.mtId+',.shutdIcon_'+y.mtId+',.silenIcon_'+y.mtId+',.speakIcon_'+y.mtId+',.circleIcon_'+y.mtId+',.deleIcon_'+y.mtId+'').attr("disabled",false).addClass("iconGreen");
    	                                    $('.lineOne,.lineTwo').attr("disabled",false);
    	                                    $('.lineOne').addClass("iconGreen");
    	                                    $('.talkIcon_'+y.mtId).attr("disabled","disabled").removeClass("iconGreen");
    	                                }
    	                                else{
    	                                    $('.hostIcon_'+y.mtId+',.shutdIcon_'+y.mtId+',.silenIcon_'+y.mtId+',.speakIcon_'+y.mtId+',.circleIcon_'+y.mtId+',.deleIcon_'+y.mtId+'').attr("disabled",true).removeClass("iconGreen");
    	                                    $('.lineOne,.lineTwo').attr("disabled",true);
    	                                    $('.lineOne').removeClass("iconGreen");
    	                                    $('.talkIcon_'+y.mtId).attr("disabled",false).addClass("iconGreen");
    	                                }
    	                            });
    	                            if(v.ishost=="1"){
    	                                $('.hostIcon_'+v.mtId).attr("disabled",true).removeClass("iconGreen");
    	                                $(".hostFlag").html("");
    	                                $('.hostIcon_'+v.mtId).parent().parent().find(".hostFlag").append("<img src= '"+$.base+"/images/pages/host.png' title='主持人'>");
    	                            }
    	                        }else{
    	                            $('.shutdIcon_'+v.mtId+',.silenIcon_'+v.mtId+',.deleIcon_'+v.mtId+',.circleIcon_'+v.mtId+'').attr("disabled",false).addClass("iconGreen");
    	                        }
    	                    }
    	                });
            },
            participant:function (obj,confId) {
                var role_id=obj['roleMessage'+confId];
                var ishostNow=role_id[loginUserId];
                $.ajax({
    	            type:"post",
    	            url:$.base+"/liveBroadCastController/getCurrentParticipant",
    	            contentType:"application/json",
    	            data:JSON.stringify({
                        "confId":$("#confId").val(),
                        "liveId":$("#liveIdControlDetail").val()
                    }),
    	            success:function (data) {
    	            	participants=data.data;
    	            }
                });
                if((ishost==2)&&(ishostNow!=ishost)){
                    //由非主持人变为主持人
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
                            if(data.status==='1'){
                                $(".menuAdmin").html("");
                                var hostStr="<button class='btn screenIcon' title='画面选看'><i class='iconfont'>&#xe626;</i></button>"+
                                    "<button class='btn synthesisIcon' title='画面合成'><i class='iconfont'>&#xe644;</i></button>"+
                                    "<button class='btn allShutIcon'></button><button class='btn allSilenIcon'></button>"+
                                    "<button class='btn subtitleIcon' title='添加字幕'><i class='iconfont'>&#xe60e;</i></button>"+
                                    "<button class='btn recordIcon' title='会场记录'><i class='iconfont'>&#xe619;</i></button>"+
                                    "<button class='btn applyExtendTime' title='申请延长直播'><i class='iconfont'>&#xe611;</i></button>"+
                                    "<button class='btn outLive' title='退出直播'><i class='iconfont' style='color:red;'>&#xe605;</i></button>"+
                                    "<button class='btn endLive' title='结束直播'><i class='iconfont' style='color:red;'>&#xe61b;</i></button>";
                                $(".menuAdmin").append(hostStr);
                                var mute=data.data.mute;//静麦开麦
                                var silence=data.data.silence;//静音停止静音
                                $(".allShutIcon").attr("att",mute);
                                $(".allSilenIcon").attr("att",silence);
                                if(mute==0){//0给他静麦  1给他开麦
                                    $(".allShutIcon").html("<i class='iconfont'>&#xe601;</i>");
                                    $(".allShutIcon").attr("title","全场静麦");
                                }else{
                                    $(".allShutIcon").html("<i class='iconfont'>&#xe7f0;</i>");
                                    $(".allShutIcon").attr("title","全场开麦");
                                }
                                if(silence==0){
                                    $(".allSilenIcon").html("<i class='iconfont'>&#xe62d;</i>");
                                    $(".allSilenIcon").attr("title","全场静音");
                                }else{
                                    $(".allSilenIcon").html("<i class='iconfont'>&#xe64a;</i>");
                                    $(".allSilenIcon").attr("title","全场停止静音");
                                }
                                setChange();
                            }
                        }
                    });
                    ishost='1';
                }
                else if((ishost==1)&&(ishostNow!=ishost)){
                    //由主持人变为非主持人
                    // ws.close();
                    $(".menuAdmin").html("");
                    var nohostStr="<button class='btn screenIcon' title='画面选看'><i class='iconfont'>&#xe626;</i></button>"+
                        "<button class='btn subtitleIcon' title='添加字幕'><i class='iconfont'>&#xe60e;</i></button>"+
                        "<button class='btn recordIcon' title='会场记录'><i class='iconfont'>&#xe619;</i></button>"+
                        "<button class='btn applySpeak' title='申请发言'><i class='iconfont'>&#xe612;</i></button>"+
                        "<button class='btn outLive' title='退出直播'><i class='iconfont' style='color:red;'>&#xe605;</i></button>";
                    $(".menuAdmin").append(nohostStr);
                    ishost='2';
                    setChange();
                }
            },
            apply:function (obj,confId) {
                var message=obj.message
                if((message).indexOf(confId)!==-1){
                    if(sysRole=='kscc管理员'){
                        base.confirm({
                            label:"提示",
                            text:"<div style='text-align:center;font-size:13px;'>"+message.replace(confId,'')+"</div>"
                        });
                    }
                    else{
                        if(ishost=='1'){
                            if(message.indexOf('发言')!==-1){
                                base.confirm({
                                    label:"提示",
									textAlign:'text-align:center',
                                    text:"<div style='text-align:center;font-size:13px;'>"+message.replace(confId,'')+"</div>"
                                });
                            }
                        }
                    }
                }
            },
            silence:function (obj,confId) {
                var silence=obj.silence;
                if((silence).indexOf(confId)!==-1){
                    var value = silence.replace(confId, '');
                    if(value=='0'){
                        var allSilenStr="<i class='iconfont'>&#xe64a;</i>";
                        $(".allSilenIcon").attr("att",'1');
                        $(".allSilenIcon").html(allSilenStr);
                        $(".allSilenIcon").attr("title","全场停止静音");
                    }
                    else{
                        var allSilenStr="<i class='iconfont'>&#xe62d;</i>";
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
                        var allShutStr="<i class='iconfont'>&#xe7f0;</i>";
                        $(".allShutIcon").attr("att",'1');
                        $(".allShutIcon").html(allShutStr);
                        $(".allShutIcon").attr("title","全场开麦");
                    }
                    else{
                        var allShutStr="<i class='iconfont'>&#xe601;</i>";
                        $(".allShutIcon").attr("att",'0');
                        $(".allShutIcon").html(allShutStr);
                        $(".allShutIcon").attr("title","全场静麦");
                    }
                }
            },
            deleteParticipant:function (obj,confId) {
                var param = obj.deleteParticiant;
                var thisConfId=param.confId
                var mtId = param.mtid; 
                if(thisConfId===confId){
                    //根据mtid,全用dom对参与方进行删除操作
                }
            },
            addParticipant:function (obj,confId) {
                //对参与方进行新增
                var param = obj.addParticipant;
                var thisConfId=param.confId
                var paticipant = param.participant;
                if(thisConfId===confId){
                    //paticipant,全用dom对参与方进行新增操作
                    participants.concat(paticipant)
                }
            },
            endLive:function(obj,confId){
 	    	    var thisConfId=obj.endLive
 	    	    if(thisConfId==confId){
                    var url=$.base+"/loginController/toLiveControlList";
                    $.ajax({
                        type:"GET",
                        url:url,
                        error:function(){
                            alert("加载错误！");
                        },
                        success:function(data){
                            if(data.indexOf('06a5bb21-b8f0-4dfd-8004-4b4e17d4f81c')!==-1){
                                window.location.href=$.base+'/loginController/toLogin'
                                return
                            }
                            $(".middle").html(data);
                        }
                    });
                }
            }
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
	                if(data.roleName==="kscc管理员"){
	                	sysRole=data.roleName;
	                	adminName=data.roleName;
	                	isAdmin=true;
	                    $(".menuAdmin").html("");
                        var adminStr="<button class='btn screenIcon' title='画面选看'><i class='iconfont'>&#xe626;</i></button>"+
			                         "<button class='btn synthesisIcon' title='画面合成'><i class='iconfont'>&#xe644;</i></button>"+
			                         "<button class='btn allShutIcon'></button>"+
			                         "<button class='btn allSilenIcon'></button>"+
			                         "<button class='btn subtitleIcon' title='添加字幕'><i class='iconfont'>&#xe60e;</i></button>"+
			                         "<button class='btn delayIcon' title='延长直播'><i class='iconfont'>&#xe60d;</i></button>"+
		                             "<button class='btn closeVideo'  title='关闭录像'><i class='iconfont'>&#xe602;</i></button>"+
		                             "<button class='btn recordIcon' title='会场记录'><i class='iconfont'>&#xe619;</i></button>"+
			                         "<button class='btn outLive' title='退出直播'><i class='iconfont' style='color:red;'>&#xe605;</i></button>"+ 
			                         "<button class='btn endLive' title='结束直播'><i class='iconfont' style='color:red;'>&#xe61b;</i></button>";
                        $(".menuAdmin").append(adminStr);
					    $(".addSelectPar").before("<div class='parListSele'>为     <select class='form-control partiList'></select>  选看画面</div>");
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
                                    var hostStr="<button class='btn screenIcon' title='画面选看'><i class='iconfont'>&#xe626;</i></button>"+
                                                "<button class='btn synthesisIcon' title='画面合成'><i class='iconfont'>&#xe644;</i></button>"+
                                                "<button class='btn allShutIcon'></button><button class='btn allSilenIcon'></button>"+
                                                "<button class='btn subtitleIcon' title='添加字幕'><i class='iconfont'>&#xe60e;</i></button>"+
                                                "<button class='btn recordIcon' title='会场记录'><i class='iconfont'>&#xe619;</i></button>"+
                                                "<button class='btn applyExtendTime' title='申请延长直播'><i class='iconfont'>&#xe611;</i></button>"+
                                                "<button class='btn outLive' title='退出直播'><i class='iconfont' style='color:red;'>&#xe605;</i></button>"+
                                                "<button class='btn endLive' title='结束直播'><i class='iconfont' style='color:red;'>&#xe61b;</i></button>";
                                    $(".menuAdmin").append(hostStr);
	                            }else{
                                    $(".menuAdmin").html("");
                                    var nohostStr="<button class='btn screenIcon' title='画面选看'><i class='iconfont'>&#xe626;</i></button>"+
                                                  "<button class='btn subtitleIcon' title='添加字幕'><i class='iconfont'>&#xe60e;</i></button>"+
                                                  "<button class='btn recordIcon' title='会场记录'><i class='iconfont'>&#xe619;</i></button>"+
                                                  "<button class='btn applySpeak' title='申请发言'><i class='iconfont'>&#xe612;</i></button>"+
                                                  "<button class='btn outLive' title='退出直播'><i class='iconfont' style='color:red;'>&#xe605;</i></button>";
	                            	$(".menuAdmin").append(nohostStr);
	                            }
							}
						})
					}
					setCarousel(hospitalId);//设置轮播
	            }
	        });
	    };
	    function wsFunction(ws){
            var confId=$("#confId").val();
            ws.onopen = function () {
                console.log("webSocket服务已开启");
            }
            ws.onmessage = function (event) {
                var message = event.data;
                var obj=eval("("+message+")");
                var uniqueKey;
                for (var key in obj)
                {
                    uniqueKey=key;
                }
                if(uniqueKey.indexOf(confId)!==-1&&obj['mtsStatus'+confId]){
                   messageFunction.online(obj,confId)
                }
                else if(uniqueKey.indexOf(confId)!==-1&&obj['roleMessage'+confId]){
                    messageFunction.participant(obj, confId);
				}
                else{
                	//有人申请发言或者申请延时
					if(obj.message){
                        messageFunction.apply(obj,confId)
					}
						//全场静音被点击
					else if(obj.silence){
                        messageFunction.silence(obj,confId)
					}
					//删除参与方被点击
					else if (obj.deleteParticiant){
						messageFunction.deleteParticipant(obj,confId)
					}
                    //新增参与方被点击
					else if(obj.addParticipant){
						messageFunction.addParticipant(obj,confId)
					}
					else if(obj.endLive){
					    messageFunction.endLive(obj,confId)
                    }
					//全场哑音被点击
					else{
                     messageFunction.mute(obj,confId)
					}
                }
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
		//加载左边参与方
		function setCarousel(hospitalId){
			$("#carouselCircle").empty();
			$(".carousel-inner").empty();
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
                    	 $(".allShutIcon").html("<i class='iconfont'>&#xe7f0;</i>");
                    	 $(".allShutIcon").attr("title","全场开麦");
                     }else{
                    	 $(".allShutIcon").html("<i class='iconfont'>&#xe601;</i>");
                    	 $(".allShutIcon").attr("title","全场静麦");
                     }
                     if(silence==1){
                    	 $(".allSilenIcon").html("<i class='iconfont'>&#xe64a;</i>");
                         $(".allSilenIcon").attr("title","全场停止静音");
                     }else{
                    	 $(".allSilenIcon").html("<i class='iconfont'>&#xe62d;</i>");
                         $(".allSilenIcon").attr("title","全场静音");
                     }
	            	   var lis="";
	                   participants=data.participants;
                       $("#confId").val(data.confId);
                       var url="ws://"+$.base.substr(7)+"/websocket/"+data.confId;
					 //校验web socket是否在正常状态
					 if (!ws) {
						 ws = new WebSocket(url);
						 setInterval(function(){
							 if (ws.readyState !== 1) {
							 ws = new WebSocket(url)
							 count = 0
							 this.wsFunctions(ws, _this, count, elements, elementContainer)
						 	}
					 	 }, 6000)
					 }
					   wsFunction(ws);
	            	   $.each(data.participants,function(i,v){
	            		        var ifont=""; //按钮图标集
	            		        var ifontCircle="";//是否在线原点
	            		        var conversionCircuit="";//线路一、二图标
	            		        var hostIcon="";//主持人图标
	            		        
	            		   	    //会场第一主持人就是默认进入直播间的主讲人
	            		   	    if(v.ishost == 1){
	            		   		  $("#speakerMain").val(v.hospitalName);//改变前的医院名称
	            		   		  mtId_old = v.mtId;//改变前的mtid
	            		   		  hostIcon="<img src= '"+$.base+"/images/pages/host.png' title='主持人'>";
	            		   	    }

	            			     var muteP=v.mute;//静麦开麦
		      	            	 var silenceP=v.silence;//静音停止静音
		      	            	 var mutePStr="";
		      	            	 var silencePStr="";
		      	            	 if(muteP==0){
		      	            		 mutePStr="<i class='iconfont' title='静麦'>&#xe601;</i>";
		      	            	 }else{
		      	            		 mutePStr="<i class='iconfont' title='开麦'>&#xe7f0;</i>";
		      	            	 }
		      	            	 if(silenceP==0){
		      	            		 silencePStr="<i class='iconfont' title='静音'>&#xe62d;</i>";
		      	            	 }else{
		      	            		 silencePStr="<i class='iconfont' title='停止静音'>&#xe64a;</i>";
		      	            	 }
	            			   
		            		   //判断是否在线
	            			   ifont="<button disabled class='btn hostIcon hostIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' att2='"+v.hospitalName+"' title='主持人'><i class='iconfont'>&#xe61f;</i></button>"+
		        			         "<button disabled class='btn shutdIcon shutdIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' mutePStatus='"+v.mute+"'>"+mutePStr+"</button>"+
			            			 "<button disabled class='btn silenIcon silenIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' silencePStatus='"+v.silence+"'>"+silencePStr+"</button>"+
			            			 "<button disabled class='btn speakIcon speakIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' title='发言'><i class='iconfont'>&#xe60c;</i></button>"+
			            			 "<button disabled class='btn talkIcon talkIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' att2='"+v.hospitalName+"' title='呼叫'><i class='iconfont'>&#xe606;</i></button>"+
			            			 "<button disabled class='btn deleIcon deleIcon_"+v.mtId+"' att='"+v.confId+"' att1='"+v.mtId+"' att2='"+v.id+"' att3='"+v.hospitalName+"' title='删除终端'><i class='iconfont' style='color:red;'>&#xe666;</i></button>";
	            			   ifontCircle="<button disabled class='btn circleIcon circleIcon_"+v.mtId+"'><i class='iconfont' title=''>&#xe645;</i></button>";
		            		   
		            		   //判断是否是自家医院
		            		   if(v.hospitalId==hospitalId){
		            			   conversionCircuit="<button class='btn lineOne_"+v.mtId+" lineOne' title='线路一'><i class='iconfont'>&#xe61a;</i>"+
	           		                                 "<button class='btn lineTwo_"+v.mtId+" lineTwo' title='线路二'><i class='iconfont'>&#xe61a;</i>";
		            		   }
		            		   
		            		   var index=Math.ceil((i+1)/3);
		            		   lis+="<li class='carousel_"+index+" detailLi'>"+
			            		         "<div class='heightFull'>"+
			            		           "<div class='heightFull widthFull'>"+
				            		            "<div class='detailBannerLi' >"+
					            		            "<div class='detailBannerDiv'>"+
					            		               "<div class='detailBgDiv'>"+
					            		                 "<div class='dragDetail' uid='"+v.mtId+"' uv='"+v.hospitalName+"'>"+
					            		                    "<span style='float:left;padding: 4px;' class='hostFlag'>"+hostIcon+"</span>"+
					            		                    "<span style='float:right;'>"+ifontCircle+"</span>"+
					            		                    "<div class='detailParti' title='"+v.hospitalName+"'>"+v.hospitalName+"</div>"+
					            		                 "</div>"+
					            		                 "<div class='buttonIfont'>"+ifont+"</div>"+
					            		               "</div>"+
					            		           "</div>"+
				            		            "</div>"+
				            		            "<div class='conversionCircuit'>"+conversionCircuit+"</div>"+
			            		            "</div>"+
			            		          "</div>"+
	            		          "</li>";
	            	   });
	            	   $(".carousel-inner").append(lis);
	            	   for (var i=0;i<Math.ceil(data.participants.length/3);i++){
	            		   $(".carousel_"+(i+1)+"").wrapAll("<ul class='carouselUl_"+(i+1)+" carouselUl'></ul>");
	            		   $(".carouselUl_"+(i+1)+"").wrap("<div class='item' style='height:100%;'></div>");
	            		   $("#carouselCircle").append("<li data-target='#myCarousel' data-slide-to='"+i+"'></li>");
	            	   }
	            	   $(".item:first").addClass("active");
	            	   $("#carouselCircle").children(":first").addClass("active");
	            	   
	            	   if(sysRole=="kscc管理员"||sysRole==1){ 
	            	   var iconBtn="<button class='btn' title='主持人' disabled><i class='iconfont' disabled>&#xe61f;</i></button>"+
  			                       "<button class='btn' title='静麦' disabled><i class='iconfont' disabled>&#xe601;</i></button>"+
        			               "<button class='btn' attr='' title='静音' disabled><i class='iconfont' disabled>&#xe62d;</i></button>"+
        			               "<button class='btn' title='发言' disabled><i class='iconfont' disabled>&#xe60c;</i></button>"+
        			               "<button class='btn' title='呼叫' disabled><i class='iconfont' disabled>&#xe606;</i></button>"+
        			               "<button class='btn' title='删除终端' disabled><i class='iconfont' style='color:red;'>&#xe666;</i></button>";
	            	   
	            	   var number=(data.participants.length)/3;
	            	   var pageNumber=$(".carousel-inner").find(".item").length;
	            	   if(Math.floor(number) === number){
	            	   var addItemStrs="<div class='item' style='height:100%;'>" +
	            		   		   "<ul class='carouselUl_"+(pageNumber+1)+" carouselUl' style='height:100%;margin:0 auto;'>" +
		            		   		"<li class='carousel_"+(pageNumber+1)+" detailLi'>"+
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
		            		          "</li>" +
	            		   		"</ul>" +
	            		   		"</div>";
	            		   $(".carousel-inner").append(addItemStrs);
	            		   $("#carouselCircle").append("<li data-target='#myCarousel' data-slide-to='"+pageNumber+"'></li>");
	            	   }else{
	            		 var  addLiStrs="<li class='carousel_add detailLi'>"+
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
	            	      $(".carousel-inner .item:last ul").append(addLiStrs);
	            	   }
	             }  
	            	   $('#myCarousel').carousel({
	                       pause: true,
	                       interval: false
	                   });
	            	   setDrag();//拖拽
	            	   setPartiClick();//参与方点击事件
	            	   setAddParti();
	               },
	               error:function(e){}
			 });
		 };
		 
		 function setAddParti(){
			 $(".addPartiDiv").off().on("click",function(){
				 $("#selectModal").modal('show');
				 $("#selectNum").text('0');
				 var startTime=$("#liveStartTime").text();
				 var endTime=$("#liveEndTime").text();
				 setZTreeModel(startTime,endTime);
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
			function setZtree(zNodes,startTime,endTime){
				require(["bootstrap","ztreeCore","ztreeExcheck","ztreeExedit"],function(){
					$.fn.zTree.init($("#treeDemo1"), setting, zNodes);
					treeObj = $.fn.zTree.getZTreeObj("treeDemo1");
					//treeObj.expandAll(true);
					setLi();
					setSelect();
					searchTree(startTime,endTime);//模态框医院列表数据搜索
				});
			}
		 //模态框里的树渲染
		 function setZTreeModel(startTime,endTime){
			//获得医院列表数据
				$.ajax({
					   type: "post", 
		               async: true, 
		               url:  $.base + "/hospital/screenHospital", 
		               contentType:"application/json",
		               data:JSON.stringify({
		                     "startTime":startTime,
		                     "endTime":endTime,
						   	 "name":$("#searchParticipantModal").val(),
                             //"confId":$("#confId").val(),
		                     }),
		               dataType: "json",
		               success: function(data){
		            	 var zNodes =data; 
		            	 setZtree(zNodes,startTime,endTime);//渲染医院列表
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

		//添加前已存在的参与方赋值给exObj
		function reExQueryMtid() {
			//再次查看添加后的参与方（新增的参与方）
			var params={
				"liveId":$("#liveIdControlDetail").val(),
				"confId":$("#confId").val(),
			}
			$.ajax({
				url:$.base+"/kscc/liveParticiPant/exParcitipant",
				type:"POST",
				contentType:"application/json",
				data:JSON.stringify(params),
				success:function(data){
					//解析listMap赋值给exObj
                    exObj =  data;
				},
				error:function(data){}
			});
		}

		//左右选择框
		function setSelect(){
			//从左往右单选
			$("#LTRSingle").unbind().on("click",function(){
				var treeObj = $.fn.zTree.getZTreeObj("treeDemo1");
				var sNodes = treeObj.getSelectedNodes();
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
	                			"newVoidNum":newvoid,
                                "account":newvoid,
                                "account_type": 5,
                                "bitrate": 2048,
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
                                        "newVoidNum":newvoid,
										"account":newvoid,
                                        "account_type": 5,
										"bitrate": 2048,
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
			
			//模态框确定按钮
            var mts=[];
			$(".selectBtn").unbind().on("click",function(){
                //调用添加前的参与方获取方法保证exobj有值
                reExQueryMtid();

                $.each(nodesObj,function(i,v){
                    var obj={};
                    for(key in v){
                        if(key!=='hospitalName'&& key !=='newVoidNum' && key !=='hospitalId'){
                            obj[key]=v[key]
                        }
                    }
                    mts.push(obj)
                })
                var params={
                    "liveId":$("#liveIdControlDetail").val(),
                    "creatorId":loginUserId,
                    "searchParticipant":nodesObj,
                    "confId":$("#confId").val(),
                    "params":{
                        "mts":mts
                    }
                }

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
                                   reQuestMtid();
                                   setCarousel();
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

		//添加参与方提交
		function reQuestMtid() {
            //再次查看添加后的参与方（新增的参与方）
            var params={
                "liveId":$("#liveIdControlDetail").val(),
                "confId":$("#confId").val(),
                "exParticipant":exObj,
            }
            $.ajax({
                url:$.base+"/kscc/liveParticiPant/addParcitipant",
                type:"POST",
                contentType:"application/json",
                data:JSON.stringify(params),
                success:function(data){
                    participantObj = data.data;
                    //确认按钮添加完参与方再发送消息
                    ws.send(JSON.stringify({addParticipant:{confId: $("#confId").val(),participant:participantObj}}))
                },
                error:function(data){}
            });
        }

		 //参与方列表操作按钮控制
		function setPartiClick(){
			//主持人
			$(".hostIcon").on("click",function(){
				var hospitalNameNow=$(this).attr("att2");//现在的医院名称
				var confId=$(this).attr("att");
				var mt_id=$(this).attr("att1");
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
			            		 requestTip.success("切换主持人成功！");
			            		 $(this).attr("disabled");
			            		 setCarousel();
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
			});
			//静麦
			$(".shutdIcon").unbind().on("click",function(){
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
			            			 $(_thisShut).parent().addClass("iconGreen");
			            			 shutdStr="<i class='iconfont' title='开麦'>&#xe7f0;</i>";
			            			 $(_thisShut).html(shutdStr);
			            			 $(_thisShut).attr("mutePStatus","1");
			            		 }
			            		 else{
			            			 requestTip.success("开麦成功！");
			            			 $(_thisShut).parent().addClass("iconGreen");
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
			$(".silenIcon").unbind().on("click",function(){
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
		            			 $(_thisSilen).parent().addClass("iconGreen");
		            			 silenStr="<i class='iconfont' title='停止静音'>&#xe64a;</i>";
		            			 $(_thisSilen).html(silenStr);
                                 $(_thisSilen).attr("silencePStatus","1");
		            		 }
		            		 else{
		            			 requestTip.success("停止静音成功！");
		            			 $(_thisSilen).parent().addClass("iconGreen");
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
			//发言
			$(".speakIcon").on("click",function(){
				var confId=$(this).attr("att");
				var mt_id=$(this).attr("att1");
				var params={
							"confId":confId,	 
							"params":{
								"mt_id":mt_id	
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
			            		 requestTip.success("发言成功！");
			            		 break;
		            		 default:
		            			 requestTip.error("发言失败！");
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
			//呼叫
			$(".talkIcon").on("click",function(){
				var confId=$(this).attr("att");
				var mt_id=$(this).attr("att1");
				var hospitalName=$(this).attr("att2");
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
			$(".deleIcon").on("click",function(){
                var confId = $("#confId").val();
				var mt_id=$(this).attr("att1");
				var delayId=$(this).attr("att2");
				var hospitalName=$(this).attr("att3");
				var params={
							"hospitalName":hospitalName,
							"id":delayId,
							"confId":confId,	 
							"params":{
								"mts":[{
									"mt_id":mt_id	
								}]
								}
						 }
				var requestTip=base.requestTip({position:"center"});
				$.ajax({
					type: "POST",
	                url:$.base + "/liveController/deleteParticipant",
	                data:JSON.stringify(params),
	                contentType:"application/json",
	                success: function(data){
	                	 
		            	 switch(data.status){
			            	 case '1':
			            		 requestTip.success("删除成功！");
			            		 //发送删除参与方消息
                                 ws.send(JSON.stringify({deleteParticiant:{confId:confId,mtid:mt_id}}))
                                 //此处不需要刷新，应该用dom操作根mtid删除一个参与方元素
                                 // setCarousel();
								 operateLI();
                                 break;
		            		 default:
		            			 requestTip.error("删除失败！");
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
		}
		 //将li提到前一个页面
			function operateLI() {
				//删除一个参与方之后，分为两种情况，第一种看li是odd 还是even
				//1.如果是even的时候，去掉一个ul，否则ul不变
				// if($(".detailLi").length%3==0){
				// 	$(".carouselUl").last().remove();
				// }
				$(".carouselUl:gt(1)").each(function (index,item) {
					var liHtml=$(item).find(".detailLi:eq(0)");
					$(".carouselUl").eq(index-1).append(liHtml);
					$(item).find(".detailLi:eq(0)").remove();
				})
				if(!$(".carouselUl").last().has("li")){
					$(".carouselUl").last().remove();
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
                               {"title":"时间", "data":"operationTime","sWidth":"30%"},
					           {"title":"日志", "data":"operationContent","sWidth":"70%"}
					           ],
                   "columnDefs":[
                       {
                           "render":function(data,type,row,meta){
                               if(data != null && data != ''){
                                   return data.substr(0,16);
                               }
                           },
                           "targets":0
                       }
				   ]
				});
		    };
		    
		//设置点击切换 
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
				            			 allShutStr="<i class='iconfont'>&#xe7f0;</i>";
                                         $(".allShutIcon").attr("att",'1');
				            			 $(".allShutIcon").html(allShutStr);
				            			 $(".allShutIcon").attr("title","全场开麦");
				            			 $(".shutdIcon").attr("mutePStatus","0");
				            			 $(".shutdIcon").html("<i class='iconfont' title='开麦'>&#xe7f0;</i>");
                                         ws.send(JSON.stringify({mute:confId+'0'}))
				            		 }
				            		 else{
				            			 requestTip.success("全场开麦成功！");
				            			 allShutStr="<i class='iconfont'>&#xe601;</i>";
                                         $(".allShutIcon").attr("att",'0');
				            			 $(".allShutIcon").html(allShutStr);
				            			 $(".allShutIcon").attr("title","全场静麦");
				            			 $(".shutdIcon").attr("mutePStatus","1");
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
				            			 allSilenStr="<i class='iconfont'>&#xe64a;</i>";
                                         $(".allSilenIcon").attr("att",'1');
				            			 $(".allSilenIcon").html(allSilenStr);
				            			 $(".allSilenIcon").attr("title","全场停止静音");
				            			 $(".silenIcon").attr("silencePStatus","0");
				            			 $('.silenIcon').html("<i class='iconfont' title='停止静音'>&#xe64a;</i>");
				            			 ws.send(JSON.stringify({silence:confId+'0'}))
				            		 }
				            		 else{
				            			 requestTip.success("全场停止静音成功！");
				            			 allSilenStr="<i class='iconfont'>&#xe62d;</i>";
                                         $(".allSilenIcon").attr("att",'0');
				            			 $(".allSilenIcon").html(allSilenStr);
				            			 $(".allSilenIcon").attr("title","全场静音");
				            			 $(".silenIcon").attr("silencePStatus","1");
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
				 //提交
				 $(".subtitleSubmit").unbind().on("click",function(){
				 	if($("#subtitleContent").val().trim()==""){
				 		base.confirm({
	                        label:"提示",
							textAlign:'text-align:center',
	                        text:"<div style='text-align:center;font-size:13px;'>请输入字幕内容！</div>"
	                    });
					}else{
						var array=[];
					 	 if(isAdmin||participant.isHost==='1'){
					 	 	$.each(participants,function (i,v) {
								array.push({mt_id:v.mtId})
	                        })
						 }
						 else{
					 	 	array.push({mt_id:participant.mtId})
						 }
					 	var params = {
		                         confId: $('#confId').val(),
		                         params:{
		                             "message": $("#subtitleContent").val(),
		                             "type": $("#scrollType").find("option:selected").val()-0,
		                             "roll_num": 1,
		                             "roll_speed": 1,
		                             "mts": array
		                         }
		                     };
					 	var requestTip=base.requestTip({position:"center"});
						 $.ajax({ 
				               type: "post",
				               url:  $.base + "/liveController/sendScreenWord",
							   data:JSON.stringify(params),
							   dataType:'json',
		                       contentType:"application/json",
				               success: function(data){
					               switch(data.status){
						            	 case '1':
						            		 requestTip.success("添加字幕成功！");
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
				//取消
				 $(".subtitleCancel").off().on("click",function(){
					 $("#scrollType").val("");
		             $("#subtitleContent").val("");
				 });
			 });
			//点击画面合成
			 $(".synthesisIcon").unbind().on("click",function(){
				 $(".synthesis").removeClass("disNone");
				 $(".synthesis").siblings().addClass("disNone");
				 dragObj.init($(".dragBox"));
                 var confId = $("#confId").val();
				 $(".detailBannerLi").removeClass("backColor");
                 var requestTip=base.requestTip({position:"center"});
                 //获得先前合成的画面
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
                                     var selectedPar="";
	                                 $.each(synthPar,function(i,v){
	                                	 $.each(screenObj,function(x,y){
		                                   	 if(v.mtId==y.mtId){
		                                   		selectedPar+="<div class='dragBox'><i class='fa fa-trash-o removedragPickTools' style='font-size:14px;cursor:pointer;float:right;margin:2px;' title='移除'></i>"+
												"<div uid='"+y.mtId+"' style='float:left;width:100%;text-align:center;font-size:14px;padding-top:22px'>"+y.hospitalName+"</div></div>";
		                                   	 }
	                                	 });
									});
	                                $(".synthesis .dragBoxDiv").html("");
                                    $(".synthesis .dragBoxDiv").append(selectedPar);
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
				 $(".synthesisSubmit").off().on("click",function(){
                     var mtIds=[];
                     var selectLength=$(".synthesis .dragBox i").length;
                     var requestTip=base.requestTip({position:"center"});
                     for(var i=0;i<selectLength;i++){
                         mtIds.push(
                             {
                                 "mt_id":$(".synthesis .dragBox:nth-child("+(i+1)+")  div").attr("uid"),
                                 "chn_idx": i,
                                 "member_type": 1
                             });
					 }
					 if(mtIds.length===0){
                         requestTip.error("请选择需要和成的画面");
					 }else{
                         var layout = selectLength === 1 ? 1 : selectLength === 2 ? 2 : selectLength === 3 ? 4 : void(0);
						 var params={
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
                        var confId = $("#confId").val();
                        var params={
                            confId:confId
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
                                        $(".dragBoxDiv").html("<div class='dragBox'></div><div class='dragBox'></div><div class='dragBox'></div>");
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
			 $(".screenIcon").unbind().on("click",function(){
				 $(".screen").removeClass("disNone");
				 $(".screen").siblings().addClass("disNone");
				 $(".detailBannerLi").removeClass("backColor");
				 var requestTip=base.requestTip({position:"center"});
				 
				 var confId = $("#confId").val();
				 
				 if($(".parListSele")){
					 getScreenData(confId);
				 }else{
					 getPartiList(confId);//select下拉框获得数据
	                 
	                 $(".partiList").change( function() {
	                	 getScreenData(confId);
	                 });
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
						 
						 var params={
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
                	 if(adminName=="kscc管理员"){
                		 currentMtId=$(".partiList").val();
                	 }else{
                		 currentMtId=thisMtId;
                	 }
                     var params={
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
			 
             //更新直播间页面结束时间
             function extendTime(){
                 var delay_time=$("input[type='radio']:checked").val();
                 if(delay_time==0){
                     delay_time=$("#customMin").val();
                 }
                 param={
                     liveId:$("#liveIdControlDetail").val(),
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
			 
             //点击申请延长直播
			 $(".applyEx").unbind().on("click",function () {
                 hospitalsName = $("#userName").text() //获取当前医院
			 	 var message=hospitalsName+"申请延长直播！";
				 message=JSON.stringify({'message':message});
				 ws.send(message);
             });
             
			//管理员点击直播延时
			 $(".delayIcon").unbind().on("click",function(){
				 var confId = $("#confId").val();
				 $(".delay").removeClass("disNone");
				 $(".delay").siblings().addClass("disNone");
				 $(".detailBannerLi").removeClass("backColor");
				 //获取当前直播剩余时间
				 var remindTime = end; //当前直播间的结束时间 
				 var  str=remindTime.toString();
                 str =  str.replace(/-/g,"/");
			        var endTime = new Date(str);
			         
				function counter(endTime) { 
				   var date = new Date();
	
				   /*转换成秒*/ 
				   var time = (endTime - date) / 1000; 
	
				   var day = Math.floor(time / (24 * 60 * 60));

				   var hour = Math.floor(time % (24 * 60 * 60) / (60 * 60));
				   
				   var minute = Math.floor(time % (24 * 60 * 60) % (60 * 60) / 60); 
	
				   // var second = Math.floor(time % (24 * 60 * 60) % (60 * 60) % 60);

				   var str = day + "天" + hour + "时" + minute + "分";
				   $("#remainingTime").text(str);
				} 

			   setInterval(function(){counter(endTime);}, 1000); 
				 
				//提交
				 $(".delaySubmit").unbind().on("click",function(){
					 var delay_time=$("input[type='radio']:checked").val();

					 if(delay_time){
						 if(delay_time==0){
							 delay_time=$("#customMin").val();
                             var r = /^\+?[1-9][0-9]*$/;
                             var flag=r.test(delay_time);
                             if(flag){
							 }else{
								 base.confirm({ 
							    	  label:"提示",
									 textAlign:'text-align:center',
							    	  text:"<div style='text-align:center;font-size:13px;'>请输入正确的分钟数！</div>",
						              confirmCallback:function(){}
								 });
								 return;
                             }
                         }
						 var parmas={
						    "confId":confId,
							"delay_time":delay_time	 
						 }
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
						            		 break;
					            		 default:
					            			 requestTip.error("延时失败！");
					            		     break;
					            	 }
                                   extendTime();
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
				 
				//取消
				 $(".delayCancel").unbind().on("click",function(){
					 $("input[type='radio']").attr("checked",false);
		             $("#customMin").val("");
				 });
				 
			 });
			 
			//关闭录像
			 $(".closeVideo").unbind().on("click",function(){
			   var requestTip=base.requestTip({position:"center"});
			   $.ajax({ 
	               type: "post",
	              // url:  $.base + "/liveController/extendTime",
				   data:JSON.stringify(parmas),
                   contentType:"application/json",
	               success: function(data){
		               switch(data.status){
			            	 case '1':
			            		 requestTip.success("关闭录像成功！");
			            		 break;
		            		 default:
		            			 requestTip.error("关闭录像失败！");
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
			 
			//退出直播
			 $(".outLive").unbind().on("click",function(){
				 base.confirm({ 
			    	  label:"提示",
					 textAlign:'text-align:center',
			    	  text:"<div style='text-align:center;font-size:13px;'>确定退出直播吗?</div>",
		              confirmCallback:function(){
			    	  	if(thisMtId){
                            var data={confId:$('#confId').val(),params:{mts:[{mt_id:thisMtId}]}}
                            var requestTip=base.requestTip({position:"center"});
                            $.ajax({
                                type: "post",
                                url:  $.base + "/liveController/getOutMeeting",
                                data:JSON.stringify(data),
                                dataType:'json',
                                contentType:"application/json",
                                success: function(e1){
                                    if(e1.status==='1'){
                                        var url=$.base+"/loginController/toLiveControlList";
                                        $.ajax({
                                            type:"GET",
                                            url:url,
                                            error:function(){
                                                alert("加载错误！");
                                            },
                                            success:function(e2){
                                                if(e2.indexOf('06a5bb21-b8f0-4dfd-8004-4b4e17d4f81c')!==-1){
                                                    window.location.href=$.base+'/loginController/toLogin'
                                                    return
                                                }
                                                $(".middle").html(e2);
                                            }
                                        });
                                    }
                                    else{
                                        requestTip.error(e1.tips)
                                    }
                                },
                                error:function(){
                                    requestTip.error();
                                }
                            });
						}
						else{
                            var url=$.base+"/loginController/toLiveControlList";
                            $.ajax({
                                type:"GET",
                                url:url,
                                error:function(){
                                    alert("加载错误！");
                                },
                                success:function(e2){
                                    if(e2.indexOf('06a5bb21-b8f0-4dfd-8004-4b4e17d4f81c')!==-1){
                                        window.location.href=$.base+'/loginController/toLogin'
                                        return
                                    }
                                    $(".middle").html(e2);
                                }
                            });
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
						            		 var url=$.base+"/loginController/toLiveControlList";
												$.ajax({ 
									                type:"GET", 
									                url:url, 
									                error:function(){ 
									                   alert("加载错误！"); 
									                }, 
									                success:function(data){
                                                        if(data.indexOf('06a5bb21-b8f0-4dfd-8004-4b4e17d4f81c')!==-1){
                                                            window.location.href=$.base+'/loginController/toLogin'
                                                            return
                                                        }
                                                        $(".middle").html(data);
									                } 
									             });
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
				 message=JSON.stringify({message:message});
				 ws.send(message);
                 $(this).attr("disabled",true);
                 setTimeout(function () {
                     $(_this).attr("disabled",false);
                 },10000)
             });
             //点击申请直播延时
             $(".applyExtendTime").unbind().on("click",function () {
                 var confId=$('#confId').val();
                 var _this = this;
                 hospitalsName = $("#userName").text() //获取当前医院
                 var message=confId+hospitalsName+"申请直播延时!";
                 message=JSON.stringify({message:message});
                 ws.send(message);
				 $(this).attr("disabled",true);
                 setTimeout(function () {
                     $(_this).attr("disabled",false);
                 },10000)
             });
		 }
           //加载select框数据
		    function getPartiList(confId){
		    	$.ajax({
	                type: "GET",
	                url:$.base + "/liveBroadCastController/getLiveDetailTwo/"+$("#liveIdControlDetail").val(),
	                contentType:"application/json",
		            success: function(data){
		            	var partiOptions=data.participants;
		    		    $(".partiList").empty();
		    		    $.each(partiOptions,function(i,v){
		    		    	$("<option value='"+v.mtId+"'>"+v.hospitalName+"</option>").appendTo(".partiList");
		    		    });
		    		    getScreenData(confId);
		            },
		            error:function(){}
		    	});
		    }
		    //加载之前选看的结果
		    function getScreenData(confId){
		    	$.ajax({
                    type: "post",
                    url:  $.base + "/liveController/getChoosePicture",
                    data:JSON.stringify({confId:confId}),
                    contentType:"application/json",
                    success: function(data){
                   	 dragObj.init($(".dragBox"));
                        switch(data.status){
                            case '1':
                           	 if(data.data){
                       			 var parVal=$(".partiList").val();
                       			 if(parVal){
                       				$.each(data.data,function(i,v){
                                     	 if(parVal==v.dst){
                                     		var selectedPar="<i class='fa fa-trash-o' style='font-size:14px;cursor:pointer;float:right;margin:2px;' title='移除'></i>"+
	   										"<div uid='"+v.src+"' style='float:left;width:100%;text-align:center;font-size:14px;padding-top:122px'>"+v.srcHospitalName+"</div>";
	   	                               		$(".screen .dragBox").html("");
	   	                               		$(".screen .dragBox").append(selectedPar);	
                                     	 }
                      			     });
                       			 }else{
                       				    //"<i class='fa fa-trash-o' style='font-size:14px;cursor:pointer;float:right;margin:2px;' title='移除'></i>"+
                       				    var selectedPar="<div uid='"+data.data[0].src+"' style='float:left;width:100%;text-align:center;font-size:14px;padding-top:122px'>"+data.data[0].srcHospitalName+"</div>";
	                               		$(".screen .dragBox").html("");
	                               		$(".screen .dragBox").append(selectedPar);
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
		 var dragObj;
		 function setDrag(){
			 dragObj=base.dragPickBox({
				    items:$(".dragDetail"),
				    boxes:$(".dragBox"),
				    clickEvent:function(obj){
			               $(".detailBannerLi").css("background","#00479d"); 
			               $(obj).parents(".detailBannerLi").css("background","rgb(2,250,78)");
			            }
				});
		 }
		 
		return {
			run:function(){
				setLiveRoom();
				userId();
				setTableRecord();//设置会场记录
				setChange();//设置点击切换
			}
		};
})