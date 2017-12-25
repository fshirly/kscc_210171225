package com.fable.kscc.bussiness.controller.liveBroadApprove;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import com.fable.kscc.bussiness.mapper.fbsUser.FbsUserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fable.kscc.api.model.livebroadcast.FbsLiveBroadcast;
import com.fable.kscc.api.model.page.PageRequest;
import com.fable.kscc.api.model.page.PageResponse;
import com.fable.kscc.api.model.user.FbsUser;
import com.fable.kscc.bussiness.mapper.livebroadcast.LiveBroadCastMapper;
import com.fable.kscc.bussiness.service.livebroadapprove.LiveBroadApproveService;
import com.fable.kscc.bussiness.service.livebroadcast.LiveBroadCastService;
import com.fable.kscc.bussiness.service.liveparticipant.LiveParticiPantService;

@Controller
@RequestMapping("/kscc/liveBroadApprove")
public class LiveBroadApproveController {
	@Autowired
	LiveBroadApproveService liveBroadApproveService;
	@Autowired
	LiveBroadCastService liveBroadCastService;
	@Autowired
	LiveParticiPantService liveParticiPantService;
	@Autowired
	LiveBroadCastMapper liveBroadCastMapper;
	@Autowired
	private FbsUserMapper ksUserMapper;
	private final Logger logger = LoggerFactory.getLogger(LiveBroadApproveController.class);

	/**
	 * 直播审批列表数据获取
	 * @param pageRequest
	 * @param request
	 * @return
	 * @throws Exception
	 */
	@RequestMapping("/liveBroadApproveList")
	@ResponseBody
	public PageResponse<FbsLiveBroadcast> liveBroadApproveList(@RequestBody PageRequest<Map<String,Object>> pageRequest,HttpServletRequest request) 
		throws Exception{
		logger.info("直播审批数据获取");
		//查询所有的管理员用户 hostIds
		List<FbsUser> hostUserList = ksUserMapper.findAllHostUserList();
		List<Integer> hostList = new ArrayList<Integer>();
		for (FbsUser userBean : hostUserList) {
			int id = userBean.getId();
			hostList.add(id);
		}
		HttpSession session = request.getSession();
		Map<String,Object> map=pageRequest.getParam();
		FbsUser ksUser = (FbsUser) session.getAttribute("ksUser");
		if (hostList.contains(ksUser.getId())){
			map.put("userId", "");
		}else{
			map.put("userId", ksUser.getId());
		}

		PageResponse<FbsLiveBroadcast> fbsLiveBroadRequest = liveBroadApproveService.queryFbsLiveBroadList(pageRequest);
		logger.info("列表数据获取结束");
		return fbsLiveBroadRequest;
	}
	/**
	 * 直播审批查看页面数据
	 * @param request
	 * @return
	 */
	@RequestMapping("/toViewLiveApprove")
	@ResponseBody
	public Map<String,Object> toViewLiveApprove(HttpServletRequest request) {
		Map<String,Object> newMap = new HashMap<String,Object>();
		String id = request.getParameter("id");
		Map<String,Object> dataMap = new HashMap<String,Object>();
		dataMap.put("liveId", id);
		List<Map<String, Object>> participants = liveBroadCastMapper.queryParticipant(dataMap);
		//遍历list赋serialNumber
		newMap.put("hostParams", participants);
		FbsLiveBroadcast bean = liveBroadApproveService.queryFbsLiveBroadById(Integer.parseInt(id));
		newMap.put("baseParams", bean);
		return newMap;
	}
	/**
	 * 直播审批编辑
	 * @param bean
	 * @return
	 * @throws Exception
	 */
	@RequestMapping("/updateLiveApprove")
	@ResponseBody
	public Map<String,Object> updateLiveApprove(@RequestBody FbsLiveBroadcast bean,HttpServletRequest request) throws Exception {
		HttpSession session = request.getSession();
		FbsUser ksUser = (FbsUser) session.getAttribute("ksUser");
		bean.setUser_id(ksUser.getId());
		return liveBroadApproveService.updateFbsLiveBroadById(bean);
	}
}
