package com.fable.kscc.bussiness.service.hospitalInformation;


import java.util.List;
import java.util.Map;

import com.fable.kscc.api.exception.BussinessException;
import com.fable.kscc.api.model.liveCodec.FbsLiveCodec;
import com.fable.kscc.api.model.page.PageRequest;
import com.fable.kscc.api.model.page.PageResponse;
import com.fable.kscc.api.model.page.ServiceResponse;
import org.apache.ibatis.annotations.Param;

import com.fable.kscc.api.model.hospitalInformation.FbsHospitalInformation;

/**
 * 医院信息类接口
 * @author wangyh
 *
 */
public interface HospitalInformationService {

	PageResponse<FbsHospitalInformation> findAllPageLiveHospitalList(PageRequest<FbsHospitalInformation> page);

	/**
	 * 获取医院信息
	 */
	List<FbsHospitalInformation> getHospitalInformationList(String id);

	/**
	 * (搜索医院)医院信息
	 * @param params
	 * @return
	 */
	List<Map<String,Object>> selectHospital(Map<String,Object> params);
	
	/**
	 * 根据医院id进行日程校验
	 * @param startTime
	 * @param endTime
	 * @param ids
	 * @return
	 */
	List<Map<String,Object>> checkHospital(String startTime,String endTime,String ids,String liveId);

	List<Map<String,Object>> modifyCheckHospital(String startTime,String endTime,String oldStartTime,String oldEndTime, String ids,String liveId,String hospitalIds);
	
	/**
	 * 获取当前登录用户所属医院
	 * @param id
	 * @return
	 */
	FbsHospitalInformation getHospitalInfoByUser(int id);

	/**
	 * 日程校验(筛选出符合当前直播间时间的参与方医院)邀请参与方页面接口
	 * @param params
	 * @return
	 */
	List<Map<String,Object>> screenHospital(Map<String,Object> params);

	/**
	 * 根据医院id查询相应的医院基础信息
	 * @param params
	 * @return
	 */
	FbsHospitalInformation selectHospitalById(@Param("params")Map params);

	/**
	 *
	 * @param params
	 * @return
	 */
	ServiceResponse insertHospitalInfo(@Param("params")Map params);

	/**
	 * 查询用户管理下拉树
	 * @param param
	 * @return
	 */
	List<Map<String,Object>> queryTreeInfo(Map<String,Object> param);

	ServiceResponse updateLiveHospital(Map<String,Object> params);

	FbsHospitalInformation getHospital(FbsHospitalInformation hospital);

	ServiceResponse deleteHospital(String ids) throws BussinessException;

}
