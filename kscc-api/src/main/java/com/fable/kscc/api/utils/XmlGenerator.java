package com.fable.kscc.api.utils;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.digest.DigestUtils;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by Wanghairui on 2017/10/10.
 */
public class XmlGenerator {

    private static Map<String, Element> rootRequestMap = new HashMap<>();

    public static void main(String[] args) throws Exception {
//        Map<String, String> login = new HashMap<>();
//        login.put("ip", "123");
//        login.put("username", "admin");
//        login.put("password", "admin123");
//        login.put("hospitalId", "1");
//        login.put("authenticationid", "asgf5");
//        generateRequestRoot(login);
//        System.out.println(generateMp4FileQueryParam(login.get("hospitalId") + login.get("ip")));

//        String response = "<?xml version=\"1.0\" encoding=\"utf-8\"?><MedtMp4QueryRsp><TotalNum>11</TotalNum><MP4List num=\"11\"><MP4Info><Title>1test</Title><TitlePath>/tmp/disk/02_02/2017年9月25日/1test/</TitlePath></MP4Info><MP4Info><Title>1314</Title><TitlePath>/tmp/disk/02_02/2017年9月25日/1314/</TitlePath></MP4Info><MP4Info><Title>0104003</Title><TitlePath>/tmp/disk/02_02/1970年1月1日/0104003/</TitlePath></MP4Info><MP4Info><Title>01040</Title><TitlePath>/tmp/disk/02_02/1970年1月1日/01040/</TitlePath></MP4Info><MP4Info><Title>0104088</Title><TitlePath>/tmp/disk/02_02/1970年1月1日/0104088/</TitlePath></MP4Info><MP4Info><Title>0104134</Title><TitlePath>/tmp/disk/02_02/1970年1月1日/0104134/</TitlePath></MP4Info><MP4Info><Title>远程测试</Title><TitlePath>/tmp/disk/02_02/2017年10月12日/远程测试/</TitlePath></MP4Info><MP4Info><Title>远程测试2 空</Title><TitlePath>/tmp/disk/02_02/2017年10月12日/远程测试2 空/</TitlePath></MP4Info><MP4Info><Title>1000000001</Title><TitlePath>/tmp/disk/02_02/1970年1月1日/1000000001/</TitlePath></MP4Info><MP4Info><Title>0104270</Title><TitlePath>/tmp/disk/02_02/2017年10月16日/0104270/</TitlePath></MP4Info><MP4Info><Title>0104270</Title><TitlePath>/tmp/disk/02_02/1970年1月1日/0104270/</TitlePath></MP4Info></MP4List></MedtMp4QueryRsp>";
//        Document document = DocumentHelper.parseText(response);
//        Element root = document.getRootElement();
//        Element MP4List = root.element("MP4List");
//        List nodes = MP4List.elements("MP4Info");
//        for (Iterator it = nodes.iterator(); it.hasNext();) {
//            Element elm = (Element) it.next();
//            System.out.println(elm.asXML());
//        }

        String response1 = "<?xml version=\"1.0\" encoding=\"utf-8\"?><GetAllChnSchemeRsp><ChnSchemeList num=\"8\"><ChnScheme><ChnID>1</ChnID><SchID>1</SchID></ChnScheme><ChnScheme><ChnID>2</ChnID><SchID>1</SchID></ChnScheme><ChnScheme><ChnID>3</ChnID><SchID>3</SchID></ChnScheme><ChnScheme><ChnID>4</ChnID><SchID>1</SchID></ChnScheme><ChnScheme><ChnID>5</ChnID><SchID>1</SchID></ChnScheme><ChnScheme><ChnID>6</ChnID><SchID>3</SchID></ChnScheme><ChnScheme><ChnID>7</ChnID><SchID>1</SchID></ChnScheme><ChnScheme><ChnID>8</ChnID><SchID>1</SchID></ChnScheme></ChnSchemeList></GetAllChnSchemeRsp>";
        Element element=(Element)(DocumentHelper.parseText(response1).getRootElement().element("ChnSchemeList").elements().get(5));
        System.out.println(element.elementText("SchID"));

    }

    /**
     *
     * @param param
     * @return XML形式参数
     * @description 登陆
     */
    public static String generateLoginParam(Map<String,String> param) {

        Element root = rootRequestMap.get(enhanceKey(param));
        removeRedundantElement(root);
        Element loginReq = root.addElement("LoginReq");
        loginReq.setText("");
        return root.asXML();
    }

    /**
     *
     * @param param
     * @return XML形式参数
     * @description 心跳
     */
    public static String generateKeepHeartBeatParam(Map<String,String> param) {
        Element root = rootRequestMap.get(enhanceKey(param));
        removeRedundantElement(root);
        Element StateReq = root.addElement("StateReq");
        Element CfgMod = StateReq.addElement("CfgMod");
        Element SysStatus = StateReq.addElement("SysStatus");
        Element DiskChg = StateReq.addElement("DiskChg");
        CfgMod.setText("TRUE");
        SysStatus.setText("TRUE");
        DiskChg.setText("TRUE");
        return root.asXML();
    }

    /**
     *
     * @param param
     * @return XML形式参数
     * @description 无参形式
     */
    public static String generateHaveNotParam(Map<String,String> param) {
        Element root = rootRequestMap.get(enhanceKey(param));
        removeRedundantElement(root);
        return root.asXML();
    }

    /**
     *
     * @param param
     * @return XML形式参数
     * @description 生成请求根
     */
    public static void generateRequestRoot(Map<String,String> param) {
        Document doc = DocumentHelper.createDocument();
        Element contentroot = doc.addElement("contentroot");
        //增加子元素
        Element authenticationinfoNode = contentroot.addElement("authenticationinfo");
        authenticationinfoNode.addAttribute("type", "7.0");

        Element usernameNode = authenticationinfoNode.addElement("username");
        Element passwordNode = authenticationinfoNode.addElement("password");
        Element authenticationidNode = authenticationinfoNode.addElement("authenticationid");
        usernameNode.setText(param.get("username"));
        passwordNode.setText(encode(param));
        authenticationidNode.setText(param.get("authenticationid"));
        rootRequestMap.put(param.get("hospitalId")+param.get("port")+param.get("ip"), contentroot);
    }

    /**
     *@author jiangmingjun
     *@date 2017/10/20
     *@description flag:0-自己看自己;1-看平台
     */
    public static String generateSetVmtParam(Map<String,String> param,int flag){

        Element root = rootRequestMap.get(enhanceKey(param));
        removeRedundantElement(root);
        Element SetVmtParamReq = root.addElement("SetVmtParamReq");
        Element DviOutPortList = SetVmtParamReq.addElement("DviOutPortList");
        DviOutPortList.addAttribute("num", "4");

        Element DviOutPort = DviOutPortList.addElement("DviOutPort");
        DviOutPort.addAttribute("id", "0");
        Element SrcChnID = DviOutPort.addElement("SrcChnID");
        SrcChnID.setText("3");

        Element DviOutPort1 = DviOutPortList.addElement("DviOutPort");
        DviOutPort1.addAttribute("id", "1");
        Element SrcChnID1 = DviOutPort1.addElement("SrcChnID");
        SrcChnID1.setText("9");
        Element DviOutPort2 = DviOutPortList.addElement("DviOutPort");
        DviOutPort2.addAttribute("id", "2");
        Element SrcChnID2 = DviOutPort2.addElement("SrcChnID");
        SrcChnID2.setText("5");
        Element DviOutPort3 = DviOutPortList.addElement("DviOutPort");
        DviOutPort3.addAttribute("id", "3");
        Element SrcChnID3 = DviOutPort3.addElement("SrcChnID");
        if(flag==1){
            SrcChnID3.setText("4");//6看自己，4看平台。
        }
        else{
            SrcChnID3.setText("6");//6看自己，4看平台。
        }
        return root.asXML();
    }

    /**
     *
     * @param param
     * @return XML形式参数
     * @description 查询文件
     */
    public static  String generateMp4FileQueryParam(Map<String,String> param){
        Element root = rootRequestMap.get(enhanceKey(param));
        removeRedundantElement(root);
        //        <!--功能: 录像MP4文件所在目录搜索-->
        Element MedtMp4QueryReq = root.addElement("MedtMp4QueryReq");
        Element Type = MedtMp4QueryReq.addElement("Type");
        Type.setText("1");//1为根据会议id开始时间结束时间查询会议，2是查询所有会议
        Element CatalogPath = MedtMp4QueryReq.addElement("CatalogPath");
        CatalogPath.setText(param.get("confId"));//会议id
        Element StartIndex = MedtMp4QueryReq.addElement("StartIndex");
        StartIndex.setText("0");
        return root.asXML();
    }

    /**
     *
     * @param param
     * @return XML形式参数
     * @description 时间同步
     */
    public static String generateSetSysTimeInfoParam(Map<String,String> param){
        Element root = rootRequestMap.get(enhanceKey(param));
        removeRedundantElement(root);
        Element SetSysTimeInfoReq= root.addElement("SetSysTimeInfoReq");
        Element TimeZone=SetSysTimeInfoReq.addElement("TimeZone");
        TimeZone.setText("+08:00");
        Element ManualSyncParam=SetSysTimeInfoReq.addElement("ManualSyncParam");
        Element Sync = ManualSyncParam.addElement("Sync");
        Sync.setText("true");
        Element Time = ManualSyncParam.addElement("Time");
        Time.setText(DateTimeUtil.gmtToUtc(new Date()));
        Element SummerParam=SetSysTimeInfoReq.addElement("SummerParam");
        Element Enable=SummerParam.addElement("Enable");
        Enable.setText("false");
        Element OffSet=SummerParam.addElement("OffSet");
        OffSet.setText("60min");
        Element Begin=SummerParam.addElement("Begin");
        Element Month = Begin.addElement("Month");
        Month.setText("6");
        Element WeekIndex = Begin.addElement("WeekIndex");
        WeekIndex.setText("1");
        Element Weekday = Begin.addElement("Weekday");
        Weekday.setText("1");
        Element Hour = Begin.addElement("Hour");
        Hour.setText("1");
        Element End=SummerParam.addElement("End");
        Element Month1 = End.addElement("Month");
        Month1.setText("9");
        Element WeekIndex1 = End.addElement("WeekIndex");
        WeekIndex1.setText("2");
        Element Weekday1 = End.addElement("Weekday");
        Weekday1.setText("7");
        Element Hour1 = End.addElement("Hour");
        Hour1.setText("23");
        Element AutoSyncParam=SetSysTimeInfoReq.addElement("AutoSyncParam");
        Element Enable1 = AutoSyncParam.addElement("Enable");
        Enable1.setText("false");
        Element Type = AutoSyncParam.addElement("Type");
        Type.setText("proto");
        Element ServerIP = AutoSyncParam.addElement("ServerIP");
        ServerIP.setText("0.0.0.0");
        Element ServerPort = AutoSyncParam.addElement("ServerPort");
        ServerPort.setText("123");
        Element Interval = AutoSyncParam.addElement("Interval");
        Interval.setText("60");
        return root.asXML();
    }

    /**
     *
     * @param param
     * @return XML形式参数
     * @description 开始备份
     */
    public static String generateMp4BackupStartParam(Map<String,String> param){
        Element root = rootRequestMap.get(enhanceKey(param));
        removeRedundantElement(root);
        Element Mp4BackupStartReq=root.addElement("Mp4BackupStartReq");
        Element StartTime = Mp4BackupStartReq.addElement("StartTime");
        StartTime.setText(DateTimeUtil.stringDateToStringTime(param.get("startTime")));
        Element EndTime = Mp4BackupStartReq.addElement("EndTime");
        EndTime.setText(DateTimeUtil.stringDateToStringTime(param.get("endTime")));
        Element ChnlIDList = Mp4BackupStartReq.addElement("ChnlIDList");
        ChnlIDList.setText("3");
        Element Title = Mp4BackupStartReq.addElement("Title");
        Title.setText(param.get("confId"));//会议id
        Element Description = Mp4BackupStartReq.addElement("Description");
        Description.setText("录像");

        return root.asXML();
    }

    /**
     *
     * @param param
     * @return XML形式参数
     * @description 获取录像通道配置
     */
    public static String generateGetChnRecCfgParam(Map<String,String> param){
        Element root = rootRequestMap.get(enhanceKey(param));
        removeRedundantElement(root);
        Element GetChnRecCfgReq=root.addElement("GetChnRecCfgReq");
        Element StartChnID = GetChnRecCfgReq.addElement("ChnIDStart");
        StartChnID.setText("3");
        Element EndChnID = GetChnRecCfgReq.addElement("ChnIDEnd");
        EndChnID.setText("3");
        return root.asXML();
    }

    /**
     *
     * @param param
     * @return XML形式参数
     * @description 开始录像，停止录像
     */
    public static String generateSetChnRecCfgParam(Map<String,String> param){
        Element root = rootRequestMap.get(enhanceKey(param));
        removeRedundantElement(root);
        Element SetChnRecCfgReq=root.addElement("SetChnRecCfgReq");
        try {
            Element CfgList=DocumentHelper.parseText(param.get("CfgList")).getRootElement();
            Element Mode = CfgList.element("Cfg").element("Mode");
            Mode.setText(param.get("mode"));
            SetChnRecCfgReq.add(CfgList);
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        return root.asXML();
    }

    /**
     *
     * @param param
     * @return XML形式参数
     * @description 删除ftp文件
     */
    public static String generateMp4FilesDeleteParam(Map<String,String> param){
        Element root = rootRequestMap.get(enhanceKey(param));
        removeRedundantElement(root);
        Element Mp4FileDeleteReq=root.addElement("Mp4FileDeleteReq");
        Element DelList= Mp4FileDeleteReq.addElement("DelList");
        DelList.addAttribute("num", "1");
        Element DelInfo = DelList.addElement("DelInfo");
        Element Type=DelInfo.addElement("Type");
        Type.setText(param.get("type"));//0按目录，1按文件
        Element Path=DelInfo.addElement("Path");
        Path.setText(param.get("filePath"));
        return root.asXML();
    }

    /**
     *
     * @param param
     * @return XML形式参数
     * @description hd/spies切换
     */
    public static String generateSetChnSchemeParam(Map<String,String> param){
        Element root = rootRequestMap.get(enhanceKey(param));
        removeRedundantElement(root);
        Element SetChnSchemeReq = root.addElement("SetChnSchemeReq");
        Element ChnSchemeList = SetChnSchemeReq.addElement("ChnSchemeList");
        ChnSchemeList.addAttribute("num", "2");
        Element ChnScheme = ChnSchemeList.addElement("ChnScheme");
        Element ChnID = ChnScheme.addElement("ChnID");
        ChnID.setText("6");//api里指定固定值
        Element SchID = ChnScheme.addElement("SchID");
        SchID.setText(param.get("SchID"));//设置预案Id 1是人像，2是hd，3是spies 只需要2,3
        //再设一个3通道
        Element ChnScheme3 = ChnSchemeList.addElement("ChnScheme");
        Element ChnID3 = ChnScheme3.addElement("ChnID");
        ChnID3.setText("3");//api里指定固定值
        Element SchID3 = ChnScheme3.addElement("SchID");
        SchID3.setText(param.get("SchID"));
        return root.asXML();
    }

    public static String generateGetMpuVidEncParam(Map<String,String> param){
        Element root = rootRequestMap.get(enhanceKey(param));
        removeRedundantElement(root);
        Element GetMpuVidEncParamReq = root.addElement("GetMpuVidEncParamReq");
        Element MpuID = GetMpuVidEncParamReq.addElement("MpuID");
        MpuID.setText("2");
        return root.asXML();
    }

    /**
     *
     * @param root
     * @return XML形式参数
     * @description 优化根参数
     */
    private static void removeRedundantElement(Element root) {
        List<Element> list = root.elements();
        if (list.size() == 2) {
            root.remove(list.get(1));
        }
    }

    /**
     *
     * @param param
     * @return XML形式参数
     * @description 生成key
     */
    private static String enhanceKey(Map<String,String> param){
        return param.get("hospitalId")+param.get("port") + param.get("ip");
    }

    /**
     *
     * @param login
     * @return XML形式参数
     * @description 加密
     */
    private static String encode(Map<String,String> login) {
        String hexMd5String = "";
        try {
            hexMd5String = DigestUtils.md5Hex((login.get("username") + "," + login.get("password") + "," + login.get("authenticationid")).getBytes("UTF-8"));
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return Base64.encodeBase64String(hexMd5String.getBytes());
    }
}
