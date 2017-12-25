package com.fable.kscc.api.medTApi;

import com.fable.kscc.api.utils.ThreadPoolUtils;
import com.fable.kscc.api.utils.XmlGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * <p>
 * Title :
 * </p>
 * <p>
 * Description:加载编解码，中途心跳停止加载编解码，重启服务加载编解码。
 * </p>
 * <p>
 * Author :Hairui
 * Date :2017/12/21
 * Time :10:57
 * </p>
 * <p>
 * Department :
 * </p>
 * <p> Copyright : 江苏飞博软件股份有限公司 </p>
 */
public class InitOrDeathRestartThread implements Runnable {

    private Logger logger = LoggerFactory.getLogger(InitOrDeathRestartThread.class);

    private boolean flag=true;
    private Map<String, String> login;
    private MedTApi medTApi;

    public InitOrDeathRestartThread(Map<String, String> login, MedTApi medTApi) {
        this.login = login;
        this.medTApi = medTApi;
    }

    @Override
    public void run() {
        while (flag) {
            String authenticationId = medTApi.getAuthenticationId(login);
            if (null != authenticationId) {
                login.put("authenticationid", authenticationId);
                XmlGenerator.generateRequestRoot(login);
                if (medTApi.Login(login)) {
                    medTApi.SetSysTimeInfo(login);
                    AuthenticThread runnable = new AuthenticThread(login, medTApi);
                    MedRunnableMap.map.put(login.get("id"), runnable);
                    ThreadPoolUtils.getThreadPool().execute(runnable);
                    break;
                }
                logger.error(login.get("hospitalName") +"login fail check your username or password");
            } else {
                logger.error(login.get("hospitalName") + ":authentication fail try connect again");
            }
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public void setFlag(boolean flag) {
        this.flag = flag;
    }
}
