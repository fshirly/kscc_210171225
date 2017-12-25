
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
 request.setCharacterEncoding("UTF-8");
 String path = request.getContextPath();
%>
<style>
i:hover{
 cursor:pointer;
}
</style>
        <div class="middleContent">
         <ul id="myTab" class="nav nav-tabs">
         <li class="active">
            <a href="#reservation" data-toggle="tab">所有直播</a>
         </li>
         <li>
            <a href="#application" data-toggle="tab">我的申请</a>
         </li>
         <li>
            <a href="#invited" data-toggle="tab">我的受邀</a>
         </li>
         <li>
            <a href="#history" data-toggle="tab">历史记录</a>
         </li>
      </ul>
      <div id="myTabContent" class="tab-content">
             <div class="tab-pane fade in active" id="reservation">
                    <div id="myCarouselReservation" class="carousel slide">
					    <!-- 轮播（Carousel）指标 -->
					    <ol class="carousel-indicators" id="carouselCircleReservation">
					        
					    </ol>   
					    <!-- 轮播（Carousel）项目 -->
					    <div class="carousel-inner" id="innerReservation">
					       
					    </div>
					    <!-- 轮播（Carousel）导航 -->
					    <a class="carousel-control left" href="#myCarouselReservation" 
					        data-slide="prev">
					    </a>
					    <a class="carousel-control right" href="#myCarouselReservation" 
					        data-slide="next">
					    </a>
				    </div>
             </div>
             <div class="tab-pane fade" id="application">
			    <div id="liveApplication">
			        <div id="myCarouselApplication" class="carousel slide">
					    <!-- 轮播（Carousel）指标 -->
					    <ol class="carousel-indicators" id="carouselCircleApplication">
					        
					    </ol>   
					    <!-- 轮播（Carousel）项目 -->
					    <div class="carousel-inner" id="innerApplication">
					       
					    </div>
					    <!-- 轮播（Carousel）导航 -->
					    <a class="carousel-control left" href="#myCarouselApplication" 
					        data-slide="prev">
					    </a>
					    <a class="carousel-control right" href="#myCarouselApplication" 
					        data-slide="next">
					    </a>
				    </div>
			    </div>
             </div>
             <div class="tab-pane fade" id="invited">
			    <div id="liveInvited">
			        <div id="myCarouselInvited" class="carousel slide">
					    <!-- 轮播（Carousel）指标 -->
					    <ol class="carousel-indicators" id="carouselCircleInvited">
					        
					    </ol>   
					    <!-- 轮播（Carousel）项目 -->
					    <div class="carousel-inner" id="innerInvited">
					       
					    </div>
					    <!-- 轮播（Carousel）导航 -->
					    <a class="carousel-control left" href="#myCarouselInvited" 
					        data-slide="prev">
					    </a>
					    <a class="carousel-control right" href="#myCarouselInvited" 
					        data-slide="next">
					    </a>
			        </div>
			   </div>
             </div>
             <div class="tab-pane fade" id="history">
             	<form class="form-inline" id="searchFormIdHis">
		            <div class="clearfix mt-10">
			            <div class="form-group col-sm-3 col-md-3">
			                <label for="liveType">直播类型：</label>
			                <select id="liveType" name="liveType" class="form-control form-width" style="width: 50%;"> 
								<option value="1">我参与的直播</option>
								<option value="2">我申请的直播</option>
								<option value="3">我受邀的直播</option>
		                   </select>
			            </div>            
			            <div class="col-sm-3 col-md-3">
			                <button id="searchBtnHis" type="button" class="btn btn-primary btn-search">搜索</button>
			            	<button id="resetBtnHis" type="button"  class="btn btn-primary btn-warning" style="margin-left:20px;">重置</button>
			            </div>
		            </div>				
	            </form>
			    <div class="mt-10 tHistory" id="tHistory">
			    	<table id="tblHistory" class="table table-striped kscc-grid"></table>
			    </div>
             </div>
         </div>
         </div>
	<!--查看弹框（公用）-->
	<div class="modal fade" id="liveViewModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
	    <div class="modal-dialog modal-lg" style="width:800px;height:550px;">
	        <div class="modal-content">
	            <div class="modal-header">
	                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
	                <h4 class="modal-title">直播详情</h4>
	            </div>
	            <div class="modal-body" style="width:770px;height:450px;">
               	  <div class="col-xs-7 col-sm-7 col-md-7">
		            	<form class="form-inline" id="liveViewform" method="post" action="">
		            		<div class="clearfix mt-10">
					            <label class="text-right">直播名称：</label>
					            <label class="form-control form-label" id="liveNameView"></label>
					        </div>
					        <div class="clearfix mt-10">
					            <label class="text-right">直播科室：</label>
					            <label class="form-control form-label" id="departmentView"></label>
					        </div>
				            <div class="clearfix mt-10">
				                <label class="text-right">开始时间：</label>
				                <label class="form-control form-label" id="liveStartTimeView"></label>
				            </div>
				            <div class="clearfix mt-10">
				                <label class="text-right">结束时间：</label>
				                <label class="form-control form-label" id="liveEndTimeView"></label>
				            </div>
				            <div class="clearfix mt-10">
				                <label class="text-right">联系人：</label>
				                <label class="form-control form-label" id="linkManView"></label>
				            </div>
				            <div class="clearfix mt-10">
				                <label class="text-right">联系方式：</label>
				                <label class="form-control form-label" id="phoneView"></label>
				            </div>
				            <div class="clearfix mt-10">
					            <label class="text-right">联系邮箱：</label>
					            <label class="form-control form-label" id="emailView"></label>
					        </div>
				            <div class="clearfix mt-10">
					            <label class="text-right">医院网址：</label>
					            <label class="form-control form-label" id="hospitalURLView"></label>
					        </div>
				            <div class="clearfix mt-10">
					            <label class="text-right">直播简介：</label>
					            <label class="form-control form-label" id="liveIntroductionView"></label>
					        </div>
					        <div class="clearfix mt-10">
					            <label class="text-right" style="float:left;">附件：</label>
								<a id="a1" style="float:left;"></a>
					        </div>
				        </form>
			        </div>
			        <div class="col-xs-5 col-sm-5 col-md-5">
					   <div class="participantsList mb-10">参与方列表</div>
				       <!-- <input type="text" class="form-control" name="searchParticipantView" id="searchParticipantView" placeholder="搜索参与方"/>
				       <span class="iconfont fuzzySearchBtnModal" id="searchBtnView" style="top:43px;right:20px;color:#00479d;">&#xe60a;</span> -->
				       <div class="liveResults mt-10">
						   <ul id="liveParticipantView"></ul>
					   </div>
					</div>
	            </div>
	            <div class="modal-footer">
	                <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
	            </div>
	        </div><!-- /.modal-content -->
	    </div><!-- /.modal -->
	</div>
	<div style="display: none">
		<form id="fileupdown" action="<%=path %>/fileUpload/download" method="get">
			<table width="100%" border="0">
				<tr>
					<td>
						<input id="fileName_bak" name="fileName" value=""/>
						<input id="fileUrl_bak" name="fileUrl" value=""/>
					</td>

				</tr>
			</table>
		</form>
	</div>
	<script>
		require(["app/liveConference/liveConferenceHosUserApp"],function(page){
		    page.run();
		})
	</script>