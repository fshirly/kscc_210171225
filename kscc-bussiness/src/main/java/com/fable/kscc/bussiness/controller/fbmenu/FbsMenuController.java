package com.fable.kscc.bussiness.controller.fbmenu;

import com.fable.kscc.api.model.menu.FbsMenu;
import com.fable.kscc.api.model.page.ResultKit;
import com.fable.kscc.api.model.page.ServiceResponse;
import com.fable.kscc.bussiness.service.fbmenu.FbsMenuService;
import org.apache.http.HttpRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequestMapping("/FbsMenuController")
@Controller
public class FbsMenuController {
    @Autowired
    private FbsMenuService fbsMenuService;

    /**
     * 根据kscc管理员查看菜单(权限)
     * @return
     */
    @RequestMapping("/findAllByRole")
    @ResponseBody
    public List<FbsMenu> findAllByRole(HttpServletRequest request){
        String userId = request.getParameter("id");
        return fbsMenuService.findAllByRole(userId);
    }

    /**
     * 根据kscc管理员查看菜单(权限)
     * @return
     */
    @RequestMapping("/updateMenuByRole")
    @ResponseBody
    public ServiceResponse updateMenuByRole(@RequestBody Map<String,Object> params){
        return fbsMenuService.updateMenuByRole(params);
    }

    /**
     * 查询普通管理员的菜单项
     * @param params
     * @return
     */
    @RequestMapping("/findMenuAllByRole")
    @ResponseBody
    public ServiceResponse findMenuAllByRole(@RequestBody Map<String,Object> params){
        return fbsMenuService.findMenuAllByRole(params);
    }

    @RequestMapping("/findMenuAllByUserId")
    @ResponseBody
    public ServiceResponse findMenuAllByUserId(@RequestBody Map<String,Object> params){
        return fbsMenuService.findMenuAllByUserId(params);
    }
}
