package com.fable.kscc.bussiness.controller.hospitalInformation;

import com.fable.kscc.api.model.hospitalInformation.FbsHospitalInformation;
import com.fable.kscc.api.model.liveCodec.FbsLiveCodec;
import com.fable.kscc.api.model.page.PageRequest;
import com.fable.kscc.api.model.page.PageResponse;
import com.fable.kscc.api.model.page.ServiceResponse;
import com.fable.kscc.api.model.user.FbsUser;
import com.fable.kscc.bussiness.service.hospitalInformation.HospitalInformationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Controller
@RequestMapping("/hospital")
public class HospitalInformationController {

	@Autowired
	private HospitalInformationService hospitalInformationService;

	@SuppressWarnings("unchecked")
	@RequestMapping("/findAllPageHospitalList")
	@ResponseBody
	public PageResponse<FbsHospitalInformation> findAllPageHospitalList(@RequestBody PageRequest<FbsHospitalInformation> request)  {
		return hospitalInformationService.findAllPageLiveHospitalList(request);
	}

	@RequestMapping("/getHospitalInfo")
	@ResponseBody
	public List<FbsHospitalInformation> getHospitalInfo(HttpServletRequest request){
		String id = request.getParameter("id");
		return hospitalInformationService.getHospitalInformationList(id);
	}

	@RequestMapping("/findAllHospitalAndUser")
	@ResponseBody
	public List<Map<String,Object>> selectHospital(@RequestBody Map<String,Object> params){
		return hospitalInformationService.selectHospital(params);
	}
	
	@RequestMapping("/selectHospitalInfo")
	@ResponseBody
	public List<Map<String,Object>> selectHospitalInfo(HttpServletRequest request){
		//日历医院列表树形显示，普通用户只显示自己
		HttpSession session = request.getSession();
		FbsUser ksUser = (FbsUser) session.getAttribute("ksUser");
		Map<String,Object> params = new HashMap<>();
		params.put("hospitalId",ksUser.getHospitalId());
		return hospitalInformationService.selectHospital(params);
	}

	/**
	 * 创建和编辑直播信息都当做管理员角色显示所有医院信息
	 * @param request
	 * @return
	 */
	@RequestMapping("/selectHospitalInfoTree")
	@ResponseBody
	public List<Map<String,Object>> selectHospitalInfoTree(HttpServletRequest request){
		//日历医院列表树形显示，普通用户只显示自己
		HttpSession session = request.getSession();
		FbsUser ksUser = (FbsUser) session.getAttribute("ksUser");
		Map<String,Object> params = new HashMap<>();
		params.put("hospitalId",0);
		return hospitalInformationService.selectHospital(params);
	}
	@RequestMapping("/checkHospital")
	@ResponseBody
	public List<Map<String,Object>> checkHospital(String startTime,String endTime, String ids,String liveId){
		return hospitalInformationService.checkHospital(startTime,endTime, ids,liveId);
	}

	@RequestMapping("/modifyCheckHospital")
	@ResponseBody
	public List<Map<String,Object>> modifyCheckHospital(String startTime,String endTime,String oldStartTime,String oldEndTime, String ids,String liveId,String hospitalIds){
		return hospitalInformationService.modifyCheckHospital(startTime,endTime,oldStartTime,oldEndTime,ids,liveId,hospitalIds);
	}

	@RequestMapping("/getHospitalInfoByUser")
	@ResponseBody
	public FbsHospitalInformation getHospitalInfoByUser(HttpServletRequest request){
		HttpSession session = request.getSession();
		FbsUser ksUser = (FbsUser) session.getAttribute("ksUser");
		return hospitalInformationService.getHospitalInfoByUser(ksUser.getId());
	}


	//日程校验(筛选出符合当前直播间时间的参与方医院)邀请参与方页面接口
	@RequestMapping("/screenHospital")
	@ResponseBody
	public List<Map<String,Object>> screenHospital(@RequestBody Map<String,Object> params){
		return hospitalInformationService.screenHospital(params);
	}

	@RequestMapping("/getHospitalInfoById")
	@ResponseBody
	public FbsHospitalInformation getHospitalInfoById(@RequestBody Map<String,Object> params){
		return hospitalInformationService.selectHospitalById(params);
	}

	@RequestMapping("/insertHospitalInfo")
	@ResponseBody
	public ServiceResponse insertHospitalInfo(@RequestBody Map<String,Object> params) throws Exception{
		return hospitalInformationService.insertHospitalInfo(params);
	}

	@RequestMapping("/getUserInfoById")
	@ResponseBody
	public List<Map<String,Object>> getTreeManagerInfoByUserId(@RequestBody Map<String,Object> map,HttpServletRequest request){
		HttpSession session = request.getSession();
		FbsUser ksUser = (FbsUser) session.getAttribute("ksUser");
		map.put("id", ksUser.getId());
		return hospitalInformationService.queryTreeInfo(map);
	}

	@RequestMapping("/updateLiveHospital")
	@ResponseBody
	public ServiceResponse updateLiveHospital(@RequestBody Map<String,Object> params){
		return hospitalInformationService.updateLiveHospital(params);
	}

	@RequestMapping("/getLiveHospitalInfoById")
	@ResponseBody
	public FbsHospitalInformation getLiveHospitalInfoById(@RequestBody Map<String,Object> params){
		FbsHospitalInformation hospital = new FbsHospitalInformation();
		hospital.setId(Integer.parseInt(params.get("id").toString()));
		return hospitalInformationService.getHospital(hospital);
	}

	@RequestMapping("/toDelLiveHospitalById")
	@ResponseBody
	public ServiceResponse toDelLiveHospitalById(String id) throws Exception {
		return hospitalInformationService.deleteHospital(id);
	}
}
