package com.fable.kscc.bussiness.util;

/**
 * Created by Administrator on 2017/11/24 0024.
 */
public class StringUtil {
    /**
     * 医院地址处理方法
     * @param address
     * @return
     */
    public String locationValue(String address){
        if (address.contains("市辖区")||address.contains("北京")||address.contains("天津")||address.contains("重庆")||address.contains("上海")){
            return address.substring(0,address.indexOf("市"));
        }else if (address.contains("省")){
            return address.substring(address.indexOf("/")+1,address.indexOf("市/")+1);
        }else if (address.contains("自治区")){
            return address.substring(address.indexOf("/")+1,address.indexOf("市/")+1);
        }else if (address.contains("特别行政区")){
            return address.substring(0,2);
        }else if (address.contains("台湾")){
            return "台湾";
        }else {
            return "";
        }
    }

    /*public static void main(String[] args) {
        //宁夏回族自治区/银川市/市辖区
        //辽宁省/本溪市/市辖区
        String location = "辽宁省/本溪市/市辖区";
        System.out.println(location.indexOf("/"));
        System.out.println(location.substring(location.indexOf("/")+1,location.indexOf("市/")+1));
    }*/
}
