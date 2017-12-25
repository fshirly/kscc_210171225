package com.fable.kscc.api.skyCloud;

import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPClientConfig;
import org.apache.commons.net.ftp.FTPFile;
import org.apache.commons.net.ftp.FTPReply;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.util.*;

public class FtpUtil {

    private static String LOCAL_CHARSET = "utf-8";

    public static Logger logger = LoggerFactory.getLogger(FtpUtil.class);

    public static void main(String[] args) {
        DownFTPParam param = new DownFTPParam();
//        param.setHost("59.45.90.59");
//        param.setPort(21);
//        param.setUsername("admin");
//        param.setPassword("admin123");
//        param.setPathDst("E:/test/");
//        param.setPathSrc("/tmp/disk/02_02/2017年12月4日/0100001/");
        param.setHost("192.168.6.30");
        param.setPort(21);
        param.setUsername("duy");
        param.setPassword("duy@1234");
        param.setPathDst("E:/testSelf/");
        param.setPathSrc("/test/");
        System.out.println(FileDownload(param));
    }

    public static Map<String,Object> FileDownload(DownFTPParam param) {

        final List<String> fileNames= new ArrayList<>();

        FTPClient ftp = null;
        try {
            ftp = ftpLogin(param);
            if(ftp==null){
                return new HashMap<String,Object>(){{put("success","0");put("reason","无法连接Ftp");}};
            }
            // 检索ftp目录下所有的文件
            boolean dir = ftp.changeWorkingDirectory(new String(param.getPathSrc().getBytes("UTF-8"), "ISO8859-1"));
            if (dir) {
                FTPFile[] fs = ftp.listFiles();
                for (FTPFile f : fs) {
                    //三种文件类型.txt .properties .mp4
                    if (!f.getName().contains(".txt")&&!f.getName().startsWith(".")) {
                        downloadLogic(param, ftp, f);
                    }
                    if (f.getName().contains(".mp4")) {
                        fileNames.add(f.getName().replace("_合成通道",""));
                    }
                }
                //文件下载完成
                //此处需退出登录，以免阻塞
                ftp.logout();
                if(checkFile(param.getPathDst())){
                 return new HashMap<String,Object>(){{put("success","1");put("fileNames",fileNames);}};
                }
                return new HashMap<String,Object>(){{put("success","0");put("reason","file is not complete");}};
            }
            else{
                return new HashMap<String,Object>(){{put("success","0");put("reason","can not find this directory");}};
            }
        } catch (final Exception e) {
            e.printStackTrace();
            logger.error(param.getHospitalName()+"ftp download happen exception",e);
            return new HashMap<String,Object>(){{put("success","0");put("reason",e.getMessage());}};
        } finally {
            try {
                if (ftp != null) {
                    ftp.disconnect();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private static FTPClient ftpLogin(DownFTPParam param) {
        FTPClient ftp;
        try {
            ftp = new FTPClient();

            ftp.connect(param.getHost(), param.getPort());
            if (ftp.isConnected()) {
                if (ftp.login(param.getUsername(), param.getPassword())) {
                    ftp.login(param.getUsername(), param.getPassword());
                    ftp.setFileType(FTPClient.BINARY_FILE_TYPE);
                    // 设置linux环境
                    FTPClientConfig conf = new FTPClientConfig(FTPClientConfig.SYST_UNIX);
                    ftp.configure(conf);
                    // 判断是否连接成功
                    int reply = ftp.getReplyCode();
                    if (!FTPReply.isPositiveCompletion(reply)) {
                        ftp.disconnect();
                        logger.error(param.getHospitalName()+"：FTP server refused connection.");
                        return null;
                    }
                    ftp.setDataTimeout(60000);       //设置传输超时时间为60秒
                    ftp.setControlEncoding(LOCAL_CHARSET);
                    // 设置访问被动模式
                    ftp.setRemoteVerificationEnabled(false);
                    ftp.enterLocalPassiveMode();
                    return ftp;
                }
                else{
                    logger.error(param.getHospitalName()+"FTP SERVER USERNAME OR PASSWORD ERROR");
                }
            }
            else{
                logger.error(param.getHospitalName()+"can not connect to this ftp host and port");
            }
        } catch (Exception e) {
            logger.error(param.getHospitalName()+"can not connect to this ftp host and port connect timeout",e);
            e.printStackTrace();
        }
        return null;
    }

    private static void downloadLogic(DownFTPParam param, FTPClient ftp, FTPFile f) throws IOException {
        BufferedInputStream bis = null;
        BufferedOutputStream bos = null;
        try {
            logger.error(" this is info!! the file i need is:" + f.getName());
            logger.error("this is info!! the file i need is:" + f.getName()+"start download");
            File localFile = new File(param.getPathDst() + f.getName().replace("_合成通道",""));
            if (!localFile.getParentFile().exists()) {
                localFile.getParentFile().mkdirs();
            }
            logger.error("this is info!! Ftp file size:"+f.getSize());
            long remoteSize=f.getSize();
            long localSize=0;
            long step;
            if(localFile.exists()){
                if((localSize=localFile.length())>= f.getSize()){
                    logger.error("this is info!! file is already downloaded");
                    return;
                }
                logger.error("this is info!! try break point continue");
                logger.error("this is info!! already download:"+localFile.length());
                ftp.setRestartOffset(localFile.length());
            }
            if(remoteSize<100){
                step=1;
            }
            else{
                step = remoteSize /100;
            }
            long process=localSize /step;
            InputStream is = ftp.retrieveFileStream(new String(f.getName().getBytes("UTF-8"), "ISO8859-1"));
            bis = new BufferedInputStream(is);
            bos = new BufferedOutputStream(new FileOutputStream(localFile,true));
            byte[] szBuf = new byte[128 * 1024];
            int dwRead;
            while ((dwRead = bis.read(szBuf, 0, 128 * 1024)) != -1) {
                bos.write(szBuf, 0, dwRead);
                localSize+=dwRead;
                long nowProcess = localSize /step;
                if(nowProcess > process){
                    process = nowProcess;
                    if(process % 10 == 0)
                        logger.error("this is info!! progress："+process);
                }
                bos.flush();
            }
            is.close();
            ftp.completePendingCommand();//在调用retrieveFileStream这个接口后，一定要手动close掉返回的InputStream，然后再调用completePendingCommand方法
            //简单来说：completePendingCommand()会一直在等FTP Server返回226 Transfer complete，
            // 但是FTP Server只有在接受到InputStream执行close方法时，才会返回。所以先要执行close方法
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (bis != null)
                bis.close();
            if (bos != null)
                bos.close();
        }
        logger.error("this is info!!"+f.getName() + "the file location is"+param.getPathDst());
    }

    private static boolean checkFile(String dstPath) {
        BufferedReader in = null;
        List<Boolean> allSuccess = new ArrayList<>();
        try {
            File file = new File(dstPath);
            File[] files = file.listFiles();
            for (File file1 : files) {
                if ("MD5.properties".equals(file1.getName())) {
                    Properties properties = new Properties();
                    in = new BufferedReader(new InputStreamReader(new FileInputStream(dstPath + "MD5.properties"), "UTF-8"));
                    properties.load(in);
                    Iterator<String> it = properties.stringPropertyNames().iterator();
                    while (it.hasNext()) {
                        String fileName = it.next();
                        if (fileName.contains(".mp4")) {
                            String srcMd5 = properties.getProperty(fileName);
                            String dstMd5 = MD5Utils.fileMD5(dstPath + fileName.replace("_合成通道",""));
                            logger.error("this is info!! srcMd5:" + srcMd5);
                            logger.error("this is info!! dstMd5:" + dstMd5);
                            allSuccess.add(srcMd5.equalsIgnoreCase(dstMd5));
                        }
                    }
                }
            }
            for (Boolean bool : allSuccess) {
                //文件不完整
                if (!bool) {
                    logger.error("file is not complete");
                    return bool;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (in != null)
                try {
                    in.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
        }
        return true;
    }

}
