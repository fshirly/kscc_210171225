package com.fable.kscc.api.medTApi;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;

/**
 * <p>
 * Title :
 * </p>
 * <p>
 * Description:
 * </p>
 * <p>
 * Author :Hairui
 * Date :2017/11/10
 * Time :8:45
 * </p>
 * <p>
 * Department :
 * </p>
 * <p> Copyright : 江苏飞博软件股份有限公司 </p>
 */
public interface MedRunnableMap {
     Map<String, AuthenticThread> map = new HashMap<>();
//     Map<String, ExecutorService> initMap = new HashMap<>();暂时不考虑调用excutorService.shutdown()方法，先让线程池自己回收
     Map<String, InitOrDeathRestartThread> controlMap = new HashMap<>();
}
