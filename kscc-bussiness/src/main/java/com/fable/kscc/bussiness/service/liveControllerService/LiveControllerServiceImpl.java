package com.fable.kscc.bussiness.service.liveControllerService;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import com.alibaba.fastjson.JSON;
import com.fable.kscc.api.medTApi.MedTApi;
import com.fable.kscc.api.model.hospitalInformation.FbsHospitalInformation;
import com.fable.kscc.api.model.liveCodec.FbsLiveCodec;
import com.fable.kscc.api.model.participant.FbsLiveParticipant;
import com.fable.kscc.api.model.user.FbsUser;
import com.fable.kscc.api.utils.Constants;
import com.fable.kscc.api.utils.HttpUtils;
import com.fable.kscc.bussiness.logandmessage.FabsLiveOprLogUtil;
import com.fable.kscc.api.utils.XmlGenerator;
import com.fable.kscc.api.cache.DataCache;
import com.fable.kscc.bussiness.mapper.fbsUser.FbsUserMapper;
import com.fable.kscc.bussiness.mapper.livecodec.LiveCodecMapper;
import com.fable.kscc.api.medTApi.AuthenticThread;
import com.fable.kscc.bussiness.websocket.Sender;
import net.sf.ehcache.search.Result;
import net.sf.ezmorph.bean.MorphDynaBean;
import net.sf.image4j.util.ConvertUtil;
import org.apache.http.HttpRequest;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fable.kscc.api.kedaApi.KedaApi;
import com.fable.kscc.api.model.livebroadcast.FbsLiveBroadcast;
import com.fable.kscc.api.model.operationLog.FbsLiveOperationLog;
import com.fable.kscc.api.model.page.ResultKit;
import com.fable.kscc.api.model.page.ServiceResponse;
import com.fable.kscc.bussiness.mapper.hospitalInformation.HospitalInformationMapper;
import com.fable.kscc.bussiness.mapper.livebroadcast.LiveBroadCastMapper;
import com.fable.kscc.bussiness.mapper.liveoperationlog.LiveOperationLogMapper;
import com.fable.kscc.bussiness.mapper.liveparticipant.LiveParticiPantMapper;

import net.sf.json.JSONObject;

import javax.imageio.ImageIO;


/**
 * Created by Wanghairui on 2017/8/14.
 */
@Service
public class LiveControllerServiceImpl implements IliveController {

    @Autowired
    private LiveBroadCastMapper broadCastMapper;

    @Autowired
    private LiveParticiPantMapper liveParticiPantMapper;

    @Autowired
    private LiveOperationLogMapper liveOperationLogMapper;

    @Autowired
    private HospitalInformationMapper hospitalInformationMapper;

    @Autowired
    private LiveCodecMapper liveCodecMapper;

    @Autowired
    private FbsUserMapper fbsUserMapper;

    @Autowired
    private KedaApi kedaApi;

    @Autowired
    private Sender sender;

    @Autowired
    private MedTApi medApi;

    private static final Logger logger = LoggerFactory.getLogger(LiveControllerServiceImpl.class);

    @Autowired
    private FabsLiveOprLogUtil logUtil;

    @Override
    public ServiceResponse getLiveList(Map<String, Object> param) {
        List<FbsLiveBroadcast> fbsLiveBroadcasts = broadCastMapper.queryLivingListByUserId(param);
        for (final FbsLiveBroadcast broadcast : fbsLiveBroadcasts) {
            List<Map<String, Object>> participant =
                    broadCastMapper.
                            queryParticipant(new HashMap<String, Object>() {{
                                put("liveId", broadcast.getId());
                                put("isDel", "0");
                            }});
            broadcast.setParticipantNames(participant);
        }
        return ResultKit.serviceResponse(fbsLiveBroadcasts);
    }

    @Override
    public ServiceResponse getParticipant(Map<String, Object> param) {
        return null;
    }

    @Override
    public ServiceResponse choosePicture(Map<String, Object> param) {
        //画面选看产生相应的日志
        markChoosePictureLog(param);
        /**
         * 转换信道——自己看平台
         */
        Map<String,Object> params = (Map<String, Object>) param.get("params");
        Map<String,Object> dst = (Map<String, Object>) params.get("dst");
        Map<String,Object> src = (Map<String, Object>) params.get("src");
        String srcmtId = src.get("mt_id").toString();
        String mtId = dst.get("mt_id").toString();
        List<Map<String, Object>> participants = (List<Map<String, Object>>) param.get("participants");
        param.put("OPStatus","choosePicture");
/*        String flag = broadCastMapper.queryBroadcastOPStatus(param); //判断现在是选定发言人还是画面选看
        if ("chooseSpeaker".equals(flag)) {
            cancelSpeaker(param);
        }else if("pictureSynthesiss".equals(flag)) {
            cancelSynthesiss(param);
        }*/
        broadCastMapper.modifyBroadcastOPStatus(param);//更新现在的操作状态
        MedTApi api = new MedTApi();
        for (Map<String, Object> map : participants) {
            if(srcmtId.equals(mtId)){
                if (mtId.equals(map.get("mtId").toString())) {
                    Map<String, String> temp = new HashMap<>();
                    temp.put("ip",map.get("ip").toString());
                    temp.put("port",map.get("port").toString());
                    temp.put("hospitalId",map.get("hospitalId").toString());
                    temp.put("hospitalName",map.get("hospitalName").toString());
                    String s =  api.viewSelfOrOther(temp,0);
                    if ("fail".equals(s)) {
                        return ResultKit.fail(temp.get("hospitalName")+"调用编解码器失败");
                    }
                    return ResultKit.success();
                }
            }
            if (mtId.equals(map.get("mtId").toString())) {
                Map<String, String> temp = new HashMap<>();
                temp.put("ip",map.get("ip").toString());
                temp.put("port",map.get("port").toString());
                temp.put("hospitalId",map.get("hospitalId").toString());
                temp.put("hospitalName",map.get("hospitalName").toString());
                String s =  api.viewSelfOrOther(temp,1);
                if ("fail".equals(s)) {
                    return ResultKit.fail(temp.get("hospitalName")+"调用编解码器失败");
                }
            }
        }
        Map<String, Object> response = kedaApi.choosePicture(param);
        if ("1".equals(response.get("success").toString())) {
            return ResultKit.success();
        } else if ("0".equals(response.get("success").toString())) {
            if ("20435".equals(response.get("error_code"))) {
                return ResultKit.fail("指定终端未与会");
            }
        }
        return ResultKit.fail("画面选看失败");
    }

    @Override
    public ServiceResponse switchHost(final Map<String, Object> param) {
        //切换主持人后选看信息获取
        Map<String, Object> response1 = kedaApi.getChoosePicture(param.get("confId").toString());
        //会场纪录增加更换主持人信息
        Map<String, Object> response = kedaApi.switchHost(param);
        Map<Object, Object> roleMessage = new HashMap<>();
        Map<Object, Object> roleMessageValue = new HashMap<>();
        if ("1".equals(response.get("success").toString())) {
            String confId = param.get("confId").toString();
            Date currentTime = new Date();
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String dateString = formatter.format(currentTime);

            Map<String, Object> map = new HashMap<String, Object>();
            final Map mapStr = JSONObject.fromObject(param.get("params").toString());
            map.put("mtId", mapStr.get("mt_id").toString());
            map.put("confId", param.get("confId").toString());
            map.put("mtIdOld", param.get("mtIdOld").toString());
            //map.put("old", param.get("old").toString());
            final int liveId = broadCastMapper.queryFbsLiveBroadcast(map).getId();
            map.put("liveId", liveId);

            //更新相应的serialnumber的值
            liveParticiPantMapper.clearHostByHaiRui(liveId);
            liveParticiPantMapper.updateParticipantSerisNum(new HashMap<String, Object>() {{
                put("serialnumber", 1);
                put("mtId", mapStr.get("mt_id").toString());
                put("liveId", liveId);
            }});
            if (sender.getSessionsOfConf().get(confId) != null) {
                sender.sendData(getJsonData(confId, roleMessageValue, roleMessage), confId);
            }
            final String hospitalNameNow = param.get("hospitalNameNow").toString();
            final String hospitalNameEx = param.get("hospitalNameEx").toString();

            FbsLiveOperationLog logBean = new FbsLiveOperationLog();
            //操作者id
            String operateId = param.get("operateId").toString();
            logBean.setOperationId(Integer.parseInt(operateId));
            logBean.setLiveId(liveId);
            logBean.setOperationTime(dateString);
            logBean.setOperationContent("主持人由" + hospitalNameEx + "切换成" + hospitalNameNow);
            liveOperationLogMapper.insertLiveOperationLog(logBean);

            return ResultKit.success();
        }
        return ResultKit.fail("切换主持人失败");
    }

    private String getJsonData(String confId, Map<Object, Object> roleMessageValue, Map<Object, Object> roleMessage) {
        List<Map<String, Object>> roleList = broadCastMapper.getParticipantsRoleByLiveId(confId);
        for (Map<String, Object> map : roleList) {
            roleMessageValue.put(map.get("id"), map.get("ishost"));
        }
        roleMessage.put("switchHost" + confId, roleMessageValue);
        return JSON.toJSONString(roleMessage);
    }

    @Override
    public ServiceResponse applySpeak(Map<String, Object> param) {
        return null;
    }

    @Override
    public ServiceResponse chooseSpeaker(Map<String, Object> param) {
//          confId:'135654'
//        params:{
//            "mt_id": "1"
//        }
        /**
         * 转换信道：主讲人——自己看自己，其他人——看平台
         */
        Map<String,Object> params = (Map<String, Object>) param.get("params");
        String mtId = params.get("mt_id").toString();
        List<Map<String, Object>> participants = (List<Map<String, Object>>) param.get("participants");
        param.put("OPStatus","chooseSpeaker");
        String flag = broadCastMapper.queryBroadcastOPStatus(param); //判断现在是选定发言人还是画面选看
        cancelSynthesiss(param);
        if ("choosePicture".equals(flag)) {
            cancelChoose(param);
        }
        broadCastMapper.modifyBroadcastOPStatus(param);//更新现在的操作状态
        MedTApi api = new MedTApi();
        for (Map<String, Object> map : participants) {
            Map<String, String> temp = new HashMap<>();
            temp.put("ip",map.get("ip").toString());
            temp.put("port",map.get("port").toString());
            temp.put("hospitalId",map.get("hospitalId").toString());
            temp.put("hospitalName",map.get("hospitalName").toString());
            if (mtId.equals(map.get("mtId").toString())) {
                String s = api.viewSelfOrOther(temp,0); //自己看自己
                if ("fail".equals(s)) {
                    return ResultKit.fail(temp.get("hospitalName")+"调用编解码器失败");
                }
            }else {
                String s = api.viewSelfOrOther(temp,1); //看平台
                if ("fail".equals(s)) {
                    return ResultKit.fail(temp.get("hospitalName")+"调用编解码器失败");
                }
            }
        }
        Map<String, Object> response = kedaApi.chooseSpeaker(param);
        logUtil.markeOperationLog(param,"2","","关闭主讲人","开启主讲人");
        if (Integer.parseInt(response.get("success").toString()) == 1) {
            return ResultKit.success();
        }
        return ResultKit.fail("选择发言时失败");
    }

    /**
     * 延长直播时间
     */
    @Override
    public ServiceResponse extendTime(Map<String, Object> param) {
        Map<String, Object> params = new HashMap<>();
        params.put("delay_time", param.get("delay_time"));
        param.put("params", params);
        Map<String, Object> response = kedaApi.extendTime(param);
        if (Integer.parseInt(response.get("success").toString()) == 1) {
            logUtil.markExtendTimeLog(param);
            return ResultKit.success();
        }
        return ResultKit.fail("延长失败");
    }

    //邀请参与方
    @Override
    public ServiceResponse inviteParticipant(final Map<String, Object> param) {
        Map<String, Object> response = kedaApi.inviteParticipant(param);
        String mtId;
        List<String> list = new ArrayList<>();
        final int liveId = Integer.parseInt(param.get("liveId").toString());
        String creatorId = param.get("creatorId").toString();
        if (Integer.parseInt(response.get("success").toString()) == 1) {
            List<MorphDynaBean> confenrences = (List<MorphDynaBean>) response.get("mts");
            for (MorphDynaBean bean : confenrences) {
                mtId = bean.get("mt_id").toString();
                list.add(mtId);
            }
            List<Map<String, Object>> paramlist = (List<Map<String, Object>>) param.get("searchParticipant");
            //操作者id
            String operateId = param.get("operateId").toString();
            Map<String,Object> paramMap = new HashMap<>();
            paramMap.put("liveId",liveId);
            paramMap.put("operateId",operateId);
            logUtil.markInviteParticipant(paramlist,paramMap);
            FbsLiveParticipant fbsLiveParticipant = new FbsLiveParticipant();
            for (int i = 0; i < paramlist.size(); i++) {
                final int hospitalId = Integer.parseInt(paramlist.get(i).get("hospitalId").toString());
                //添加参与方赋值‘3’保证排序从上往下
                int serialnumber =Integer.parseInt(paramlist.get(i).get("serialNumber").toString());//3
                fbsLiveParticipant.setSerialnumber(serialnumber);
                fbsLiveParticipant.setHospitalId(hospitalId);//设置参与方医院id
                String newVideoNum = liveCodecMapper.findNewVideoNum(hospitalId);//根据参与方医院id设置新世通账号
                fbsLiveParticipant.setNewvideoNum(newVideoNum);
                fbsLiveParticipant.setIshost("2");
                fbsLiveParticipant.setLiveId(liveId);//设置直播间id
                fbsLiveParticipant.setCreatorId(creatorId);//设置创建者(获取的登陆者id)
                fbsLiveParticipant.setUpdateId(creatorId);
                fbsLiveParticipant.setParticipation("0");
                fbsLiveParticipant.setMtId(list.get(i));
                //更新isDel状态（邀请之前删除的参与方、邀请从未参加该会议的参与方）
                //根据liveId和hospitalId查询相应的参与方信息 有/无 isempty
                FbsLiveParticipant bean = liveParticiPantMapper.queryParcitipantHost(new HashMap<String, Object>(){{put("liveId",liveId);put("hospitalId",hospitalId);}});
                if(null == bean || "".equals(bean)){
                    liveParticiPantMapper.setParticipant(fbsLiveParticipant);
                }else{
                    liveParticiPantMapper.updateParticipantIsDel(new HashMap<String, Object>()
                    {{put("isDel",0);put("liveId",liveId);put("hospitalId",hospitalId);}});
                }
            }
            return ResultKit.serviceResponse(list);
        }
        return ResultKit.fail("邀请参与方失败");
    }

    /**
     * 删除参与方
     */
    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public ServiceResponse deleteParticipant(Map<String, Object> param) {
        //会场纪录增加删除参与方医院
        //软通端的参与方删除
        Map<String, Object> response = kedaApi.deleteParticipant(param);
        int num = (int)param.get("num");
        if(response!=null){
            if (Integer.parseInt(response.get("success").toString()) == 1) {
                Date currentTime = new Date();
                SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                String dateString = formatter.format(currentTime);
                String hospitalName = param.get("hospitalName").toString();
                FbsLiveOperationLog logBean = new FbsLiveOperationLog();
                //操作者id
                String operateId = param.get("operateId").toString();
                logBean.setOperationId(Integer.parseInt(operateId));
                logBean.setLiveId(Integer.parseInt(param.get("liveId").toString()));
                logBean.setOperationTime(dateString);
                logBean.setOperationContent("" + hospitalName + "删除成功");
                liveOperationLogMapper.insertLiveOperationLog(logBean);
                //对参与方做软删除操作
                liveParticiPantMapper.updateParticipantIsDel(param);
                //liveParticiPantMapper.deleteParticipant(param);
                if(num==2){
                    endLive(param);
                }
                return ResultKit.success();
            }
            return ResultKit.fail("参与方删除失败");
        }
            return ResultKit.fail("调用keda视讯平台报错");
    }

    @Override
    public ServiceResponse pictureSynthesis(Map<String, Object> param) {
        Map<String, Object> response = kedaApi.pictureSynthesis(param);
        if ("1".equals(response.get("success").toString())) {
            return ResultKit.success();
        }
        return ResultKit.fail("画面和成失败");
    }

    @Override
    public ServiceResponse pictureSynthesiss(final Map<String, Object> param) {
        /**
         * 转换平台信道
         */

        List<Map<String, Object>> participants = (List<Map<String, Object>>) param.get("participants");
        param.put("OPStatus","pictureSynthesiss");
        //String flag = broadCastMapper.queryBroadcastOPStatus(param); //判断现在是选定发言人还是画面选看
        cancelChoose(param);
        //cancelSpeaker(param);
/*        if("chooseSpeaker".equals(flag)) {
            cancelSpeaker(param);
        }*/
        broadCastMapper.modifyBroadcastOPStatus(param);//更新现在的操作状态
        Map<String,Object> params = (Map<String, Object>) param.get("params");
        List<Map<String,Object>> mems = (List<Map<String, Object>>) params.get("members");
        MedTApi api = new MedTApi();
        for (Map<String, Object> map : participants) {
            Map<String, String> temp = new HashMap<>();
            temp.put("ip",map.get("ip").toString());
            temp.put("port",map.get("port").toString());
            temp.put("hospitalId",map.get("hospitalId").toString());
            temp.put("hospitalName",map.get("hospitalName").toString());
            for (Map<String,Object> mem : mems) {
                if (map.get("mtId").equals(mem.get("mt_id"))) {
                   String s =  api.viewSelfOrOther(temp,1);
                    if ("fail".equals(s)) {
                        return ResultKit.fail(temp.get("hospitalName")+"调用编解码器失败");
                    }
                }
            }
        }

        String confId = param.get("confId").toString();
        Map<String, Object> responseForGet = kedaApi.getPictureSynthesiss(confId);
        if ("1".equals(responseForGet.get("success").toString())) {
            Map<String, Object> responseForCancel = kedaApi.cancelPictureSynthesiss(confId);
            if ("1".equals(responseForCancel.get("success").toString())) {
                Map<String, Object> responseForSynthesiss = kedaApi.pictureSynthesiss(param);
                if ("1".equals(responseForSynthesiss.get("success").toString())) {
                    return ResultKit.success();
                } else {
                    return ResultKit.fail(responseForSynthesiss.toString());
                }
            }
        }
        Map<String, Object> response = kedaApi.pictureSynthesiss(param);
        if (null != response.get("success")) {
            if ("1".equals(response.get("success").toString())) {
                logUtil.markPictureSynthesissLog(param);
                return ResultKit.success();
            }
        }
        return ResultKit.fail(response.toString());
    }

    @Override
    public ServiceResponse silence(Map<String, Object> param) {
        logUtil.markeOperationLog(param,"1","","静音成功","取消静音成功");
        Map<String, Object> response = kedaApi.silence(param);
        if (Integer.parseInt(response.get("success").toString()) == 1) {
            return ResultKit.success();
        }
        return ResultKit.fail("静音失败");
    }

    /**
     * 画面选看日志类
     * @param param
     */
    public void markChoosePictureLog(Map<String, Object> param){
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        Map<String, Object> mapsrc = new HashMap<String, Object>();
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();

        mapsrc.put("confId", param.get("confId").toString());
        int liveId = broadCastMapper.queryFbsLiveBroadcast(mapsrc).getId();
        mapsrc.put("liveId", liveId);
        Map<String, Object> paramsMap = (Map<String, Object>) param.get("params");
        //选看的院方
        Map<String, Object> src = (Map<String, Object>) paramsMap.get("src");
        mapsrc.put("mtId",src.get("mt_id"));
        int hospitalId = liveParticiPantMapper.queryParcitipantHost(mapsrc).getHospitalId();
        String hospitalNameSrc = hospitalInformationMapper.findAllById(hospitalId);
        //为选看的院方
        Map<String,Object> dst = (Map<String, Object>) paramsMap.get("dst");
        mapsrc.put("mtId",dst.get("mt_id"));
        int hospitalIddst = liveParticiPantMapper.queryParcitipantHost(mapsrc).getHospitalId();
        String hospitalNameDst = hospitalInformationMapper.findAllById(hospitalIddst);

        //操作者id
        String operateId = param.get("operateId").toString();
        logBean.setOperationId(Integer.parseInt(operateId));
        logBean.setLiveId(liveId);
        logBean.setOperationTime(dateString);
        logBean.setOperationContent(hospitalNameDst+"选看"+hospitalNameSrc+"成功");//A选看B成功
        liveOperationLogMapper.insertLiveOperationLog(logBean);

    }



    /**
     * 哑音
     */
    @Override
    public ServiceResponse mute(Map<String, Object> param) {
        //哑音状态，1-哑音，0-停止哑音
        //会场纪录增加哑言操作记录
        Map<String, Object> response = kedaApi.mute(param);
        if (Integer.parseInt(response.get("success").toString()) == 1) {
            logUtil.markeOperationLog(param,"1","","开麦成功","静麦成功");
            return ResultKit.success();
        }
        return ResultKit.fail("哑音失败");
    }

    @Override
    public ServiceResponse allSilence(Map<String, Object> param) {
        Map<String, Object> response = kedaApi.allSilence(param);
        if (Integer.parseInt(response.get("success").toString()) == 1) {
            logUtil.markAllSilenceLog(param);
            return ResultKit.success();
        }
        return ResultKit.fail("全场静音失败");
    }

    @Override
    public ServiceResponse allMute(Map<String, Object> param) {
        Map<String, Object> response = kedaApi.allMute(param);
        if (Integer.parseInt(response.get("success").toString()) == 1) {
            logUtil.markAllMuteLog(param);
            return ResultKit.success();
        }
        return ResultKit.fail("全场哑音失败");
    }

    @Override
    public ServiceResponse endLive(Map<String, Object> param) {
        String confId = (String) param.get("confId");
        //结束直播的时候把与会的所有的编解码器的字幕全部清空
        List<Map<String,Object>> codeList = broadCastMapper.getParticipantsByConfId(confId);
        //判断是结束直播还是删除参与方

        if (param.containsKey("hospitalName")){
            FbsHospitalInformation hosBean = hospitalInformationMapper.getHospitalIdByName(param.get("hospitalName").toString());
            List<Map<String,String>> arryCode = liveCodecMapper.getCodecByHospitalId(hosBean.getId());
            for (Map<String,String> mapcode : arryCode){
                Map<String,Object> objMap = new HashMap<>();
                objMap.put("port",mapcode.get("port"));
                objMap.put("ip",mapcode.get("ip"));
                pushBpmContent(objMap);
            }
        }else{
            for(Map<String,Object> map : codeList){
                pushBpmContent(map);
            }
        }

        Map<String, Object> response = kedaApi.endConf(confId);
        if (Integer.parseInt(response.get("success").toString()) == 1) {
            Map<String, Object> params = new HashMap<>();
            params.put("confId", confId);
            param.put("endTime", new Date());
            broadCastMapper.endLive(param);
            return ResultKit.success();
        }
        return ResultKit.fail("结束直播失败");
    }


    public void pushBpmContent(final Map<String,Object> map){
        final ExecutorService service = Executors.newSingleThreadExecutor();
        service.execute(new Runnable() {
            @Override
            public void run() {
                    /*word为发送的字幕*/
                String word = "";
                int length=55*word.length();
                length=length+16-length%16;
                BufferedImage image=new BufferedImage(length, 64, BufferedImage.TYPE_BYTE_BINARY);
                Graphics graphics=image.getGraphics();
                graphics.setColor(new Color(0,0,0));
                graphics.fillRect(0, 0, 600, 400);
                graphics.setColor(new Color(255,255,255));
                graphics.setFont(new Font("楷体",Font.BOLD+ Font.ITALIC,50));
                graphics.drawString(word, 10, 52);

                BufferedImage imageOfConverted= ConvertUtil.convert4(image);
                try {
                    ImageIO.write(imageOfConverted, "BMP", new File(System.getProperty("user.home")+File.separator+"word.bmp"));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            /*编解码ip和端口号port*/
                HttpUtils.upload("http://"+map.get("ip")+":"+map.get("port")+ Constants.MedT100.uploadWord, System.getProperty("user.home")+File.separator+"word.bmp");
                service.shutdown();
            }
        });
    }

    public static void main(String[] args) {
        new LiveControllerServiceImpl().pushBpmContent(new HashMap<String, Object>(){{put("ip","58.240.21.178");put("port","60081");}});
    }
    /**
     * 查看会场记录
     */
    @Override
    public List<FbsLiveOperationLog> meetingRecord(Map<String, Object> param) {
        return liveOperationLogMapper.meetingRecord(param);
    }

    /**
     * 批量呼叫参与方
     */
    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public ServiceResponse callParticipant(Map<String, Object> param) {
        //会场纪录增加呼叫参与方信息
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        Map<String, Object> map = new HashMap<String, Object>();
        String hospitalName = param.get("hospitalName").toString();
        map.put("confId", param.get("confId").toString());
        int liveId = broadCastMapper.queryFbsLiveBroadcast(map).getId();
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();
        //操作者id
        String operateId = param.get("operateId").toString();
        logBean.setOperationId(Integer.parseInt(operateId));
        logBean.setLiveId(liveId);
        logBean.setOperationTime(dateString);
        logBean.setOperationContent("呼叫参与方医院" + hospitalName + "完毕");
        liveOperationLogMapper.insertLiveOperationLog(logBean);

        Map<String, Object> response = kedaApi.callParticipant(param);
        if (Integer.parseInt(response.get("success").toString()) == 1) {
            //liveParticiPantMapper.deleteParticipant(param);
            return ResultKit.success();
        }
        return ResultKit.fail("参与方呼叫失败");
    }

    /**
     * 影藏接口
     *
     * @return
     */
    @Override
    public ServiceResponse getLiveBroadCastList() {
        Map<String, Object> params = new HashMap<>();
        Map<String, Object> param = new HashMap<>();
        params.put("start", 0);
        params.put("count", 0);
        param.put("params", params);
        List<Map<String, Object>> list = new ArrayList<>();
        String confId;
        String name;
        String startTime;
        String endTime;
        List<String> participants;
        Map<String, Object> response = kedaApi.getLiveBroadList(param);
        System.out.println("response===="+response);
        if (Integer.parseInt(response.get("success").toString()) == 1) {
            List<MorphDynaBean> confenrences = (List<MorphDynaBean>) response.get("confs");
            for (MorphDynaBean bean : confenrences) {
                Map<String, Object> meettingMap = new HashMap<>();
                confId = bean.get("conf_id").toString();
                name = bean.get("name").toString();
                startTime = bean.get("start_time").toString().replace("T", " ");
                endTime = bean.get("end_time").toString().replace("T", " ");
                startTime = startTime.substring(0, startTime.indexOf("+"));
                endTime = endTime.substring(0, endTime.indexOf("+"));
                participants = broadCastMapper.queryParticpantsNameByConfId(confId);
                meettingMap.put("startTime", startTime);
                meettingMap.put("endTime", endTime);
                meettingMap.put("confId", confId);
                meettingMap.put("name", name);
                meettingMap.put("participantNames", participants);
                list.add(meettingMap);
            }
            Map<String, Object> numMap = new HashMap<>();
            numMap.put("confNum", confenrences.size());
            list.add(numMap);
            return ResultKit.serviceResponse(list);
        }
        return ResultKit.fail("获取视频会议列表失败");
    }

    @Override
    public ServiceResponse endConf() {
        Map<String, Object> params = new HashMap<>();
        Map<String, Object> param = new HashMap<>();
        params.put("start", 0);
        params.put("count", 0);
        param.put("params", params);
        List<Map<String, Object>> list = new ArrayList<>();
        String confId;
        Map<String, Object> endResponse;
        Map<String, Object> sqlParam = new HashMap<>();
        Map<String, Object> response = kedaApi.getLiveBroadList(param);
        if (Integer.parseInt(response.get("success").toString()) == 1) {
            List<MorphDynaBean> confenrences = (List<MorphDynaBean>) response.get("confs");
            for (MorphDynaBean bean : confenrences) {
                confId = bean.get("conf_id").toString();
                endResponse = kedaApi.endConf(confId);
                sqlParam.put("confId", confId);
                sqlParam.put("endTime", new Date());
                broadCastMapper.endLive(sqlParam);
                list.add(endResponse);
            }
            return ResultKit.serviceResponse(list);
        }
        return ResultKit.fail("删除会议失败");
    }

    @Override
    public ServiceResponse sendScreenWord(Map<String, Object> param) {
        Map<String, Object> response = kedaApi.sendShortMessage(param);
        if ("1".equals(response.get("success").toString())) {
            logUtil.markSendScreenWordLog(param);
            return ResultKit.success();
        }
        return ResultKit.fail(response.get("fail").toString());
    }

    @Override
    public ServiceResponse cancelPictureSynthesiss(Map<String, Object> param) {
        /**
         * 转换自己信道
         */
        List<Map<String, Object>> participants = (List<Map<String, Object>>) param.get("participants");
        //Map<String,Object> params = (Map<String, Object>) param.get("params");
        /*List<Map<String,Object>> mems = (List<Map<String, Object>>) params.get("members");*/
        Map<String, Object> responseMap = kedaApi.getPictureSynthesiss(param.get("confId").toString());
        List<MorphDynaBean> members = (List<MorphDynaBean>) responseMap.get("members");
        MedTApi api = new MedTApi();
        for (Map<String, Object> map : participants) {
            Map<String, String> temp = new HashMap<>();
            temp.put("ip",map.get("ip").toString());
            temp.put("port",map.get("port").toString());
            temp.put("hospitalId",map.get("hospitalId").toString());
            temp.put("hospitalName",map.get("hospitalName").toString());
            if (members != null) {
                for (MorphDynaBean bean : members) {
                    if (map.get("mtId").equals(bean.get("mt_id"))) {
                        String s = api.viewSelfOrOther(temp,0);
                        if ("fail".equals(s)) {
                            return ResultKit.fail(temp.get("hospitalName")+"调用编解码器失败");
                        }
                    }
                }
            }
        }
        Map<String, Object> response = kedaApi.cancelPictureSynthesiss(param.get("confId").toString());
        if ("1".equals(response.get("success").toString())) {
            return ResultKit.success();
        }
        return ResultKit.fail("无画面合成信息");
    }

    @Override
    public ServiceResponse cancelChoosePicture(Map<String, Object> param) {
        /**
         * 转换自己信道
         */
        List<Map<String, Object>> participants = (List<Map<String, Object>>) param.get("participants");
        MedTApi api = new MedTApi();
        for (Map<String, Object> map : participants) {
            Map<String, String> temp = new HashMap<>();
            temp.put("ip",map.get("ip").toString());
            temp.put("port",map.get("port").toString());
            temp.put("hospitalId",map.get("hospitalId").toString());
            temp.put("hospitalName",map.get("hospitalName").toString());
            if (param.get("mtId").equals(map.get("mtId"))) {
                String s = api.viewSelfOrOther(temp,0);
                if ("fail".equals(s)) {
                    return ResultKit.fail(temp.get("hospitalName")+"调用编解码器失败");
                }
            }
        }
        Map<String, Object> response = kedaApi.cancelChoosePicture(param);
        if ("1".equals(response.get("success").toString())) {
            return ResultKit.success();
        }
        return ResultKit.fail("无画面选看信息");
    }

    @Override
    public ServiceResponse getPictureSynthesiss(final Map<String, Object> param) {
        Map<String, Object> response = kedaApi.getPictureSynthesiss(param.get("confId").toString());
        List<Map<String, Object>> list = new ArrayList<>();
        if (response.get("success") != null) {
            if ("1".equals(response.get("success").toString())) {
                final String layout = response.get("layout").toString();
                List<MorphDynaBean> members = (List<MorphDynaBean>) response.get("members");
                for (MorphDynaBean bean : members) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("mtId", bean.get("mt_id"));
                    param.put("mtId", bean.get("mt_id"));
                    String hospitalName = broadCastMapper.getHospitalNameByConfIdAndMtid(param);
                    map.put("hospitalName", hospitalName);
                    list.add(map);
                }
                list.add(new HashMap<String, Object>(){{put("layout",layout);}});
                return ResultKit.serviceResponse(list);
            } else if ("0".equals(response.get("success").toString())) {
                return ResultKit.success();
            }
        }
        return ResultKit.fail("获取画面合成信息错误");
    }

    @Override
    public ServiceResponse getChoosePicture(Map<String, Object> param) {
        Map<String, Object> response = kedaApi.getChoosePicture(param.get("confId").toString());
        List<Map<String, Object>> list = new ArrayList<>();
        String hospitalId= param.get("hospitalId").toString();//管理员用户为0，普通参与方不为0
        if (response.get("success") != null) {
            if ("1".equals(response.get("success").toString())) {
                List<MorphDynaBean> inspections = (List<MorphDynaBean>) response.get("inspections");
                for (MorphDynaBean bean : inspections) {
                    if("0".equals(hospitalId)){
                        list = addinspections(param,bean,list);
                    }else{
                        //通过医院id查询
                        FbsLiveBroadcast broadcastbean = broadCastMapper.queryFbsLiveBroadcast(param);
                        Map<String, Object> maplist = new HashMap<>();
                        maplist.put("liveId",broadcastbean.getId());
                        maplist.put("hospitalId",param.get("hospitalId"));
                        FbsLiveParticipant parBean = liveParticiPantMapper.queryParcitipantHost(maplist);
                        String selectMtId = parBean.getMtId();
                        if(((MorphDynaBean) bean.get("src")).get("mt_id").equals(selectMtId)){
                            list = addinspections(param,bean,list);
                        }
                    }
                }
                return ResultKit.serviceResponse(list);
            } else if ("0".equals(response.get("success").toString())) {
                return ResultKit.success();
            }
        }
        return ResultKit.fail("获取画面选看信息错误");
    }

    /**
     * 获取画面选看数据公共方法
     * @param param
     * @param bean
     */
    public List<Map<String, Object>> addinspections(Map<String, Object> param,MorphDynaBean bean,List<Map<String, Object>> list){
        Map<String, Object> map = new HashMap<>();
        map.put("src", ((MorphDynaBean) bean.get("src")).get("mt_id"));
        param.put("mtId", ((MorphDynaBean) bean.get("src")).get("mt_id"));
        String srcHospitalName = broadCastMapper.getHospitalNameByConfIdAndMtid(param);
        map.put("srcHospitalName", srcHospitalName);

        map.put("dst", ((MorphDynaBean) bean.get("dst")).get("mt_id"));
        param.put("mtId", ((MorphDynaBean) bean.get("dst")).get("mt_id"));
        String dstHospitalName = broadCastMapper.getHospitalNameByConfIdAndMtid(param);
        map.put("dstHospitalName", dstHospitalName);
        list.add(map);
        return list;
    }
    @Override
    @Transactional
    public ServiceResponse getOutMeeting(Map<String, Object> param) {

        String ishost=param.get("ishost").toString();
        if("1".equals(ishost)){
            //直接调用退出
            return forGetOut(param);
        }
        Map<String, Object> response = kedaApi.getOutMeeting(param);
        if ("1".equals(response.get("success").toString())) {
            logUtil.markOutMeetingLog(param);
            return ResultKit.success();
        }
        return ResultKit.fail("退出失败");
    }

    private ServiceResponse forGetOut(Map<String, Object> param){
        List<String> lastMt = new ArrayList();
        Map<String, Object> hostMt=((List<Map<String,Object>>)((Map<String, Object>)param.get("params")).get("mts")).get(0);
        Map<String, Object> response =kedaApi.getMTS(param.get("confId").toString());
        if("1".equals(response.get("success").toString())){
            List<MorphDynaBean> list = (List<MorphDynaBean>) response.get("mts");
            for(MorphDynaBean bean:list){
                String mtId=bean.get("mt_id").toString();
                if(!hostMt.get("mt_id").equals(mtId)&&"1".equals(bean.get("online").toString())){
                    lastMt.add(mtId);
                }
            }
            if(lastMt.size()==0){
                return ResultKit.fail("没有在线的参与方可切换为主持人");
            }
            //先挂断自己
            Map<String, Object>  hangUpSelf= kedaApi.getOutMeeting(param);
            if("1".equals(hangUpSelf.get("success").toString())){
                Random random = new Random();
                final String getMt = lastMt.get(random.nextInt(lastMt.size()));
                Map<String, Object> newParam = new HashMap<>();
                newParam.put("mt_id",getMt);
                param.put("params", newParam);
                Map<String, Object> responseForSwitch= kedaApi.switchHost(param);
                if("1".equals(responseForSwitch.get("success").toString())){
                    final int liveId = Integer.parseInt(param.get("liveId").toString());
                    liveParticiPantMapper.clearHostByHaiRui(liveId);
                    liveParticiPantMapper.updateParticipantSerisNum(new HashMap<String, Object>() {{
                        put("serialnumber", 1);
                        put("mtId", getMt);
                        put("liveId", liveId);
                    }});
                    //日志，主持人退出会议，切换到下一个主持人
                    logUtil.markHostOutMeetingLog(param);
                    return ResultKit.serviceResponse(getMt);
                }
                return ResultKit.fail("切换下一个主持人出现异常");
            }
            return ResultKit.fail("挂断出现异常");
        }
        return ResultKit.fail("获取终端列表异常");
    }

    /**
     *@author jiangmingjun
     *@date 2017/10/19
     *@description 用于自动取消画面选看，画面合成，主讲人
     */
    private void cancelChoose(Map<String, Object> param) {
        Map<String,Object> temp = kedaApi.getChoosePicture(param.get("confId").toString());
        List<MorphDynaBean> list = (List<MorphDynaBean>)temp.get("inspections");
        Map<String,Object> params = (Map<String, Object>) param.get("params");
        List<Map<String,Object>> mems = (List<Map<String, Object>>) params.get("members");
        for (MorphDynaBean bean : list) {
            Map<String,Object> objectMap = new HashMap<>();
            objectMap.put("confId",param.get("confId"));
            objectMap.put("mtId",((MorphDynaBean) bean.get("dst")).get("mt_id"));
            if (null != mems) {
                for (Map<String,Object> mem : mems) {
                    if (objectMap.get("mtId").equals(mem.get("mt_id"))) {
                        kedaApi.cancelChoosePicture(objectMap);
                    }
                }
            }else {
                kedaApi.cancelChoosePicture(objectMap);
            }

        }
    }

    private void cancelSpeaker(Map<String, Object> param) {
        Map<String,Object> speakerParam = new HashMap<>();
        speakerParam.put("confId",param.get("confId").toString());
        Map<String,Object> temp = new HashMap<>();
        temp.put("mt_id","");
        speakerParam.put("params",temp);
        speakerParam.put("participants",param.get("participants"));
        kedaApi.chooseSpeaker(speakerParam);
    }

    private void cancelSynthesiss(Map<String, Object> param) {
        kedaApi.cancelPictureSynthesiss(param.get("confId").toString()); //如果当前是画面合成，则取消画面合成操作
    }

    @Override
    public ServiceResponse startOrcancelVideo(Map<String, Object> param) {
        List<Map<String, Object>> participants = (List<Map<String, Object>>) param.get("participants");
        String mtId = param.get("mtId").toString();
        String mode = param.get("mode").toString();//start or stop
        String response = "";
        for (Map<String, Object> map : participants) {
            if (mtId.equals(map.get("mtId").toString())) {
                Map<String, String> paraCode = new HashMap<>();
                paraCode.put("ip",map.get("ip").toString());
                paraCode.put("port",map.get("port").toString());
                paraCode.put("hospitalId",map.get("hospitalId").toString());
                paraCode.put("username",map.get("username").toString());
                paraCode.put("password",map.get("password").toString());
                paraCode.put("mode",mode);
                response = medApi.setChnRecCfg(paraCode);
            }
        }
        if ("fail".equals(response)){
            return ResultKit.fail("获取录像通道配置接口调用失败"); //设置失败
        }else{
            logUtil.markstartOrcancelVideoLog(param);
            return ResultKit.success(); //设置成功
        }
    }

    @Override
    public ServiceResponse switchImage(Map<String, Object> param) {
        List<Map<String, Object>> participants = (List<Map<String, Object>>) param.get("participants");
        String mtId = param.get("mtId").toString();
        String SchID = param.get("SchID").toString();
        String response ="";
        for (Map<String, Object> map : participants) {
            if (mtId.equals(map.get("mtId").toString())) {
                Map<String, String> paraImage = new HashMap<>();
                paraImage.put("ip",map.get("ip").toString());
                paraImage.put("port",map.get("port").toString());
                paraImage.put("hospitalId",map.get("hospitalId").toString());
                paraImage.put("username",map.get("username").toString());
                paraImage.put("password",map.get("password").toString());
                paraImage.put("SchID",SchID);//设置预案Id 1是人像，2是hd，3是spies 只需要2,3
                response = medApi.setChnScheme(paraImage);
            }
        }
        if ("fail".equals(response)){
            return ResultKit.fail("设置通道预案接口调用失败"); //切换失败
        }else{
            logUtil.markswitchImageLog(param);
            return ResultKit.success(); //切换成功
        }

    }

    @Override
    public ServiceResponse getSwitchMode(List<Map<String,String>> params) {
        Map<String,String> map = new HashMap();
        System.out.println("participants params：：：：："+params);
        for (Map<String,String> param:params){
            try{
                map.put(param.get("mtId"),medApi.getChnRecCfg(param));
            } catch (Exception e){
                e.printStackTrace();
                return ResultKit.fail("获取编解码通道录像配置接口调用失败");//抛异常了
            }
        }
        return ResultKit.serviceResponse(map);
    }

    @Override
    public ServiceResponse getSwitchImage(List<Map<String, String>> params) {
        Map<String,String> map = new HashMap<>();
        for (Map<String,String> param:params){
            //通过登录者的id查询所属的医院id
            FbsUser userBean = new FbsUser();
            userBean.setId(Integer.parseInt(param.get("loginUserid")));
            FbsUser bean = fbsUserMapper.queryFbUser(userBean);
            if(0 == bean.getHospitalId()){
                try {
                    map.put(param.get("mtId"),medApi.getAllChnScheme(param));
                } catch (Exception e) {
                    e.printStackTrace();
                    return ResultKit.fail("获取所有通道对应预案信息接口调用失败");
                }
            }else if(bean.getHospitalId() == Integer.parseInt(param.get("hospitalId"))){
                try {
                    map.put("schId",medApi.getAllChnScheme(param));
                } catch (Exception e) {
                    e.printStackTrace();
                    return ResultKit.fail("获取所有通道对应预案信息接口调用失败");
                }
            }
        }
        return ResultKit.serviceResponse(map);
    }

    public List<Map<String, Object>> addImageMode(String confId, Map<String, Object> param, MorphDynaBean bean, List<Map<String, Object>> list,String flag){
        Map<String, Object> map = new HashMap<>();
        //获取医院名称
        param.put("mtId",bean.get("mt_id"));
        String srcHospitalName = broadCastMapper.getHospitalNameByConfIdAndMtid(param);
        map.put("srcHospitalName", srcHospitalName);
        //获取相应的录像开启或者关闭
        List<Map<String, Object>> participant = broadCastMapper.queryParticipant(param);
        Map<String, Object> partOnemap = participant.get(0);
        Map<String, String> paraCode = new HashMap<>();
        paraCode.put("ip", partOnemap.get("ip").toString());
        paraCode.put("port",partOnemap.get("port").toString());
        paraCode.put("hospitalId",partOnemap.get("hospitalId").toString());
        paraCode.put("username",partOnemap.get("username").toString());
        paraCode.put("password",partOnemap.get("password").toString());
        paraCode.put("confId",confId);
        map.put("hospitalId",partOnemap.get("hospitalId").toString());
        if("mode".equals(flag)){
            map.put("mode", medApi.getChnRecCfg(paraCode));
        }else if("image".equals(flag)){
            map.put("SchID", medApi.getAllChnScheme(paraCode));
        }
        list.add(map);
        return list;
    }

    @Override
    public ServiceResponse getBmpImageInfo(Map<String, Object> param) {
        //根据相应的编解码器ip和port查询相应的word字幕内容
        Map<String,Object> map = new HashMap<>();
        try {
            FbsLiveCodec code = liveCodecMapper.queryLiveCodeTitle(param);
            map.put("codeTitle",code);
        } catch (Exception e) {
            e.printStackTrace();
            return ResultKit.fail("获取编解码器相应的字幕内容失败");
        }
        return ResultKit.serviceResponse(map);
    }
}
