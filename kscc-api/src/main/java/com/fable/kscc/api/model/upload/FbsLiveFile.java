package com.fable.kscc.api.model.upload;
import java.util.Date;


/**
 * 实体类
 */
public class FbsLiveFile  {
	
	private Integer id;

	/**会议id*/
	private Integer confid;

	/**医院id*/
	private Integer hospitalid;

	/**编解码器id*/
	private Integer codecid;

	/**编解码器上文件名称*/
	private String filename;

	/**编解码器上文件目录*/
	private String filepath;

	/**天翼云文件目录*/
	private String storefilepath;

	/**天翼云文件名称*/
	private String storefilename;

	/**编解码文件是否已删除 0.未删除，1.已删除*/
	private String oldfilestatus;

	/**文件是否已上传到天翼云 0.未上传 1.已上传*/
	private String uploadstatus;

	/**天翼云文件是否已删除 0.未删除 1.已删除*/
	private String storefilestatus;

	private Integer fileserialnumber;

	/**创建者*/
	private String creatorid;

	/**创建时间*/
	private Date createdtime;

	/**修改者*/
	private String updateid;

	/**修改时间*/
	private Date updatedtime;
	
	private String title;
	
	private String starttime;
	
	private String hospitalname;
	
	private String bucket;
	
	private Integer liveid;
	
	private String ip;
	
	private String port;
	
	private String username;
	
	private String password;
	
	private String displayName;
	
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Integer getConfid() {
		return confid;
	}

	public void setConfid(Integer confid) {
		this.confid = confid;
	}

	public Integer getHospitalid() {
		return hospitalid;
	}

	public void setHospitalid(Integer hospitalid) {
		this.hospitalid = hospitalid;
	}

	public Integer getCodecid() {
		return codecid;
	}

	public void setCodecid(Integer codecid) {
		this.codecid = codecid;
	}

	public String getFilename() {
		return filename;
	}

	public void setFilename(String filename) {
		this.filename = filename;
	}

	public String getFilepath() {
		return filepath;
	}

	public void setFilepath(String filepath) {
		this.filepath = filepath;
	}

	public String getStorefilepath() {
		return storefilepath;
	}

	public void setStorefilepath(String storefilepath) {
		this.storefilepath = storefilepath;
	}

	public String getStorefilename() {
		return storefilename;
	}

	public void setStorefilename(String storefilename) {
		this.storefilename = storefilename;
	}

	public String getOldfilestatus() {
		return oldfilestatus;
	}

	public void setOldfilestatus(String oldfilestatus) {
		this.oldfilestatus = oldfilestatus;
	}

	public String getUploadstatus() {
		return uploadstatus;
	}

	public void setUploadstatus(String uploadstatus) {
		this.uploadstatus = uploadstatus;
	}

	public String getStorefilestatus() {
		return storefilestatus;
	}

	public void setStorefilestatus(String storefilestatus) {
		this.storefilestatus = storefilestatus;
	}

	public Integer getFileserialnumber() {
		return fileserialnumber;
	}

	public void setFileserialnumber(Integer fileserialnumber) {
		this.fileserialnumber = fileserialnumber;
	}

	public String getCreatorid() {
		return creatorid;
	}

	public void setCreatorid(String creatorid) {
		this.creatorid = creatorid;
	}

	public Date getCreatedtime() {
		return createdtime;
	}

	public void setCreatedtime(Date createdtime) {
		this.createdtime = createdtime;
	}

	public String getUpdateid() {
		return updateid;
	}

	public void setUpdateid(String updateid) {
		this.updateid = updateid;
	}

	public Date getUpdatedtime() {
		return updatedtime;
	}

	public void setUpdatedtime(Date updatedtime) {
		this.updatedtime = updatedtime;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getStarttime() {
		return starttime;
	}

	public void setStarttime(String starttime) {
		this.starttime = starttime;
	}

	public String getHospitalname() {
		return hospitalname;
	}

	public void setHospitalname(String hospitalname) {
		this.hospitalname = hospitalname;
	}

	public String getBucket() {
		return bucket;
	}

	public void setBucket(String bucket) {
		this.bucket = bucket;
	}

	public Integer getLiveid() {
		return liveid;
	}

	public void setLiveid(Integer liveid) {
		this.liveid = liveid;
	}

	public String getIp() {
		return ip;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}

	public String getPort() {
		return port;
	}

	public void setPort(String port) {
		this.port = port;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getDisplayName() {
		return displayName;
	}

	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}
	
	
	
	
}
