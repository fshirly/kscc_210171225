package com.fable.kscc.bussiness.service.livebroadapprove;

import java.text.SimpleDateFormat;
import java.util.*;

import com.fable.kscc.api.model.menuRole.FbsMenuRole;
import com.fable.kscc.api.model.participant.FbsLiveParticipant;
import com.fable.kscc.bussiness.mapper.fbmenu.FbMenuMapper;
import com.fable.kscc.bussiness.mapper.livebroadcast.LiveBroadCastMapper;
import com.fable.kscc.bussiness.mapper.liveparticipant.LiveParticiPantMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fable.kscc.api.model.livebroadcast.FbsLiveBroadcast;
import com.fable.kscc.api.model.message.FbsLiveMessage;
import com.fable.kscc.api.model.page.PageRequest;
import com.fable.kscc.api.model.page.PageResponse;
import com.fable.kscc.api.model.user.FbsUser;
import com.fable.kscc.bussiness.mapper.LiveMessage.LiveMessageMapper;
import com.fable.kscc.bussiness.mapper.hospitalInformation.HospitalInformationMapper;
import com.fable.kscc.bussiness.mapper.fbsUser.FbsUserMapper;
import com.fable.kscc.bussiness.mapper.livebroadapprove.LiveBroadApproveMapper;
import com.fable.kscc.bussiness.mapper.liveoperationlog.LiveOperationLogMapper;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
@Service("liveBroadApproveServiceImpl")
public class LiveBroadApproveServiceImpl implements LiveBroadApproveService {

	@Autowired
	LiveBroadApproveMapper LiveBroadApproveMapper;

	@Autowired
    FbsUserMapper ksUserMapper;

	@Autowired
	LiveMessageMapper liveMessageMapper;

	@Autowired
	LiveParticiPantMapper liveParticiPantMapper;

	@Autowired
	LiveBroadCastMapper liveBroadCastMapper;
	@Autowired
	FbMenuMapper fbMenuMapper;

	@Override
	public PageResponse<FbsLiveBroadcast> queryFbsLiveBroadList(PageRequest<Map<String,Object>> pageRequest) {
		Map<String,Object> map=pageRequest.getParam();
		Page<FbsLiveBroadcast> result = PageHelper.startPage(pageRequest.getPageNo(), pageRequest.getPageSize());
		LiveBroadApproveMapper.queryFbsLiveBroadList(map);
		return PageResponse.wrap(result);
	}
	
	@Override
	public FbsLiveBroadcast queryFbsLiveBroadById(Integer id) {
		return LiveBroadApproveMapper.queryFbsLiveBroadById(id);
	}

	@Override
	public int deleteFbsLiveBroadById(Integer id) {
		return LiveBroadApproveMapper.deleteFbsLiveBroadById(id);
	}

	@Override
	public Map<String,Object> updateFbsLiveBroadById(FbsLiveBroadcast fbsLiveBroadcast) {
		Map<String, Object> map = new HashMap<>();
		final int id = fbsLiveBroadcast.getId();//直播id
		String approveStatus = fbsLiveBroadcast.getApprovalStatus();
		int user_Id = fbsLiveBroadcast.getUser_id();// 当前登录者的id
		int user_BothId = fbsLiveBroadcast.getUserId();//操作的直播申请方id（包括管理员或者普通参与方）
		Date currentTime = new Date();
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String dateString = formatter.format(currentTime);

		//查询所有的管理员用户 hostIds
		List<FbsUser> hostUserList = ksUserMapper.findAllHostUserList();
		List<Integer> hostList = new ArrayList<Integer>();
		for (FbsUser userBean : hostUserList) {
			int num = userBean.getId();
			hostList.add(num);
		}

		//查询所属直播的所有已参与的参与方（）
		List<FbsLiveParticipant> participantsList =  liveParticiPantMapper.queryFbsLiveParti(id);
		//通过直播id查询相应的直播间名称
		Map<String, Object> mapValue = new HashMap<>();
		mapValue.put("liveId",id);
		Map<String, Object> mapParam = liveBroadCastMapper.queryLiveById(mapValue);
		String liveTitle = mapParam.get("title").toString();

		if(approveStatus.equals("2")){//已拒绝
			particidisableMessage(participantsList,user_BothId,hostList,user_Id,id,liveTitle,"直播（","）已被拒绝");
		}else if(approveStatus.equals("1")){//已同意
			particiapproveMessage(participantsList,user_BothId,hostList,user_Id,id,liveTitle,"直播（","）审批通过");
		}
		//根据同意拒绝更新approveStatus状态和更新APPROVAL_TIME的时间
		fbsLiveBroadcast.setApprovalTime(dateString);
        Boolean status = LiveBroadApproveMapper.updateFbsLiveBroadById(fbsLiveBroadcast) !=0;
        map.put("success",status);
        if(status){
            map.put("message","修改成功");
        }else {
            map.put("message","修改失败");
        }
        return map;
	}

	public void particiapproveMessage(List<FbsLiveParticipant> participantsList,int user_BothId,List<Integer> hostList,int user_Id,final int id,String liveTitle,String value1,String value2){
		Date currentTime = new Date();
		FbsLiveMessage message = new FbsLiveMessage();
		for(FbsLiveParticipant partiBean : participantsList){
			//过滤没参加直播的参与方
			String participation = partiBean.getParticipation();
			/*int user_apply_id = partiBean.getId();//申请者的id
			boolean flag_apply = (user_apply_id == user_BothId) ? true : false;*/
			if(participation.equals("0")||participation.equals("1")){ //已参与的未表态的参与方
				int hospitalId = partiBean.getHospitalId();
				FbsUser userBean = ksUserMapper.getFbUserByhospitalId(hospitalId);
				int userId = userBean.getId();
				message.setUserId(userId);//接受消息方
				message.setCreatorId(String.valueOf(user_Id));//系统管理员
				message.setCreatedTime(currentTime);
				message.setMtype("2");//其它类型
				message.setLiveId(id);
				message.setStatus("1");
				//入消息信息-创建直播信息
				if(hostList.contains(user_BothId)){
					message.setContent("直播（"+liveTitle+"）审批通过邀请您参与");
				}else {
					if(userId == user_BothId){
						message.setContent(value1+liveTitle+value2);
					}else{
						message.setContent("直播（"+liveTitle+"）审批通过邀请您参与");
					}
				}
				liveMessageMapper.insertLiveMessage(message);
			}
		}

		if(hostList.contains(user_BothId)){
			addhostmessage(hostList,id,user_Id,liveTitle,value1,value2);
		}
	}

	public void particidisableMessage(List<FbsLiveParticipant> participantsList,int user_BothId,List<Integer> hostList,int user_Id,final int id,String liveTitle,String value1,String value2){
		Date currentTime = new Date();
		FbsLiveMessage message = new FbsLiveMessage();
		for(FbsLiveParticipant partiBean : participantsList){
			int hospitalId = partiBean.getHospitalId();
			FbsUser userBean = ksUserMapper.getFbUserByhospitalId(hospitalId);
			int userId = userBean.getId();
			//拒绝申请直播
			if(!hostList.contains(user_BothId)){
				//当申请直播方 == 参与方
				if(userId == user_BothId){
					message.setCreatorId(String.valueOf(user_Id));//系统管理员
					message.setCreatedTime(currentTime);
					message.setMtype("2");//其它类型
					message.setLiveId(id);
					message.setStatus("1");
					message.setUserId(userId);
					message.setContent(value1+liveTitle+value2);
					liveMessageMapper.insertLiveMessage(message);
				}
			}
		}
		if(hostList.contains(user_BothId)){
			addhostmessage(hostList,id,user_Id,liveTitle,value1,value2);
		}
	}

	/**
	 * 给管理员用户发送消息
	 * @param hostList
	 * @param id
	 * @param user_Id
	 * @param liveTitle
	 * @param value1
	 * @param value2
	 */
	public void addhostmessage(List<Integer> hostList,final int id,int user_Id,String liveTitle,String value1,String value2){
		FbsLiveMessage message = new FbsLiveMessage();
		Date currentTime = new Date();
		for (final int userIdsec : hostList) {
			//判断该管理员用户是否具有直播审批的权限
			FbsMenuRole bean  = fbMenuMapper.findIdByUserIdAndhostRole(new HashMap<String, Object>(){{put("userId",userIdsec);}});
			if ("1".equals(bean.getHostRole())){
				//给管理员发送通知
				message.setLiveId(id);
				message.setUserId(userIdsec);
				message.setCreatorId(String.valueOf(user_Id));
				message.setMtype("2");//消息信息
				message.setStatus("1");
				message.setCreatedTime(currentTime);
				message.setContent(value1+liveTitle+value2);
				liveMessageMapper.insertLiveMessage(message);
			}else {
				break;
			}

		}
	}
}
