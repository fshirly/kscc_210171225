<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
 request.setCharacterEncoding("UTF-8");
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>KSCC</title>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/lib/bootstrap-3.3.5/css/bootstrap.min.css" type="text/css" />
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/lib/bootstrap-3.3.5/css/bootstrap-responsive.css" type="text/css" />
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/lib/jquery.dataTables.css" type="text/css" />
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/lib/dataTables.bootstrap.css" type="text/css" />
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/lib/zTreeStyle.css" type="text/css" />
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/lib/iconfont.css" type="text/css" />
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/font-awesome.min.css" type="text/css" />
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/lib/jquery.mCustomScrollbar.min.css" type="text/css" />
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/lib/autoSelect.css" type="text/css" />
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/pages/kscc.css" type="text/css" />
<script type="text/javascript" charset="utf-8" src="${pageContext.request.contextPath}/js/lib/require.js"></script>
<script type="text/javascript" charset="utf-8" src="${pageContext.request.contextPath}/js/lib/config.js"></script>
</head>
<body class="indexBody">
	<div class="loadingDiv" style="position:absolute;display:none;width:100%;height:100%;z-index:99;background:rgba(0,0,0,.2);">
		<div style="position:absolute;top:50%;left:50%;margin:-25px 0  0 -25px;width: 60px;height:60px;background:url(${pageContext.request.contextPath}/images/pages/loading.gif) no-repeat;background-size: cover;"></div>
	</div>
    <input type="hidden" id="liveIdEdit" name="liveIdEdit"/>
    <input type="hidden" id="indexEdit" name="indexEdit"/>
    <input type="hidden" id="siteEdit" name="siteEdit"/>
	<input type="hidden" id="createIdEdit" name="createIdEdit"/>
	<input type="hidden" id="liveIdControlDetail" name="liveIdControlDetail"/>
	<input type="hidden" id="roleName" name="roleName"/>
	<input type="hidden" id="hospitalId" name="hospitalId"/>
	
	<div class="header" >
		 <nav class="navbar" role="navigation">
		    <div class="container-fluid">
			    <div class="logoImg">
			         <img src="${pageContext.request.contextPath}/images/pages/karlLogo.png" alt="卡尔Logo" />
			    </div>
			    <div class="navLi"> 
			        <ul class="nav navbar-nav" id="topLi">
					</ul>
					<div class="userHeader">
					    <span id="userName"></span>
					    <!-- <span class="headerLogin"><button class="btn quit"><i class="iconfont" style="font-weight:800;color:#00479d;">&#xe668;</i></button></span> -->
					    <span class="headerLogin"><button class="btn quit">退出</button></span>
					</div>
			    </div>
		    </div>
		</nav>
	</div>
	<div class="middle">
	     <div class="middleContent carouselHome">
				  <div id="myCarouselHome" class="carousel slide">
				    <div class="carousel-inner">
				    </div>
				   </div>
	        </div>
	</div>
	<div class="bottom">
	   <ul class="nav" id="bottomLi">
	   </ul>
	</div>
</body>
<script>
require(["app/indexApp"],function(page){
    page.run();
})
</script>
</html>