---
title: "java设计模式：策略模式"
description: "本文探讨了如何通过策略模式改进约会策略，避免冗长条件判断，提高代码灵活性和可维护性。通过定义DateStrategy接口和具体实现如AGirlAction和BGirlAction，展示了如何在面对不同女孩时灵活切换行为，同时强调了其优缺点。"
pubDate: 2022-12-30
tags: ["java", "设计模式"]
source: "https://blog.csdn.net/shanghuayao/article/details/128497324"
---
如果你想去约会不同的小姐姐，那就要根据小姐姐的喜好来决定带她去做什么？

```java
if(girl=="A"){
    ...
}else if(girl=="B"){
    ...
}else if(girl=="C"){
	...
}
```

如果有更多条件需要判断时，该流程控制会变得很长，代码变得臃肿、难以维护、可读性低。

如果想要和一个新的小姐姐约会，那就要在原有代码基础上做修改。

此时我们可以使用**策略模式**来进行优化。

```java
//定义一个接口
public interface DateStrategy {
    void doSomeThing();
}
```

```java
public class AGirlAction implements DateStrategy{
    @Override
    public void doSomeThing() {
        System.out.println("喝咖啡");
    }
}
```

```java
public class BGirlAction implements DateStrategy{
    @Override
    public void doSomeThing() {
        System.out.println("看电影");
    }
}
```

```java
public class Context {
    private DateStrategy dateStrategy;

    public Context(DateStrategy dateStrategy) {
        this.dateStrategy = dateStrategy;
    }

    public void doSomeThing(){
        dateStrategy.doSomeThing();
    }
}
```

```java
public void date(String girl) {
        Context context = null;
        switch (girl){
            case "A":
                context = new Context(new AGirlAction());
                break;
            case "B":
                context = new Context(new BGirlAction());
                break;
        }
        context.doSomeThing();
    }
```

### 优缺点

##### 优点：

1、算法可以自由切换。

2、避免使用多重条件判断。

3、扩展性良好。

##### 缺点：

1、策略类增多

2、策略类需要对外暴露
