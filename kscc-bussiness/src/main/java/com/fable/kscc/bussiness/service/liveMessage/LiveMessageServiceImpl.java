package com.fable.kscc.bussiness.service.liveMessage;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import javax.servlet.http.HttpServletRequest;

import com.fable.kscc.api.model.hospitalInformation.FbsHospitalInformation;
import com.fable.kscc.api.model.livebroadcast.FbsLiveBroadcast;
import com.fable.kscc.api.model.participant.FbsLiveParticipant;
import com.fable.kscc.api.model.user.FbsUser;
import com.fable.kscc.api.utils.StringUtil;
import com.fable.kscc.bussiness.logandmessage.FabsLiveOprLogUtil;
import com.fable.kscc.bussiness.mapper.fbsUser.FbsUserMapper;
import com.fable.kscc.bussiness.mapper.hospitalInformation.HospitalInformationMapper;
import com.fable.kscc.bussiness.mapper.livebroadcast.LiveBroadCastMapper;
import com.fable.kscc.bussiness.mapper.liveparticipant.LiveParticiPantMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fable.kscc.api.model.message.FbsLiveMessage;
import com.fable.kscc.api.model.page.PageRequest;
import com.fable.kscc.api.model.page.PageResponse;
import com.fable.kscc.bussiness.mapper.LiveMessage.LiveMessageMapper;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;


@Service
public class LiveMessageServiceImpl implements LiveMessageService {

	@Autowired
	private LiveMessageMapper liveMessageMapper;
	@Autowired
	private FbsUserMapper fbsUserMapper;

	@Autowired
	private LiveBroadCastMapper liveBroadCastMapper;

	@Autowired
	private LiveParticiPantMapper liveParticiPantMapper;
	@Autowired
	private HospitalInformationMapper hospitalInformationMapper;
	@Autowired
	private FabsLiveOprLogUtil logUtil;
	//根据状态和发言人模糊查询消息信息
	@Override
	public PageResponse<FbsLiveMessage> findMessageByStatus(HttpServletRequest request,PageRequest<Map<String,Object>> pageRequest) {
		Map<String,Object> map=pageRequest.getParam();
		Page<FbsLiveMessage> result = PageHelper.startPage(pageRequest.getPageNo(), pageRequest.getPageSize());
		liveMessageMapper.findMessageByStatus(map);
		for (FbsLiveMessage success : result){
			//查询所有的管理员用户 hostIds
			List<FbsUser> hostUserList = fbsUserMapper.findAllHostUserList();
			List<Integer> hostList = new ArrayList<Integer>();
			for (FbsUser userBean : hostUserList) {
				int id = userBean.getId();
				hostList.add(id);
			}
			//根据created_id查询发信人
			String creatId = success.getCreatorId();
			/*user.setId(Integer.parseInt(creatId));
			FbsUser userbean = fbsUserMapper.queryFbUser(user);
			success.setHospitalName(userbean.getUserName());*/
			if(hostList.contains(Integer.parseInt(creatId))){
				success.setHospitalName("管理员");
			}else{
				FbsHospitalInformation bean = hospitalInformationMapper.getHospitalInfoByUser(Integer.parseInt(creatId));
				success.setHospitalName(bean.getHospitalName());
			}

			SimpleDateFormat sDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			String date = sDateFormat.format(success.getCreatedTime());
			success.setUniversalTime(date);
		}
		return PageResponse.wrap(result);
	}

	@Override
	public PageResponse<FbsLiveMessage> findMessageBySpeaker(HttpServletRequest request, final PageRequest<Map<String, Object>> pageRequest) {
		List<FbsUser> hostUserList = fbsUserMapper.findAllHostUserList();
		Map<String,Object> map=pageRequest.getParam();
		final String userName = map.get("userName").toString();//A医院，管理员
		List<FbsUser> arrayusBean = new ArrayList<FbsUser>();
		int createUseId = 0;
		String strValueUser = "";
		String strCreatIdUser = "";
		if (!"".equals(userName)){
			//根据发言人查询字段模糊查询相应的createId
			arrayusBean = fbsUserMapper.getUserByUserName(new HashMap<String, Object>(){{put("userName",userName);}});
			if(arrayusBean.size() !=0 ){
				for (FbsUser usBean : arrayusBean){
					createUseId = usBean.getId();
					strValueUser += String.valueOf(createUseId) + ',';
					strCreatIdUser = strValueUser.substring(0, strValueUser.length() - 1);
				}
			}else {
				strCreatIdUser = "-1";
			}
		}else {
			createUseId = 999;
		}

		//模糊查询所有的医院id
		List<FbsHospitalInformation> hosBeanList = hospitalInformationMapper.queryHospitalListByName(userName);
		List<Integer> userList = new ArrayList<Integer>();
		for (FbsHospitalInformation hosBean : hosBeanList) {
			int id = hosBean.getId();
			//通过医院id指向相应的用户id
			FbsUser userBean = fbsUserMapper.getFbUserByhospitalId(id);
			userList.add(userBean.getId());
		}
		Page<FbsLiveMessage> result = PageHelper.startPage(pageRequest.getPageNo(), pageRequest.getPageSize());
		//通过输入名称查询相应的管理员和医院信息

		String strValue = "";
		String strCreatId = "";
		if(createUseId != 999){
			if (0 != arrayusBean.size()){
				if(!"0".equals(arrayusBean.get(0).getHostLevel())){
					map.put("strCreatId",strCreatIdUser);
					liveMessageMapper.findMessageByStatus(map);
					//8888888（全是管理员用户）
					setResultMessage(result);
				}else if("0".equals(arrayusBean.get(0).getHostLevel())){
					//拼接creatId
					for (int i = 0; i < userList.toArray().length; i++) {
						String str = userList.toArray()[i].toString();
						strValue += str + ',';
						strCreatId = strValue.substring(0, strValue.length() - 1);
					}
					map.put("strCreatId",strCreatId);
					liveMessageMapper.findMessageByStatus(map);
					//8888888888(全是医院用户)
					setResultMessage(result);
				}
			}else {
				map.put("strCreatId",strCreatIdUser);
				liveMessageMapper.findMessageByStatus(map);
				//8888888（全是管理员用户）
				setResultMessage(result);
			}

		}else {
				liveMessageMapper.findMessageByStatus(map);
				for (FbsLiveMessage success : result){
					//查询所有的管理员用户 hostIds
					List<Integer> hostList = new ArrayList<Integer>();
					for (FbsUser userBean : hostUserList) {
						int id = userBean.getId();
						hostList.add(id);
					}
					//根据created_id查询发信人
					String creatId = success.getCreatorId();
					//查询相应的产生消息用户名
					FbsUser ubean = fbsUserMapper.getUserInfoByUser(Integer.parseInt(creatId));
					if("0".equals(ubean.getHostLevel())){
						FbsHospitalInformation bean = hospitalInformationMapper.getHospitalInfoByUser(Integer.parseInt(creatId));
						success.setHospitalName(bean.getHospitalName());
					}else{
						success.setHospitalName(ubean.getUserName());
					}

					SimpleDateFormat sDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
					String date = sDateFormat.format(success.getCreatedTime());
					success.setUniversalTime(date);
			}
		}
		return PageResponse.wrap(result);
	}

	//批量已读
	@Override
	public int updateLiveMessageStatus(String id) {
		String[] ids = id.split(",");
		int[] num = new int[ids.length];
		for(int i=0; i<ids.length;i++){
			num[i] = Integer.parseInt(ids[i]) ;
		}
		return liveMessageMapper.updateLiveMessageStatus(num);
	}

	//批量删除
	@Override
	@Transactional(propagation=Propagation.REQUIRED)
	public int deleteLiveMessageStatus(String id) {
		String[] ids = id.split(",");
		int[] num = new int[ids.length];
		for(int i=0; i<ids.length;i++){
			num[i] = Integer.parseInt(ids[i]) ;
		}
		return liveMessageMapper.deleteLiveMessageStatus(num);
	}

	//根据id读取单条消息
	@Override
	public FbsLiveMessage findMessageById(Integer id) {
		List<FbsUser> hostUserList = fbsUserMapper.findAllHostUserList();
		List<Integer> hostList = new ArrayList<Integer>();
		for (FbsUser userBean : hostUserList) {
			int hostid = userBean.getId();
			hostList.add(hostid);
		}
		FbsLiveMessage message = liveMessageMapper.findMessageById(id);
		//通过createId查询出相应的发信人
		String creatorId = message.getCreatorId();
		if (hostList.contains(Integer.parseInt(creatorId))){
			message.setHospitalName("管理员");
		}else{
			FbsHospitalInformation bean = hospitalInformationMapper.getHospitalInfoByUser(Integer.parseInt(creatorId));
			message.setHospitalName(bean.getHospitalName());
		}
		return message;
	}

	@Override
	public int queryExtendCount(Map<String, Object> param) {

		return liveMessageMapper.queryExtendCount(param);
	}

	@Override
	public void markExtendMessages(Map<String, Object> param) {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String endTime = "";
		//获取原结束时间
		String oldEndTime = liveBroadCastMapper.searchEndTime(Integer.parseInt(String.valueOf(param.get("liveId"))));
		//获取需要延长的时间
		int time = Integer.parseInt(String.valueOf(param.get("timeExpand")));
		try {
			long millionSeconds = sdf.parse(oldEndTime).getTime() + time * 1000 * 60;//毫秒
			Date date = new Date(millionSeconds);
			SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm");
			endTime = dateFormat.format(date).toString();
		} catch (ParseException e) {
			e.printStackTrace();
		}
		Map<String, Object> map = new HashMap<>();
		map.put("endTime", endTime);
		map.put("liveId", Integer.parseInt(String.valueOf(param.get("liveId"))));
		//产生延时的消息信息超过10分钟就给消息信息
		if(time >= 10){
			insertExtendLiveTime(String.valueOf(param.get("liveId")),endTime,String.valueOf(param.get("userid")),time);
		}
		//产生直播间的延时日志
		logUtil.markAskExtendTimeLog(param);
	}

	public void insertExtendLiveTime(String liveId, String extendTime, String userid,int time){
		Date timedata = new Date();
		//通过liveId查询相应的直播名称
		Map<String,Object> map = new HashMap<>();
		map.put("id",liveId);
		FbsLiveBroadcast bean = liveBroadCastMapper.searchBroadcastInfoByLiveId(map);
		String liveName = bean.getTitle();

		//查询所有的管理员用户 hostIds
		List<FbsUser> hostUserList = fbsUserMapper.findAllHostUserList();
		List<Integer> hostList = new ArrayList<Integer>();
		for (FbsUser userBean : hostUserList) {
			int id = userBean.getId();
			hostList.add(id);
		}
		if (!"".equals(extendTime)) {
			FbsLiveMessage message = new FbsLiveMessage();
			for (int userId : hostList) {
				//给管理员发送通知
				message.setLiveId(Integer.parseInt(liveId));
				message.setContent("直播（"+liveName+"）申请延时"+time+"分钟，请至直播管理页面设值");
				message.setUserId(userId);
				message.setCreatorId(userid);
				message.setMtype("2");
				message.setStatus("1");
				message.setAddressee(-1);
				message.setCreatedTime(timedata);
				liveMessageMapper.insertLiveMessage(message);
			}
		}
	}

	/**
	 * 发送消息的公共类
	 * @param result
	 */
	public void setResultMessage(Page<FbsLiveMessage> result){
		for (FbsLiveMessage success : result){
			//根据created_id查询发信人
			String creatId = success.getCreatorId();
			//查询相应的产生消息用户名
			FbsUser ubean = fbsUserMapper.getUserInfoByUser(Integer.parseInt(creatId));
			if("0".equals(ubean.getHostLevel())){
				FbsHospitalInformation bean = hospitalInformationMapper.getHospitalInfoByUser(Integer.parseInt(creatId));
				success.setHospitalName(bean.getHospitalName());
			}else{
				success.setHospitalName(ubean.getUserName());
			}
			SimpleDateFormat sDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			String date = sDateFormat.format(success.getCreatedTime());
			success.setUniversalTime(date);
		}
	}

}
