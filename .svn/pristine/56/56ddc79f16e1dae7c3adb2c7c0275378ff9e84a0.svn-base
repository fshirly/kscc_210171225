package com.fable.kscc.bussiness.service.uploadfile.jobmanage;

import javax.annotation.PostConstruct;

import org.springframework.stereotype.Service;

@Service
public class UploadJobManager {
	
	/**
	 * 增加定时任务
	 */
	@PostConstruct
	public void addJob() {
		try {
			QuartzManager.addJob("UploadFileJob", UploadFileJob.class,"0 05 15 * * ?");
		} catch (Exception e) {
			QuartzManager.addJob("UploadFileJob", UploadFileJob.class, "0 0 1 * * ?");
			e.printStackTrace();
		}
	}
}
