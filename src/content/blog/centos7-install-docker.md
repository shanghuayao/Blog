---
title: "Centos7上安装docker命令详解"
description: "本文详细介绍了在Centos7上安装Docker的过程，包括检查系统内核版本、更新yum包、卸载旧版本、安装必要软件包、设置yum源、安装Docker及验证安装等步骤。同时针对安装过程中可能遇到的问题提供了具体的解决办法。"
pubDate: 2020-12-12
tags: ["运维"]
source: "https://blog.csdn.net/shanghuayao/article/details/111086414"
---
## Centos7上安装docker命令详解

转自：[https://www.cnblogs.com/yufeng218/p/8370670.html](https://www.cnblogs.com/yufeng218/p/8370670.html)

### 一、安装docker

1、Docker 要求 CentOS 系统的内核版本高于 3.10 ，查看本页面的前提条件来验证你的CentOS 版本是否支持 Docker 。

通过 uname -r 命令查看你当前的内核版本

```java
$ uname -r
```

2、使用 root 权限登录 Centos。确保 yum 包更新到最新。

```java
$ sudo yum update
```

3、卸载旧版本(如果安装过旧版本的话)

```java
$ sudo yum remove docker  docker-common docker-selinux docker-engine
```

4、安装需要的软件包， yum-util 提供yum-config-manager功能，另外两个是devicemapper驱动依赖的

```java
$ sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```

5、设置yum源

```java
$ sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

![哈哈](/Blog/images/csdn/centos7-docker-111086414/01-cd2dce2e6f16400a62682f3df387a7c3.png)

6、可以查看所有仓库中所有docker版本，并选择特定版本安装

```java
$ yum list docker-ce --showduplicates | sort -r
```

![1](/Blog/images/csdn/centos7-docker-111086414/02-0f79b09922fe76aa6fb663afdfb45907.png)

7、安装docker

```java
$ sudo yum install docker-ce  #由于repo中默认只开启stable仓库，故这里安装的是最新稳定版17.12.0
$ sudo yum install <FQPN>  # 例如：sudo yum install docker-ce-17.12.0.ce
```

8、启动并加入开机启动

```java
$ sudo systemctl start docker
$ sudo systemctl enable docker
```

9、验证安装是否成功(有client和service两部分表示docker安装启动都成功了)

```java
$ docker version
```

![天青色等烟雨](/Blog/images/csdn/centos7-docker-111086414/03-ca28f01dfdbb8916f45741796fdb3480.png)

### 二、问题

1、因为之前已经安装过旧版本的docker，在安装的时候报错如下：

```
> Transaction check error:   file /usr/bin/docker from install of
> docker-ce-17.12.0.ce-1.el7.centos.x86_64 conflicts with file from
> package docker-common-2:1.12.6-68.gitec8512b.el7.centos.x86_64   file
> /usr/bin/docker-containerd from install of
> docker-ce-17.12.0.ce-1.el7.centos.x86_64 conflicts with file from
> package docker-common-2:1.12.6-68.gitec8512b.el7.centos.x86_64   file
> /usr/bin/docker-containerd-shim from install of
> docker-ce-17.12.0.ce-1.el7.centos.x86_64 conflicts with file from
> package docker-common-2:1.12.6-68.gitec8512b.el7.centos.x86_64   file
> /usr/bin/dockerd from install of
> docker-ce-17.12.0.ce-1.el7.centos.x86_64 conflicts with file from
> package docker-common-2:1.12.6-68.gitec8512b.el7.centos.x86_64
```

2、卸载旧版本的包

```java
$ sudo yum erase docker-common-2:1.12.6-68.gitec8512b.el7.centos.x86_64
```

3、再次安装docker

```java
$ sudo yum install docker-ce
```

⚠️：国外镜像一般很难访问，建议配置阿里云镜像。

```java
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

hello world!!!
