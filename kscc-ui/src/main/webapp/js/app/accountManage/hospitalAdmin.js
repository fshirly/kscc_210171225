define(["base","datatables.net","app/commonApp"],function(base,DataTable,common){
    function setTableList(){
        var userId = $("#userIdstr").val();
        $.ajax({
            //医院用户登录管理员基本登录信息
            url:$.base+"/fbsUser/getHostUserDetails?userId="+userId,
            type: "GET",
            async:false,
            success:function(data){
                $(".addOrEdit").empty();
                var strs="";
                var strvalue="";
                if(data.id){
                    $("#loginName").val(data.loginName);
                    $("#phone").val(data.mobilePhone);
                    $("#email").val(data.email);
                    $("#password").val(data.password);
                    $(".editAdminDiv input").attr("disabled","disabled");
                    strs="<button class='btn btn-primary hospitalAdminEdit'>编辑</button>";
                }else{
                    strs="<button class='btn btn-primary hospitalAdminAdd'>新增</button>";
                    strvalue ="";
                }
                $(".addOrEdit").append(strs);
                setEdit();
            }
        });

        //新增管理员用户
        $(".hospitalAdminAdd").off().on("click",function(){
            var params={
                "hospitalId":$("#userIdstr").val(),
                "loginName":$("#loginName").val(),
                "user_password":$("#password").val(),
                "mobilePhone":$("#phone").val(),
                "email":$("#email").val()
            }
            var requestTip=base.requestTip({position:"center"});
            $.ajax({
                url:$.base+"/fbsUser/addHostUser",
                type:"post",
                contentType:"application/json",
                data:JSON.stringify(params),
                success:function(data){
                    requestTip.success();
                    $("#addModal").modal("hide");
                    common.refreshGrid(grid);
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

    function setEdit(){
        $(".hospitalAdminEdit").off().on("click",function(){
            $(".editAdminDiv input").attr("disabled",false);
            $(this).text("保存");
            $.ajax({
                //编辑保存接口
                //url:$.base+"/fbsUser/getHostUserDetails?userId="+userId,
                type: "GET",
                success:function(data){

                }
            });
        });
    }

    //编码器编辑
    $(".codecEdit").on("click",function(){
        var codecId=$(this).attr("rowId");
        $(this).attr({"data-toggle":"modal","data-target":"#editModal"});
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
                if(data.status === "1"){
                    $("#ownershipEdit").val(data.data.codecOwnership);
                    $("#accountEdit").val(data.data.newvideoNum);
                    $("#IPAddressEdit").val(data.data.ip);
                    $("#MACAddressEdit").val(data.data.mac);
                }else{
                    requestTip.error(data.tips);
                }
            }
        });
        //编辑确定按钮
        $(".saveEdit").on("click",function(){
            var params={
                "id":codecId,
                "codecOwnership":$("#ownershipEdit").val(),
                "newvideoNum":$("#accountEdit").val(),
                "ip":$("#IPAddressEdit").val(),
                "mac":$("#MACAddressEdit").val()
            }
            var requestTip=base.requestTip({position:"center"});
            $.ajax({
                url:$.base+"/fabsLiveCode/updateLiveCode",
                type:"post",
                contentType:"application/json",
                data:JSON.stringify(params),
                success:function(data){
                    if(data.status=='1'){
                        requestTip.success();
                        $("#editModal").modal("hide");
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
        });
    });


    return {
        run:function(){
            setTableList();//管理员管理表格
            setEdit();
        }
    };

});