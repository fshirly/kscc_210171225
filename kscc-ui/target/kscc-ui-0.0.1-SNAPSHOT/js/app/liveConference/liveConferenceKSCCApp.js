define(["base","datatables.net"],function(base,DataTable){
    var loginUserId='';
	
	function getMenus(){
		$.ajax({
            type:"post",
            async: false,
            url:$.base+"/liveBroadCastController/getUserId",
            success:function (data) {
                loginUserId=data.id;
            }
		});
	};
	
    function GetRequest() {
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    }
    var request = GetRequest();
    var index = request['index'];
    
    $('#myTab li:eq('+index+') a').tab('show');
    
	//直播查看
    function viewLiveDetail(liveId){
        $.ajax({
            type: "GET",
            async: false,
            url:$.base + "/liveBroadCastController/getLiveDetail/"+liveId,
            contentType:"application/json",
            success: function(data){
            	//上传文件filePath
                var value = data.filePath;
                var fileName = data.fileName;
                //$('#a1').attr('href','../fileUpload/download?fileUrl='+value+'&fileName='+fileName);
                $("#liveNameView").text(data.title);//直播名称
                $("#liveNameView").attr("title",data.title);
                $("#liveStartTimeView").text(formatDate(data.startTime));//直播开始时间
                $("#liveEndTimeView").text(formatDate(data.endTime));//直播结束时间
				$("#departmentView").text(data.departmentName);//科室名字
				$("#linkManView").text(data.linkMan);//联系人
				$("#phoneView").text(data.phone);//联系方式
                $("#liveEmailView").text(data.email);//邮箱地址
                $("#hospitalURLView").text(data.hospitalWebsite);//医院网址
                $("#hospitalURLView").attr("title",data.hospitalWebsite);
                $("#liveIntroductionView").text(data.liveIntroduction);//直播简介
                $("#liveIntroductionView").attr("title",data.liveIntroduction);
                var aElement=$('#a1')
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

               var hostParams=data.participants;//参与方数据
         	   var lis="";
         	   $("#liveParticipantView").empty();
         	   $.each(hostParams,function(i,v){
					if(v.serialNumber==1){
						$("#liveParticipantView").append("<li att='"+v.hospitalId+"' class='participantsLi'><span class='iconfont iconfontList'>&#xe61e;</span><span class='controlParti' title='"+v.hospitalName+"'>"+v.hospitalName+"</span><span class='iconfont iconfontImg' style='color:#ee453b;' title='第一主持人'>&#xe61c;</span></li>");
					}else if(v.serialNumber==2){
						$("#liveParticipantView").append("<li att='"+v.hospitalId+"' class='participantsLi'><span class='iconfont iconfontList'>&#xe61e;</span><span class='controlParti' title='"+v.hospitalName+"'>"+v.hospitalName+"</span></li>");//<span class='iconfont iconfontImg' title='第二主持人'>&#xe61c;</span>
					}else{
						$("#liveParticipantView").append("<li att='"+v.hospitalId+"' class='participantsLi'><span class='iconfont iconfontList'>&#xe61e;</span><span class='controlParti' title='"+v.hospitalName+"'>"+v.hospitalName+"</span></li>");
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

    //页面参与方列表搜索框
	function searchMain(nodesObj){
		$("#searchBtnView").on("click",function(){
			var condition=$("#searchParticipantView").val();
			$("#liveParticipantView").empty();
			var container=[];
			$.each(nodesObj,function(i,v){
				if(v.hospitalName.indexOf(condition)>-1){
					container.push(v);
				}
			});
			$.each(container,function(i,v){
				if(v.serialNumber==1){
					$("#liveParticipantView").append("<li att='"+v.id+"' class='participantsLi'><span class='iconfont iconfontList'>&#xe61e;</span><span class='controlParti' title='"+v.hospitalName+"'>"+v.hospitalName+"</span><span class='iconfont iconfontImg' style='color:#ee453b;' title='第一主持人'>&#xe61c;</span></li>");
				}
				else if(v.serialNumber==2){
					$("#liveParticipantView").append("<li att='"+v.id+"' class='participantsLi'><span class='iconfont iconfontList'>&#xe61e;</span><span class='controlParti' title='"+v.hospitalName+"'>"+v.hospitalName+"</span></li>");//<span class='iconfont iconfontImg' title='第二主持人'>&#xe61c;</span>
				}
				else{
					$("#liveParticipantView").append("<li att='"+v.id+"' class='participantsLi'><span class='iconfont iconfontList'>&#xe61e;</span><span class='controlParti' title='"+v.hospitalName+"'>"+v.hospitalName+"</span></li>");
				}
		    });
		});
	}
    //我的直播
		function setTableWait(searchFlag){

		   $("#tblReservation").DataTable({
				"searching":false,
				"lengthChange":false,
				"autoWidth":false,
				"serverSide":true,
				"paging":true,
				"stateSave":true,
				"ordering":false,
                "retrieve": true,
				"language":{"url":$.base+"/js/lib/chinese.json"},
				"ajax":{ 
					"type":"post",
					"url":$.base+"/broadcastMeeting/getBroadcastMeetList",
					"contentType":"application/json",
					"data": function ( d ) {
                        var titleName;
                        if(searchFlag == 1){
                            titleName = $("#searchConferenceMessage").val();
                        }else{
                            titleName = $("#liveNameW").val();
						}
                          var params={
                       		   "pageNo": d.start/d.length+1,
                       		   "pageSize": d.length,
                                "param":{
                       		   		"playStatus":"0",
                                    "approvalStatus":"1",
                                    "liveName": titleName,//直播名称
                                    "broadStartTime": $("#liveStartTimeW").val(),//直播开始时间
                                    "broadEndTime": $("#liveEndTimeW").val(),//直播结束时间
                                    "applicant":$("#applicantW").find("option:selected").val(),//申请方
                                    "applyStartTime": $("#releaseStartTimeW").val(),//发布开始时间
                                    "applyEndTime": $("#releaseEndTimeW").val(),//发布结束时间
                                    "userId":'',
									"isDel":"0"
								}
                          };
                          // $.extend(d,params);
                         return JSON.stringify(params);
                       }
					},
				"columns":[
				           {"title":"序号","data":"id","sWidth":"5%"},
				           {"title":"直播名称", "data":"title","sWidth":"25%"},
				           {"title":"申请方", "data":"name","sWidth":"15%"},
				           {"title":"申请时间", "data":"createdTime","sWidth":"15%"},
				           {"title":"直播开始时间", "data":"startTime","sWidth":"15%"},
				           {"title":"操作", "data":"operate","sWidth":"25%"}
				           ],
	           "columnDefs":[
						   {
							   "render":function(data,type,row,meta){
								   return meta.row+1;
							   },
							   "targets":0
						   },
						   {
							   "render":function(data,type,row,meta){
								   var html="";
								   html="<span class='widthLength widthLengthEx' title='"+row.title+"'>"+row.title+"</span>";
								   return html;
							   },
							   "targets":1
						   },
						   {
							   "render":function(data,type,row,meta){
								   var html="";
								   html="<span class='widthLength' title='"+row.name+"'>"+row.name+"</span>";
								   return html;
							   },
							   "targets":2
						   },
						   {
							   "render":function(data,type,row,meta){
								   return data.substr(0,16);
							   },
							   "targets":3
						   },
						   {
							   "render":function(data,type,row,meta){
								   return data.substr(0,16);
							   },
							   "targets":4
						   },

			              {"render":function(data,type,row,meta){
                                  var html = "";
                                  html =  "<div class='clearfix'>" +
	                            	  "<div style='display:inline-block;'><button class='btn btn-link liveViewW' rowId='"+row.id+"' ><i class='iconfont' style='color:#0e51a2;font-weight:500;' title='查看'>&#xe609;</i></button></div>"+
	                            	  "<div style='margin-left:3px;display:inline-block;'><button class='btn btn-link liveEditW' rowId='"+row.id+"' ><i class='iconfont' style='color:#0e51a2;font-weight:500;' title='编辑'>&#xe608;</i></button></div>"+
	                            	  "<div style='margin-left:3px;display:inline-block;'><button class='btn btn-link startLive' rowId='"+row.id+"'><i class='iconfont' style='color:#0e51a2;font-weight:500;' title='开始直播'>&#xe61a;</i></button></div>"+
	                            	  "<div style='margin-left:3px;display:inline-block;'><button class='btn btn-link endLive' rowId='"+row.id+"'><i class='iconfont' style='color:#0e51a2;font-weight:500;' title='取消直播'>&#xe610;</i></button></div>"+
                            	  "</div>";
				            	  return html;
				              },
				               "targets":5
				            }
			              ],
	              
				"drawCallback":function(setting){
					//已预约直播查看
					$(".liveViewW").off().on("click",function(){
						var liveViewId=$(this).attr("rowId");
				        $(this).attr({"data-toggle":"modal","data-target":"#liveViewModal"});
				        $("#searchParticipantView").val("");
                        viewLiveDetail(liveViewId);
					});
				    
					//直播编辑
					$(".liveEditW").off().on("click",function(){
						var liveEditId=$(this).attr("rowId");
						$("#liveIdEdit").val(liveEditId);
						$("#siteEdit").val("/loginController/toLiveConferenceKSCC");
						$("#indexEdit").val("0");
						var url=$.base+"/loginController/toEditLiveBroadcast";
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
					});
					
					//开始直播弹框
					$(".startLive").off().on("click",function(){
						var startLiveId=$(this).attr("rowId");
						base.confirm({ 
					    	  label:"提示",
					    	  text:"<div style='text-align:center;font-size:13px;'>确定开始此直播?</div>",
							textAlign:'text-align:center',
				              confirmCallback:function(){
				            	  var requestTip=base.requestTip({position:"center"});
				            	    $.ajax({
	                                    url:$.base+"/liveBroadCastController/startLive/"+startLiveId,
	                                    type:"GET",
	                                    contentType:"application/json",
							        	success:function(data){
	                                    	if(data.status==="1"){
	                                    		$("#tReservation").html("<table id='tblReservation' class='table table-striped'  style='width:100%;'></table>");
	                                            setTableWait();
	                                            requestTip.success();
	                                            //跳转到对应直播间
//	                                            var url=$.base+"/loginController/toLiveControlDetail";
//	            								$.ajax({ 
//	            					                type:"GET", 
//	            					                url:url, 
//	            					                error:function(){ 
//	            					                   alert("加载错误！"); 
//	            					                }, 
//	            					                success:function(data){
//	                                                    if(data.indexOf('06a5bb21-b8f0-4dfd-8004-4b4e17d4f81c')!==-1){
//	                                                        window.location.href=$.base+'/loginController/toLogin'
//	                                                        return
//	                                                    }
//	                                                    $(".middle").html(data);
//	            					                } 
//	            					             });
//	            								$("#liveIdControlDetail").val(startLiveId);
											}
											else{
                                                requestTip.error(data.tips);
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
					//取消直播弹框
					$(".endLive").off().on("click",function(){
						var endLiveId=$(this).attr("rowId");
						base.confirm({ 
					    	  label:"提示",
					    	  text:"<div style='text-align:center;font-size:13px;'>确定取消此直播?</div>",
				              confirmCallback:function(){
				            	    var requestTip=base.requestTip({position:"center"});
				            	    $.ajax({
		                                  url:$.base+"/liveBroadCastController/cancelLive/"+endLiveId,
		                                  type:"get",
		                                  contentType:"application/json",
							        	  success:function(data){
							        		  $("#tReservation").html("<table id='tblReservation' class='table table-striped'  style='width:100%;'></table>");
				                          	  setTableWait();
				                          	  requestTip.success();
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
				} 
			});
	    };
		
		//我的申请
		function setTableYet(searchFlag){
		   $("#tblApplication").DataTable({
				"searching":false,
				"lengthChange":false,
				"autoWidth":false,
				"serverSide":true,
				"paging":true,
				"stateSave":true,
				"ordering":false,
                "retrieve": true,
				"language":{"url":$.base+"/js/lib/chinese.json"},
				"ajax":{ 
					"type":"post",
                    "url":$.base+"/broadcastMeeting/getBroadcastMeetList",
					"contentType":"application/json",
					"data": function ( d ) {
						var titleName;
						if(searchFlag == 1){
                            titleName = $("#searchConferenceMessage").val();
						}else{
							titleName = $("#liveNameY").val();
						}
                          var params={
                       		   "pageNo": d.start/d.length+1,
                       		   "pageSize": d.length,
							  	"param": {
                                    "playStatus":"0",
                                    "liveName": titleName,//直播名称
                                    "broadStartTime": $("#liveStartTimeY").val(),//直播开始时间
                                    "broadEndTime": $("#liveEndTimeY").val(),//直播结束时间
                                    //"approvalStatus": $("#approvalStatusY").find("option:selected").val(),//审批状态
                                    "approvalStatus":"0",//审批状态（未审批）
                                    "applyStartTime": $("#applicationStartTimeY").val(),//申请开始时间
                                    "applyEndTime": $("#applicationEndTimeY").val(),//申请结束时间
                                    "userId":loginUserId,
								}
                          };
                         return JSON.stringify(params);
                       }
					},
				"columns":[
				           {"title":"序号","data":"id","sWidth":"5%"},
				           {"title":"直播名称", "data":"title","sWidth":"25%"},
				           {"title":"申请时间", "data":"createdTime","sWidth":"20%"},
				           {"title":"直播开始时间", "data":"startTime","sWidth":"20%"},
				           {"title":"操作", "data":"operate","sWidth":"15%"}
				           ],
	           "columnDefs":[
				          {
                              "render":function(data,type,row,meta){
									return meta.row+1;
							  },
							  "targets":0
						  },
						  {
							   "render":function(data,type,row,meta){
								   var html="";
								   html="<span class='widthLength widthLengthEx' title='"+row.title+"'>"+row.title+"</span>";
								   return html;
							   },
							   "targets":1
						   },
						   {
							   "render":function(data,type,row,meta){
								   return data.substr(0,16);
							   },
							   "targets":2
						   },
						   {
							   "render":function(data,type,row,meta){
								   return data.substr(0,16);
							   },
							   "targets":3
						   },
			              {"render":function(data,type,row,meta){
                                  var html = "";
                                  html =  "<div class='clearfix'>" +
	                            	  "<div style='display:inline-block;'><button class='btn btn-link liveViewY' rowId='"+row.id+"' ><i class='iconfont' style='color:#0e51a2;font-weight:500;' title='查看'>&#xe609;</i></button></div>"+
	                            	  "<div style='margin-left:3px;display:inline-block;'><button class='btn btn-link liveEditY' rowId='"+row.id+"' ><i class='iconfont' style='color:#0e51a2;font-weight:500;' title='编辑'>&#xe608;</i></button></div>"+
                            	  "</div>";
				            	  return html;
				              },
				               "targets":4
				            }
			              ],
	              
				"drawCallback":function(setting){
					//申请的直播查看
					$(".liveViewY").off().on("click",function(){
						var liveViewId=$(this).attr("rowId");
				        $(this).attr({"data-toggle":"modal","data-target":"#liveViewModal"});
				        $("#searchParticipantView").val("");
				        viewLiveDetail(liveViewId);
					});
				    
					//申请的直播编辑
					$(".liveEditY").off().on("click",function(){
						var liveEditId=$(this).attr("rowId");
						$("#liveIdEdit").val(liveEditId);
						$("#siteEdit").val("/loginController/toLiveConferenceKSCC");
						$("#indexEdit").val("1");
						var url=$.base+"/loginController/toEditLiveBroadcast";
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
                                $(".middle").html(data); ;
			                } 
			             });
					});
				}
			});
	    };
	    
	    //历史直播
		function setTableHis(){
		   $("#tblHistory").DataTable({
				"searching":false,
				"lengthChange":false,
				"autoWidth":false,
				"serverSide":true,
				"paging":true,
				"stateSave":true,
				"ordering":false,
                "retrieve": true,
				"language":{"url":$.base+"/js/lib/chinese.json"},
				"ajax":{ 
					"type":"post",
                    "url":$.base+"/broadcastMeeting/getBroadcastMeetList",
					"contentType":"application/json",
					"data": function ( d ) {
						var params={
		                   		   "pageNo": d.start/d.length+1,
		                   		   "pageSize": d.length,
		                           "param":{
									   "playStatus":"2"
									}
		                      };
		                return JSON.stringify(params);
                     }
				},
				"columns":[
				           {"title":"序号","data":"id","sWidth":"5%"},
				           {"title":"直播名称", "data":"title","sWidth":"25%"},
				           {"title":"申请方", "data":"name","sWidth":"25%"},
				           {"title":"直播开始时间", "data":"startTime","sWidth":"25%"},
				           {"title":"操作", "data":"operate","sWidth":"20%"}
				           ],
	           "columnDefs":[
				          {
                              "render":function(data,type,row,meta){
									return meta.row+1;
							  },
							  "targets":0
						  },
						  {
							   "render":function(data,type,row,meta){
								   var html="";
								   html="<span class='widthLength widthLengthEx' title='"+row.title+"'>"+row.title+"</span>";
								   return html;
							   },
							   "targets":1
						   },
						   {
							   "render":function(data,type,row,meta){
								   var html="";
								   html="<span class='widthLength' title='"+row.name+"'>"+row.name+"</span>";
								   return html;
							   },
							   "targets":2
						   },
						   {
							   "render":function(data,type,row,meta){
								   return data.substr(0,16);
							   },
							   "targets":3
						   },
			              {"render":function(data,type,row,meta){
                                  var html = "";
                                  html =  "<div class='clearfix'>" +
	                            	  "<div style='display:inline-block;'><button class='btn btn-link liveViewH' rowId='"+row.id+"' ><i class='iconfont' style='color:#0e51a2;font-weight:500;' title='查看'>&#xe609;</i></button></div>"+
                            	  "</div>";
				            	  return html;
				              },
				               "targets":4
				            }
			              ],
	              
				"drawCallback":function(setting){
					//历史直播查看
					$(".liveViewH").off().on("click",function(){
						var liveViewId=$(this).attr("rowId");
				        $(this).attr({"data-toggle":"modal","data-target":"#liveViewModal"});
				        viewLiveDetail(liveViewId);
					});
				}
			});
	    };
	    
		 function setPage(){
			//时间插件
			 base.form.date({
				 element:$(".date"),
				 isTime:true,
				 theme:"#00479d",
				 dateOption:{ 
					// min:getNowFormatDate(),
					 max: "2099-06-16 23:59", //最大日期
					 format: 'yyyy-MM-dd HH:mm'
				 }
			 });
			 
			//获得从第几个tab跳转
		        var index = $("#indexEdit").val();
		        if(index){
		        	$('#myTab li:eq(' + index + ') a').tab('show');
		        	switch(index)
		        	{
		        	case "0":
		        		$("#tReservation").html("<table id='tblReservation' class='table table-striped kscc-grid'></table>");
					    setTableWait();
		        	  break;
		        	case "1":
		        		$("#tApplication").html("<table id='tblApplication' class='table table-striped kscc-grid'></table>");
		   			    setTableYet();
		        	  break;
		        	}
		        }else{
		        	$('#myTab li:eq(0) a').tab('show');
		        	$("#tReservation").html("<table id='tblReservation' class='table table-striped kscc-grid'></table>");
				    setTableWait();
		        }
	    	
		  	//已预约直播搜索
             $("#searchBtnW").on("click",function(){
                 $("#tReservation").html("<table id='tblReservation' class='table table-striped kscc-grid'></table>");
                 var searchStartTimeWne = $("#liveStartTimeW").val();
                 var searchEndTimeWne = $("#liveEndTimeW").val();
                 var searchStartTimeWwo = $("#releaseStartTimeW").val();
                 var searchEndTimeWwo = $("#releaseEndTimeW").val();
                 if(searchStartTimeWne>searchEndTimeWne&&searchEndTimeWne!=""&&searchStartTimeWne!=""&&searchEndTimeWne!=null&&searchStartTimeWne!=null){
                	 base.confirm({ 
				    	  label:"提示",
				    	  text:"<div style='text-align:center;font-size:13px;'>直播开始时间不能大于结束时间！</div>",
						 textAlign:'text-align:center',
			              confirmCallback:function(){}
               	     });
                 }else if(searchStartTimeWwo>searchEndTimeWwo&&searchEndTimeWwo!=""&&searchStartTimeWwo!=""&&searchEndTimeWwo!=null&&searchStartTimeWwo!=null){
                	 base.confirm({ 
				    	  label:"提示",
				    	  text:"<div style='text-align:center;font-size:13px;'>申请开始时间不能大于结束时间！</div>",
			              confirmCallback:function(){}
             	     });
                 }
                 setTableWait();
             });
		  	
			//已预约直播重置
			$("#resetBtnW").on("click",function(){
				$("#liveNameW").val("");//直播名称
                $("#liveStartTimeW").val("");//直播开始时间
                $("#liveEndTimeW").val("");//直播结束时间
                $("#applicantW").val("");
   				$("#releaseStartTimeW").val("");//发布开始时间
   				$("#releaseEndTimeW").val("");//发布结束时间
				
			});	
			
			//申请的直播搜索
		  	$("#searchBtnY").on("click",function(){
				$("#tApplication").html("<table id='tblApplication' class='table table-striped kscc-grid'></table>");
                var searchStartTimeYne = $("#liveStartTimeY").val();
                var searchEndTimeYne = $("#liveEndTimeY").val();
                var searchStartTimeYwo = $("#applicationStartTimeY").val();
                var searchEndTimeYwo = $("#applicationEndTimeY").val();
                if(searchStartTimeYne>searchEndTimeYne&&searchEndTimeYne!=""&&searchStartTimeYne!=""&&searchEndTimeYne!=null&&searchStartTimeYne!=null){
                	base.confirm({ 
				    	  label:"提示",
				    	  text:"<div style='text-align:center;font-size:13px;'>直播开始时间不能大于结束时间！</div>",
						textAlign:'text-align:center',
			              confirmCallback:function(){}
          	        });
                }else if(searchStartTimeYwo>searchEndTimeYwo&&searchEndTimeYwo!=""&&searchStartTimeYwo!=""&&searchEndTimeYwo!=null&&searchStartTimeYwo!=null){
                	base.confirm({ 
				    	  label:"提示",
				    	  text:"<div style='text-align:center;font-size:13px;'>申请开始时间不能大于结束时间！</div>",
						  textAlign:'text-align:center',
			              confirmCallback:function(){}
        	        });
                }
			    setTableYet();
			});
		  	
			//申请的直播重置
			$("#resetBtnY").on("click",function(){
				$("#liveNameY").val("");//直播名称
                $("#liveStartTimeY").val("");//直播开始时间
                $("#liveEndTimeY").val("");//直播结束时间
                $("#approvalStatusY").val("");//审批状态
                $("#applicationStartTimeY").val("");//申请开始时间
                $("#applicationEndTimeY").val("");//申请结束时间
			});
			
			$(".highSearch").off().on("click",function(){
				if($("#myTab li:first").hasClass("active")){
					$("#searchDivWait").slideToggle("slow");
					$("#searchDivYet").hide();
					var display =$('#searchDivWait').css('display');
					if(display == "block"){
						base.form.reset($("#searchFormIdWait"));
						$("#tReservation").html("<table id='tblReservation' class='table table-striped kscc-grid'></table>");
		   			    setTableWait(); 
					}
				}
				else if($("#myTab li:last").hasClass("active")){
					$("#searchDivYet").slideToggle("slow");
					$("#searchDivWait").hide();
					var display =$('#searchDivYet').css('display');
					if(display == "block"){
						base.form.reset($("#searchFormIdYet"));
						$("#tApplication").html("<table id='tblApplication' class='table table-striped kscc-grid'></table>");
		   			    setTableYet(); 
					}
				}
			});
			
			//直播名称搜索
			$(".fuzzySearchBtn").click(function(){
				if($("#myTab li:first").hasClass("active")){
                    $("#tLive").html("<table id='tblReservation' class='table table-striped kscc-grid'></table>");
                    $("#tblReservation").dataTable().fnDestroy();
                    setTableWait(1);//我的直播
				}
				else if($("#myTab li:last").hasClass("active")){
                    $("#tLive").html("<table id='tblApplication' class='table table-striped kscc-grid'></table>");
                    $("#tblApplication").dataTable().fnDestroy();
                    setTableYet(1);//申请的直播
				}
			});
        };
		function setOption(){
			$.ajax({
                url:$.base+"/hospital/getHospitalInfo",
                type:"POST",
                contentType:"application/json",
                success:function(data){
                   	for(var i=0;i<data.length;i++){
                   		$("#applicantW").append("<option value='"+data[i].hospitalName+"'>"+data[i].hospitalName+"</option>");
					}
                },
			})
		}
		
		 function  setTabChange(){
    	    $('#myTab a').click(function (e) {  
    	       e.preventDefault();//阻止a链接的跳转行为  
    	       $(this).tab('show');//显示当前选中的链接及关联的content 
    	       if($(this).html()=="我的直播"){
    	    	   $("#tReservation").html("<table id='tblReservation' class='table table-striped kscc-grid'></table>");
   			       setTableWait(); 
   			       $(".searchBar").show();
    	       }
    	       else if($(this).html()=="我的申请"){
    	    	   $("#tApplication").html("<table id='tblApplication' class='table table-striped kscc-grid'></table>");
   			       setTableYet();
   			       $(".searchBar").show();
    	       }else if($(this).html()=="历史直播"){
    	    	   $("#tHistory").html("<table id='tblHistory' class='table table-striped kscc-grid'></table>");
    	    	   setTableHis();
    	    	   $(".searchBar").hide();
    	       }
    	    });
	     }
		
		return {
			run:function(){
				getMenus();//获得底部菜单
				setPage();
				setOption();
				setTabChange();
			}
		};
});
