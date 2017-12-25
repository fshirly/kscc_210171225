<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
    request.setCharacterEncoding("UTF-8");
    String path = request.getContextPath();
%>
	<link href="${pageContext.request.contextPath}/css/lib/fullcalendar.min.css" rel="stylesheet" type="text/css">
	<link href="${pageContext.request.contextPath}/css/lib/fullcalendar.print.min.css" rel="stylesheet" type="text/css" media='print'>
<div class="middleContent heightFull" >
     <div class="col-xs-2 col-sm-2 col-md-2" style="overflow:auto;">
         <input type="text" class="form-control selectInput" name="searchParticipantModal" id="searchParticipantModal" placeholder="搜索医院方" />
		 <span class="iconfont" id="searchBtnModel" title="搜索"  style="top:5px;right:15px;">&#xe60a;</span>
         <div class="calList">医院列表</div>
         <div class="zTreeDemoBackground"  style="height:375px;overflow-x:hidden;overflow-y:auto;">
             <ul id="treeDemo2" class="ztree"></ul>
         </div>
     </div>
     <div class="col-xs-10 col-sm-10 col-md-10 calDiv" >
         <div id="resourceCal"></div>
     </div>
</div>
<div style="display: none">
    <form id="fileupdown" action="<%=path %>/fileUpload/download" method="post">
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
require(["app/resourceCalendar/resourceCalendarApp"],function(page){
    page.run();
})
</script>