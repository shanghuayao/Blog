---
title: "如何禁止tomcat的启动日志，以及为什么要将log日志对象声明为private static final类型的呢？"
description: "本文介绍如何通过调整日志级别来禁止Springboot应用中嵌入式Tomcat的启动日志显示，并解释了为什么需要将日志对象声明为private static final类型。"
pubDate: 2021-04-01
tags: ["java"]
source: "https://blog.csdn.net/shanghuayao/article/details/115371980"
---
### 1、如何禁止tomcat的启动日志

Springboot2.x 启动时，控制台输出了来自嵌入式tomcat的红色日志，这些日志似乎对程序没有影响，那么可以试着将它过滤掉。

解决方法：

1、Tomcat使用自带的JULI的衍生产品java.util.logging来输出日志

2、JULI兼容java.util.logging，可以使用同样的配置方法进行配置

spring启动前，加上这样这句来控制日志输出级别：

```java
java.util.logging.Logger.getLogger("org.apache").setLevel(java.util.logging.Level.WARNING);
```

这将指示java.util.logging（由JULI实现）仅将警告传播到控制台。

### 2、为什么要将log日志对象声明为private static final类型的呢？

![在这里插入图片描述](/Blog/images/csdn/tomcat-log-private-static-final-115371980/01-9d9f3d9eae067749f61a91fc068dac63.png)

1. 设置为private(私有的)是为了不让其他类共享该日志对象。
2. 设置为static(静态)是为了让每个类中的日志对象都只生成一份，属于该类而不是具体的实例 。
3. 设置为final是为了确保该日志对象不会被修改。
