<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
    request.setCharacterEncoding("UTF-8");
%>
<style>
    .table-striped>tbody>tr{
        background: #fff !important;
    }
</style>
<div class="middleContent" style="height:100%;">
    <div class="searchBar">
        <div>
            <div>
                <input type="text" class="form-control" name="searchLiveName" id="searchLiveName" placeholder="请输入直播名称关键字" style="width:250px;"/>
                <span class="iconfont fuzzySearchBtn">&#xe60a;</span>
            </div>
            <a class="highSearch">高级搜索</a>
        </div>
    </div>
    <div id="searchDiv" style="clear:both;">
        <form class="form-inline" id="searchFormId">
            <div class="row clearfix mt-10">
                <div class="form-group col-sm-3 col-md-3">
                    <label class="text-right" for="liveName">直播名称：</label>
                    <input id="liveName" name="liveName" class="form-control form-width" style="width: 50%;"/>
                </div>
                <div class="col-sm-6 col-md-6">
                    <label class="text-right" for="liveStartTime">直播开始时间：</label>
                    <div class="input-group" style="width:30%">
                        <input readonly class="form-control date" id="liveStartTime" name="liveStartTime" value="" >
                    </div>
                    <span>-</span>
                    <div class="input-group" style="width:30%">
                        <input readonly class="form-control date"  id="liveEndTime" name="liveEndTime" value="" >
                    </div>
                </div>
            </div>
            <div class="row clearfix mt-10">
                <div class="form-group col-sm-3 col-md-3">
                    <label class="text-right" for="operativeHospital">手术医院：</label>
                    <select  class="form-control form-width" name="operativeHospital"  id="operativeHospital" style="width: 50%;">

                    </select>
                </div>
                <div class="form-group col-sm-3 col-md-3">
                    <label class="text-right" for="videoStatus">视频上传状态：</label>
                    <select id="videoStatus" name="videoStatus" class="form-control form-width" style="width: 50%;">
                        <option value="">&nbsp;</option>
                        <option value="0">已上传</option>
                        <option value="1">未上传</option>
                    </select>
                </div>
                <div class="col-sm-3 col-md-3 approvalBtn">
                    <button id="searchBtn" type="button" class="btn btn-primary btn-search">搜索</button>
                    <button id="resetBtn" type="button"  class="btn btn-primary btn-warning" style="margin-left:20px;">重置</button>
                </div>
            </div>
        </form>
    </div>
    <div class="mt-10" id="tLive" style="clear:both;">
        <table id="tblLiveApproval" class="table table-striped kscc-grid" style="display: none"></table>
        <table id="userTableLive" class="table table-striped kscc-grid"></table>
    </div>
</div>
<script>
    var grid=null;
    require(["app/videoManage/videoTable"],function(page){
        page.run();
    })
</script>