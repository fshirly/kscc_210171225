package com.fable.kscc.bussiness.service.livecodec;

import java.util.List;
import java.util.Map;

import com.fable.kscc.api.exception.BussinessException;
import com.fable.kscc.api.model.page.PageRequest;
import com.fable.kscc.api.model.page.PageResponse;
import com.fable.kscc.api.model.page.ServiceResponse;
import com.fable.kscc.api.model.user.FbsUser;
import org.apache.ibatis.annotations.Param;

import com.fable.kscc.api.model.liveCodec.FbsLiveCodec;

public interface LiveCodecService {
	
	/**
	 * 根据id查看编解码器(手术室)
	 * @param id
	 * @return
	 */
	List<FbsLiveCodec> findAllLiveCodec(int id);
	
	/**
	 * 根据参与方医院id查询新世通账号
	 * @param id
	 * @return
	 */
	public String findNewVideoNum(int id);

	/**
	 * 查询编解码器分页
	 * @param page
	 * @return
	 */
	PageResponse<FbsLiveCodec> findAllPageLiveCodeList(PageRequest<FbsLiveCodec> page);

	boolean insertLiveCode(Map<String,Object> params);

	ServiceResponse deleteCode(String ids) throws BussinessException;

	ServiceResponse getCode(FbsLiveCodec code);

	ServiceResponse updateLiveCode(Map<String,Object> params);

	ServiceResponse updateLiveCodeSubTitle(Map<String,String> params);

}
