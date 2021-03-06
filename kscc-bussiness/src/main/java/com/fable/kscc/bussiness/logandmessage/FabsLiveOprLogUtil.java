package com.fable.kscc.bussiness.logandmessage;

import com.fable.kscc.api.model.hospitalInformation.FbsHospitalInformation;
import com.fable.kscc.api.model.liveCodec.FbsLiveCodec;
import com.fable.kscc.api.model.operationLog.FbsLiveOperationLog;
import com.fable.kscc.api.model.participant.FbsLiveParticipant;
import com.fable.kscc.bussiness.mapper.hospitalInformation.HospitalInformationMapper;
import com.fable.kscc.bussiness.mapper.livebroadcast.LiveBroadCastMapper;
import com.fable.kscc.bussiness.mapper.livecodec.LiveCodecMapper;
import com.fable.kscc.bussiness.mapper.liveoperationlog.LiveOperationLogMapper;
import com.fable.kscc.bussiness.mapper.liveparticipant.LiveParticiPantMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by fushan on 2017/10/24 0024.
 */
@Component
public class FabsLiveOprLogUtil {
    
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
    /**
     * 开启关闭主讲人，静音哑言开启关闭日志类
     * @param param
     * @param kindValue
     * @param valueOne
     * @param valueTwo
     * @param valueThree
     */
    public void markeOperationLog(Map<String, Object> param,String kindValue,String valueOne,String valueTwo,String valueThree){
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        Map<String, Object> map = new HashMap<String, Object>();
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();
        if("1".equals(kindValue)){
            map.put("mtId", param.get("mtId").toString());
            map.put("confId", param.get("confId").toString());
            int liveId = broadCastMapper.queryFbsLiveBroadcast(map).getId();
            map.put("liveId", liveId);
            int hospitalId = liveParticiPantMapper.queryParcitipantHost(map).getHospitalId();
            String hospitalName = hospitalInformationMapper.findAllById(hospitalId);
            Map<String, Object> paramsMap = (Map<String, Object>) param.get("params");
            String valueFlag = paramsMap.get("value").toString();
            //操作者id
            String operateId = param.get("operateId").toString();
            logBean.setOperationId(Integer.parseInt(operateId));

            logBean.setLiveId(liveId);
            logBean.setOperationTime(dateString);
            if("1".equals(valueFlag)){
                logBean.setOperationContent(valueOne + hospitalName + valueTwo);
            }else{
                logBean.setOperationContent(valueOne + hospitalName + valueThree);
            }
        }else if ("2".equals(kindValue))
        {
            map.put("confId", param.get("confId").toString());
            int liveId = broadCastMapper.queryFbsLiveBroadcast(map).getId();
            //操作者id
            String operateId = param.get("operateId").toString();
            logBean.setOperationId(Integer.parseInt(operateId));
            logBean.setLiveId(liveId);
            logBean.setOperationTime(dateString);
            Map<String, Object> paramsMap = (Map<String, Object>) param.get("params");
            String valueFlag = paramsMap.get("mt_id").toString();
            map.put("liveId", liveId);
            String hospitalName ="";
            if("".equals(valueFlag)){
                hospitalName ="";
            }else{
                map.put("mtId",valueFlag);
                int hospitalId = liveParticiPantMapper.queryParcitipantHost(map).getHospitalId();
                hospitalName = hospitalInformationMapper.findAllById(hospitalId);
            }
            if("".equals(valueFlag)){
                logBean.setOperationContent(valueOne + hospitalName + valueTwo);
            }else{
                logBean.setOperationContent(valueOne + hospitalName + valueThree);
            }
        }
        liveOperationLogMapper.insertLiveOperationLog(logBean);
    }




    /**
     * 画面合成日志类
     * @param param
     */
    public void markPictureSynthesissLog(Map<String,Object> param){
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        Map<String, Object> map = new HashMap<String, Object>();
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();

        map.put("confId", param.get("confId").toString());
        int liveId = broadCastMapper.queryFbsLiveBroadcast(map).getId();
        map.put("liveId", liveId);
        Map<String, Object> paramsMap = (Map<String, Object>) param.get("params");

        List<Map<String,Object>> listMap = (List<Map<String, Object>>) paramsMap.get("members");
        int listNum = listMap.size();
        List<String> nameList = new ArrayList<String>();
        StringBuffer nameStr = new StringBuffer();
        //循环遍历查出所有的合成医院
        for (Map<String,Object> mapBean : listMap){
            map.put("mtId",mapBean.get("mt_id"));
            int hospitalId = liveParticiPantMapper.queryParcitipantHost(map).getHospitalId();
            String hospitalName = hospitalInformationMapper.findAllById(hospitalId);
            nameStr.append(hospitalName+",");
        }
        //操作者id
        String operateId = param.get("operateId").toString();
        logBean.setOperationId(Integer.parseInt(operateId));
        logBean.setLiveId(liveId);
        logBean.setOperationTime(dateString);
        //两个，三个，四个画面合成
        if(listNum == 2){
            logBean.setOperationContent("两画面合成成功："+nameStr.substring(0,nameStr.length()-1));
        }else if(listNum == 3){
            logBean.setOperationContent("三画面合成成功："+nameStr.substring(0,nameStr.length()-1));
        }else if(listNum == 4){
            logBean.setOperationContent("四画面合成成功："+nameStr.substring(0,nameStr.length()-1));
        }else{
            logBean.setOperationContent("画面合成成功："+nameStr.substring(0,nameStr.length()-1));
        }
        liveOperationLogMapper.insertLiveOperationLog(logBean);
    }

    /**
     * 全场静音日志
     * @param param
     */
    public void markAllMuteLog(Map<String,Object> param){
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        Map<String, Object> map = new HashMap<String, Object>();
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();

        map.put("confId", param.get("confId").toString());
        int liveId = broadCastMapper.queryFbsLiveBroadcast(map).getId();
        map.put("liveId", liveId);
        Map<String, Object> paramsMap = (Map<String, Object>) param.get("params");

        String valueFlag = paramsMap.get("value").toString();
        //操作者id
        String operateId = param.get("operateId").toString();
        logBean.setOperationId(Integer.parseInt(operateId));
        logBean.setLiveId(liveId);
        logBean.setOperationTime(dateString);
        if("0".equals(valueFlag)){
            logBean.setOperationContent("全场静麦成功");
        }else if("1".equals(valueFlag)){
            logBean.setOperationContent("全场开麦成功");
        }
        liveOperationLogMapper.insertLiveOperationLog(logBean);
    }

    /**
     * 全场静音日志
     * @param param
     */
    public void markAllSilenceLog(Map<String,Object> param){
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        Map<String, Object> map = new HashMap<String, Object>();
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();

        map.put("confId", param.get("confId").toString());
        int liveId = broadCastMapper.queryFbsLiveBroadcast(map).getId();
        map.put("liveId", liveId);
        Map<String, Object> paramsMap = (Map<String, Object>) param.get("params");

        String valueFlag = paramsMap.get("value").toString();
        //操作者id
        String operateId = param.get("operateId").toString();
        logBean.setOperationId(Integer.parseInt(operateId));
        logBean.setLiveId(liveId);
        logBean.setOperationTime(dateString);
        if("0".equals(valueFlag)){
            logBean.setOperationContent("取消全场静音成功");
        }else if("1".equals(valueFlag)){
            logBean.setOperationContent("全场静音成功");
        }
        liveOperationLogMapper.insertLiveOperationLog(logBean);
    }

    public void markSendScreenWordLog(Map<String,Object> param){
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        Map<String, Object> map = new HashMap<String, Object>();
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();

        map.put("confId", param.get("confId").toString());
        int liveId = broadCastMapper.queryFbsLiveBroadcast(map).getId();
        map.put("liveId", liveId);
        Map<String, Object> paramsMap = (Map<String, Object>) param.get("params");

        String message = paramsMap.get("message").toString();
        //操作者id
        String operateId = param.get("operateId").toString();
        logBean.setOperationId(Integer.parseInt(operateId));
        logBean.setLiveId(liveId);
        logBean.setOperationTime(dateString);
        logBean.setOperationContent("添加字幕成功："+message);
        liveOperationLogMapper.insertLiveOperationLog(logBean);
    }

    /**
     * 延长直播时间日志
     * @param param
     */
    public void markExtendTimeLog(Map<String,Object> param){
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        Map<String, Object> map = new HashMap<String, Object>();
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();

        map.put("confId", param.get("confId").toString());
        int liveId = broadCastMapper.queryFbsLiveBroadcast(map).getId();
        Map<String, Object> paramsMap = (Map<String, Object>) param.get("params");
        String delay_time = paramsMap.get("delay_time").toString();

        //操作者id
        String operateId = param.get("operateId").toString();
        logBean.setOperationId(Integer.parseInt(operateId));
        logBean.setLiveId(liveId);
        logBean.setOperationTime(dateString);
        logBean.setOperationContent("延长直播成功：延长"+delay_time+"分钟");
        liveOperationLogMapper.insertLiveOperationLog(logBean);
    }

    public void markOutMeetingLog(Map<String,Object> param){
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        Map<String, Object> map = new HashMap<String, Object>();
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();

        map.put("confId", param.get("confId").toString());
        String liveId = param.get("liveId").toString();
        map.put("liveId", liveId);
        Map<String, Object> paramsMap = (Map<String, Object>) param.get("params");
        List<Map<String,Object>> mapList = (List<Map<String, Object>>) paramsMap.get("mts");
        String hospitalName ="";
        for (Map<String, Object> mapBean : mapList){
            map.put("mtId",mapBean.get("mt_id"));
            int hospitalId = liveParticiPantMapper.queryParcitipantHost(map).getHospitalId();
            hospitalName = hospitalInformationMapper.findAllById(hospitalId);
        }
        //操作者id
        String operateId = param.get("operateId").toString();
        logBean.setOperationId(Integer.parseInt(operateId));
        logBean.setLiveId(Integer.parseInt(liveId));
        logBean.setOperationTime(dateString);
        logBean.setOperationContent(hospitalName+"退出直播成功");
        liveOperationLogMapper.insertLiveOperationLog(logBean);
    }

    /**
     * 主持人退出直播
     * @param param
     */
    public void markHostOutMeetingLog(Map<String,Object> param){
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        Map<String, Object> map = new HashMap<String, Object>();
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();

        map.put("confId", param.get("confId").toString());
        String liveId = param.get("liveId").toString();
        map.put("liveId", liveId);
        String hospitalName ="";
        Map<String, Object> paramsMap = (Map<String, Object>) param.get("params");
        map.put("mtId", paramsMap.get("mt_id"));
        int hospitalId = liveParticiPantMapper.queryParcitipantHost(map).getHospitalId();
        hospitalName = hospitalInformationMapper.findAllById(hospitalId);
        //操作者id
        String operateId = param.get("operateId").toString();
        logBean.setOperationId(Integer.parseInt(operateId));
        logBean.setLiveId(Integer.parseInt(liveId));
        logBean.setOperationTime(dateString);
        logBean.setOperationContent("当前主持人已退出成功，切换主持人到"+hospitalName+"");
        liveOperationLogMapper.insertLiveOperationLog(logBean);
    }

    /**
     * 邀请参与方日志
     * @param mapList
     * @param paramMap
     */
    public void markInviteParticipant(List<Map<String, Object>> mapList,Map<String,Object> paramMap){
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();
        StringBuffer buffer = new StringBuffer();
        for (Map<String, Object> mapbean : mapList){
            String name = mapbean.get("hospitalName").toString();
            buffer.append(name+",");
        }
        logBean.setOperationId(Integer.parseInt(paramMap.get("operateId").toString()));
        logBean.setLiveId(Integer.parseInt(paramMap.get("liveId").toString()));
        logBean.setOperationTime(dateString);
        logBean.setOperationContent(""+buffer.substring(0,buffer.length()-1)+"添加成功");
        liveOperationLogMapper.insertLiveOperationLog(logBean);
    }

    public void markAskExtendTimeLog(Map<String,Object> param){
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();

        String liveId = param.get("liveId").toString();
        String userid = param.get("userid").toString();
        FbsHospitalInformation bean = hospitalInformationMapper.getHospitalInfoByUser(Integer.parseInt(userid));
        String hospitalName = bean.getHospitalName();
        String timeExpand =param.get("timeExpand").toString();
        if (Integer.parseInt(timeExpand) >= 10){ //延时超过十分钟产生日志
            logBean.setLiveId(Integer.parseInt(liveId));
            logBean.setOperationTime(dateString);
            logBean.setOperationContent(""+hospitalName+"申请延时直播成功："+timeExpand+"分钟");
            liveOperationLogMapper.insertLiveOperationLog(logBean);
        }
    }

    public void markcreateMeetingLog(Map<String,Object> param,String firstValue,String secondValue){
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        Map<String, Object> map = new HashMap<String, Object>();
        //产生会场记录
        Map<String, Object> hostMt=((List<Map<String, Object>>)param.get("params")).get(0);
        map.put("mt_id",hostMt.get("mt_id").toString());
        map.put("liveId",param.get("liveId").toString());
        //查询隶属哪家医院
        FbsHospitalInformation information = new FbsHospitalInformation();
        FbsLiveParticipant particatbean = liveParticiPantMapper.queryParcitipantHost(map);
        information.setId(particatbean.getHospitalId());
        FbsHospitalInformation hospitalbean = hospitalInformationMapper.queryLiveHospital(information);
        String hostname = hospitalbean.getHospitalName();

        //主持医院xxx退出直播成功，主持人由xxx替换成yyy
        map.put("confId", param.get("confId").toString());
        //int liveId = broadCastMapper.queryFbsLiveBroadcast(map).getId();
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();
        logBean.setLiveId(Integer.parseInt(param.get("liveId").toString()));
        logBean.setOperationTime(dateString);
        //logBean.setOperationContent("呼叫参与方医院" + hospitalName + "完毕");
        logBean.setOperationContent(firstValue + secondValue + "完毕");
        liveOperationLogMapper.insertLiveOperationLog(logBean);
    }

    public void markstartOrcancelVideoLog(Map<String,Object> param){
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        Map<String, Object> mapsrc = new HashMap<String, Object>();
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();

        mapsrc.put("confId", param.get("confId").toString());
        int liveId = broadCastMapper.queryFbsLiveBroadcast(mapsrc).getId();
        mapsrc.put("liveId", liveId);
        String mtId = param.get("mtId").toString();
        String mode = param.get("mode").toString();
        //设置医院名称
        mapsrc.put("mtId",mtId);
        int hospitalId = liveParticiPantMapper.queryParcitipantHost(mapsrc).getHospitalId();
        String hospitalNameSrc = hospitalInformationMapper.findAllById(hospitalId);

        //操作者id
        String operateId = param.get("operateId").toString();
        logBean.setOperationId(Integer.parseInt(operateId));
        logBean.setLiveId(liveId);
        logBean.setOperationTime(dateString);
        if ("stop".equals(mode)){
            logBean.setOperationContent(hospitalNameSrc+"关闭录像成功");//A选看B成功
        }else {
            logBean.setOperationContent(hospitalNameSrc+"开启录像成功");//A选看B成功
        }
        liveOperationLogMapper.insertLiveOperationLog(logBean);
    }

    public void markswitchImageLog(Map<String,Object> param){
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        Map<String, Object> mapsrc = new HashMap<String, Object>();
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();

        mapsrc.put("confId", param.get("confId").toString());
        int liveId = broadCastMapper.queryFbsLiveBroadcast(mapsrc).getId();
        mapsrc.put("liveId", liveId);
        String mtId = param.get("mtId").toString();
        String SchID = param.get("SchID").toString();
        //设置医院名称
        mapsrc.put("mtId",mtId);
        int hospitalId = liveParticiPantMapper.queryParcitipantHost(mapsrc).getHospitalId();
        String hospitalNameSrc = hospitalInformationMapper.findAllById(hospitalId);

        //操作者id
        String operateId = param.get("operateId").toString();
        logBean.setOperationId(Integer.parseInt(operateId));
        logBean.setLiveId(liveId);
        logBean.setOperationTime(dateString);
        if ("2".equals(SchID)){
            logBean.setOperationContent(hospitalNameSrc+"设置颜色hd成功");
        }else {
            logBean.setOperationContent(hospitalNameSrc+"设置颜色spies成功");
        }
        liveOperationLogMapper.insertLiveOperationLog(logBean);
    }

    /**
     *
     * @param param ip,port,word
     */
    public void bmpImageLogs(Map<String,String> param){
        FbsLiveCodec code = liveCodecMapper.findCodeByIpAndPort(param);
        String word = param.get("word").toString();
        String hospitalName = hospitalInformationMapper.findAllById(code.getHospitalId());

        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(currentTime);
        Map<String, Object> mapsrc = new HashMap<String, Object>();
        FbsLiveOperationLog logBean = new FbsLiveOperationLog();

        //操作者id
        String operateId = param.get("operateId").toString();
        logBean.setOperationId(Integer.parseInt(operateId));
        logBean.setLiveId(Integer.parseInt(param.get("liveId")));
        logBean.setOperationTime(dateString);

        logBean.setOperationContent(""+hospitalName+"添加字幕："+word);//A选看B成功

        liveOperationLogMapper.insertLiveOperationLog(logBean);
    }

}
