<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
 request.setCharacterEncoding("UTF-8");
%>
<style>
.dataTables_wrapper .dataTables_paginate .paginate_button{
    padding:0px!important;
}
#tblRecord_paginate{
   font-size:10px!important;
}
.menuAdmin .iconfont{
  width:22px;
  display:block;
  margin:0 auto;
  }
.btn.focus, .btn:focus, .btn:hover {
    color: none !important;
}
#tblRecord tr td{
	/*text-align: left;*/
}
</style>
		    <div class="middleContent">
				<div class="row firstRow">
		            <div class="form-group col-sm-4 col-md-4 text-center clearfix">
						<div class="totalParticipant pull-left" style="display:inline-block"></div>
		                <span id="liveName" style="display:block;margin-left:60px;font-size:18px;font-weight:600;white-space: nowrap;text-overflow: ellipsis;overflow: hidden"></span>
		            </div>
		            <div class="form-group col-sm-4 col-md-4">
		                <label class="text-right">开始时间：</label>
		                <label id="liveStartTime" style="width:60%;"></label>
		            </div>
		            <div class="form-group col-sm-4 col-md-4">
		                <label class="text-right">结束时间：</label>
		                <label id="liveEndTime" style="width:60%;"></label>
		            </div>
			    </div>
			    <div class="row secondRow">
			         <div class="col-sm-4 col-md-4 controlBanner">
			            <div id="liveCarousel" class="carousel slide" style="height:100%;">
						    <!-- 轮播（Carousel）指标 -->
						    <ol class="carousel-indicators carouselCircleDetail" id="liveCarouselCircle">
						        
						    </ol>   
						    <!-- 轮播（Carousel）项目 -->
						    <div class="carousel-inner" style="height:100%;">
						       
						    </div>
						    <!-- 轮播（Carousel）导航 -->
						    <a class="carousel-control left" href="#liveCarousel"
						        data-slide="prev">
						    </a>
						    <a class="carousel-control right" href="#liveCarousel"
						        data-slide="next">
						    </a>
					    </div>
			         </div>
			         <div class="col-sm-8 col-md-8" style="width:63%;height:100%;">
			         <input type="hidden" id="mtid" name="mtid"/>
			         <input type="hidden" id="confId" name="confId"/>
			         <input type="hidden" id="speakerMain" name="speakerMain"/>
			            <div class="menuAdmin">
			               <!--  <button class="btn" ><i class="iconfont" title="主页">&#xe603;</i></button>
				            <button class="btn allShutIcon"></button>
				            <button class="btn allSilenIcon"></button>
				            <button class="btn screenIcon" title="画面选看"><i class="iconfont">&#xe626;</i></button>
				            <button class="btn synthesisIcon" title="画面合成"><i class="iconfont">&#xe644;</i></button>
				            <button class="btn subtitleIcon" title="添加字幕"><i class="iconfont">&#xe60e;</i></button>
				            <button class="btn applySpeak" title="申请发言"><i class="iconfont">&#xe604;</i></button>
				            <button class="btn applyExtendTime" title="申请延时"><i class="iconfont">&#xe60c;</i></button>
				            <button class="btn delayIcon" title="直播延时"><i class="iconfont">&#xe501;</i></button>
			                <button class="btn closeVideo"  title="关闭录像"><i class="iconfont">&#xe602;</i></button>
			                <button class="btn recordIcon" title="会场记录"><i class="iconfont">&#xe619;</i></button>
				            <button class="btn outLive" title="退出直播"><i class="iconfont" style="color:red;">&#xe605;</i></button> 
				            <button class="btn endLive" title="结束直播"><i class="iconfont" style="color:red;">&#xe61b;</i></button> -->
				        </div>
				        <div class="imageView">
				            <div class="subtitle disNone">
				                  <div class="form-group text-right">
								      <span class="addSubtitlePar"><i class="iconfont subtitleSubmit" title="提交" style="font-size:28px;">&#xe648;</i></span>
				                      <span style="margin-left:15px;"><i class="iconfont subtitleCancel" title="取消" style="font-size:28px;">&#xe99c;</i></span>
								  </div>
								  <div class="form-group">
								     <form id="subtitleForm">
								         <label class="text-right" for="subtitleContent" style="float:left;width:164px;">字幕内容:</label>
								         <textarea class="form-control" id="subtitleContent" name="subtitleContent" type="text" value="" placeholder="最多30个汉字" role="{required:true,zhLength:30}" ></textarea>
								     </form>
								  </div>
				            </div>
				            <div class="item synthesis disNone" type="three" style="position:relative;">
				               <div class="form-group text-right" style="position:absolute;top:0px;right:0px;">
							      <span><i class="iconfont synthesisSubmit" title="合成" style="font-size:28px;">&#xe648;</i></span>
			                      <span style="margin-left:15px;"><i class="iconfont synthesisCancel" title="取消画面合成" style="font-size:28px;">&#xe99c;</i></span>
							   </div>
						       <div class="synthesisRegion">
								   <div class="col-sm-3 col-md-3 dragNum">
									   <div>画面合成模式：</div>
								      <ul class="dragNumUl">
								     	<li att="2" class="dragNumLi"><img src="${pageContext.request.contextPath}/images/pages/synthesisTwo.png"/></li>
										<li att="3"><img src="${pageContext.request.contextPath}/images/pages/synthesisThree.png"/></li>
										<li att="4"><img src="${pageContext.request.contextPath}/images/pages/synthesisFour.png"/></li>
									  </ul>
								   </div>
								   <div>
					                   <div class="col-sm-9 col-md-9 dragBoxDiv dragBoxDiv_2">
										  <div class="dragBox"></div>
										  <div class="dragBox"></div>
									   </div>
									   <div class="col-sm-9 col-md-9 dragBoxDiv dragBoxDiv_3 disNone">
										  <div class="dragBox"></div>
										  <div class="dragBox"></div>
										  <div class="dragBox"></div> 
									   </div>
									   <div class="col-sm-9 col-md-9 dragBoxDiv dragBoxDiv_4 disNone">
										  <div class="dragBox"></div>
										  <div class="dragBox"></div>
										  <div class="dragBox"></div>
										  <div class="dragBox"></div> 
									   </div>
								   </div>
							   </div>
				            </div>
				            <div class="item screen disNone" type="one" style="position:relative;">
					             <div class="form-group text-right" style="position:absolute;top:0px;right:0px;width:100%;">
								     <span class="addSelectPar"><i class="iconfont screenSubmit" title="提交" style="font-size:28px;">&#xe648;</i></span>
				                     <span style="margin-left:15px;"><i class="iconfont screenCancel" title="取消画面选看" style="font-size:28px;">&#xe99c;</i></span>
								 </div>
							     <div class="dragBox dragBoxOne"></div>
				            </div>
				            <div class="colorSelect disNone">
				                  <div class="form-group text-right">
								      <span class="addColor"><i class="iconfont colorSubmit" title="提交" style="font-size:28px;">&#xe648;</i></span>
				                      <!-- <span style="margin-left:15px;"><i class="iconfont colorCancel" title="取消" style="font-size:28px;">&#xe99c;</i></span> -->
								  </div>
								  <div class="colorDivs">
									  <div class="form-group colorDiv">
									      <label class="text-left" for="subtitleContent" style="width:150px;">请选择颜色:</label>
									  </div>
									  <div class="form-group colorDiv">      
									      <input type="radio" id="HDInput" name="radiobtn" value="2" style="margin-left:5px;">
									      <label for="HDInput">HD</label>
									  </div>
									  <div class="form-group colorDiv">
									      <input type="radio" id="SPInput" name="radiobtn" value="3" style="margin-left:5px;">
										  <label for="SPInput">Spies</label>
									  </div>
								  </div>
				            </div>
				            <div class="videoMani disNone">
				                  <div class="form-group text-right">
								      <span class="addVideo"><i class="iconfont videoSubmit" title="提交" style="font-size:28px;">&#xe648;</i></span>
				                      <!-- <span style="margin-left:15px;"><i class="iconfont videoCancel" title="取消" style="font-size:28px;">&#xe99c;</i></span> -->
								  </div>
								  <div class="videoDivs">
									  <div class="form-group videoDiv">
									      <label class="text-left" for="subtitleContent" style="width:150px;">请选择录像状态:</label>
									  </div>
									  <div class="form-group videoDiv">      
									      <input type="radio" id="startInput" name="radiobtn" value="start" style="margin-left:5px;">
									      <label for="startInput">开启</label>
									  </div>
									  <div class="form-group videoDiv">
									      <input type="radio" id="stopInput" name="radiobtn" value="stop" style="margin-left:5px;">
										  <label for="stopInput">关闭</label>
									  </div>
								  </div>
				            </div>
				            <div class="delay disNone">
				                  <div class="form-group text-right">
								      <span><i class="iconfont delaySubmit" title="提交" style="font-size:28px;">&#xe648;</i></span>
				                      <span style="margin-left:15px;"><i class="iconfont delayCancel" title="取消" style="font-size:28px;">&#xe99c;</i></span>
								  </div>
								  <div class="clearfix" style="width:50%;margin: 0 auto">
									  <div class="form-group">
										  <label class="text-right" for="remainingTime" style="width:150px;">当前直播剩余时间:</label>
										  <label name="remainingTime" id ="remainingTime" style="margin-left: 30px"></label>
									  </div>
									  <div class="form-group">
										  <label class="text-right pull-left" for="subtitleContent" style="width:150px;">请选择直播延时时间:</label>
										  <div class="form-group delayDivs" style="display:inline-block;margin-left:30px;">
											  <input type="radio" id="thirtyMin" name="radiobtn" value="30" style="margin-left:5px;">
											  <label for="thirtyMin">30分钟</label></br>
											  <input type="radio" id="sixtyMin" name="radiobtn" value="60" style="margin-left:5px;">
											  <label for="sixtyMin">60分钟</label></br>
											  <input type="radio" id="sixtyMinMore" name="radiobtn" value="120" style="margin-left:5px;">
											  <label for="sixtyMinMore">120分钟</label></br>
											  <div>
												  <input type="radio" id="custom" name="radiobtn" value="0" style="margin-left:5px;">
												  <label for="custom" style="width:50px;">自定义</label>
												  <input class="form-control" id="customMin" type="text" value="" style="display:inline-block;width:80px;">  分钟
												  <span style="color:red;font-size:12px;" id="tipDelay">请输入正整数，最小10，最大180</span>
											  </div>
										  </div>
									  </div>

								  </div>
				            </div>
				            <div class="record disNone">
				               <table id="tblRecord" class="table table-striped kscc-grid"></table>
				            </div>
			            </div>
			         </div>
		         </div>
		    </div>
	<!--选择参与方弹框-->
	<div class="modal fade" id="selectModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
					<h4 class="modal-title">选择参与方</h4>
				</div>
				<div class="modal-body" style="height:400px;">
					<div class="selectLeft" style="position:relative;">
						<input type="text" class="form-control mt-10 selectInput" name="searchParticipantModal" id="searchParticipantModal" placeholder="搜索参与方"/>
						<span class="iconfont" id="searchBtnModel" title="搜索">&#xe60a;</span>
						<div style="height:22px;line-height:22px;font-size:12px;color:#333;padding:3px;">医院列表</div>
						<div class="zTreeDemoBackground">
							<ul id="treeDemo1" class="ztree">
	
							</ul>
						</div>
					</div>
					<div class="selectMiddle">
						<button type="button" id="LTRSingle">></button>
						<button type="button" id="RTLSingle"> < </button>
					</div>
					<div class="selectRight">
						<div style="border-bottom:1px solid #ccc;">已选<span id="selectNum"></span>位</div>
						<ul id="selectResult"></ul>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary selectBtn">确定</button>
					<button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
				</div>
			</div><!-- /.modal-content -->
		</div><!-- /.modal -->
	</div>
	<script>
		require(["app/liveControl/liveControlDetailApp"],function(page){
		    page.run();
		})
	</script>