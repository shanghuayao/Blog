---
title: "JAVA synchronized锁的是什么"
description: "本文探讨了Java中的synchronized关键字在解决共享资源冲突中的作用。详细解释了对象锁、类锁的概念，并通过示例代码展示了如何使用synchronized实现线程同步，确保并发环境下的数据一致性。同时强调了何时应该使用同步以及同步的重要性。"
pubDate: 2023-06-30
tags: ["java", "并发编程"]
source: "https://blog.csdn.net/shanghuayao/article/details/131469958"
---
### 文章有错误和不严谨的地方欢迎大家的指正，帮助我继续进步，谢谢

最近在学习《java编程思想》的线程相关问题时，一直疑问解决共享资源所运用的synchronized关键字的问题，今天整理一下synchronized锁的到底是什么。

> Java以提供synchronized关键字的形式，为防止资源冲突提供了内置支持。当任务要执行被synchronized关键字保护的代码片段时，它将检查锁是否可用，然后获取锁，执行代码，释放锁。

## 1、对象锁

```java
//synchronized方法，锁的是当前对象
    synchronized void function(){
        //...
    }

    //synchronized同步块，this锁的也是当前对象
	synchronized(this){
        //...
    }
```

**所有对象都自动含有单一的锁(也称为监视器)。调用该对象中的任意synchronized方法时，该对象会被加锁，这时如果需要调用该对象的其他synchronized方法，要等前一个方法释放了锁才可以调用。**

```java
public class People {
    public synchronized void changeMoney(){
        int money = 5;
        while (money>0){
            System.out.println(Thread.currentThread().getName() + " - " +money);
            money--;
        }
    }

    public synchronized void changeMoney2(){
        int money = 5;
        while (money>0){
            System.out.println(Thread.currentThread().getName() + " - " +money);
            money--;
        }
    }
     public static void main(String[] args) {
        People p = new People();
        new Thread(new SyncThread(p),"线程A").start();
        new Thread(new SyncThread2(p),"线程B").start();
    }
}
class SyncThread implements Runnable{
    People p;
    SyncThread(People p){
        this.p = p;
    }
    @Override
    public void run() {
        p.changeMoney();
    }
}

class SyncThread2 implements Runnable{
    People p;
    SyncThread2(People p){
        this.p = p;
    }
    @Override
    public void run() {
        p.changeMoney2();
    }
}
```

上述代码执行结果是：

```java
线程A - 5
线程A - 4
线程A - 3
线程A - 2
线程A - 1
线程B - 5
线程B - 4
线程B - 3
线程B - 2
线程B - 1
```

用两个线程分别调用同一对象中的两个synchronized方法，1方法执行完毕后才会执行2方法。此时如果把其中一个synchronized方法改为普通方法，结果会交替执行（可以在方法中加延时，比较直观）。

```java
public synchronized void changeMoney(){
        int money = 5;
        while (money>0){
            System.out.println(Thread.currentThread().getName() + " - " +money);
            money--;
            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public void changeMoney2(){
        int money = 5;
        while (money>0){
            System.out.println(Thread.currentThread().getName() + " - " +money);
            money--;
            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
```

运行结果：

```java
线程A - 5
线程B - 5
线程B - 4
线程A - 4
线程B - 3
线程A - 3
线程B - 2
线程A - 2
线程B - 1
线程A - 1
```

## 2、类锁

```java
//synchronized静态方法，锁的是类
    synchronized static void function(){
        //...
    }
    //代码块，填该类的.class对象，锁的是类
    synchronized（ .class）{
    }
```

**针对每个类也有一个锁，作为类的Class对象的一部分，所以 synchronized static方法可以在类的范围内控制对静态资源的并发访问。**

## 3、给对象的属性加锁

```java
public class People {

    private Integer age;

    public void setAge(Integer age) {
        this.age = age;
    }

    public Integer addAge() {
        synchronized (this.age){
            this.age = age+1;
            return this.age;
        }
    }

    public static void main(String[] args) {
        People p = new People();
        p.setAge(0);
        new Thread(new ChangeThread(p),"线程A").start();
        new Thread(new ChangeThread(p),"线程B").start();
    }

}

class ChangeThread implements Runnable{

    People p;

    ChangeThread(People p){
        this.p = p;
    }

    @Override
    public void run() {
        for (int i=0;i<10;i++){
            System.out.println(Thread.currentThread().getName() + " - " + p.addAge());
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
            }
        }
    }

}
```

对People的熟悉age进行+1操作，线程A和B同时进行处理，给age属性加锁，防止出现并发问题。

上述代码输出结果：

```java
线程A - 1
线程B - 2
线程A - 3
线程B - 4
线程B - 5
线程A - 6
线程A - 7
线程B - 8
线程B - 9
线程A - 10
线程A - 12
线程B - 11
线程B - 13
线程A - 14
线程B - 15
线程A - 16
线程B - 18
线程A - 17
线程A - 19
线程B - 20
```

## 4、你应该什么时候同步呢？

> 如果你正在写一个变量，它可以接下来将被另一个线程读取，或者正在读取一个上一次已经被另一个线程写过的变量，那么你必须使用同步，并且，读写线程都必须使用相同的监视器锁同步。

**注意：在使用并发时，将域设置为同步是非常有必要的。这样可以防止其他任务直接访问域，避免产生冲突。**
