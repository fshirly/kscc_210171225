<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
	request.setCharacterEncoding("UTF-8");
%>
<%--style:IE浏览在输入字的时候，输入框默认带个叉叉，选择时间也会。下面代码是去掉叉叉--%>
<style>
	input::-ms-clear{display:none;}
	.text{position:relative;height:32px; width:200px;}
	.text input{float:left;;height:20px;line-height:20px; width:195px;margin:0;padding:5px 0 5px 5px; border:solid 1px #ccc;}
	.text span{position:absolute;right:0; line-height:32px;height:32px; cursor:pointer;}
</style>
      <div class="middleContent">
		  <form role="form" id="createLiveForm" method="post" enctype="multipart/form-data" action="">
		   <div class="clearfix" style="position:relative">
			  <div  style="width: 400px;float:left;position:absolute;left:0;z-index:999">
			   <div class="participantsList mb-10 partiFirst text-left" style="width: 303px;"><span>步骤1：</span>基本信息</div>
				<input type="hidden" name="searchParticipant" id="searchParticipant">
					<div class="form-group">
						<label class="text-center" for="liveName">直播名称:</label>
						<input type="text" class="form-control form-width" name="liveName"  id="liveName" placeholder="请输入名称" role="{required:true,zhLength:50}" ><dfn>*</dfn>
						<div style="color:red;padding-left:120px;font-size:12px;display:none;" id="tipMessage5">名称中不可包含特殊字符</div>
					</div>
					<div class="form-group">
						<label class="text-center" for="department">直播科室:</label>
						<select class="form-control form-width" name="department" id ="department" role="{required:true}">
						</select><dfn>*</dfn>
					</div>
					<div class="form-group">
						<label class="text-center" for="startTime">开始时间:</label>
						<input readonly class="form-control form-width date" id="startTime" name="startTime" value="" role="{required:true}"><dfn>*</dfn>
					</div>
					<div class="form-group">
						<label class="text-center" for="endTime">结束时间:</label>
						<input readonly class="form-control form-width date" id="endTime" name="endTime" value="" role="{required:true}"><dfn>*</dfn>
						<div style="color:red;padding-left:120px;font-size:12px;display:none;" id="tipMessage4">开始时间必须小于结束时间</div>
					</div>
					<div class="form-group">
						<label class="text-center" for="linkMan" style="text-align:center;padding-left:13px;">联系人:</label>
						<input type="text" class="form-control form-width" name="linkMan" id ="linkMan"  value="" role="{filterCN:true,zhLength:20}" />
					</div>
					<div class="form-group">
						<label class="text-center" for="phone">联系方式:</label>
						<input type="text" class="form-control form-width" name="phone" id ="phone"  placeholder="请填写手机或座机号码" value="" role="{required:true}" /><dfn>*</dfn>
						<div style="color:red;padding-left:120px;font-size:12px;display:none;" id="tipMessage1">请输入正确的电话，如：021-87888822或13151090613</div>
					</div>
					<div class="form-group">
						<label class="text-center" for="email">联系邮箱:</label>
						<input type="text" class="form-control form-width" name="email" id ="email" value="" role="{email:true}"/>
					</div>
					<div class="form-group">
						<label class="text-center" for="hospitalURL">医院网址:</label>
						<input type="text" class="form-control form-width" name="hospitalURL" id ="hospitalURL" value="" />
					</div>
				</div>
			  <div style="position:relative;float:left;width:100%;padding: 0 443px 0 400px;">
				 <div class="participantsList mb-10 partiSecond" style="max-width: 650px;"><span>步骤2：</span>参与方医院</div>
				  <div style="position:relative;max-width: 650px;margin:0 auto">
					 <input type="text" value="" class="form-control mb-10" id="searchBox" placeholder="搜索参与方"/>
					 <span class="iconfont" id="searchBtnMain" style="right:8%;top:3px">&#xe60a;</span><a type="button" class="addParticipant text-center" title="添加参与方">
					  <i class="iconfont" style="color:#00479d;font-size:22px;top:3px;right:8%">&#xe81f;</i></a>
				 </div>
				 <div class="liveResults" style="max-width:650px;margin:0 auto">
					 <ul id="liveParticipant"></ul>
				 </div>
			  </div>
			  <div id="addImgDiv" style="width:400px;float:right;position:absolute;right:0;z-index:999">
				 <div class="text-center">
					 <div class="participantsList mb-10 partiThird  text-left"><span>步骤3：</span>直播简介</div>
					 <div class="form-group" >
						 <label class="text-center liveIntroTxt" for="liveIntroduction" style="display:inline-block;vertical-align:top;width:100px">直播简介:</label>
						 <textarea class="form-control" name="liveIntroduction" id ="liveIntroduction" value="" placeholder="最多300个汉字" role="{zhLength:300}" ></textarea>
					 </div>
					 <div class="form-group" id="enclosureInput">
						 <label class="text-center enclosureNew" for="enclosure">上传简介:</label>
						 <label for="file" class="btn btn-primary inputLabel" >上传简介</label>
						 <input type="file" class="form-control form-width" name="file" id ="file"  accept=".xls,.xlsx,.doc,.docx,.txt,.pdf"/>
						 <!-- <button class="btn btn-primary" id="fileBtn" onclick="return false;">上传</button> -->
						 <div style="padding-left:120px;font-size:10px;" class="fileNameDiv"></div>
						 <div style="padding-left:120px;font-size:10px;color:#c0c9d8;">系统支持.xls,.xlsx,.doc,.docx,.txt,.pdf文件，最大10M</div>
					 </div>
				 </div>
			  </div>
		  </div>
		  <div class="formButton">
			  <button id="submitBtn" type="button" class="btn btn-primary" onclick="return false;">提交</button>
			  <button id="resetBtn" type="button" class="btn btn-primary" onclick="return false;">重置</button>
		  </div>
	 </form>
    </div>

<script>
    require(["app/createLiveBroadcast/createLiveBroadcastApp"],function(page){
        page.run();
    })
</script>