package com.fable.kscc.bussiness.service.fbmenu;

import com.fable.kscc.api.model.hospitalInformation.FbsHospitalInformation;
import com.fable.kscc.api.model.menu.FbsMenu;
import com.fable.kscc.api.model.page.ResultKit;
import com.fable.kscc.api.model.page.ServiceResponse;
import com.fable.kscc.api.model.user.FbsUser;
import com.fable.kscc.api.model.userRole.FbsUserRole;
import com.fable.kscc.bussiness.mapper.fbmenu.FbMenuMapper;
import com.fable.kscc.bussiness.mapper.fbsUser.FbsUserMapper;
import com.fable.kscc.bussiness.mapper.fbuserrole.FabUserRoleMapper;
import com.fable.kscc.bussiness.mapper.hospitalInformation.HospitalInformationMapper;
import com.sun.org.apache.regexp.internal.RE;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FbsMenuServiceImpl implements FbsMenuService{

    @Autowired
    private FbMenuMapper fbMenuMapper;
    @Autowired
    private FabUserRoleMapper fabUserRoleMapper;
    @Autowired
    private FbsUserMapper fbsUserMapper;
    @Autowired
    private HospitalInformationMapper hospitalInformationMapper;
    @Override
    public List<FbsMenu> findAllByRole(String userId) {
        //根据用户id查询是超级管理员还是普通管理员
        return fbMenuMapper.findAllByRole();
    }

    @Override
    @Transactional(propagation= Propagation.REQUIRED)
    public ServiceResponse updateMenuByRole(Map<String,Object> params) {
        fbMenuMapper.InitializationMenuRole();//初始化kscc管理员

        Map<String,Object> paramMap = new HashMap<>();
        paramMap.put("roleId",params.get("roleId"));
        paramMap.put("userId",params.get("userId"));

        //已勾选
        String ids = params.get("id").toString();
        if (!"".equals(ids)){
            String[] id = ids.split(",");
            int[] num = new int[id.length];
            for(int i=0; i<id.length;i++){
                num[i] = Integer.parseInt(id[i]) ;
                paramMap.put("menuId",num[i]);
                paramMap.put("hostRole","1");
                try {
                    fbMenuMapper.updateMenuByRole(paramMap);
                } catch (Exception e) {
                    e.printStackTrace();
                    return ResultKit.fail("更新失败");
                }
            }
        }

        //未勾选
        String idF = params.get("idF").toString();
        if (!"".equals(idF)){
            String[] idFs = idF.split(",");
            int[] numF= new int[idFs.length];
            for(int i=0; i<idFs.length;i++){
                numF[i] = Integer.parseInt(idFs[i]) ;
                paramMap.put("menuId",numF[i]);
                paramMap.put("hostRole","0");
                try {
                    fbMenuMapper.updateMenuByRole(paramMap);
                } catch (Exception e) {
                    e.printStackTrace();
                    return ResultKit.fail("更新失败");
                }
            }
        }
        return ResultKit.success();
    }

    @Override
    public ServiceResponse findMenuAllByRole(Map<String, Object> params) {
        List<Map<String,Object>> menuList = fbMenuMapper.findMenuAllByRole(params);
        return ResultKit.serviceResponse(menuList);
    }

    @Override
    public ServiceResponse findMenuAllByUserId(Map<String, Object> params) {
        String userId = params.get("userId").toString();
        //根据用户id查询相应的用户角色id
        FbsUserRole userRole = fabUserRoleMapper.queryRoleByUserId(Integer.parseInt(userId));

        //根据角色id查询相应的菜单项
        if ("2".equals(userRole.getRoleId())){
            params.put("roleId",userRole.getRoleId());//1或者2
            params.put("userId","");
            params.put("hostRole",0);
        }else{
            params.put("roleId",userRole.getRoleId());//1或者2
            params.put("hostRole","1");
        }

        List<Map<String,Object>> menusList = fbMenuMapper.findMenuAllByRole(params);
        for (Map<String,Object> map : menusList){
            //直播信息(医院用户url)
            if("2".equals(map.get("id")) && "2".equals(userRole.getRoleId())){
                map.put("url","/loginController/toLiveConferenceHosUser");
            }
        }

        Map<Object,Object> arrList = new HashMap<>();
        //根据用户id查询相应的登录人名称
        FbsUser user = fbsUserMapper.getUserInfoByUser(Integer.parseInt(userId));
        Map<String,Object> map = new HashMap<>();
        if ("1".equals(userRole.getRoleId())){
            String loginName = user.getLoginName();
            map.put("loginName",loginName);
            //menusList.add(map);
            arrList.put("loginName",loginName);
            //管理员用户（超级管理员/普通管理员）
            arrList.put("changeFlag","0");
        }else{
            //根据相应的用户id查询所属医院名称
            FbsHospitalInformation hospitalInformation = hospitalInformationMapper.getHospitalInfoByUser(user.getId());
            String hospitalName = hospitalInformation.getHospitalName();
            map.put("loginName",hospitalName);
            //menusList.add(map);
            arrList.put("loginName",hospitalName);
            //普通医院用户
            arrList.put("changeFlag","1");
        }
        arrList.put("menusList",menusList);
        return ResultKit.serviceResponse(arrList);
    }
}
