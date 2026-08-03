---
title: "epel源-是什么?为什么安装？"
description: "博客提及EPEL源，探讨其是什么以及为何要安装，还给出相关来源链接https://www.cnblogs.com/fps2tao/p/7580188.html ，涉及Linux系统相关知识。"
pubDate: 2020-12-28
tags: ["运维"]
source: "https://blog.csdn.net/shanghuayao/article/details/111875093"
---
> EPEL源-是什么?为什么安装？

```java
EPEL (Extra Packages for Enterprise Linux)是基于Fedora的一个项目，为“红帽系”的操作系统提供额外的软件包，适用于RHEL、CentOS和Scientific Linux.

使用很简单：
1. 首先需要安装一个叫”epel-release”的软件包，这个软件包会自动配置yum的软件仓库。当然你也可以不安装这个包，自己配置软件仓库也是一样的。
#用于RHEL5系列
wget http://download.fedoraproject.org/pub/epel/5/i386/epel-release-5-4.noarch.rpm
rpm -ivh epel-release-5-4.noarch.rpm
#用于RHEL6系列
wget http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-5.noarch.rpm
rpm -ivh epel-release-6-5.noarch.rpm

2. 安装完成之后你就可以直接使用yum来安装额外的软件包了
yum clean all

yum makecache
yum install nginx pure-ftpd

3.直接自己手工添加软件仓库配置文件
vi /etc/yum.repos.d/epel.repo

[epel]
name=epel
mirrorlist=http://mirrors.fedoraproject.org/mirrorlist?repo=epel-releasever&arch=releasever&arch=basearch
enabled=1
gpgcheck=0

CentOS6.5添加阿里云的EPEL源
yum localinstall --nogpgcheck http://mirrors.aliyun.com/epel/6/x86_64/epel-release-6-8.noarch.rpm

安装阿里云EPEL源
1、首先卸载以前装的epel以免影响
rpm -e epel-release
2、 下载阿里提供的epel
wget -P /etc/yum.repos.d/ http://mirrors.aliyun.com/repo/epel-6.repo
3、yum clean all
4、yum makecache

阿里云源安装示例：
1、备份(如有配置其他epel源)
mv /etc/yum.repos.d/epel.repo /etc/yum.repos.d/epel.repo.backup
mv /etc/yum.repos.d/epel-testing.repo /etc/yum.repos.d/epel-testing.repo.backup

2、下载新repo 到/etc/yum.repos.d/
epel(RHEL 7)
wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo

epel(RHEL 6)
wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-6.repo

epel(RHEL 5)
wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-5.repo
```

来源：https://www.cnblogs.com/fps2tao/p/7580188.html
