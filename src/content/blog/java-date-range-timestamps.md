---
title: "java获取今天,昨天,上周,上月等 0点以及24点的时间戳"
description: "本文详细介绍了使用Java获取各种特定时间段的时间戳方法，包括今天、昨天、近7日及30日、上月及本周等不同场景的时间戳计算，适用于数据库查询和其他需要精确时间定位的应用。"
pubDate: 2020-07-07
tags: ["java"]
source: "https://blog.csdn.net/shanghuayao/article/details/107179774"
---
#### 经常遇到用时间作为查询条件的情况,本人整理了一些常用的时间段的时间戳,供参考

1. 获取 昨天这个时间的时间戳

```
Calendar calendar = Calendar.getInstance();     //当前时间
        calendar.add(Calendar.DAY_OF_YEAR,-1);
        Long dd = calendar.getTime().getTime()/1000;
        System.out.println(dd);
```

1. 计算今天0点的时间戳

```
Long  time = System.currentTimeMillis();  //当前时间的时间戳
       long zero = time/(1000*3600*24)*(1000*3600*24) - TimeZone.getDefault().getRawOffset();
       System.out.println(new Timestamp(zero));//今天零点零分零秒
       System.out.println(zero/1000);
```

1. 计算今天23点59分59秒的时间戳

```
Calendar calendar = Calendar.getInstance();
     calendar.set(calendar.get(Calendar.YEAR),calendar.get(Calendar.MONTH),calendar.get(Calendar.DAY_OF_MONTH),23,59,59);
     long tt = calendar.getTime().getTime()/1000;
     System.out.println(tt);
```

1. 计算昨天0点的时间戳

```
Calendar calendar = Calendar.getInstance();
     calendar.set(calendar.get(Calendar.YEAR),calendar.get(Calendar.MONTH),calendar.get(Calendar.DAY_OF_MONTH)-1,0,0,0);
     long tt = calendar.getTime().getTime()/1000;
     System.out.println(tt);
```

1. 计算昨天23:59:59 秒的时间戳

```
Calendar calendar = Calendar.getInstance();
     calendar.set(calendar.get(Calendar.YEAR),calendar.get(Calendar.MONTH),calendar.get(Calendar.DAY_OF_MONTH)-1,23,59,59);
     long tt = calendar.getTime().getTime()/1000;
     System.out.println(tt);
```

1. 计算近7日 0点的时间戳(不包含当天)

```
Calendar calendar = Calendar.getInstance();
     calendar.set(calendar.get(Calendar.YEAR),calendar.get(Calendar.MONTH),calendar.get(Calendar.DAY_OF_MONTH)-7,0,0,0);
     long tt = calendar.getTime().getTime()/1000;
     System.out.println(tt);
```

1. 计算近30天 0点的时间戳(不包含当天)

```
Calendar calendar = Calendar.getInstance();
     calendar.set(calendar.get(Calendar.YEAR),calendar.get(Calendar.MONTH),calendar.get(Calendar.DAY_OF_MONTH)-30,0,0,0);
     long tt = calendar.getTime().getTime()/1000;
     System.out.println(tt);
```

1. 计算上月第一天 0点的时间戳

```
Calendar calendar = Calendar.getInstance();
     calendar.set(calendar.get(Calendar.YEAR),calendar.get(Calendar.MONTH)-1,1,0,0,0);
     long tt = calendar.getTime().getTime()/1000;
     System.out.println(tt);
```

1. 计算上月最后一天 23点的时间戳

```
Calendar calendar = Calendar.getInstance();
     calendar.set(calendar.get(Calendar.YEAR),calendar.get(Calendar.MONTH)-1,calendar.get(Calendar.DAY_OF_MONTH),23,59,59);
     calendar.set(Calendar.DAY_OF_MONTH,calendar.getActualMaximum(Calendar.DAY_OF_MONTH));
     long tt = calendar.getTime().getTime()/1000;
     System.out.println(tt)
```

1. 计算上周周一 0点的时间戳

```
Calendar calendar = Calendar.getInstance();
     calendar.set(calendar.get(Calendar.YEAR),calendar.get(Calendar.MONDAY), calendar.get(Calendar.DAY_OF_MONTH), 0, 0,0);
     calendar.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);
     calendar.add(Calendar.DATE,-7);
     System.out.println(calendar.getTime().getTime()/1000);
```

1. 计算上周周日23点的时间戳

```
Calendar calendar = Calendar.getInstance();
     calendar.set(calendar.get(Calendar.YEAR),calendar.get(Calendar.MONDAY), calendar.get(Calendar.DAY_OF_MONTH), 23, 59,59);
     calendar.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);
     calendar.add(Calendar.DATE,-1);
     System.out.println(calendar.getTime().getTime()/1000);
```

1. 计算本月第一天0点的时间戳

```
Calendar calendar = Calendar.getInstance();
     calendar.set(calendar.get(Calendar.YEAR),calendar.get(Calendar.MONDAY), calendar.get(Calendar.DAY_OF_MONTH), 0, 0,0);
     calendar.set(Calendar.DAY_OF_MONTH,calendar.getActualMinimum(Calendar.DAY_OF_MONTH));
     long tt = calendar.getTime().getTime()/1000;
    System.out.println(tt);
```

1. 计算本月最后一天23:59:59的时间戳

```
Calendar calendar = Calendar.getInstance();
     calendar.set(calendar.get(Calendar.YEAR),calendar.get(Calendar.MONDAY), calendar.get(Calendar.DAY_OF_MONTH), 23, 59,59);
     calendar.set(Calendar.DAY_OF_MONTH,calendar.getActualMaximum(Calendar.DAY_OF_MONTH));
     long tt = calendar.getTime().getTime()/1000;
     System.out.println(tt);
```

```
</div><div><div></div></div>
            <link href="https://csdnimg.cn/release/phoenix/mdeditor/markdown_views-60ecaf1f42.css" rel="stylesheet">
                            </div>
```

源博客：[https://blog.csdn.net/weixin_44108435/article/details/87937314](https://blog.csdn.net/weixin_44108435/article/details/87937314)
