package com.fable.kscc.bussiness.mapper.hospitalInformation;

import com.fable.kscc.api.model.hospitalInformation.FbsHospitalInformation;

import java.util.List;
import java.util.Map;

import com.fable.kscc.api.model.liveCodec.FbsLiveCodec;
import org.apache.ibatis.annotations.Param;

/**
 * 医院信息mapper
 * @author wangyh
 *
 */

public interface HospitalInformationMapper {
	List<FbsHospitalInformation> findAllPageLiveHospitalList(FbsHospitalInformation codec);
	
	List<FbsHospitalInformation> getHospitalInformationList(@Param("id") String id);
	
	/**
	 * 医院信息(日程校验)
	 * @return
	 */
	List<FbsHospitalInformation> findAllHospitalInfo(@Param("params")Map params);
	
	
	FbsHospitalInformation getHospitalIdByName(String hospitalName);
	
	/**
	 * 查询所有医院
	 * @return
	 */
	List<FbsHospitalInformation> selectHospitalInfo();

	/**
	 * (搜索医院)医院信息
	 * @param params
	 * @return
	 */
	List<FbsHospitalInformation> selectHospital(@Param("params")Map params);

	/**
	 * 根据id查看医院名称
	 * @param id
	 * @return
	 */
	String findAllById(@Param("id")int id);
	
	/**
	 * 获取当前登陆用户所属医院
	 * @param id
	 * @return
	 */
	FbsHospitalInformation getHospitalInfoByUser(@Param("id")int id);

	/**
	 * 根据医院id查询医院
	 * @param params
	 * @return
	 */
	List<FbsHospitalInformation> selectHospitalById(@Param("params")Map params);

	/**
	 * 新增医院信息
	 * @param hospitalInformation
	 * @return
	 */
	int insertFbsHospitalInfo(FbsHospitalInformation hospitalInformation);

	int updateLiveHospital(@Param("params") Map<String,Object> params);

	FbsHospitalInformation queryLiveHospital(FbsHospitalInformation Hospital);

	int deleteLiveHospital(@Param("id") int id);

	List<FbsHospitalInformation> getHospitalForAddParticipant(List<Integer> params);

	List<FbsHospitalInformation> queryHospitalListByName(@Param("hospitalName")String hospitalName);

	List<FbsHospitalInformation> getAllHospitalList();
}