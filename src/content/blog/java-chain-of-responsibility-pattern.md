---
title: "java设计模式：责任链模式"
description: "本文介绍责任链模式的基本概念，通过两个代码示例展示其在Java中的应用，包括如何处理请求和响应，以及如何通过链条传递请求。此外还讨论了该模式的优点和缺点。"
pubDate: 2022-12-13
tags: ["java", "设计模式", "责任链模式"]
source: "https://blog.csdn.net/shanghuayao/article/details/128302727"
---
> 顾名思义，责任链模式（Chain of Responsibility Pattern）为请求创建了一个接收者对象的链。这种模式给予请求的类型，对请求的发送者和接收者进行解耦。这种类型的设计模式属于行为型模式。
> 在这种模式中，通常每个接收者都包含对另一个接收者的引用。如果一个对象不能处理该请求，那么它会把相同的请求传给下一个接收者，依此类推。

### 优缺点

> 优点：
> 1、降低耦合度。它将请求的发送者和接收者解耦。
> 2、简化了对象。使得对象不需要知道链的结构。
> 3、增加新的请求处理类很方便。

> 缺点：
> 1、不能保证请求一定被接收。
> 2、系统性能将受到一定影响，而且在进行代码调试时不太方便，可能会造成循环调用。

### 代码示例1

需要注意的是，通常在责任链模式的实现中，如果在某一层已经处理了这个请求，那么这个请求就不会传递下去。在我这个例子中，消息会一直传递到最底层不管它是否已经被处理。

```java
public class Person {

    private String name;
    private String sex;
    private Integer age;

    public String getName() {
        return name;
    }
    public String getSex() {
        return sex;
    }
    public Integer getAge() {
        return age;
    }

    public void setName(String name) {
        this.name = name;
    }
    public void setSex(String sex) {
        this.sex = sex;
    }
    public void setAge(Integer age) {
        this.age = age;
    }

}
```

```java
/**
 * 处理器抽象类，具体实现继承此类
 */
public abstract class Handler {

    protected Handler nextHandler;

    //设置下一个处理器
    public void  setNextHandler(Handler handler){
        this.nextHandler = handler;
    }

    public abstract void doHandler(Person person);

}
```

```java
/**
 * Age处理器
 */
public class AgeHandler extends Handler{

    @Override
    public void doHandler(Person person) {
        if(person.getAge()<18){
            System.out.println("您是未成年人，无法继续操作");
            return;
        }
        System.out.println("您已成年，允许继续操作");
        if(nextHandler!=null){
            nextHandler.doHandler(person);
        }
    }
}
```

```java
/**
 * Name处理器
 */
public class NameHandler extends Handler{

    @Override
    public void doHandler(Person person) {
        if(person.getName().length()>3){
            System.out.println("您的名字不是三个字，无法继续操作");
            return;
        }
        System.out.println("您的名字是三个字，允许继续操作");
        if(nextHandler!=null){
            nextHandler.doHandler(person);
        }
    }
}
```

```java
/**
 * Sex处理器
 */
public class SexHandler extends Handler{

    @Override
    public void doHandler(Person person) {
        if(!person.getSex().equals("男")){
            System.out.println("您的性别不是男，无法继续操作");
            return;
        }
        System.out.println("您的性别是男，允许继续操作");
        if(nextHandler!=null){
            nextHandler.doHandler(person);
        }
    }
}
```

```java
public class CheckService {

    public static void check(String name,String sex,Integer age){
        Person person = new Person();
        person.setName(name);
        person.setAge(age);
        person.setSex(sex);

        Handler nameHandler = new NameHandler();
        Handler sexHandler = new SexHandler();
        Handler ageHandler = new AgeHandler();

        nameHandler.setNextHandler(sexHandler);
        sexHandler.setNextHandler(ageHandler);
        nameHandler.doHandler(person);
    }

    public static void main(String[] args) {
        check("许三多","男",17);
    }
}
```

#### 输出结果：

![在这里插入图片描述](/Blog/images/csdn/java-128302727/01-a03cb336f67a413cf2af0b4fd8d6cfc6.png)

### 代码示例2

有返回值的责任链模式

该示例借助@Autowired将Handler的所有实现类注入到List中，再以循环的方式调用具体执行方法，根据返回值进行判断。

```java
public class Userlogin {

    private String username;

    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
```

```java
public abstract class Handler {

    private Handler nextHandler;

    public void setNextHandler(Handler nextHandler) {
        this.nextHandler = nextHandler;
    }

    public abstract boolean doHandler(Userlogin userlogin);
}
```

```java
@Component
public class PasswordHandler extends Handler{

    @Override
    public boolean doHandler(Userlogin userlogin) {
        if(userlogin.getPassword().length()<8){
            System.out.println("密码小于八位");
            return false;
        }
        return true;
    }
}
```

```java
@Component
public class UsernameHandler extends Handler{

    @Override
    public boolean doHandler(Userlogin userlogin) {
        if(userlogin.getUsername().length()<6){
            System.out.println("用户名小于6位");
            return false;
        }
        return true;
    }
}
```

```java
@Component
public class UserLoginService{

    @Autowired
    private List<Handler> handlerList;

    public boolean run(Userlogin user) {
        user.setUsername("admin111");
        user.setPassword("1234567");
        for (Handler handler:handlerList) {
            if(!handler.doHandler(user)){
                return false;
            }
        }
        return true;
    }
}
```
