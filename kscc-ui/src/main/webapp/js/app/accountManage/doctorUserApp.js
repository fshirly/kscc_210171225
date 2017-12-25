define(["base","datatables.net","app/commonApp"],function(base,DataTable,common){
    var grid1 = null;
    function setTable(){
        grid1 = $("#tblDoctor").DataTable({
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
            "url":$.base+"/fbsDoctor/findAllPageHospitalUserList",
			"contentType":"application/json",
			"data": function ( d ) { 
	               var params={
	            		   "pageNo": d.start/d.length+1,
	            		   "pageSize": d.length,
						   "param": {
                               "hospitalId":$("#iddoctorstr").val(),
							   "doctorName" : $('#doctorName').val(), //医生姓名
							   "department": $('#belongDepartment').find("option:selected").val(), //所属科室
							   "rank": $('#rank').find("option:selected").val(),//职级
							}
	               };
	              return JSON.stringify(params);
	            }
			},
			"columns":[
			           {"title":"<input type='checkbox' name='allResult'>","sWidth":"5%"},
			           {"title":"医生姓名", "data":"doctorName","sWidth":"15%"},
			           {"title":"身份证号", "data":"gmsfhm","sWidth":"15%"},
			           {"title":"联系电话", "data":"mobilePhone","sWidth":"15%"},
			           {"title":"所属科室", "data":"departname","sWidth":"15%"},
			           {"title":"职级", "data":"rank","sWidth":"15%"},
			           {"title":"操作", "data":"id","sWidth":"20%"}
			           ],
           "columnDefs":[
						{ 
						    "render":function(data,type,row,meta){ 
						    	var html = "<input type='checkbox' name='result' value='"+row.id+"'>"; 
							       $("input[name='result']").parent().addClass("text-center"); 
							    return html; 
						    }, 
						    "targets":0 
						 },
                         {"render":function(data,type,row,meta){
                           var html = "";
                           html =  "<div class='clearfix'>" +
                                   "<div style='display:inline-block;'><button class='btn btn-link doctorEdit' rowId='"+row.id+"' ><i class='iconfont' style='color:#0e51a2;font-weight:500;' title='编辑'>&#xe608;</i></button></div>"+
                            	   "<div style='margin-left:3px;display:inline-block;'><button class='btn btn-link doctorDelete' rowId='"+row.id+"' ><i class='iconfont' style='color:#0e51a2;font-weight:500;' title='删除'>&#xe685;</i></button></div>"+
                     	  "</div>";
			            	  return html;
			              },
			               "targets":6
			            }
		              ],
              
			"drawCallback":function(setting){
				
				//医生用户新增
				$(".doctorAdd").off().on("click",function(){
					var doctorId=$(this).attr("rowId");
			        $(this).attr({"data-toggle":"modal","data-target":"#addModal"});
                    addAllDepartment();
			        //新增确定按钮
			        $(".saveAdd").off().on("click",function(){
			        	base.form.validate({
                            form:$("#doctorFormAdd"),
                            passCallback:function(){
                            	var params={
        			        			"hospitalId":$("#iddoctorstr").val(),
        						        "username":$("#doctorNameAdd").val(),
        								"gmsfhm":$("#IDNumberAdd").val(),
        								"mobilePhone":$("#phoneAdd").val(),
        								"department":$("#belongDepartmentAdd").find("option:selected").val(),
        								"rank":$("#rankAdd").find("option:selected").val()
        						      }
        			        	var requestTip=base.requestTip({position:"center"});
        			        	$.ajax({
        				        	url:$.base+"/fbsUser/addHospitorUser",
        				        	type:"post",
                                    contentType:"application/json",
        				        	data:JSON.stringify(params),
        				        	success:function(data){
        				        		if(data.status ==='1'){
                                            requestTip.success();
                                            $("#addModal").modal("hide");
                                            base.form.reset($("#doctorFormAdd"));//清空模态框数据
                                            common.refreshGrid(grid1);
										}else {
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
				
				//关闭模态框
		        $('#addModal').on('hidden.bs.modal', function () {
		        	base.form.reset($("#doctorFormAdd"));
		        });
				
				//全选
			     $("input[name='allResult']").on("click",function(){
					  if($(this).is(':checked')){
						  $("input[name='result']").prop("checked",true);
				      }else{
				    	  $("input[name='result']").prop("checked",false);
				      }
				  });
				
			      //批量删除
				  $(".doctorBatchDel").unbind("click").on("click",function(){
					 var doctorIds = [];
					 $("input[name='result']:checked").each(function(i,o){
						 doctorIds.push($(o).val());
					 });
					 if(doctorIds.length==0){
						 base.confirm({ 
					    	  label:"提示",
					    	  text:"<div style='text-align:center;font-size:13px;'>请选择需要删除项！</div>",
							  textAlign:'text-align:center',
				              confirmCallback:function(){}
						 });
					  }
					  else if(doctorIds.length>0){
						  base.confirm({ 
					    	  label:"提示",
					    	  text:"<div style='text-align:center;font-size:13px;'>确定要删除此记录吗?</div>",
							  textAlign:'text-align:center',
				              confirmCallback:function(){
				            	  var requestTip=base.requestTip({position:"center"});
				            	  $.ajax({
                                      url:$.base+"/fbsDoctor/toDelFbDoctorById?id="+doctorIds,
							        	type:"POST",
							        	contentType:"application/json",
							        	data:JSON.stringify(doctorIds),
							        	success:function(data){
							        		requestTip.success();
                                            common.refreshGrid(grid1);
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
					 } 
				  });
				
				//医生用户编辑
				$(".doctorEdit").off().on("click",function(){
					var doctorId=$(this).attr("rowId");
			        $(this).attr({"data-toggle":"modal","data-target":"#editModal"});
                    editAllDepartment();
                    var params={
                       "id":doctorId
                    }
			        //获取原先的数据
			        $.ajax({
			        	url:$.base+"/fbsDoctor/getDoctorInfoById",
			        	type:"post",
                        contentType:"application/json",
                        data:JSON.stringify(params),
			        	success:function(data){
			        		$("#doctorNameEdit").val(data.doctorName);
							$("#IDNumberEdit").val(data.gmsfhm);
							$("#phoneEdit").val(data.mobilePhone);
                            $("#belongDepartmentEdit").find("option[value='"+data.department+"']").attr("selected",true); //科室
							//$("#belongDepartmentEdit").val(data.department);
							$("#rankEdit").val(data.rank);
			        	}
			        });
			        //编辑确定按钮
			        $(".saveEdit").off().on("click",function(){
			        	base.form.validate({
                            form:$("#doctorFormEdit"),
                            passCallback:function(){
                            	var params={
        			        			"id":doctorId,
        			        			"userName":$("#doctorNameEdit").val(),
        								"gmsfhm":$("#IDNumberEdit").val(),
        								"mobilePhone":$("#phoneEdit").val(),
        								"department":$("#belongDepartmentEdit").find("option:selected").val(),
        								"rank":$("#rankEdit").find("option:selected").val()
        						      }
        			        	var requestTip=base.requestTip({position:"center"});
        			        	$.ajax({
        				        	url:$.base+"/fbsUser/updateHospitalUser",
        				        	type:"post",
                                    contentType:"application/json",
        				        	data:JSON.stringify(params),
        				        	success:function(data){
        				        		requestTip.success();
        				        		$("#editModal").modal("hide");
        				        		base.form.reset($("#doctorFormEdit"));//清空模态框数据
                                        common.refreshGrid(grid1);
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
				
				//关闭模态框
		        $('#editModal').on('hidden.bs.modal', function () {
		        	base.form.reset($("#doctorFormEdit"));
		        });
				
				//删除
				$(".doctorDelete").on("click",function(){
					var doctorId=$(this).attr("rowId");
					base.confirm({
					    	  label:"提示",
					    	  text:"<div style='text-align:center;font-size:13px;'>确定删除?</div>",
						      textAlign:'text-align:center',
				              confirmCallback:function(){
				            	  var requestTip=base.requestTip({position:"center"});
				            	  $.ajax({
                                      url:$.base+"/fbsDoctor/toDelFbDoctorById?id="+doctorId,
									  type:"POST",
                                      contentType:"application/json",
							        	success:function(data){
							        		requestTip.success();
							        		common.refreshGrid(grid1);
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
    	var height = parseInt($(".middleContent").height()-150) ;
		$(".tDoctor").height(height); 
    	base.scroll({
            container:".tDoctor"
        });
    }
    
    //所属科室
    function findAllDepartment(){
        $.ajax({
            url:$.base+"/FbsDepartment/findAllDepartment",
            type:"POST",
            contentType:"application/json",
            dateType:"json",
            success:function(data){
                $("#belongDepartment").html("");
                // var html = "<option value='0'>全部</option>";//初始化
                var html = "<option value=''></option>";//初始化
                $.each(data,function(index,item){
                    html+="<option value='"+item.id+"'>"+item.departmentName+"</option>";
                })
                $("#belongDepartment").html(html);
            },
            error:function(data){}
        });
    }

    function addAllDepartment(){
        $.ajax({
            url:$.base+"/FbsDepartment/findAllDepartment",
            type:"POST",
            contentType:"application/json",
            dateType:"json",
            success:function(data){
                $("#belongDepartmentAdd").html("");
                // var html = "<option value='0'>全部</option>";//初始化
                var html = "";//初始化
                $.each(data,function(index,item){
                    html+="<option value='"+item.id+"'>"+item.departmentName+"</option>";
                })
                $("#belongDepartmentAdd").html(html);
            },
            error:function(data){}
        });
    }

    function editAllDepartment(){
        $.ajax({
            url:$.base+"/FbsDepartment/findAllDepartment",
            type:"POST",
            contentType:"application/json",
            dateType:"json",
            success:function(data){
                $("#belongDepartmentEdit").html("");
                // var html = "<option value='0'>全部</option>";//初始化
                var html = "";//初始化
                $.each(data,function(index,item){
                    html+="<option value='"+item.id+"'>"+item.departmentName+"</option>";
                })
                $("#belongDepartmentEdit").html(html);
            },
            error:function(data){}
        });
    }

    function setPage(){
    	//搜索
        $("#searchBtn1").off().on("click",function(){
            $("#tDoctor").html("<table id='tblDoctor' class='table table-striped' style='width:93%;'></table>");
            setTable();
		});

    	//重置
    	$("#resetBtn1").off().on("click",function(){
    		$('#doctorName').val(""); //医生姓名
			$('#belongDepartment').val(""); //所属科室
			$('#rank').val("");
    	});
    }
    
	return {
		run:function(){
			setTable();//管理员管理表格
			setPage();
            findAllDepartment();
		}
	};
});
