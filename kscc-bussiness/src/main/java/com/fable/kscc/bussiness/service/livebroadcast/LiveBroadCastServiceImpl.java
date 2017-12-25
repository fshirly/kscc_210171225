package com.fable.kscc.bussiness.service.livebroadcast;

import com.alibaba.fastjson.JSON;
import com.fable.kscc.api.kedaApi.KedaApi;
import com.fable.kscc.api.medTApi.MedTApi;
import com.fable.kscc.api.model.department.FbsDepartment;
import com.fable.kscc.api.model.hospitalInformation.FbsHospitalInformation;
import com.fable.kscc.api.model.liveHomePage.FbsLiveHomepage;
import com.fable.kscc.api.model.livebroadcast.FbsLiveBroadcast;
import com.fable.kscc.api.model.menuRole.FbsMenuRole;
import com.fable.kscc.api.model.message.FbsLiveMessage;
import com.fable.kscc.api.model.page.PageRequest;
import com.fable.kscc.api.model.page.PageResponse;
import com.fable.kscc.api.model.page.ResultKit;
import com.fable.kscc.api.model.page.ServiceResponse;
import com.fable.kscc.api.model.participant.FbsLiveParticipant;
import com.fable.kscc.api.model.user.FbsUser;
import com.fable.kscc.api.utils.DateTimeUtil;
import com.fable.kscc.bussiness.mapper.LiveMessage.LiveMessageMapper;
import com.fable.kscc.bussiness.mapper.fbmenu.FbMenuMapper;
import com.fable.kscc.bussiness.mapper.fbsUser.FbsUserMapper;
import com.fable.kscc.bussiness.mapper.fbsdepartment.FbsDepartmentMapper;
import com.fable.kscc.bussiness.mapper.hospitalInformation.HospitalInformationMapper;
import com.fable.kscc.bussiness.mapper.livebroadcast.LiveBroadCastMapper;
import com.fable.kscc.bussiness.mapper.livecodec.LiveCodecMapper;
import com.fable.kscc.bussiness.mapper.liveparticipant.LiveParticiPantMapper;
import com.fable.kscc.bussiness.websocket.Sender;
import net.sf.ezmorph.bean.MorphDynaBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class LiveBroadCastServiceImpl implements LiveBroadCastService {

    @Autowired
    private LiveBroadCastMapper liveBroadCastMapper;


    @Autowired
    private LiveParticiPantMapper liveParticiPantMapper;

    @Autowired
    private LiveCodecMapper liveCodecMapper;

    @Autowired
    LiveMessageMapper liveMessageMapper;

    @Autowired
    private FbsUserMapper ksUserMapper;

    @Autowired
    HospitalInformationMapper hospitalInformationMapper;

    @Autowired
    FbsDepartmentMapper fbsDepartmentMapper;

    @Autowired
    FbMenuMapper fbMenuMapper;
    @Autowired
    private KedaApi api;

    @Autowired
    private MedTApi medTApi;

    @Autowired
    private Sender sender;

    private SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    private Map<String, Boolean> isConferencePoolExist = new HashMap<>();

    private ExecutorService cachedThreadPool = Executors.newCachedThreadPool();


    /**
     * 创建直播申请
     */
    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public ServiceResponse createLiveApplications(FbsLiveBroadcast broadcast) {
        broadcast.setCreatedTime(DateTimeUtil.toString(new Date()));
        liveBroadCastMapper.createLiveApplications(broadcast);
        //产生相应的消息信息
        createMessage(broadcast);
        //设置参与方
        List<FbsLiveParticipant> fbsLiveParticipants = broadcast.getParticipants();
        for (FbsLiveParticipant fbsLiveParticipant : fbsLiveParticipants) {
            String newVideoNum = liveCodecMapper.findNewVideoNum(fbsLiveParticipant.getHospitalId());//根据参与方医院id设置新世通账号
            fbsLiveParticipant.setNewvideoNum(newVideoNum);
            fbsLiveParticipant.setLiveId(broadcast.getId());//设置直播间id
            fbsLiveParticipant.setParticipation("0");
            fbsLiveParticipant.setCreatedTime(new Date());
            fbsLiveParticipant.setCreatorId(broadcast.getCreatorId());
            liveParticiPantMapper.setParticipant(fbsLiveParticipant);
        }
        return ResultKit.success();
    }


    @Override
    public ServiceResponse getLiveBroadCast(Map<String, Object> param) {
        List<FbsLiveBroadcast> fbsLiveBroadcasts = liveBroadCastMapper.getLiveBroadCast(param);
        List<FbsLiveBroadcast> inviteLives = liveBroadCastMapper.inviteLive(param);
        fbsLiveBroadcasts.addAll(inviteLives);
       /* List<String> startTimeList = new ArrayList<String>();
        for (FbsLiveBroadcast broadcasts : fbsLiveBroadcasts){
            String startTime = broadcasts.getStartTime();
            startTimeList.add(startTime);
        }*/
        return ResultKit.serviceResponse(fbsLiveBroadcasts);
    }

    @Override
    public ServiceResponse applyBroadCast(Map<String, Object> param) {
        List<FbsLiveBroadcast> fbsLiveBroadcasts = liveBroadCastMapper.getLiveBroadCast(param);
        return ResultKit.serviceResponse(fbsLiveBroadcasts);
    }

    @Override
    public ServiceResponse selectHomePage() {
        List<FbsLiveHomepage> fbsLiveHomepages = liveBroadCastMapper.selectHomePage();
        return ResultKit.serviceResponse(fbsLiveHomepages);
    }

    @Override
    public ServiceResponse getMeetingInfo(Map<String, Object> params) {
        Map<String, Object> response = api.getMeetingInfo(params.get("confId").toString());
        if (response.get("success") != null) {
            if ("1".equals(response.get("success").toString())) {
                Map<String, Object> container = new HashMap<>();
                container.put("mute", response.get("mute"));
                container.put("silence", response.get("silence"));
                return ResultKit.serviceResponse(container);
            }
        }
        return ResultKit.fail("获取会议信息失败");
    }

    @Override
    public ServiceResponse inviteLive(Map<String, Object> param) {
        List<FbsLiveBroadcast> broadcasts = liveBroadCastMapper.inviteLive(param);
        return ResultKit.serviceResponse(broadcasts);
    }

    @Override
    public PageResponse<FbsLiveBroadcast> getAllHistoryBroadCast(PageRequest<Map<String, Object>> pageRequest) {
        //map里有userId，participation，status（1、我参与的，2、我申请的，3、我受邀的）三个参数
        Map<String, Object> map = pageRequest.getParam();
        String status = map.get("status").toString();
        List<FbsLiveBroadcast> liveBroadcasts = new ArrayList<>();
        String liveType;
        //我参与的直播( 我申请的，和我受邀的直播并且是会议status为2的，已经结束的直播)
        if ("1".equals(status)) {
            map.put("playStatus", "2");
            liveType = "我参与的直播";
            map.put("doNotParticipant", "2");
            List<FbsLiveBroadcast> inviteLives = liveBroadCastMapper.inviteLive(map);
            List<FbsLiveBroadcast> fbsLiveBroadcastOfMine = liveBroadCastMapper.getLiveBroadCast(map);
            inviteLives.addAll(fbsLiveBroadcastOfMine);
            filterHistory(inviteLives, liveBroadcasts, liveType);
        }
        //我申请的直播（管他妈的有没有同意，有没有被取消）
        else if ("2".equals(status)) {
            liveType = "我申请的直播";
            List<FbsLiveBroadcast> fbsLiveBroadcastOfMine = liveBroadCastMapper.getLiveBroadCast(map);
            filterHistory(fbsLiveBroadcastOfMine, liveBroadcasts, liveType);
        } else {
            liveType = "我受邀的直播";
            map.put("approvalStatus", "1");
            List<FbsLiveBroadcast> inviteLives = liveBroadCastMapper.inviteLive(map);
            filterHistory(inviteLives, liveBroadcasts, liveType);
        }
        return PageResponse.wrap(liveBroadcasts, pageRequest.getPageNo(), pageRequest.getPageSize());
    }

    @Override
    @Transactional
    public int agreeInviteOrNot(Map<String, Object> map) {
        //web端传的参数：{participant:'2',userId:loginUserId,liveId:disagreeId}
        //产生相应的消息信息
        createAgreeOrNoMessage(map);
        int change = liveBroadCastMapper.updateLiveParticipant(map);
        if ("2".equals(map.get("participant").toString())) {
            List<Map<String, Object>> participants = liveBroadCastMapper.queryParticipant(map);
            if (participants.size() == 1) {
                String id = map.get("liveId").toString();
                liveBroadCastMapper.cancelLive(id);
            }
        }
        return change;
    }

    public void createMessage(FbsLiveBroadcast broadcast){
        //创建直播给管理员和参与方发送通知
        Date time = new Date();
        //查询所有的管理员用户 hostIds
        List<FbsUser> hostUserList = ksUserMapper.findAllHostUserList();
        List<Integer> hostList = new ArrayList<Integer>();
        for (FbsUser userBean : hostUserList) {
            int id = userBean.getId();
            hostList.add(id);
        }
        String liveId = broadcast.getId().toString();
        String title = broadcast.getTitle().toString();
        //查询所属直播的所有已参与的参与方（）
        FbsLiveMessage message = new FbsLiveMessage();
        for (final int userId : hostList) {
            //给管理员发送通知
            //判断该管理员用户是否具有直播审批的权限
            FbsMenuRole bean  = fbMenuMapper.findIdByUserIdAndhostRole(new HashMap<String, Object>(){{put("userId",String.valueOf(userId));}});
            if ("1".equals(bean.getHostRole())){
                message.setLiveId(Integer.parseInt(liveId));
                message.setContent("新的直播申请（" + title + "）请至审批页面审批");
                message.setUserId(userId);
                message.setCreatorId(broadcast.getUserId().toString());
                message.setMtype("2");//修改记录类型
                message.setStatus("1");
                message.setCreatedTime(time);
                liveMessageMapper.insertLiveMessage(message);
            }else{
                break;
            }

        }
    }
    public void createAgreeOrNoMessage(Map<String, Object> map){
        String liveId = map.get("liveId").toString();
        String userId = map.get("userId").toString();
        String participant = map.get("participant").toString();
        //医院B同意XXX直播（participant为1同意，participant为2拒绝）
        if(!"".equals(userId)){
            //创建直播给管理员和参与方发送通知
            Date time = new Date();
            //查询所有的管理员用户 hostIds
            List<FbsUser> hostUserList = ksUserMapper.findAllHostUserList();
            List<Integer> hostList = new ArrayList<Integer>();
            for (FbsUser userBean : hostUserList) {
                int id = userBean.getId();
                hostList.add(id);
            }

            //通过用户id查询相应的医院名称
            FbsHospitalInformation hosBean = hospitalInformationMapper.getHospitalInfoByUser(Integer.parseInt(userId));
            String hospitalName = hosBean.getHospitalName();
            //通过直播id查询相应的直播名称
            Map<String, Object> mapone = new HashMap<>();
            mapone.put("id",liveId);
            FbsLiveBroadcast broadcastBean = liveBroadCastMapper.searchBroadcastInfoByLiveId(mapone);
            String liveName = broadcastBean.getTitle();
            FbsLiveMessage message = new FbsLiveMessage();

            for (int user_Id : hostList) {
                //给管理员发送通知
                message.setLiveId(Integer.parseInt(liveId));
                if("1".equals(participant)){
                    message.setContent(hospitalName+"同意参与直播（" + liveName + "）！");
                }else{
                    message.setContent(hospitalName+"拒绝参与直播（" + liveName + "）！");
                }
                message.setUserId(user_Id);
                message.setCreatorId(userId);
                message.setMtype("2");//消息信息
                message.setStatus("1");
                message.setCreatedTime(time);
                liveMessageMapper.insertLiveMessage(message);
            }
            //参加该会议的每个参与方发送消息信息
            List<FbsLiveParticipant> participantsList = liveParticiPantMapper.queryFbsLiveParti(Integer.parseInt(liveId));
            for (FbsLiveParticipant partiBean : participantsList) {
                int hospitalId1 = partiBean.getHospitalId();
                FbsUser userBean = ksUserMapper.getFbUserByhospitalId(hospitalId1);
                int userId1 = userBean.getId();
                message.setUserId(userId1);
                message.setCreatorId(userId);
                message.setMtype("2");//消息信息通知其它参与者
                message.setStatus("1");
                if("1".equals(participant)){
                    message.setContent(hospitalName+"同意参与直播（" + liveName + "）！");
                }else{
                    message.setContent(hospitalName+"拒绝参与直播（" + liveName + "）！");
                }
                message.setLiveId(Integer.parseInt(liveId));
                message.setCreatedTime(time);
                liveMessageMapper.insertLiveMessage(message);
            }
        }
    }
    @Override
    public Map<String, Object> getLiveDetail(Map<String, Object> param) {
        List<Map<String, Object>> participants = liveBroadCastMapper.queryParticipant(param);
        Map<String, Object> liveBroadCast = liveBroadCastMapper.queryLiveById(param);
        liveBroadCast.put("participants", participants);
        return liveBroadCast;
    }

    @Override
    public Map<String, Object> getLiveDetailTwo(Map<String, Object> param) {
        //保证都是与会参与方
        param.put("isDel","0");
        List<Map<String, Object>> participants = liveBroadCastMapper.queryParticipant(param);
        Map<String, Object> liveBroadCast = liveBroadCastMapper.queryLiveById(param);
        String confId = liveBroadCast.get("confId").toString();
        Map<String, Object> meetingInfo = api.getMeetingInfo(confId);
        if ("1".equals(meetingInfo.get("success").toString())) {
            liveBroadCast.put("silence", meetingInfo.get("silence"));
            liveBroadCast.put("mute", meetingInfo.get("mute"));
        }
        completeParticipants(participants, confId);
        liveBroadCast.put("participants", participants);
        return liveBroadCast;
    }

    @Override
    public List<Map<String, Object>> getCurrentParticipant(Map<String, Object> param) {
        List<Map<String, Object>> participants = liveBroadCastMapper.queryParticipant(param);
        String confId = param.get("confId").toString();
        completeParticipants(participants, confId);
        return participants;
    }
    private void completeParticipants(List<Map<String, Object>> participants, String confId) {
        Map<String, Object> responseForMts = api.getMTS(confId);
        Map<String, Object> responseForSpeak = api.getSpeaker(confId);
        if ("1".equals(responseForMts.get("success").toString())) {
            List<MorphDynaBean> mts = (List<MorphDynaBean>) responseForMts.get("mts");
            if (mts.size() != 0) {
                for (Map<String, Object> map : participants) {
                    for (MorphDynaBean bean : mts) {
                        String mtId=bean.get("mt_id").toString();
                        if (mtId.equals(map.get("mtId"))) {
                            map.put("confId", confId);
                            map.put("silence", bean.get("silence"));
                            map.put("mute", bean.get("mute"));
                            map.put("online", bean.get("online"));
                            map.put("speaker", mtId.equals(responseForSpeak.get("mt_id")) ? 1 : 0);
                            //封装相应的编解码信息
                            Map<String, String> paraCode = new HashMap<>();
                            paraCode.put("ip", map.get("ip").toString());
                            paraCode.put("port",map.get("port").toString());
                            paraCode.put("hospitalId",map.get("hospitalId").toString());
                            paraCode.put("username",map.get("username").toString());
                            paraCode.put("password",map.get("password").toString());
                            paraCode.put("confId",map.get("confId").toString());
                            break;
                        }
                    }
                }
            }
        }
    }


    @Override
    @Transactional
    public ServiceResponse modifyLiveBroadcast(Map<String, Object> param) throws Exception {

        //首先判断参与方有没有改变（数量，参与方名称），开始时间和结束时间有没有改变
        //改变的话，就需要重新审核

        List<Map<String, Object>> oldParticipant = (List<Map<String, Object>>) param.get("oldParticipant");
        Map<String, Object> oldLive = (Map<String, Object>) param.get("oldLive");

        List<Map<String, Object>> newParticipant = (List<Map<String, Object>>) param.get("newParticipant");
        Map<String, Object> newLive = (Map<String, Object>) param.get("newLive");
        newLive.put("updateTime", format.format(new Date()));
        //修改直播基本信息时
        String liveId = oldLive.get("id").toString();
        //登录者的id
        String user_id = param.get("user_id").toString();
        //创建者的id
        String createUserId = param.get("createUserId").toString();
        //审批状态 (0/1)
        String approvalStatus = param.get("approvalStatus").toString();

        //查询所有的管理员用户 hostIds
        List<FbsUser> hostUserList = ksUserMapper.findAllHostUserList();
        List<Integer> hostList = new ArrayList<Integer>();
        for (FbsUser userBean : hostUserList) {
            int id = userBean.getId();
            hostList.add(id);
        }
        //根据部门id查询相应的部门名称
        FbsDepartment department = fbsDepartmentMapper.queryDepartmentById(Integer.parseInt(newLive.get("department").toString()));
        String departmentName = department.getDepartmentName() == null ? "" : department.getDepartmentName();
        String departmentNameOld = oldLive.get("departmentName") == null ? "" : oldLive.get("departmentName").toString();
        insertMessage(createUserId,user_id,departmentName, departmentNameOld, liveId, "直播（"+newLive.get("liveName").toString()+"）的直播科室已修改，由“");

        String fileName = newLive.get("fileName") == null ? "" : newLive.get("fileName").toString();
        String fileNameOld = oldLive.get("file_name") == null ? "" : oldLive.get("file_name").toString();//
        if(!"".equals(fileName)){
            insertMessage(createUserId,user_id,fileName, fileNameOld, liveId, "直播（"+newLive.get("liveName").toString()+"）的上传附件已修改，由“");
        }

        String pictureName = newLive.get("pictureName") == null ? "" : newLive.get("pictureName").toString();
        String pictureNameOld = oldLive.get("pictureName") == null ? "" : oldLive.get("pictureName").toString();//
        if(!"".equals(pictureName)){
            insertMessage(createUserId,user_id,pictureName, pictureNameOld, liveId, "直播（"+newLive.get("liveName").toString()+"）的上传图片已修改，由“");
        }

        String liveName = newLive.get("liveName").toString();
        String liveNameOld = oldLive.get("title").toString();
        insertMessage(createUserId,user_id,liveName, liveNameOld, liveId, "直播名称已修改，由“");
        String mobilePhone = newLive.get("phone").toString();
        String mobilePhoneOld = oldLive.get("phone").toString();
        insertMessage(createUserId,user_id,mobilePhone, mobilePhoneOld, liveId, "直播（"+liveName+"）的电话已修改，由“");
        String email = newLive.get("email") == null ? "" : newLive.get("email").toString();
        String emailOld = oldLive.get("email") == null ? "" : oldLive.get("email").toString();
        insertMessage(createUserId,user_id,email, emailOld, liveId, "直播（"+liveName+")的联系邮箱已修改，由“");
        String hospitalURL = newLive.get("hospitalURL") == null ? "" : newLive.get("hospitalURL").toString();
        String hospitalWebsiteOld = oldLive.get("hospitalWebsite") == null ? "" : oldLive.get("hospitalWebsite").toString();
        insertMessage(createUserId,user_id,hospitalURL, hospitalWebsiteOld, liveId, "直播（"+liveName+")的医院网址已修改，由“");
        String liveIntroduction = newLive.get("liveIntroduction") == null ? "" : newLive.get("liveIntroduction").toString();
        String liveIntroductionOld = oldLive.get("liveIntroduction") == null ? "" : oldLive.get("liveIntroduction").toString();
        insertMessage(createUserId,user_id,liveIntroduction, liveIntroductionOld, liveId, "直播（"+liveName+"）的医院简介已修改，由“");

        //当直播开始时间和结束时间改变时
        String userId = oldLive.get("userId").toString();
        String startTime = newLive.get("startTime").toString();
        String startTimeOld = oldLive.get("startTime").toString();
        if (startTime.length() != startTimeOld.length()) {
            startTimeOld = startTimeOld.substring(0, startTimeOld.length() - 5);
        }
        String endTime = newLive.get("endTime").toString();
        String endTimeOld = oldLive.get("endTime").toString();
        if (endTime.length() != endTimeOld.length()) {
            endTimeOld = endTimeOld.substring(0, endTimeOld.length() - 5);
        }
        Map<String, Object> mapParams = new HashMap<String, Object>();
        mapParams.put("liveId", liveId);
        mapParams.put("liveName", liveName);
        mapParams.put("userId", userId);
        mapParams.put("startTime", startTime);
        mapParams.put("startTimeOld", startTimeOld);
        mapParams.put("endTime", endTime);
        mapParams.put("endTimeOld", endTimeOld);
        mapParams.put("user_id", user_id);
        mapParams.put("approvalStatus",approvalStatus);
        mapParams.put("createUserId",createUserId);
        //json字符创转化为List<map>
        if (newParticipant.get(0).containsKey("hospitalName") && oldParticipant.get(0).containsKey("hospitalName")) {
            //调用操作记录方法
            insertMessageHost(newParticipant, oldParticipant, mapParams);
        }
        //调用操作记录方法
        if (!startTime.equals(startTimeOld) || !endTime.equals(endTimeOld)) {
            insertMessageTime(mapParams);
        }

        //时间变动或者参与人变动
        if (!isSameParticipant(oldParticipant, newParticipant) || !isSameTime(oldLive, newLive)) {
            //医院用户申请，管理员修改已审批的申请（不需要重新走流程的）
            //医院用户申请，申请方修改已审批的申请（不需要重新走流程的）
            if("1".equals(approvalStatus)||"0".equals(approvalStatus)){
                liveBroadCastMapper.deletePaticipant(newLive);
                for (Map<String, Object> map : newParticipant) {
                    int hospitalId;
                    if (map.get("hospitalId") == null) {
                        hospitalId = Integer.parseInt(map.get("id").toString());
                    } else {
                        hospitalId = Integer.parseInt(map.get("hospitalId").toString());
                    }
                    map.remove("id");
                    String newVideoNum = liveCodecMapper.findNewVideoNum(hospitalId);
                    map.put("liveId", newLive.get("liveId").toString());
                    map.put("newvideoNum", newVideoNum);
                    map.put("hospitalId", hospitalId);
                    Object serialNumber = map.get("serialNumber");
                    if (serialNumber != null && "1".equals(serialNumber.toString())) {
                        map.put("isHost", "1");
                    } else {
                        map.put("isHost", "2");
                    }
                    liveBroadCastMapper.insertParticipant(map);
                }
                newLive.put("approvalStatus", "0");//重新审批
            }
        }
        //二者都没变动
        else {
            liveBroadCastMapper.clearHost(newLive);
            for (Map<String, Object> map : newParticipant) {
                if (map.get("hospitalId") == null) {
                    map.put("hospitalId", map.get("id"));
                }
                Object serialNumber = map.get("serialNumber");
                if (serialNumber != null && "1".equals(serialNumber.toString())) {
                    map.put("isHost", "1");
                } else {
                    map.put("isHost", "2");
                }
                map.put("liveId", newLive.get("liveId"));
                liveBroadCastMapper.updateParticipant(map);
            }
        }
        liveBroadCastMapper.modifyLive(newLive);
        return ResultKit.success();
    }


    /**
     * 修改记录处理方法
     *
     * @param value
     * @param valueOld
     * @param liveId
     * @param fixName
     */
    public void insertMessage(String createUserId,String user_id,String value, String valueOld, String liveId, String fixName) {
        //查询所有的管理员用户 hostIds
        List<FbsUser> hostUserList = ksUserMapper.findAllHostUserList();
        List<Integer> hostList = new ArrayList<Integer>();
        for (FbsUser userBean : hostUserList) {
            int id = userBean.getId();
            hostList.add(id);
        }
        //直播审批修改直播名称，直播开始时间，操作记录入表
        if (!value.equals(valueOld)) {
            if ("".equals(valueOld)) {
                insertModefiyLiveMessage(liveId,hostList,createUserId,user_id,value,"空",fixName);
            } else {
                insertModefiyLiveMessage(liveId,hostList,createUserId,user_id,value,valueOld,fixName);
            }
        }
    }

    public void insertModefiyLiveMessage(String liveId,List<Integer> hostList,String createUserId,String user_id,String value, String valueOld,String fixName){
        Date time = new Date();
        FbsLiveMessage message = new FbsLiveMessage();
        List<FbsLiveParticipant> participantsList = liveParticiPantMapper.queryFbsLiveParti(Integer.parseInt(liveId));
        //医院用户申请，管理员修改未审批的申请，给申请医院发送消息通知，其他参与方没有消息通知
        if(!hostList.contains(Integer.parseInt(createUserId))){
            for (FbsLiveParticipant partiBean : participantsList) {
                //过滤没参加直播的参与方
                String participation = partiBean.getParticipation();
                if (participation.equals("0") || participation.equals("1")) { //已参与的
                    int hospitalId1 = partiBean.getHospitalId();
                    FbsUser userBean = ksUserMapper.getFbUserByhospitalId(hospitalId1);
                    int userId1 = userBean.getId();
                    //申请方 == 参与方
                    if(userId1 == Integer.parseInt(createUserId)){
                        message.setUserId(userId1);
                        message.setCreatorId(user_id);
                        message.setMtype("2");//消息信息通知其它参与者
                        message.setStatus("1");
                        //message.setContent(fixName + "空" + "”修改为“" + value + "”");
                        message.setContent(fixName + valueOld + "”修改为“" + value + "”");
                        message.setLiveId(Integer.parseInt(liveId));
                        message.setCreatedTime(time);
                        liveMessageMapper.insertLiveMessage(message);
                    }
                }
            }
            //医院用户申请，管理员修改未审批的申请，不给管理员用户发消息信息
            if(!hostList.contains(user_id)){
                //给管理员发送消息信息
                for (int userId : hostList) {
                    message.setLiveId(Integer.parseInt(liveId));
                    //message.setContent(fixName + "空" + "”修改为“" + value + "”");
                    message.setContent(fixName + valueOld + "”修改为“" + value + "”");
                    message.setUserId(userId);
                    message.setCreatorId(user_id);
                    message.setMtype("1");//修改记录类型
                    message.setStatus("1");
                    message.setCreatedTime(time);
                    liveMessageMapper.insertLiveMessage(message);
                    message.setMtype("2");//消息信息
                    message.setStatus("1");
                    message.setCreatedTime(time);
                    liveMessageMapper.insertLiveMessage(message);
                }
            }
        }else{
            //管理员申请，管理员修改未审批的申请，给管理员发送消息通知，所有参与方医院没有消息通知
            for (int userId : hostList) {
                //给管理员发送通知
                message.setLiveId(Integer.parseInt(liveId));
                //message.setContent(fixName + "空" + "”修改为“" + value + "”");
                message.setContent(fixName + valueOld + "”修改为“" + value + "”");
                message.setUserId(userId);
                message.setCreatorId(user_id);
                message.setMtype("1");//修改记录类型
                message.setStatus("1");
                message.setCreatedTime(time);
                liveMessageMapper.insertLiveMessage(message);
                message.setMtype("2");//消息信息
                message.setStatus("1");
                message.setCreatedTime(time);
                liveMessageMapper.insertLiveMessage(message);
            }
        }
    }
    /**
     * 更改直播参与方增加操作记录和通知消息
     *
     * @param mapsList
     * @param mapsOld
     * @param mapParams
     */
    public void insertMessageHost(List<Map<String, Object>> mapsList, List<Map<String, Object>> mapsOld, Map<String, Object> mapParams) {
        Date currentTime = new Date();
        //查询所有的管理员用户 hostIds
        List<FbsUser> hostUserList = ksUserMapper.findAllHostUserList();
        List<Integer> hostList = new ArrayList<Integer>();
        for (FbsUser userBean : hostUserList) {
            int id = userBean.getId();
            hostList.add(id);
        }

        FbsLiveMessage parciticMessage = new FbsLiveMessage();
        String liveId = mapParams.get("liveId").toString();
        String liveName = mapParams.get("liveName").toString();
        String userId = mapParams.get("userId").toString();
        String user_id = mapParams.get("user_id").toString();
        //当改变前后 参与方数量不一致时
        if (mapsList.size() != mapsOld.size()) {
            List<String> listNew = new ArrayList<String>();
            List<String> listOld = new ArrayList<String>();
            for (Map<String, Object> map : mapsList) {
                listNew.add(map.get("hospitalName").toString());
            }
            for (Map<String, Object> map : mapsOld) {
                listOld.add(map.get("hospitalName").toString());
            }
            //比较参与方-双方比较
            //FbsLiveMessage parciticMessage = new FbsLiveMessage();
            String strValue = "";
            String strName = "";
            //删除参与方
            if (listNew.size() < listOld.size()) {
                for (int i = 0; i < listOld.toArray().length; i++) {

                    if (!listNew.contains(listOld.toArray()[i])) {
                        //不包含各自参与方
                        String str = listOld.toArray()[i].toString();
                        strValue += str + ',';
                        strName = strValue.substring(0, strValue.length() - 1);
                    }
                }
                //给管理员用户增加一条修改记录
                for (int userIdhost : hostList) {
                    parciticMessage.setUserId(userIdhost);
                    parciticMessage.setMtype("2");
                    parciticMessage.setStatus("1");
                    parciticMessage.setLiveId(Integer.parseInt(liveId));
                    parciticMessage.setCreatorId(user_id);
                    parciticMessage.setCreatedTime(currentTime);
                    parciticMessage.setContent("直播（"+liveName+"）参与方已修改，删除参与方“" + strName + "”请管理员重新审批");
                    liveMessageMapper.insertLiveMessage(parciticMessage);
                    parciticMessage.setContent("直播（"+liveName+"）参与方已修改，删除参与方“" + strName + "”请注意！");
                    parciticMessage.setMtype("1");
                    liveMessageMapper.insertLiveMessage(parciticMessage);
                }

            } else if (listNew.size() > listOld.size()) {//增加参与方
                for (int i = 0; i < listNew.toArray().length; i++) {

                    if (!listOld.contains(listNew.toArray()[i])) {
                        //不包含各自参与方
                        String str = listNew.toArray()[i].toString();
                        strValue += str + ',';
                        strName = strValue.substring(0, strValue.length() - 1);
                    }
                }

                //给管理员用户增加一条修改记录
                for (int userIdadd : hostList) {
                    parciticMessage.setUserId(userIdadd);
                    parciticMessage.setMtype("2");
                    parciticMessage.setStatus("1");
                    parciticMessage.setLiveId(Integer.parseInt(liveId));
                    parciticMessage.setCreatorId(user_id);
                    parciticMessage.setCreatedTime(currentTime);
                    parciticMessage.setContent("直播（"+liveName+"）参与方已修改，新增参与方“" + strName + "”请管理员重新审批");
                    liveMessageMapper.insertLiveMessage(parciticMessage);
                    parciticMessage.setContent("直播（"+liveName+"）参与方已修改，新增参与方“" + strName + "”请注意！");
                    parciticMessage.setMtype("1");
                    liveMessageMapper.insertLiveMessage(parciticMessage);
                }
            }

        }

        //保证是对参与者做了相应的更改操作（改变前后传过来的json格式有区别）
        String namepersonone = "";
        String namepersontwo = "";
        String nameperoneold = "";
        String namepertwoold = "";
            for (Map<String, Object> map : mapsList) {
                if (String.valueOf(map.get("serialNumber")).equals("1")) {//第一主持人
                    namepersonone = map.get("hospitalName").toString();
                } else if (String.valueOf(map.get("serialNumber")).equals("2")) {//第二主持人
                    namepersontwo = map.get("hospitalName").toString();
                }
            }
            for (Map<String, Object> map : mapsOld) {
                if (String.valueOf(map.get("serialNumber")).equals("1")) {//第一主持人
                    nameperoneold = map.get("hospitalName").toString();
                } else if (String.valueOf(map.get("serialNumber")).equals("2")) {//第二主持人
                    namepertwoold = map.get("hospitalName").toString();
                }
            }

        //比较改变前后的主持人变化情况
        if (namepersonone.equals(nameperoneold) && namepersontwo.equals(namepertwoold)) {
            //主持人没更换
            //增加或减少参与者
            return;
        } else if (!namepersonone.equals(nameperoneold) && namepersontwo.equals(namepertwoold)) {
            //更换第一主持人
            //给管理员用户增加一条修改记录
            for (int userIdadd : hostList) {
                parciticMessage.setUserId(userIdadd);
                parciticMessage.setMtype("1");
                parciticMessage.setStatus("1");
                parciticMessage.setLiveId(Integer.parseInt(liveId));
                parciticMessage.setCreatorId(user_id);
                parciticMessage.setCreatedTime(currentTime);
                parciticMessage.setContent("直播（"+liveName+"）主持人已修改，第一主持人由“" + nameperoneold + "”切换到“" + namepersonone + "”");
                liveMessageMapper.insertLiveMessage(parciticMessage);
                parciticMessage.setMtype("2");
                parciticMessage.setContent("直播（"+liveName+"）主持人已修改，至审批页面重新审批，第一主持人由“" + nameperoneold + "”切换到“" + namepersonone + "”");
                liveMessageMapper.insertLiveMessage(parciticMessage);
            }
        } else if (namepersonone.equals(nameperoneold) && !namepersontwo.equals(namepertwoold)) {
            //更换第二主持人
            for (int userIdchanget : hostList) {
                parciticMessage.setUserId(userIdchanget);
                parciticMessage.setMtype("1");
                parciticMessage.setStatus("1");
                parciticMessage.setLiveId(Integer.parseInt(liveId));
                parciticMessage.setCreatorId(user_id);
                parciticMessage.setCreatedTime(currentTime);
                parciticMessage.setContent("直播（"+liveName+"）主持人已修改，第二主持人由“" + namepertwoold + "”切换到“" + namepersontwo + "”");
                liveMessageMapper.insertLiveMessage(parciticMessage);
                parciticMessage.setMtype("2");
                parciticMessage.setContent("直播（"+liveName+"）主持人已修改，第二主持人由“" + namepertwoold + "”切换到“" + namepersontwo + "”请管理员至审批页面重新审批，");
                liveMessageMapper.insertLiveMessage(parciticMessage);
            }
        } else if (!namepersonone.equals(nameperoneold) && !namepersontwo.equals(namepertwoold)) {
            //第一，第二主持人都更换了
            for (int userIdchanget : hostList) {
                parciticMessage.setUserId(userIdchanget);
                parciticMessage.setMtype("1");
                parciticMessage.setStatus("1");
                parciticMessage.setLiveId(Integer.parseInt(liveId));
                parciticMessage.setCreatorId(user_id);
                parciticMessage.setCreatedTime(currentTime);
                parciticMessage.setContent("直播（"+liveName+"）主持人已修改，第一主持人由“" + nameperoneold + "”切换到“" + namepersonone + "”，第二主持人由“" + namepertwoold + "”切换到“" + namepersontwo+"”");
                liveMessageMapper.insertLiveMessage(parciticMessage);
                parciticMessage.setMtype("2");
                parciticMessage.setContent("直播（"+liveName+"）主持人已修改，第一主持人由“" + nameperoneold + "”切换到“" + namepersonone + "”第二主持人由“"+namepertwoold + "”切换到“" + namepersontwo+"”请管理员至审批页面重新审批，");
                liveMessageMapper.insertLiveMessage(parciticMessage);
            }
        }
    }

    /**
     * 更改开始和结束时间增加修改记录和通知消息
     *
     * @param mapParams
     */
    public void insertMessageTime(Map<String, Object> mapParams) {
        Date currentTime = new Date();

        //查询所有的管理员用户 hostIds
        List<FbsUser> hostUserList = ksUserMapper.findAllHostUserList();
        List<Integer> hostList = new ArrayList<Integer>();
        for (FbsUser userBean : hostUserList) {
            int id = userBean.getId();
            hostList.add(id);
        }

        String liveId = mapParams.get("liveId").toString();
        String liveName = mapParams.get("liveName").toString();
        String user_id = mapParams.get("user_id").toString();

        String startTime = mapParams.get("startTime").toString();
        String startTimeOld = mapParams.get("startTimeOld").toString();
        String endTime = mapParams.get("endTime").toString();
        String endTimeOld = mapParams.get("endTimeOld").toString();
        String approvalStatus =mapParams.get("approvalStatus").toString();
        String createUserId =mapParams.get("createUserId").toString();
        if (!startTime.equals(startTimeOld) || !endTime.equals(endTimeOld)) {
            //查询所属直播的所有已参与的参与方（）
            FbsLiveMessage Bean = new FbsLiveMessage();
            List<FbsLiveParticipant> participantsList = liveParticiPantMapper.queryFbsLiveParti(Integer.parseInt(liveId));
            for (FbsLiveParticipant partiBean : participantsList) {
                //过滤没参加直播的参与方
                String participation = partiBean.getParticipation();
                if (participation.equals("0") || participation.equals("1")) { //已参与的
                    int hospitalId1 = partiBean.getHospitalId();
                    FbsUser userBean = ksUserMapper.getFbUserByhospitalId(hospitalId1);
                    int userId1 = userBean.getId();
                    Bean.setUserId(userId1);
                    Bean.setCreatorId(user_id);
                    Bean.setMtype("2");//消息信息通知其它参与者
                    Bean.setStatus("1");
                    //医院用户申请，管理员修改已审批的申请（不需要重新走流程的），给所有参与方医院发送消息通知
                    if("1".equals(approvalStatus) && !hostList.contains(Integer.parseInt(user_id)) && !hostList.contains(Integer.parseInt(createUserId))){
                        Bean.setContent("直播（" + liveName + "）直播时间已修改");
                    }else{
                        Bean.setContent("直播（" + liveName + "）直播时间已修改，需要管理员重新审批");
                    }
                    Bean.setLiveId(Integer.parseInt(liveId));
                    Bean.setCreatedTime(currentTime);
                    liveMessageMapper.insertLiveMessage(Bean);
                    if("1".equals(approvalStatus) && hostList.contains(Integer.parseInt(user_id)) && !hostList.contains(Integer.parseInt(createUserId))){
                        Bean.setContent("直播（" + liveName +"）直播时间已修改");
                    }else{
                        Bean.setContent("直播（" + liveName +"）直播时间已修改，需要管理员重新审批");
                    }
                    Bean.setMtype("1");
                    liveMessageMapper.insertLiveMessage(Bean);
                }
            }
            for (int userId : hostList) {
                if(hostList.contains(Integer.parseInt(user_id))){
                    //给管理员发送通知
                    Bean.setLiveId(Integer.parseInt(liveId));
                    Bean.setContent("直播（" + liveName + "）直播时间已修改，需要管理员重新审批");
                    Bean.setUserId(userId);
                    Bean.setCreatorId(user_id);
                    Bean.setMtype("2");
                    Bean.setStatus("1");
                    Bean.setCreatedTime(currentTime);
                    liveMessageMapper.insertLiveMessage(Bean);
                    Bean.setContent("直播（" + liveName + "）直播时间已修改，需要重新审批");
                    Bean.setMtype("1");
                    liveMessageMapper.insertLiveMessage(Bean);
                }else {
                    Bean.setLiveId(Integer.parseInt(liveId));
                    Bean.setContent("直播（" + liveName + "）直播时间已修改，需要管理员重新审批");
                    Bean.setUserId(userId);
                    Bean.setCreatorId(user_id);
                    Bean.setMtype("2");
                    Bean.setStatus("1");
                    Bean.setCreatedTime(currentTime);
                    liveMessageMapper.insertLiveMessage(Bean);
                    Bean.setContent("直播（" + liveName + "）直播时间已修改，需要重新审批");
                    Bean.setMtype("1");
                    liveMessageMapper.insertLiveMessage(Bean);
                }
            }
            //更新该直播信息审批状态(待审批让kscc管理重新审批)
            //LiveBroadApproveMapper.updateLiveApproveStatus(Integer.parseInt(liveId));
        }
    }

    /**
     * 此处请注意，会议有可能提前开始，有可能，到时未开始，会自动开始，
     * 由于我们调用的是第三方创会接口，所以，关于会议时间的一切，
     * 统一以平台会议为标准
     *
     * @param liveId
     * @return
     */
    @Override
    public ServiceResponse startLive(final String liveId,int flag) {
        //分为手动开始直播，和自动开始直播
        //手动开始直播，需要记录开始时间，结合创建的直播的结束时间(endTime)得到会议时长
        //自动开始直播，根据创建会议的startTime字段得到会议开始时间，结合endTime得出会议时长
        Map<String, Object> param = getLiveDetail(new HashMap<String, Object>() {{
            put("liveId", liveId);
        }});
        long duration;
        //自动开始
        String startTime=null;
        if (flag == 0) {
            duration = (((Date) param.get("endTime")).getTime() - ((Date) param.get("startTime")).getTime()) / 1000 / 60;
        }
        //手动开始
        else {
            Date date = new Date();
            startTime = format.format(date);
            duration = (((Date) param.get("endTime")).getTime() - date.getTime()) / 1000 / 60;
        }
        String confName = param.get("title").toString();
        List<Map<String, Object>> invites = (List<Map<String, Object>>) param.get("participants");
        List<String> mtE164s = new ArrayList<>();
        for (Map<String, Object> map : invites) {
            mtE164s.add(map.get("newvideoNum").toString());
        }
        String jsonParam = api.generateConfParam(confName, mtE164s, duration);
        Map<String, Object> response = api.createConf(jsonParam);
        String confId;
        if (response != null) {
            if ("1".equals(response.get("success").toString())) {
                confId = response.get("conf_id").toString();
//                Map<String, Object> responseForConfInfo = api.getMeetingInfo(confId);
//                String trueStartTime = responseForConfInfo.get("start_time").toString().replace("T", " ");
//                trueStartTime = trueStartTime.substring(0, trueStartTime.indexOf("+"));
//                String trueEndTime = responseForConfInfo.get("end_time").toString().replace("T", " ");
//                trueEndTime = trueEndTime.substring(0, trueEndTime.indexOf("+"));
//                liveBroadCastMapper.startLive(param.get("id").toString(), confId, trueStartTime, trueEndTime);
                liveBroadCastMapper.startLive(param.get("id").toString(), confId, startTime);

                /**
                 * 开始直播的时候自己看自己
                 */
                List<Map<String, Object>> participants = (List<Map<String, Object>>) param.get("participants");
                List <Map<String,String>> loginQueue = new ArrayList<>();
                for (Map<String, Object> map : participants) {
                    Map<String,String> temp = new HashMap<>();
                    temp.put("ip",map.get("ip").toString());
                    temp.put("port",map.get("port").toString());
                    temp.put("hospitalId",map.get("hospitalId").toString());
                    temp.put("hospitalName",map.get("hospitalName").toString());
                    temp.put("username",map.get("username").toString());
                    temp.put("password",map.get("password").toString());
                    loginQueue.add(temp);
                }
                for (Map<String,String> temp : loginQueue) {
                    medTApi.viewSelfOrOther(temp,0);
                }
                return ResultKit.success();
            } else if ("0".equals(response.get("success").toString())) {
                return ResultKit.fail(response.get("error_code") + ":" + response.get("description"));
            }
        }

        return ResultKit.fail("开始会议失败");
    }


    /**
     * 线程执行不断获取参与方的在线,静音，哑音，是否有发言人，有的话，发言人是谁！
     *
     * @param confId
     */
    public void getTerminalStatus(final String confId) {
        final Map<Object, Object> statusMap = new HashMap<>();
        final Map<String, Object> mtsStatus = new HashMap<>();
        cachedThreadPool.execute(new Runnable() {
            @Override
            public void run() {
                boolean flag = true;
                while (flag) {
                    try {
                        Thread.sleep(4000);
                        Map<String, Object> responseForMts = api.getMTS(confId);
                        Map<String, Object> responseForSpeak = api.getSpeaker(confId);
                        if (sender.getSessionsOfConf().get(confId) != null) {
                            if ("1".equals(responseForMts.get("success").toString())) {
                                List<MorphDynaBean> mts = (List<MorphDynaBean>) responseForMts.get("mts");
                                for (MorphDynaBean mt : mts) {
                                    String mtId=mt.get("mt_id").toString();
                                    Map<String, Object> mtObject = new HashMap<>();
                                    mtObject.put("online", mt.get("online"));
                                    mtObject.put("silence", mt.get("silence"));
                                    mtObject.put("mute", mt.get("mute"));
                                    mtObject.put("speaker",
                                            mtId.equals(responseForSpeak.get("mt_id"))?1:0
                                    );
                                    statusMap.put(mtId, mtObject);
                                }
                                mtsStatus.put("mtsStatus" + confId, statusMap);
                                String status = JSON.toJSONString(mtsStatus);
                                sender.sendData(status, confId);
                            }
                        } else {
                            flag = false;
                            isConferencePoolExist.remove(confId);
                        }
//                        System.out.println("线程isConferencePoolExist存在吗:" + isConferencePoolExist);
//                        System.out.println("该会议中的session长度:" + sender.getSessionsOfConf().get(confId).size());
                    } catch (InterruptedException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                    }
                }
            }
        });
    }


    @Override
    public Map<String, Object> cancelLive(String param) {
        final int status = liveBroadCastMapper.cancelLive(param);
        return new HashMap<String, Object>() {{
            put("status", status);
        }};
    }

    /**
     * 在此处才获取终端会议列表的目的是，创会是一个繁琐的工作，不可创会之后立即获得终端状态
     * 需要再会议列表中进去，启动线程参与方状态线程，呼叫参与方（kscc管理员进入无须呼入），开启会议混音。
     * 并且每次进入都会判断线程是否存在，存在则无须开启。
     *
     * @param confId   会议id
     * @param userId   用户id
     * @param roleCode 用户角色
     * @return ServiceResponse
     * @author wanghairui
     */

    @Override
    public ServiceResponse getMts(final String confId, String userId, String roleCode) {

        String mtId = liveBroadCastMapper.getMtIdByUserId(confId, userId);
        /*呼叫逻辑，分为是不是KSCC管理员，还有参与方mtId有没有加载过，不是管理员并且存在mtId,进去的时候再主动呼叫编解码器*/
        if (!"role1".equals(roleCode) && mtId != null) {
            Map<String, Object> param = new HashMap<>();
            Map<String, Object> params = new HashMap<>();
            List<Map<String, Object>> mts = new ArrayList<>();
            Map<String, Object> mt = new HashMap<>();
            mt.put("mt_id", mtId);
            mt.put("forced_call", 0);
            mts.add(mt);
            params.put("mts", mts);
            param.put("confId", confId);
            param.put("params", params);
            api.callParticipant(param);
        }

        /*线程存在，说明都加载完成，无需走下面流程*/
        if (isConferencePoolExist.get(confId) != null) {
            return ResultKit.success();
        }

         /*该 会议 下的线程不存在,判断mtId有没有被加载过,分为进入会议人是谁：1，kscc管理员，2：医院用户*/

         /*医院用户，且被加载过*/
        if (mtId != null) {
            isConferencePoolExist.put(confId, true);
            getTerminalStatus(confId);
            return ResultKit.success();
        }
        /*mtId为null，两个角色都有可能*/

        List<Map<String, Object>> invites =
                liveBroadCastMapper.queryParticipant(new HashMap<String, Object>() {{
                    put("confId", confId);
                }});

        if ("role1".equals(roleCode)) {
            /*此处判断该会议有没有被加载过，根据confId查找参与方的mtId,判断是否存在mtId*/
            /*参与方被加载过，赋值过*/
            if (invites.get(0).get("mtId") != null) {
                isConferencePoolExist.put(confId, true);
                getTerminalStatus(confId);
                return ResultKit.success();
            }

        }
        Map<String, Object> responseForMts = api.getMTS(confId);
        List<Map<String, Object>> members = new ArrayList<>();
        if ("1".equals(responseForMts.get("success").toString())) {
            List<MorphDynaBean> mts = (List<MorphDynaBean>) responseForMts.get("mts");
            if (mts.size() != 0) {
                for (Map<String, Object> map : invites) {
                    for (MorphDynaBean mt : mts) {
                        if (map.get("newvideoNum").toString().equals(mt.get("e164").toString())) {
                            Map<String, Object> mixMap = new HashMap<>();
                            mixMap.put("mt_id", mt.get("mt_id"));
                            members.add(mixMap);
                            map.put("mtId", mt.get("mt_id"));
                            map.put("updateTime", format.format(new Date()));
                            liveBroadCastMapper.updateParticipantMtsById(map);
                            break;
                        }
                    }
                }
                Map<String, Object> meettingMap = new HashMap<>();

                Map<String, Object> params = new HashMap<>();
                params.put("mode", 1);
                params.put("members", members);

                meettingMap.put("confId", confId);
                meettingMap.put("params", params);
                api.meettingMixs(meettingMap);
                getTerminalStatus(confId);
                isConferencePoolExist.put(confId, true);
                return ResultKit.success();
            }
            return ResultKit.fail("无参与方");
        }
        return ResultKit.fail("调用获取终端列表失败");
    }

    private boolean isSameParticipant(List<Map<String, Object>> oldOne, List<Map<String, Object>> newOne) {
        List<String> oldHospitalId = new ArrayList<>();
        List<String> newHospitalId = new ArrayList<>();
        for (Map<String, Object> map : oldOne) {
            oldHospitalId.add(map.get("hospitalId").toString());
        }
        for (Map<String, Object> map : newOne) {
            if (map.get("hospitalId") == null) {
                newHospitalId.add(map.get("id").toString());
            } else {
                newHospitalId.add(map.get("hospitalId").toString());
            }
        }
        return oldHospitalId.containsAll(newHospitalId) && newHospitalId.containsAll(oldHospitalId);
    }

    private boolean isSameTime(Map<String, Object> oldLive, Map<String, Object> newLive) {
        String oldStartTime = oldLive.get("startTime").toString().substring(0, 16);
        String oldEndTime = oldLive.get("endTime").toString().substring(0, 16);
        String newStartTime = newLive.get("startTime").toString();
        String newEndTime = newLive.get("endTime").toString();
        return oldEndTime.equals(newEndTime) && oldStartTime.equals(newStartTime);
    }

    private void filterHistory(List<FbsLiveBroadcast> broadcasts, List<FbsLiveBroadcast> container, String liveTye) {
        for (FbsLiveBroadcast broadcast : broadcasts) {
            //结束的会议
//			if("2".equals(broadcast.getPlayStatus())){
            broadcast.setLiveType(liveTye);
            container.add(broadcast);
//			}
        }
    }


    //获取当前直播间结束时间
    public String searchEndTime(Map<String, Object> param) {
        return liveBroadCastMapper.searchEndTime(Integer.parseInt(String.valueOf(param.get("liveId"))));
    }


    //更新当前直播间的结束时间(延时)
    @Override
    public String updateEndTime(Map<String, Object> param) {//liveId 延长时间 timeExpand
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
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        Map<String, Object> map = new HashMap<>();
        map.put("endTime", endTime);
        map.put("liveId", Integer.parseInt(String.valueOf(param.get("liveId"))));
        liveBroadCastMapper.updateEndTime(map);
        return endTime;
    }

    @Override
    public ServiceResponse getSelectBroadcast() {
        return ResultKit.serviceResponse(liveBroadCastMapper.selectAllBroadcast());
    }

    @Override
    public ServiceResponse deleteHomePicture(FbsLiveHomepage homepage) {
        int changes = liveBroadCastMapper.deleteHomePictureByLiveId(homepage.getLiveId());
        if(changes==1)
            return ResultKit.success();
        else
            return ResultKit.fail();
    }

    @Override
    @Transactional
    public ServiceResponse addHomePicture(FbsLiveHomepage homepage) {

        if(homepage.getId()!=null){
            liveBroadCastMapper.modifyHomePage(homepage);
            return ResultKit.success();
        }
        liveBroadCastMapper.insertIntoHomePage(homepage);
        return ResultKit.success();
    }


}
