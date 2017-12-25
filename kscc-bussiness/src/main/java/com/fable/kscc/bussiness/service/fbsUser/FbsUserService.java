package com.fable.kscc.bussiness.service.fbsUser;


import java.util.List;
import java.util.Map;

import com.fable.kscc.api.exception.BussinessException;
import com.fable.kscc.api.model.page.PageRequest;
import com.fable.kscc.api.model.page.PageResponse;
import com.fable.kscc.api.model.page.ServiceResponse;
import com.fable.kscc.api.model.user.FbsUser;
import com.fable.kscc.api.utils.Page;

/**
 * 用户Service
 * 查询(单条，分页，集合)+增删改,特殊业务除外
 * @author zhujj
 *
 */
public interface FbsUserService {

	
	/**
	 * 查询单个用户
	 */
	ServiceResponse getUser(FbsUser user);
	

	/**
	 * 查询所有用户分页列表
	 */
	PageResponse<FbsUser> findAllPageUserList(PageRequest<FbsUser> page);

	/**
	 * 查询管理员用户信息
	 * @param page
	 * @return
	 */
	PageResponse<FbsUser> findAllPageAdminUserList(PageRequest<FbsUser> page);

	/**
	 * 更新用户
	 */
	int updateUser(Map<String,Object> params);

	int updateHostUser(Map<String,Object> params);

	int reSetPassword(Map<String,Object> params);

	/**
	 * 更新医院用户
	 * @param params
	 * @return
	 */
	int updateHospitalUser(Map<String,Object> params);
	/**
	 * 删除用户
	 */
	int deleteUser(String ids) throws BussinessException;
	
	/**
	 * 新增用户
	 */
	boolean insertUser(Map<String,Object> params);

	/**
	 *
	 * @param params
	 * @return
	 */
	ServiceResponse insertHospitorUser(Map<String,Object> params);
	/**
	 * 重置密码
	 */
	int updatePass(Map<String,Object> params);
	
	
	/**
	 * 根据登录名查询用户
	 * @param params
	 * @return
	 */
	FbsUser userByLoginName(Map<String,Object> params);


	boolean insertHostUser(Map<String,Object> params);

	FbsUser getUserInfoByUser(int id);

	boolean getUserByLoginName(Map<String,Object> params);
}
