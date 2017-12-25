package com.fable.kscc.bussiness.mapper.livebroadcast;

import com.amazonaws.services.simpleworkflow.model.StartTimerDecisionAttributes;
import com.fable.kscc.api.model.liveHomePage.FbsLiveHomepage;
import com.fable.kscc.api.model.livebroadcast.FbsLiveBroadcast;
import com.fable.kscc.api.model.participant.FbsLiveParticipant;
import com.fable.kscc.api.model.user.FbsUser;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

import com.fable.kscc.api.model.livebroadcast.FbsLiveBroadcast;



@Repository
public interface LiveBroadCastMapper {

	/**
	 * 创建直播申请
	 * @param liveBroadCast
	 * @return
	 */
	 int createLiveApplications(FbsLiveBroadcast liveBroadCast);

	 List<FbsLiveBroadcast> getLiveBroadCast(Map<String,Object> map);

	 List<FbsLiveBroadcast> inviteLive(Map<String,Object> map);

     //同意邀请还是拒绝邀请
	 int updateLiveParticipant(Map<String,Object> map);

	 List<Map<String, Object>> queryParticipant(Map<String, Object> param);

	 Map<String, Object> queryLiveById(Map<String, Object> param);

	 int modifyLive(Map<String, Object> param);

	 int deletePaticipant(Map<String, Object> param);

	 int insertParticipant(Map<String, Object>param);

	 int clearHost(Map<String, Object> param);

	 int updateParticipant(Map<String, Object> param);

	 int startLive(@Param("id") String param,@Param("confId") String confId,
				   @Param("startTime") String startTime);

	 int cancelLive(@Param("id") String param);


	 int updateParticipantMtsById(Map<String,Object> param);

	 FbsLiveBroadcast queryFbsLiveBroadcast(Map<String, Object> param);

	List<String> queryParticpantsNameByConfId(@Param("confId") String confId);

	List<FbsLiveBroadcast> queryLivingListByUserId(Map<String, Object> param);

	List<FbsLiveBroadcast> checkSql(Map<String, Object> param);

	int endLive(Map<String, Object> param);
	
	/**
	 * 搜索当前直播间的结束时间
	 * @param liveId
	 * @return
	 */
	String searchEndTime(@Param("liveId") int liveId);
	
	/**
	 * 更新当前直播间的结束时间(延时)
	 * @param map
	 * @return
	 */
	int updateEndTime(@Param("map") Map<String, Object> map);

	/**
	 * 首页设置轮询图片时选择哪个直播select的值
	 * @return FbsLiveBroadcast
	 */
	List<FbsLiveBroadcast> selectAllBroadcast();

	/**
	 *新增一个首页轮询图片
	 * @return int
	 */
	int insertIntoHomePage(FbsLiveHomepage homepage);

	/**
	 * 查询相应的时间段所有直播信息
	 * @param params
	 * @return
	 */
	List<Map<String,Object>> queryMulti(@Param("map") Map<String,Object> params);

	FbsLiveBroadcast searchBroadcastInfoByLiveId(@Param("map") Map<String, Object> map);

	List<FbsLiveHomepage> selectHomePage();

	int modifyHomePage(FbsLiveHomepage homepage);

	int countHomePictureByLiveId(@Param("liveId") int liveId);

	int deleteHomePictureByLiveId(@Param("liveId") int liveId);

	List<Map<String,Object>> getParticipantsRoleByLiveId(@Param("confId") String confId);

	String getHospitalNameByConfIdAndMtid(Map<String, Object> param);

	String getMtIdByUserId(@Param("confId") String confId, @Param("userId") String userId);

	List<Map<String,String>> getLiveOfEndButNotGenerate();

	int modifyParticipantGenerate(Map<String, String> param);

	/**
	 * 查询正在直播中的所有参与方
	 */
	List<Map<String,String>> queryParticipantsInLive();

	int modifyBroadcastOPStatus(Map<String, Object> param);

	String queryBroadcastOPStatus(Map<String, Object> param);

	void updateStartTime(@Param("startTime") long startTime);

	List<Map<String,Object>> getParticipantsByConfId(@Param("confId") String confId);

}
