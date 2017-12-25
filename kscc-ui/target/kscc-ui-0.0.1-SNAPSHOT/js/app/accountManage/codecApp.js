define(["base","datatables.net","app/commonApp"],function(base,DataTable,common){
	var grid = null;
	
    function setTable1(){
    	var i=0;
    	grid = $("#tblCodec").DataTable({
			"searching":false,
			"lengthChange":false,
			"autoWidth":false,
			"serverSide":true,
			"paging":true,
			"stateSave":true,
			"ordering":false,
			"language":{"url":$.base+"/js/lib/chinese.json"},
			"ajax":{ 
			"type":"post",
            "url":$.base+"/fabsLiveCode/findAllPageCodeList",
			"contentType":"application/json",
			"data": function ( d ) {
	               var params={
	            		   "pageNo": d.start/d.length+1,
	            		   "pageSize": d.length,
						   "param": {
	            		   	   "hospitalId":$("#idcodestr").val(),
							   "codecOwnership" : $('#ownership').val(), //编码器归属
							   "newvideoNum": $('#account').val(), //新视通账号
							   "ip": $('#IPAddress').val()//IP地址
							}
	               };
	              return JSON.stringify(params);
	            }
			},
			"columns":[
			           {"title":"序号","sWidth":"5%"},
			           {"title":"编码器名称", "data":"codecOwnership","sWidth":"20%"},
						{"title":"所属科室", "data":"departmentName","sWidth":"15%"},
						{"title":"安装位置", "data":"remarks","sWidth":"15%"},
						{"title":"编解码账号", "data":"newvideoNum","sWidth":"15%"},
						{"title":"编解码器IP", "data":"ip","sWidth":"15%"},
			           {"title":"操作", "data":"id","sWidth":"15%"}
			           ],
           "columnDefs":[
						{ 
						    "render":function(data,type,row,meta){ 
						       var html = "<div>"+(meta.row+1)+"</div>"; 
						       return html; 
						    }, 
						    "targets":0 
						 },
						 {
						    "render":function(data,type,row,meta){
							   var html="";
							   html="<span class='widthLength' title='"+row.codecOwnership+"'>"+row.codecOwnership+"</span>";
							   return html;
						    },
						    "targets":1
						},
                         {
							   "render":function(data,type,row,meta){
								   i++;
								   var deleStr="";
								   // if(i==1){
									//    deleStr="<div style='margin-left:3px;display:inline-block;'><button class='btn btn-link codecDelete' rowId='"+row.id+"' disabled><i class='iconfont' style='color:#0e51a2;font-weight:500;' title='不可删除'>&#xe685;</i></button></div>";
								   // }else{
									//    deleStr="<div style='margin-left:3px;display:inline-block;'><button class='btn btn-link codecDelete' rowId='"+row.id+"' ><i class='iconfont' style='color:#0e51a2;font-weight:500;' title='删除'>&#xe685;</i></button></div>";
								   // }
		                           var html = "";
		                           html =  "<div class='clearfix'>" +
		                                   "<div style='display:inline-block;'><button class='btn btn-link codecEdit' rowId='"+row.id+"' ><i class='iconfont' style='color:#0e51a2;font-weight:500;' title='编辑'>&#xe608;</i></button></div>"+deleStr+
		                     	  "</div>";
			            	  return html;
			              },
			               "targets":6
			            }
		              ],
              
			"drawCallback":function(setting){
				
				//编码器新增
				$(".codecAdd").off().on("click",function(){
					var codecId=$(this).attr("rowId");
			        $(this).attr({"data-toggle":"modal","data-target":"#addModal"});
			        //新增确定按钮
			        $(".saveAdd").off().on("click",function(){
			        	base.form.validate({ 
			                 form:$("#codecFormAdd"), 
			                 passCallback:function(){
			                	 var params={
			                                "hospitalId":$("#idcodestr").val(),
									        "codecOwnership":$("#ownershipAdd").val(),
									        "ftpPort":$("#ftpAdd").val(),
											"newvideoNum":$("#accountAdd").val(),
											"ip":$("#IPAddressAdd").val(),
											"port":$("#portAdd").val(),
				            				"username":$("#userNameAdd").val(),
				            				"password":$("#userPasswordAdd").val(),
				            				"code_password":"",
									      }
						        	var requestTip=base.requestTip({position:"center",timeout:-1});
						        	$.ajax({
							        	url:$.base+"/fabsLiveCode/addLiveCoder",
							        	type:"post",
			                            contentType:"application/json",
							        	data:JSON.stringify(params),
							        	success:function(data){
							        		requestTip.success();
							        		$("#addModal").modal("hide");
							        		base.form.reset($("#codecFormAdd"));
							        		common.refreshGrid(grid);
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
				});
				
				//编码器编辑
				$(".codecEdit").off().on("click",function(){
					var codecId=$(this).attr("rowId");
			        $(this).attr({"data-toggle":"modal","data-target":"#editModal"});
			        findAllDepartment();
                    var params={
                        "id":codecId
                    }
                    var requestTip=base.requestTip({position:"center"});
			        //获取原先的数据
			        $.ajax({
			        	url:$.base+"/fabsLiveCode/getLiveCodeInfoById",
			        	type:"post",
                        contentType:"application/json",
                        data:JSON.stringify(params),
			        	success:function(data){
			        		if (data.status === '1'){
			        			$("#departmentIdEdit").find("option[value='"+data.data.departmentId+"']").attr("selected",true); //科室
                                $("#ownershipEdit").val(data.data.codecOwnership);
                                $("#ftpEdit").val(data.data.ftpPort);
                                $("#accountEdit").val(data.data.newvideoNum);
                                $("#IPAddressEdit").val(data.data.ip);
                                $("#portEdit").val(data.data.port);
                                $("#userNameEdit").val(data.data.userName);
                                $("#userPasswordEdit").val(data.data.password);
                                $("#remarksEdit").val(data.data.remarks);
                                
							}else{
			        			requestTip.error(data.tips);
							}

			        	}
			        });
			        //编辑确定按钮
			        $(".saveEdit").off().on("click",function(){
			        		base.form.validate({ 
				                 form:$("#codecFormEdit"), 
				                 passCallback:function(){
				                	 var params={
							        			"id":codecId,
							        			"departmentId":$("#departmentIdEdit").find("option:selected").val(),//归属科室
										        "codecOwnership":$("#ownershipEdit").val(),
										        "ftpPort":$('#ftpEdit').val(),//FTP端口号
												"newvideoNum":$("#accountEdit").val(),
												"ip":$("#IPAddressEdit").val(),
												"port":$("#portEdit").val(),
					            				"username":$("#userNameEdit").val(),
					            				"password":$("#userPasswordEdit").val(),
					            				"remarks":$("#remarksEdit").val(),
										      }
	                                 var requestTip=base.requestTip({position:"center",timeout:0});
							        	$.ajax({
								        	url:$.base+"/fabsLiveCode/updateLiveCode",
				                            type:"post",
				                            contentType:"application/json",
								        	data:JSON.stringify(params),
								        	success:function(data){
	                                            if(data.status=='1'){
	                                                requestTip.success();
	                                                $("#editModal").modal("hide");
	                                                $("#tipMessage").hide();
	                                                $(".areaSelect .pick-show").css("border-color","#ccc");
	                                                base.form.reset($("#codecFormEdit"));
	                                                common.refreshGrid(grid);
	                                            }else{
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
				});
				
				//删除
				$(".codecDelete").off().on("click",function(){
					var codecId=$(this).attr("rowId");
					base.confirm({
					    	  label:"提示",
					    	  text:"<div style='text-align:center;font-size:13px;'>确定删除?</div>",
						      textAlign:'text-align:center',
				              confirmCallback:function(){
				            	  var requestTip=base.requestTip({position:"center"});
				            	  $.ajax({
							        	url:$.base+"/fabsLiveCode/toDelLiveCodeById?id="+codecId,
							        	type:"POST",
                                        contentType:"application/json",
							        	success:function(data){
							        		requestTip.success();
							        		common.refreshGrid(grid);
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
				setScrollTab();
			}
		});
    };
    
    function setScrollTab(){
    	var height = parseInt($(".middleContent").height()-120) ;
		$(".tCodec").height(height); 
    	base.scroll({
            container:".tCodec"
        });
    }
    
    function setPage(){
    	//搜索
        // $("#searchBtn2").off().on("click",function(){
         //    $("#tCodec").html("<table id='tblCodec' class='table table-striped' style='width:93%;'></table>");
         //    setTable1();
    	// 	//common.refreshGrid(grid);
    	// });
    	//
    	// //重置
    	// $("#resetBtn2").off().on("click",function(){
         //    $('#ownership').val("");
         //    $('#account').val("");
         //    $('#IPAddress').val("");
    	// });
    }
    
    //归属科室
    function findAllDepartment(){
            $.ajax({
                url:$.base+"/FbsDepartment/findAllDepartment",
                type:"POST",
                contentType:"application/json",
                dateType:"json",
                success:function(data){
                    $("#departmentIdEdit").html("");
                    $("#departmentIdEdit").append("<option value='-1' style='color:#555;'>--请选择--</option>");
                    var html = "";//初始化
                    $.each(data,function(index,item){
						html+="<option value='"+item.id+"'>"+item.departmentName+"</option>";
					})
                    $("#departmentIdEdit").append(html);
                },
                error:function(data){}
            });
    }
    
	return {
		run:function(){
			setTable1();//管理员管理表格
			setPage();
		}
	};
});
