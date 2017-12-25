package com.fable.kscc.api.model.upload;

public class UploadBean {
	private Integer id; // 编号

	private String confId; // 会场id

	private String bucket; // 视频上传桶

	private Integer codecId;
	
	private Integer hospitalId;
	
	private String status;
	
	private String filename;
	
	private String fileSize;
	
	private String fileuploadname;
	
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getConfId() {
		return confId;
	}

	public void setConfId(String confId) {
		this.confId = confId;
	}

	public String getBucket() {
		return bucket;
	}

	public void setBucket(String bucket) {
		this.bucket = bucket;
	}

	public Integer getCodecId() {
		return codecId;
	}

	public void setCodecId(Integer codecId) {
		this.codecId = codecId;
	}

	public Integer getHospitalId() {
		return hospitalId;
	}

	public void setHospitalId(Integer hospitalId) {
		this.hospitalId = hospitalId;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getFilename() {
		return filename;
	}

	public void setFilename(String filename) {
		this.filename = filename;
	}

	public String getFileSize() {
		return fileSize;
	}

	public void setFileSize(String fileSize) {
		this.fileSize = fileSize;
	}

	public String getFileuploadname() {
		return fileuploadname;
	}

	public void setFileuploadname(String fileuploadname) {
		this.fileuploadname = fileuploadname;
	}
	
	
}
