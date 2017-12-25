package com.fable.kscc.api.beans.component;

public class VideoFormats {

	private int format = 4 ;
	private int resolution = 13;//12:720p,13:1080p
	private int frame = 30;
	private int bitrate= 4096;

	public int getFormat() {
		return format;
	}

	public void setFormat(int format) {
		this.format = format;
	}

	public int getResolution() {
		return resolution;
	}

	public void setResolution(int resolution) {
		this.resolution = resolution;
	}

	public int getFrame() {
		return frame;
	}

	public void setFrame(int frame) {
		this.frame = frame;
	}

	public int getBitrate() {
		return bitrate;
	}

	public void setBitrate(int bitrate) {
		this.bitrate = bitrate;
	}

}
