package com.fable.kscc.api.utils;

/**
 * Created by Administrator on 2017/12/25 0025.
 */
public class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName()+"正在执行。。。");
        System.out.println("修改某个文件上传到github");
    }
}
