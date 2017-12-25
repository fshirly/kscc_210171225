package com.fable.kscc.bussiness.interceptor;

import com.fable.kscc.api.model.user.FbsUser;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by Wanghairui on 2017/8/1.
 */
public class Interceptor extends HandlerInterceptorAdapter {

    private static final String[] IGNORE_URL = {"/loginController/toLogin",
            "/loginController/login",
            "/loginController/getImage",
            "/loginController/validateCode",
            "/loginController/getBmpImage"
    };

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response, Object handler) throws Exception {
        String contextPath = request.getContextPath();//容器名
        String url = request.getServletPath();
//        String url3 = request.getRequestURI();//端口号后面的所有东西
        for (String str : IGNORE_URL) {
            if (url.equals(str)) {
               return true;
            }
        }
        FbsUser user = (FbsUser) request.getSession().getAttribute("ksUser");
        if (user != null) {
            return true;
        } else {
            response.sendRedirect(contextPath + IGNORE_URL[0]);
            return false;
        }
    }
}
