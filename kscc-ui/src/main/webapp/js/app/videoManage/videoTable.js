/**
 * Created by Administrator on 2017/10/25 0025.
 */
define(["BaseApp","base","datatables.net"],function(baseApp,base){
    //点击高级搜索
    function clickHighSearch(){
        $(".highSearch").off().on("click",function () {
            $("#searchDiv").slideToggle("slow",function(){
                setScroll();//设置滚动条
            });

        })
    }
    //判断登录人身份
    function loginUser(){
            $.ajax({
                type:"post",
                url:$.base+"/liveBroadCastController/getUserId",
                success:function (data) {
                    if(data.roleName=="kscc管理员"){ //则说明是管理员 ,反之则不是
                        $(".highSearch").show();
                        setTable();
                        $("#userTableLive").hide();
                        $("#tblLiveApproval").show();
                        clickHighSearch();
                    }else{
                        $(".highSearch").hide();
                        $("#tblLiveApproval").hide();
                        $("#userTableLive").show();
                         setUserTable(data.hospitalId);
                    }
                }
            })
    }
    //获取手术医院
    function getOperateHospital(){
        $.ajax({
            url:$.base+"/hospital/getHospitalInfo",
            type:"get",
            success:function (data) {
                if(data && data.length>0){
                    var options="";
                    $.each(data,function(index,item){
                        if(item.id){
                            options+="<option value='"+item.id+"'>"+item.hospitalName+"</option>"
                        }
                    });
                    $("#operativeHospital").html("<option></option>"+options)
                }
            }
        })
    }
   //时间插件
    function setDate(){
        base.form.date({
            element:$(".date"),
            isTime:true,
            theme:"#00479d",
            dateOption:{
                max: "2099-06-16 23:59", //最大日期
                format: 'yyyy-MM-dd HH:mm'
            }
        })
    }
    function setTable(){
        grid = $("#tblLiveApproval").DataTable({
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
                "url":$.base+"/awsFile/listFile",
                "contentType":"application/json",
                data:function(d){
                    var startTime = $("#liveStartTime").val();
                    var endTime = $("#liveEndTime").val();
                    if(startTime !='' && endTime !=''){
                        startTime = startTime+':00';
                        endTime = endTime+':00';
                    }
                    var params={
                        "pageNo": d.start/d.length+1,
                        "pageSize": d.length,
                        "param":{
                            "title": $("#liveName").val(),//直播名称
                            "timeBegin": startTime,//直播开始时间
                            "timeEnd": endTime,//直播结束时间
                            "hospital":$("#operativeHospital").val(),
                            "uploadstatus": $("#videoStatus").val()//审批状态
                        }
                    };
                    return JSON.stringify(params);
                },
                "dataSrc":function (d) {
                    if(d && d.data && d.data.length>0){ //将所有的liveId找出
                        var data=d.data;
                        var liveArr=[];
                        var liveFlag=[];
                        var hospitalArr=[];
                        var hospitalFlag=[];
                        var diffHospital=[];
                        $.each(d.data,function (index,item) {
                            liveArr[item.liveid]=0;
                            liveFlag[item.liveid]=0;
                            hospitalArr[item.liveid.toString()+item.hospitalid.toString()]=0;
                            hospitalFlag[item.liveid.toString()+item.hospitalid.toString()]=0;
                            diffHospital[item.liveid]=[];

                        });
                        //获取所有的直播id集合
                        $.each(data,function(index,item){
                            liveArr[item.liveid]++;
                            hospitalArr[item.liveid.toString()+item.hospitalid.toString()]++;
                            if($.inArray(item.hospitalid,diffHospital[item.liveid])==-1){
                                diffHospital[item.liveid].push(item.hospitalid)
                            }
                            item.hNum=0;
                            item.vNum=0;
                            item.diffNum=0;
                        });

                        $.each(d.data,function (index,item) {
                            if(liveFlag[item.liveid]==0){
                                item.hNum=liveArr[item.liveid];
                                item.pIndex=true;
                                item.diffNum=diffHospital[item.liveid].length;
                                liveFlag[item.liveid]=1;
                            }
                            if(hospitalFlag[item.liveid.toString()+item.hospitalid.toString()]==0){
                                item.vNum = hospitalArr[item.liveid.toString()+item.hospitalid.toString()];
                                item.vIndex=true;
                                hospitalFlag[item.liveid.toString()+item.hospitalid.toString()]=1
                            }
                        });
                    }
                    if(d && d.data==null){
                        d.data=[];
                    }
                    return d.data
                }
            },
            "columns":[
                {"title":"<span style='width: 55%;display:inline-block;text-align: left;padding-left: 20px;'>直播名称</span><span style='width:45%;display:inline-block;text-align: left'>直播开始时间</span>", "data":"title","sWidth":"35%"},
                {"title":"<div >手术医院</div>", "data":"hospitalname","sWidth":"16%"},
                {"title":"录像名称", "data":"filename","sWidth":"16%"},
                {"title":"视频上传状态", "data":"uploadstatus","sWidth":"11%"},
                {"title":"操作", "data":"operate","sWidth":"25%"}
            ],
            "columnDefs":[
                {
                    "render":function(data,type,row,meta){
                        //hNum 大于1才给展开按钮hFlag='0'
                    	var starttime = row.starttime.split(".")[0];
                        if(row.hNum>1 && row.diffNum>1){
                            return "<div class='text-left liveWrapper pl-10'><span style='width:55%;display:inline-block'><a class='clickLive'hFlag='0' liveId='"+row.liveid+"'><i class='iconfont tableIcon' title='展开'>&#xe600;</i></a>"+row.title+"</span>" +
                                "<span style='width:45%;display:inline-block'>"+starttime+"</span></div>"
                        }else{
                            return "<div class='text-left liveWrapper pl-10'><span style='width:55%;display:inline-block'><i></i>"+row.title+"</span><span style='width:45%;display:inline-block'>"+starttime+"</span></div>"
                        }

                    },
                    "targets":0
                },
                {
                    "render":function(data,type,row,meta){
                        //vNum 大于1才给展开按钮
                        if(row.vNum>1){
                            return "<div class='hospitalWrapper'><a class='clickHospital' liveId='"+row.liveid+"' hospitalId='"+row.hospitalid+"' vFlag='0'><i class='iconfont tableIcon' title='展开'>&#xe600;</i></a><span>"+row.hospitalname+"</span></div>"
                        }else{
                            return "<div class='hospitalWrapper'><i></i>"+row.hospitalname+"</div>"
                        }

                    },
                    "targets":1
                },
                {
                    "render":function(data,type,row,meta){
                        return row.displayName
                    },
                    "targets":2
                },
                {
                    "render":function(data,type,row,meta){
                        if(row.uploadstatus==0){
                            return "未上传"
                        }else{
                            return "已上传"
                        }
                    },
                    "targets":3
                },
                {
                    "render":function(data,type,row,meta){
                        var download="";
                        var cloudDel="";
                        //var edit="";
                        var localDel="";
                        if(row.uploadstatus==0){
                            download="<a class='btn btn-link ' disabled ><i class='iconfont tableIcon' title='下载'>&#xe65b;</i></a>";
                            localDel ="<a class='btn btn-link' disabled ><i class='iconfont tableIcon' title='删除'>&#xe685;</i></a>";
                            cloudDel="<a class='btn btn-link' disabled><i class='iconfont tableIcon' style='font-size: 17px' title='云删除'>&#xe634;</i></a>";
                        }else{
                            download="<a class='btn btn-link download'><i class='iconfont tableIcon' title='下载'>&#xe65b;</i></a>";
                            if(row.oldfilestatus==0){ //编解码是否已经删除
                                localDel = "<a class='btn btn-link  localDel' ip='"+row.ip+"' port='"+row.port+"' userName='"+row.username+"' password='"+row.password+"' confid='"+row.confid+"' codecid='"+row.codecid+"'>" +
                                    "<i class='iconfont tableIcon' title='删除'>&#xe685;</i></a>"
                            }else{
                                localDel ="<a class='btn btn-link' disabled ><i class='iconfont tableIcon' title='删除'>&#xe685;</i></a>"
                            }
                            if(row.storefilestatus==0){//云上文件是否删除
                                cloudDel="<a class='btn btn-link cloudDel'><i class='iconfont tableIcon' style='font-size: 17px' title='云删除'>&#xe634;</i></a>";
                            }else{
                                cloudDel="<a class='btn btn-link' disabled><i class='iconfont tableIcon' style='font-size: 17px' title='云删除'>&#xe634;</i></a>";
                                download="<a class='btn btn-link ' disabled ><i class='iconfont tableIcon' title='下载'>&#xe65b;</i></a>";
                            }
                        }

                        var buttons=download + localDel + cloudDel;
                        return "<div class='operateParent' filename='"+row.displayName+"' bucket='"+row.bucket+"' fileId='"+row.id+"' filePath='"+row.filepath+"' hospitalId='"+row.hospitalid+"'>"+buttons+"</div>";
                    },
                    "targets":4
                }
            ],
            "createdRow":function (row,data,dataIndex) {
                //分为两种情况
                if(data.hNum!=0){
                    $(row).find("td:eq(0)").attr("rowspan",data.hNum);
                    if(data.vNum!=0){
                        $(row).find("td:eq(1)").attr("rowspan",data.vNum)
                    }else{
                        $(row).find("td:eq(1)").remove();
                    }
                }else{
                    $(row).find("td:eq(0)").remove();
                    if(data.vNum!=0){
                        $(row).find("td:eq(0)").attr("rowspan",data.vNum)
                    }else{
                        $(row).find("td:eq(0)").remove();
                    }
                }
                $(row).attr("liveId",data.liveid);
                $(row).attr("hId",data.hospitalid);
                //将所有不含pIndex的隐藏
                if(!data.pIndex){
                    $(row).find("td").addClass("hide");
                }
                $(row).attr("liveId",data.liveid);
                if(data.vIndex){
                    $(row).attr("liveAlone",data.vIndex+data.liveid);
                    $(row).attr("vIndex",data.vIndex);
                }else{
                    $(row).attr("hAlone",data.liveid.toString()+data.hospitalid.toString())
                }
            },
            drawCallback:function(setting){
                //判断是否含有加号(判断第二行是否有加号)
                var flag0=false;
                var flag1=false;
                //一旦含有一个tableIcon，就将flag0改变成true
                $("#tblLiveApproval .liveWrapper").each(function(index,item) {
                     if($(item).find("i").hasClass("tableIcon")){
                         flag0  = true
                     }
                });
                //一旦含有一个tableIcon，就将flag0改变成true
                $("#tblLiveApproval .hospitalWrapper").each(function(index,item) {
                    if( $(item).find("i").hasClass("tableIcon")){
                        flag1  = true
                    }
                });
                if(flag0){
                    $("#tblLiveApproval .liveWrapper").find("i").not(".tableIcon").addClass("blockArea")
                }
                if(flag1){
                    $("#tblLiveApproval .hospitalWrapper").find("i").not(".tableIcon").addClass("blockArea")
                }
                //点击直播(展开和闭合要分开写) 展开的时候只展开子，闭合是闭合子孙
                $(".clickLive").off().on("click",function () {
                    var liveAlone=$(this).parents("tr").attr("liveAlone");
                    $("tr[liveAlone='"+liveAlone+"']").not(":first").find("td").toggleClass("hide").css("border-left",0);
                    if($(this).attr("hFlag")==0){ //为0说明处于合并的状态（打开）
                        $(this).html("<i class='iconfont tableIcon' title='关闭'>&#xe643;</i>");
                        $(this).attr("hFlag",1);
                        //每次展开的时候给当前的按钮的父元素td加上右边的border
                        $(this).parents("td").css("border-right","#ccc 1px solid")
                    }else{
                        $("tr[liveAlone='"+liveAlone+"']").each(function(index,item){
                            if($(item).find(".clickHospital").attr("vflag")==1){ //说明被展开了
                                $("tr[hAlone='"+$(item).attr("liveId")+$(item).attr("hId")+"']").find("td").addClass("hide");
                                $(this).find("td").css("border-right","#ccc 0px solid");
                                $(item).find(".clickHospital").attr("vflag",0);
                                $(item).find(".clickHospital").html("<i class='iconfont tableIcon' title='展开'>&#xe600;</i>")
                            }
                        });
                        $(this).html("<i class='iconfont tableIcon' title='展开'>&#xe600;</i>");
                        $(this).attr("hFlag",0);//合并
                        $(this).parents("td").css("border-right","#ccc 0px solid")
                    }
                });
                //点击医院
                $(".clickHospital").off().on("click",function () {
                    var liveId = $(this).attr("liveId");
                    var hospitalId=$(this).attr("hospitalId");
                    var hAlone=liveId.toString()+hospitalId.toString();
                    $("tr[hAlone='"+hAlone+"']").find("td").toggleClass("hide").css("border-left",0);
                    //设置vFlag的值
                    if($(this).attr("vFlag")==0){
                        $(this).html("<i class='iconfont tableIcon' title='关闭'>&#xe643;</i>");
                        $(this).attr("vFlag",1);
                        //每次展开的时候给当前的按钮的父元素td加上右边的border
                        $(this).parents("td").css("border-right","#ccc 1px solid")
                    }else{
                        $(this).html("<i class='iconfont tableIcon' title='展开'>&#xe600;</i>");
                        $(this).attr("vFlag",0);
                        $(this).parents("td").css("border-right","#ccc 0px solid")
                    }
                });
                download();
                edit();//点击编辑
                localDel();//本地删除
                cloudDel();//云删除
                search();//搜索
                reset();//重置
                setScroll();//设置滚动条
                SearchBtn();
            }
        })
    }
    function setUserTable(hospital){
        $("#userTableLive").DataTable({
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
                "url":$.base+"/awsFile/listFile",
                "contentType":"application/json",
                "data": function ( d ){
                    var params={
                        "pageNo": d.start/d.length+1,
                        "pageSize": d.length,
                        "param":{
                            "title": $("#liveName").val(),//直播名称
                            "hospital":hospital
                        }
                    };
                    return JSON.stringify(params);
                },
                "dataSrc":function(d){
                    var liveArr=[];
                    var liveFlag=[];
                    if(d && d.data && d.data.length>0  ){
                        $.each(d.data,function(index,item){
                            liveArr[item.liveid]=0;
                            liveFlag[item.liveid]=0;
                            item.hNum=0;
                        });
                       $.each(d.data,function(index,item){
                           liveArr[item.liveid]++;
                       });
                        $.each(d.data,function(index,item){
                            if(liveFlag[item.liveid]==0){
                                item.hNum=liveArr[item.liveid];
                                liveFlag[item.liveid]=1
                            }
                        })
                    }
                    if(d && d.data==null){
                        d.data=[];
                    }
                    return d.data;
                }
            },
            "columns":[
                {"title":"<span style='width: 55%;display:inline-block;text-align: left;padding-left: 20px;'>直播名称</span><span style='width:45%;display:inline-block;text-align: left;'>直播开始时间</span>", "data":"title","sWidth":"50%"},
                {"title":"录像名称", "data":"filename","sWidth":"35%"},
                {"title":"操作", "data":"operate","sWidth":"15%"}
            ],
            "columnDefs":[
                {
                    "render":function (data,type,row,meta) {
                        var starttime="";
                        if(row.starttime){
                            starttime  = row.starttime.split(".")[0];
                        }
                        if(row.hNum>1){
                            return "<div class='text-left liveWrapper1 pl-10'><span style='width:55%;display:inline-block'><a class='clickLive' hFlag='0' liveId='"+row.liveid+"'><i class='iconfont tableIcon' title='展开'>&#xe600;</i></a>"+row.title+"</span>" +
                                "<span style='width:45%;display:inline-block'>"+starttime+"</span></div>"
                        }else{
                            return "<div class='text-left  liveWrapper1 pl-10'><span style='width:55%;display:inline-block'><i></i>"+row.title+"</span><span style='width:45%;display:inline-block'>"+starttime+"</span></div>"
                        }
                    },
                    "targets":0
                },
                {
                    "render":function(data,type,row,meta){
                        return row.displayName
                    },
                    "targets":1
                },
                {
                    "render":function (data,type,row,meta) {
                        var download="";
                        if(row.uploadstatus==0){
                            download="<a class='btn btn-link ' disabled ><i class='iconfont tableIcon' title='下载'>&#xe65b;</i></a>";
                        }else{
                            //download="<a href='http://www.karlstorz.com.oos-website-cn.oos-hq-sh.ctyunapi.cn/"+row.bucket+"/"+row.filename+"' class='btn btn-link download'><i class='iconfont tableIcon' title='下载'>&#xe65b;</i></a>";
                            download="<a class='btn btn-link download'><i class='iconfont tableIcon' title='下载'>&#xe65b;</i></a>";
                        }
                        return  "<div class='operateParent' filename='"+row.displayName+"' bucket='"+row.bucket+"' fileId='"+row.id+"' filePath='"+row.filepath+"' hospitalId='"+row.hospitalid+"'>"+download+"</div>"
                    },
                    "targets":2
                }
            ],
            "createdRow":function(row,data,dataIndex){
                if(data.hNum>0){
                    $(row).find("td:eq(0)").attr("rowspan",data.hNum);
                }else{
                    $(row).find("td:eq(0)").remove();
                }
                $(row).attr("liveId",data.liveid);
                $(row).attr("hNum",data.hNum);
                if(data.hNum==0){
                    $(row).find("td").addClass("hide")
                }
            },
            "drawCallback":function (setting) {
                //判断是否含有加号(判断第二行是否有加号)
                var flag1=false;
                //一旦含有一个tableIcon，就将flag0改变成true
                $("#userTableLive .liveWrapper1").each(function(index,item) {
                    if( $(item).find("i").hasClass("tableIcon")){
                        flag1  = true
                    }
                });
                if(flag1){
                    $("#userTableLive .liveWrapper1").find("i").not(".tableIcon").addClass("blockArea")
                }
                //点击直播
                $(".clickLive").off().on("click",function(){
                    var liveId  = $(this).parents("tr").attr("liveId");
                    $("tr[liveId='"+liveId+"'][hNum=0]").find("td").toggleClass("hide").css("border-left",0);
                    if($(this).attr("hFlag")==0){
                        $(this).html("<i class='iconfont tableIcon' title='关闭'>&#xe643;</i>");
                        $(this).parents("td").css("border-right","#ccc 1px solid");
                        $(this).attr("hFlag",1);
                    }else{
                        $(this).html("<i class='iconfont tableIcon' title='展开'>&#xe600;</i>");
                        $(this).parents("td").css("border-right","#ccc 0px solid");
                        $(this).attr("hFlag",0);//合并
                    }
                });
                download();//下载
                SearchBtn(true,hospital);
                setScroll();
            }
        })
    }
    
  //点击下载直接加链接
    function download(){
        $(".download").off().on("click",function(){
            var params={};
            params.filename=$(this).parent().attr("filename");
            params.bucket=$(this).parent().attr("bucket");
            $.ajax({
                url:$.base+"/awsFile/getFile",
                type:"post",
                data:JSON.stringify(params),
                contentType:"application/json",
                success:function(result){
                    window.location.href=result
                }
            })
        })
    }
  
    //点击编辑
    function edit(){
        $(".edit").off().on("click",function(){
            var params={};
            params.filename = $(this).parent().attr("filename");
            params.bucket = $(this).parent().attr("bucket");
            params.fileId=$(this).parent().attr("fileId");
            var modal = base.modal({
                label:"编辑录像名称",
                width:450,
                height:80,
                context:"<div><label style='width:65px'>录像名称:</label><input class='form-control form-width newName' value='"+params.filename+"' style='width: 260px;max-width:300px !important'></div>",
                callback:function () {

                },
                buttons:[
                    {
                        label:"保存",
                        cls:"btn btn-info confirm",
                        clickEvent:function () {
                            params.name=$(".newName").val();
                            $.ajax({
                                url:$.base+"/awsFile/renameFile",
                                type:"post",
                                data:JSON.stringify(params),
                                contentType:"application/json",
                                success:function(result){
                                    if(result.status=="1"){
                                        base.requestTip().success("修改成功");
                                        grid.ajax.reload();
                                       modal.hide();
                                    }else{
                                        base.requestTip().error(result.tips);
                                    }

                                }
                            })
                        }
                    },
                    {
                        label:"重置",
                        cls:"btn btn-warning",
                        clickEvent:function(){
                           $("input").val("");
                        }
                    }
                ]

            });

        })
    }
    //删除
    function localDel(){
        $(".localDel").off().on("click",function(){
            //弹框
            var params={};
            params.username=$(this).attr("userName");
            params.password=$(this).attr("password");
            params.hospitalId = $(this).parent().attr("hospitalId");
            params.id = $(this).parent().attr("fileId");
            params.ip = $(this).attr("ip");
            params.port = $(this).attr("port");
            params.type="1";
            params.filePath=$(this).parent().attr("filepath");
            params.fileName=$(this).parent().attr("filename");
            params.confId= $(this).attr("confid");
            params.codecId=$(this).attr("codecid");
            base.confirm({
                width:250,
                text:"确认是否删除编解码器侧录像文件？一旦删除录像文件将不可恢复。",
                confirmCallback:function(){
                    $.ajax({
                        url:$.base+"/medT100/deleteMedT100File",
                        contentType:"application/json",
                        data:JSON.stringify(params),
                        type:"post",
                        success:function (result) {
                            if(result.status=="1"){
                                base.requestTip().success("删除成功");
                                grid.ajax.reload();
                            }else{
                                base.requestTip().error(result.tips);
                            }
                        }
                    })
                }
            });
        })
    }
    //云删除
    function cloudDel(){
        $(".cloudDel").off().on("click",function(){
            var params={};
            params.filename=$(this).parent().attr("filename");
            params.bucket=$(this).parent().attr("bucket");
            params.fileId=$(this).parent().attr("fileId");
            base.confirm({
                width:250,
                text:"确认是否删除天翼云侧录像文件？一旦删除录像文件将不可恢复。",
                confirmCallback:function(){
                    $.ajax({
                        url:$.base+"/awsFile/deleteFile/",
                        contentType:"application/json",
                        type:"post",
                        data:JSON.stringify(params),
                        beforeSend:function () {
                            $(".loadingDiv").show();
                        },
                        success:function(result){
                            if(result.status=="1"){
                                base.requestTip().success("删除成功");
                                grid.ajax.reload();
                            }else{
                                base.requestTip().error(result.tips);
                            }
                        },
                        complete:function(){
                            $(".loadingDiv").hide()
                        }
                    })
                }
            });
        })
    }
    //搜索
    function search(){
        $(".btn-search").off().on("click",function(){
                var start = $("#liveStartTime").val();
                var end =$("#liveEndTime").val();
                if(start>end){
                    base.confirm({
                        label:"提示",
                        text:"<div style='text-align:center;font-size:13px;'>直播开始时间不能大于结束时间！</div>",
                        textAlign:'text-align:center'
                        //confirmCallback:function(){}
                    });
                }else{
                    grid.ajax.reload()
                }
        })
    }
    //重置
    function reset() {
        $("#resetBtn").off().on("click",function () {
            $("input").val("");
            $("select").val("");
        })
    }
    //设置滚动条
    function setScroll(){
        //middleContent高度
        $(".middleContent").css("overflow","hidden");
        var midHeight = $(".middleContent")[0].clientHeight;
        var searchBarHeight = $(".searchBar").height();
        var searchDivHeight = $("#searchDiv")[0].clientHeight;
        var tableHeight  = midHeight-searchBarHeight-searchDivHeight;
        $("#tLive").height(tableHeight-40);
        base.scroll({
            container:"#tLive"
        })
    }
    //模糊查询根据直播名称查表格
    //依据直播名称查询
    function SearchBtn(flag,hospital) {
        $(".fuzzySearchBtn").off().on("click",function(){
            //flag为true的时候表示医院登录，需要传医院的id
            grid.settings()[0].ajax.data=function (){
                var obj={};
                if(flag){
                   obj.hospital= hospital;
                }
                obj.pageNo=1;
                obj.pageSize=10;
                obj.param={"title":$("#searchLiveName").val()};
                return JSON.stringify(obj);
            };
            grid.ajax.reload();
        });
    }
    return {
        run:function(){
            loginUser();
            getOperateHospital();
            setDate()
        }
    }
});
