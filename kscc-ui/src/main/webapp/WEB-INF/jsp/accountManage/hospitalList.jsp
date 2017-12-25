<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
    request.setCharacterEncoding("UTF-8");
%>
<%
    Object id = request.getAttribute("id");
%>
<style>
	.form-width1{
		display: inline-block;
		width: 290px !important;
	}
</style>
<div class="hospitalListDiv">
    <input type="hidden" id="idstr" value="<%=id %>"/>
    <div class="clearfix">
        <button class="btn btn-primary hospitalAdd">新增</button>
    </div>

    <div id="tHospital">
        <table id="tblHospital" class="table table-striped kscc-grid"></table>
    </div>
</div>

<div class="modal fade" id="addHosModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" >
    <div class="modal-dialog modal-md">
        <div class="modal-content" style="width:650px;">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title">新增医院</h4>
            </div>
            <div class="modal-body addHosContent">
				<div class="orderDiv text-center">
				    <span class="orderNum orderNumOne">
				      <span class="orderOne">1</span>
				    </span>
				    <span class="line lineSecond"></span>
				    <span class="orderNum orderNumTwo">
				      <span class="orderTwo">2</span>
				    </span>
				    <span class="line lineThird"></span>
				    <span class="orderNum orderNumThree">
				      <span class="orderThree">3</span>
				    </span>
				</div>
				<div class="orderDiv text-center">
				    <span class="orderCon">医院信息</span>
				    <span class="orderCon">管理员信息</span>
				    <span class="orderCon">编解码器信息</span>
				</div>
				<div class="hospitalAll">
				  <div class="hosAdd active">
                    <form id="hosAddForm">
	                    <div class="clearfix mt-10">
	                        <label class="text-right">医院名称：</label>
	                        <input class="form-control form-width1" id="hospitalNameAdd" role="{required:true,filterCN:true,zhLength:60}"><dfn>*</dfn>
	                    </div>
	                    <div class="clearfix mt-10">
	                        <label class="text-right">网站链接：</label>
	                        <input class="form-control form-width1" id="hospitalUrlAdd" role="{zhLength:100}">
	                    </div>
	                    <div class="clearfix mt-10">
				            <label class="text-right belongCity">医院地址：</label>
				            <div class="areaSelect areaSelectAdd" role="{required:true}"></div><dfn style="height:30px;line-height:30px;">*</dfn>
				            <div style="color:red;padding-left:120px;font-size:14px;display:none;" id="tipMessage">必填项</div>
				        </div>
						<div class="clearfix mt-10">
							<label class="text-right belongCity">详细地址：</label>
							<input class="form-control form-width1" id="adressinput" style="margin-left:5px;" role="{zhLength:300}">
						</div>
						<div class="clearfix mt-10">
							<label class="text-right" style="margin-top:5px;vertical-align:top">医院简介：</label>
							<textarea class="form-control form-width1" id="hospitalContentAdd" role="{zhLength:300}"></textarea>
						</div>
                    </form>
                </div>
                <div class="hosAdminAdd">
                   <form id="hosAdminAddForm">
	                   <div class="clearfix mt-10">
	                        <label class="text-right">登录名称：</label>
	                        <input class="form-control form-width" id="loginNameAdd" role="{required:true,zhLength:20}"><dfn>*</dfn>
	                    </div>
	                    <div class="clearfix mt-10">
	                        <label class="text-right">登录密码：</label>
	                        <input class="form-control form-width" type="password" id="passwordAdd" role="{required:true,password:true}"><dfn>*</dfn>
	                        <div style="padding-left:124px;font-size:10px;color:#c0c9d8;">字母和数字组合的6-18位字符</div>
	                    </div>
	                    <div class="clearfix mt-10">
	                        <label class="text-right">确认密码：</label>
	                        <input class="form-control form-width" type="password" id="confirmPasswordAdd" role="{required:true,password:true}"><dfn>*</dfn>
	                        <div style="padding-left:124px;font-size:10px;color:#c0c9d8;">字母和数字组合的6-18位字符</div>
	                    </div>
	                    <div class="clearfix mt-10">
	                        <label class="text-right">姓名：</label>
	                        <input class="form-control form-width" id="userNameHosAdd" role="{filterCN:true}" >
	                    </div>
	                    <div class="clearfix mt-10">
	                        <label class="text-right">联系电话：</label>
	                        <input class="form-control form-width" id="telephoneAdd" >
	                    </div>
	                    <div class="clearfix mt-10">
	                        <label class="text-right">邮箱：</label>
	                        <input class="form-control form-width" id="emailAdd" role="{email:true}">
	                    </div>
                    </form>
                </div>
                <div class="codecAdd">
                    <form id="codecAddForm">
				        <div class="clearfix mt-10">
				            <label class="text-right">归属科室：</label>
							<select class="form-control form-width" name="departmentIdAdd" id ="departmentIdAdd" role="{required:true}"></select><dfn>*</dfn>
				        </div>
	                    <div class="clearfix mt-10">
				            <label class="text-right">编解码器名称：</label>
				            <input class="form-control form-width" id="ownershipAdd" role="{required:true,zhLength:20}"><dfn>*</dfn>
				        </div>
				        <div class="clearfix mt-10">
				            <label class="text-right">ftp端口号：</label>
				            <input class="form-control form-width" id="ftpAdd" role="{required:true,port:true}"><dfn>*</dfn>
				        </div>
				        <div class="clearfix mt-10">
				            <label class="text-right">新视通账号：</label>
				            <input class="form-control form-width" id="accountAdd" role="{required:true,number:true,zhLength:40}"><dfn>*</dfn>
				        </div>
			            <div class="clearfix mt-10">
			                <label class="text-right">IP地址：</label>
			                <input class="form-control form-width" id="IPAddressAdd" role="{required:true,ip:true}"><dfn>*</dfn>
			            </div>
			            <div class="clearfix mt-10">
			                <label class="text-right">端口号：</label>
			                <input class="form-control form-width" id="portAdd" role="{required:true,port:true}"><dfn>*</dfn>
			            </div>
			            <div class="clearfix mt-10">
			                <label class="text-right">编解码器用户名：</label>
			                <input class="form-control form-width" id="userNameAdd" role="{required:true,zhLength:20}"><dfn>*</dfn>
			            </div>
			            <div class="clearfix mt-10">
			                <label class="text-right">编解码器密码：</label>
			                <input class="form-control form-width" id="userPasswordAdd" role="{required:true,zhLength:50}"><dfn>*</dfn>
			            </div>
			            <div class="clearfix mt-10">
			                <label class="text-right">安装位置：</label>
			                <input class="form-control form-width" id="remarksAdd" role="{zhLength:100}">
			            </div>
			        </form>
                </div>
			  </div>
            </div>
            <div class="modal-footer" id="addHosModalBtn">
                <!-- <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
                <button type="button" class="btn btn-primary saveAddHospital">确定</button> -->
                <button type="button" class="btn btn-primary hosNext">下一步</button>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal -->
</div>
<!-- 编辑医院 -->
<div class="modal fade" id="editHosModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="top:100px!important;">
    <div class="modal-dialog modal-md">
        <div class="modal-content" style="width:650px;">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title">编辑</h4>
            </div>
            <div class="modal-body pl-p15">
                <form id="hosFormEdit" method="post" action="">
                    <div class="clearfix mt-10">
                        <label class="text-right">医院名称：</label>
                        <input class="form-control form-width1" id="hospitalNameEdit" role="{required:true,filterCN:true,zhLength:60}"><dfn>*</dfn>
                    </div>
                    <div class="clearfix mt-10">
                        <label class="text-right">网站链接：</label>
                        <input class="form-control form-width1" id="hospitalUrlEdit" role="{zhLength:100}">
                    </div>
                    <div class="clearfix mt-10">
			            <label class="text-right belongCity">医院地址：</label>
			            <div class="areaSelect areaSelectEdit" role="{required:true}"></div><dfn style="height:30px;line-height:30px;">*</dfn>
			            <div style="color:red;padding-left:120px;font-size:14px;display:none;" id="tipMessage2">必填项</div>
			        </div>
					<div class="clearfix mt-10">
						<label class="text-right belongCity">详细地址：</label>
						<input class="form-control form-width1" id="detailAdress" style="margin-left:5px;"  role="{zhLength:300}">
					</div>
					<div class="clearfix mt-10">
						<label class="text-right" style="margin-top:5px;vertical-align:top">医院简介：</label>
						<textarea class="form-control form-width1" id="hospitalContentEdit"  role="{zhLength:300}"></textarea>
					</div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
                <button type="button" class="btn btn-primary saveEdit">确定</button>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal -->
</div>
<script>
    require(["app/accountManage/hospitalList"],function(page){
        page.run();
    })
</script>
