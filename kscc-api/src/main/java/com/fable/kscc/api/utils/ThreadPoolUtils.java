package com.fable.kscc.api.utils;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * @auther jiangmingjun
 * @create 2017/11/6
 * @description 单例模式创建线程池，保证程序中只创建一个线程池
 */
public class ThreadPoolUtils {
    private ThreadPoolUtils() {
    }
    private static final ExecutorService threadPool = Executors.newCachedThreadPool();//jdk1.8文档中说未使用六十秒的线程将被终止并从缓存中删除

    public static ExecutorService getThreadPool() {
        return threadPool;

    }
}
