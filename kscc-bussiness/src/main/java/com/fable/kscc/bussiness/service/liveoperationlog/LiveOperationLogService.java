package com.fable.kscc.bussiness.service.liveoperationlog;

import java.util.Map;

import com.fable.kscc.api.model.operationLog.FbsLiveOperationLog;
import com.fable.kscc.api.model.page.PageRequest;
import com.fable.kscc.api.model.page.PageResponse;
import com.fable.kscc.api.utils.Page;

public interface LiveOperationLogService {
	PageResponse<FbsLiveOperationLog> queryFbsLiveOperationLogList(PageRequest<Map<String,Object>> pageRequest);
	int insertLiveOperationLog(FbsLiveOperationLog fbsLiveOperationLog);
	boolean insertApplySpeakLog(Map<String,Object> param);
}
