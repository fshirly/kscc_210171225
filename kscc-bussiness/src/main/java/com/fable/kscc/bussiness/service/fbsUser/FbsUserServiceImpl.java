package com.fable.kscc.bussiness.service.fbsUser;

import java.util.HashMap;
import java.util.Map;

import com.fable.kscc.api.model.doctor.FbsDoctor;
import com.fable.kscc.api.model.hospitalInformation.FbsHospitalInformation;
import com.fable.kscc.api.model.page.PageRequest;
import com.fable.kscc.api.model.page.PageResponse;
import com.fable.kscc.api.model.page.ResultKit;
import com.fable.kscc.api.model.page.ServiceResponse;
import com.fable.kscc.api.model.userRole.FbsUserRole;
import com.fable.kscc.bussiness.mapper.fbmenu.FbMenuMapper;
import com.fable.kscc.bussiness.mapper.fbsDoctor.FbsDoctorMapper;
import com.fable.kscc.bussiness.mapper.fbuserrole.FabUserRoleMapper;
import com.fable.kscc.bussiness.mapper.hospitalInformation.HospitalInformationMapper;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import com.fable.kscc.api.exception.BussinessException;
import com.fable.kscc.api.model.user.FbsUser;
import com.fable.kscc.api.utils.MD5Encrypt;
import com.fable.kscc.bussiness.mapper.fbsUser.FbsUserMapper;
import com.fable.kscc.bussiness.mapper.fbsrole.FbsRoleMapper;

@Service
public class FbsUserServiceImpl implements FbsUserService {
	@Autowired
	private FbsUserMapper fbsUserMapper;
	@Autowired
	private FbsDoctorMapper fbsDoctorMapper;
	@Autowired
	private FbsRoleMapper fbsRoleMapper;
	@Autowired
	private FabUserRoleMapper fabUserRoleMapper;
	@Autowired
	private HospitalInformationMapper hospitalInformationMapper;
	@Autowired
	private FbMenuMapper fbMenuMapper;
	@Override
	public ServiceResponse getUser(FbsUser user) {
		FbsUser userBean = null;
		try {
			userBean = fbsUserMapper.queryFbUser(user);
		} catch (Exception e) {
			e.printStackTrace();
			return ResultKit.fail("获取用户信息失败");
		}
		return ResultKit.serviceResponse(userBean);
	}

	/**
	 * 查询全部用户分页列表
	 */
	@Override
	public PageResponse<FbsUser> findAllPageUserList(PageRequest<FbsUser> pageRequest) {
		FbsUser map=pageRequest.getParam();
		Page<FbsUser> result = PageHelper.startPage(pageRequest.getPageNo(), pageRequest.getPageSize());
		fbsUserMapper.findAllPageUserList(map);
		return PageResponse.wrap(result);
	}

	@Override
	@Transactional(propagation= Propagation.REQUIRED)
	public int updateUser(Map<String,Object> params) {
		String isModify = params.get("isModify").toString();
		String pass = "";
		if(fbsUserMapper.searchUserByLoginName(params)>0){
			return 0;//判断登陆名是否存在
		}
		FbsUser user = fbsUserMapper.userByLoginName(params);//修改界面带过去的密码是加密后的
		if ("1".equals(isModify)){
			if(!user.getPassword().equals(MD5Encrypt.encode(params.get("password").toString()))){//密码正确
				params.put("password",user.getPassword());
				return 0;
			}else{
				if("".equals(params.get("newPassword").toString())){
					pass = MD5Encrypt.encode(params.get("password").toString());
					params.put("password",pass);
				}else{
					pass = MD5Encrypt.encode(params.get("newPassword").toString());//页面密码发生改变，则对最新密码进行加密录入数据库
					params.put("password",pass);
				}
			}
			return fbsUserMapper.updateFbUser(params);
		}else{
			return fbsUserMapper.updateFbUser(params);
		}

	}

	@Override
	@Transactional(propagation= Propagation.REQUIRED)
	public int updateHostUser(Map<String,Object> params) {
		String hospitalId = params.get("hospitalId").toString();
		String pass = "";
		if(fbsUserMapper.searchUserByLoginName(params)>0){
			return 0;//判断登陆名是否存在
		}
		FbsUser user = fbsUserMapper.userByHostLoginName(params);//修改界面带过去的密码是加密后的
		if ("0".equals(hospitalId)){//管理员
			return fbsUserMapper.updateFbUser(params);
		}else{
			if(!user.getPassword().equals(MD5Encrypt.encode(params.get("password").toString()))){//密码正确
				params.put("password",user.getPassword());
				return 0;
			}else{
				pass = MD5Encrypt.encode(params.get("newPassword").toString());//页面密码发生改变，则对最新密码进行加密录入数据库
				params.put("password",pass);
			}
			return fbsUserMapper.updateFbUser(params);
		}

	}

	@Override
	@Transactional(propagation= Propagation.REQUIRED)
	public int reSetPassword(Map<String,Object> params) {
		String pass = "";
		if(fbsUserMapper.searchUserByLoginName(params)>0){
			return 0;//判断登陆名是否存在
		}
		FbsUser user = fbsUserMapper.userByLoginName(params);//修改界面带过去的密码是加密后的
		if(user.getPassword().equals(MD5Encrypt.encode(params.get("newPassword").toString()))){//密码正确
			return -1;
		}else{//密码错误
			pass = MD5Encrypt.encode(params.get("newPassword").toString());//页面密码发生改变，则对最新密码进行加密录入数据库
			params.put("password",pass);
		}
		return fbsUserMapper.updatePassword(params);
	}

	@Override
	@Transactional(propagation= Propagation.REQUIRED)
	public int updateHospitalUser(Map<String, Object> params) {
		return fbsDoctorMapper.updateDoctorFbUser(params);
	}

	@Override
	@Transactional(propagation= Propagation.REQUIRED)
	public int deleteUser(String adminId) throws BussinessException {
		String[] id = adminId.split(",");
		int[] num = new int[id.length];
		for(int i=0; i<id.length;i++){
			num[i] = Integer.parseInt(id[i]) ;
		}
		fbsRoleMapper.deleteRole(num);
		return fbsUserMapper.deleteFbUser(num);
	}



	@Override
	@Transactional(propagation= Propagation.REQUIRED)
	public boolean insertUser(final Map<String,Object> params) {
		if(fbsUserMapper.searchUserByLoginName(params)>0){
			return false;
		}
		//给每个普通管理员用户新增菜单项
		final FbsUser user = new FbsUser();
		String pass = MD5Encrypt.encode(params.get("password").toString());
		user.setLoginName(params.get("loginName").toString());
		user.setUserName(params.get("username").toString());
		user.setSector(params.get("sector").toString());
		user.setNewVideoNum(params.get("newVideoNum").toString());
		user.setCreatorId(params.get("creatorId").toString());
		user.setUserName(params.get("username").toString());
		user.setPassword(pass);
		user.setMobilePhone(params.get("telePhone").toString());
		//user.setTelePhone(params.get("mobilePhone").toString());
		user.setEmail(params.get("email").toString());
		//hostLevel 普通管理员设置为2
		user.setHostLevel("2");
		fbsUserMapper.insertFbUser(user);
		//普通医院新增菜单项
		String menuIdArry = params.get("menuIdArry").toString();
		String[] id = menuIdArry.split(",");
		int[] num = new int[id.length];
		for(int i=0; i<id.length;i++){
			num[i] = Integer.parseInt(id[i]) ;
			final int menuId = num[i];
			fbMenuMapper.inserMenuRole(new HashMap<String, Object>(){{put("menuId",menuId);put("userId",user.getId());
				put("roleId",1);put("hostRole",1);}});
		}
		Map<String,Object> map = new HashMap<>();
		map.put("id",user.getId());
		map.put("creatorId","");
		return fbsUserMapper.setAdmin(map)>0;
	}

	/**
	 * 重置密码
	 * @param params
	 */
	@Override
	@Transactional(propagation= Propagation.REQUIRED)
	public int updatePass(Map<String,Object> params) {
		String pass = MD5Encrypt.encode("123456");
		FbsUser user = new FbsUser();
		user.setPassword(pass);
		user.setLoginName(params.get("loginName").toString());
		return fbsUserMapper.updatePass(user);
	}


	@Override
	public FbsUser userByLoginName(Map<String, Object> params) {
		return fbsUserMapper.userByLoginName(params);
	}

	@Override
	public ServiceResponse insertHospitorUser(Map<String, Object> params) {
		FbsDoctor doctor = new FbsDoctor();
		doctor.setDoctorName(params.get("username").toString());
		doctor.setGmsfhm(params.get("gmsfhm").toString());
		doctor.setDepartment(params.get("department").toString());
		doctor.setRank(params.get("rank").toString());
		doctor.setMobilePhone(params.get("mobilePhone").toString());
		doctor.setHospitalId(Integer.parseInt(params.get("hospitalId").toString()));
		try {
			fbsDoctorMapper.insertFbDoctor(doctor);
		} catch (Exception e) {
			e.printStackTrace();
			return ResultKit.fail("新增医院用户失败");
		}
		return ResultKit.success();
	}

	@Override
	public boolean insertHostUser(Map<String, Object> params) {
		FbsUser user = new FbsUser();
		String pass = MD5Encrypt.encode(params.get("user_password").toString());
		user.setPassword(pass);
		user.setLoginName(params.get("loginName").toString());
		user.setMobilePhone(params.get("mobilePhone").toString());
		user.setEmail(params.get("email").toString());
		if("".equals(params.get("hospitalId"))){//.equal()){
			//通过医院名称查询相应的医院id
			FbsHospitalInformation bean = hospitalInformationMapper.getHospitalIdByName(params.get("hospitalName").toString());
			user.setHospitalId(bean.getId());
		}else{
			user.setHospitalId(Integer.parseInt(params.get("hospitalId").toString()));
		}
		int num = fbsUserMapper.insertFbUser(user);
		if(num>0){
			//给添加的用户赋予角色
			params.put("id",user.getId());
			FbsUser userBean = fbsUserMapper.userByLoginName(params);
			FbsUserRole roleBean = new FbsUserRole();
			roleBean.setUserId(userBean.getId().toString());
			roleBean.setRoleId("2");//医院管理员角色
			fabUserRoleMapper.insertFabUserRole(roleBean);
			return true;
		}else{
			return false;
		}
	}

	@Override
	public PageResponse<FbsUser> findAllPageAdminUserList(PageRequest<FbsUser> pageRequest) {
		FbsUser map=pageRequest.getParam();
		Page<FbsUser> result = PageHelper.startPage(pageRequest.getPageNo(), pageRequest.getPageSize());
		fbsUserMapper.findAllPageAdminUserList(map);
		return PageResponse.wrap(result);
	}

	@Override
	public FbsUser getUserInfoByUser(int id) {
		FbsUser userInfo = new FbsUser();
		//int success = fbsUserMapper.searchAdmin(id);
		userInfo = fbsUserMapper.getUserInfoByUser(id);
		return  userInfo;
	}

	@Override
	public boolean getUserByLoginName(Map<String, Object> params) {
        FbsUser bean = fbsUserMapper.getUserByLoginName(params);
        if("".equals(bean) || null == bean){
            return true;
        }else{
            return false;
        }
	}
}
