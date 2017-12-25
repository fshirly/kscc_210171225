package com.fable.kscc.bussiness.controller.liveparticipant;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import com.fable.kscc.api.model.page.ResultKit;
import com.fable.kscc.api.model.page.ServiceResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fable.kscc.api.model.hospitalInformation.FbsHospitalInformation;
import com.fable.kscc.api.model.participant.FbsLiveParticipant;
import com.fable.kscc.api.model.user.FbsUser;
import com.fable.kscc.bussiness.service.liveparticipant.LiveParticiPantService;

@Controller
@RequestMapping("/kscc/liveParticiPant")
public class LiveParticiPantController {
	@Autowired
	LiveParticiPantService liveParticiPantService;
	private final Logger logger = LoggerFactory.getLogger(LiveParticiPantController.class);
	
	@RequestMapping("/liveFbsLiveParticiList")
	@ResponseBody
	public List<FbsLiveParticipant> liveFbsLiveParticiList(HttpServletRequest request){
		logger.info("获取参与者（医院）信息");
		Integer id = Integer.parseInt(request.getParameter("id"));
		List<FbsLiveParticipant> partiList = liveParticiPantService.queryFbsLiveParti(id);
		for(FbsLiveParticipant partBean : partiList){
			int liveId = partBean.getLiveId();
			//通过所属医院id查询相应的医院信息
			FbsHospitalInformation hospitalList = liveParticiPantService.getHospitalInformationList(liveId);
			String hospitalName = hospitalList.getHospitalName();
			partBean.setHospitalName(hospitalName);
		}
		logger.info("获取参与者（医院）信息结束");
		return partiList;
	}
	
	@RequestMapping("/queryParciticiIsOnline")
	@ResponseBody
	public boolean queryParciticiIsOnline(HttpServletRequest request,Map<String,Object> map){
		HttpSession session = request.getSession();
		FbsUser ksUser = (FbsUser) session.getAttribute("ksUser");
		map.put("id", ksUser.getId());
		boolean strFlg = liveParticiPantService.updateParticiPantOnline(map);
		return strFlg;
	}


	@RequestMapping("/invitationHospitalParticipant")
	@ResponseBody
	public List<FbsLiveParticipant> invitationHospitalParticipant(Map<String,Object> map){
		return liveParticiPantService.invitationHospitalParticipant(map);
	}

}
