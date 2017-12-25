package com.fable.kscc.bussiness.mapper.broadcastMeeting;

import com.fable.kscc.api.model.livebroadcast.FbsLiveBroadcast;

import java.util.List;
import java.util.Map;

/**
 * Created by wangyh on 2017/8/7 0007.
 */
public interface BroadcastMeetMapper {

    /**
     * 获取直播会议信息列表
     */
    List<FbsLiveBroadcast> getBroadcastMeetList(Map<String,Object> map);

    /**
     *修改直播会议列表
     */
    int editBroadcastMeet(FbsLiveBroadcast fbsLiveBroadcast);
    /**
     *获取直播会议信息列表总数
     */
    int getBroadcastMeetListCount(Map<String,Object> map);
    
    List<Map<String,Object>> getBroadcastForSchedule(Map<String,String> map);

}
