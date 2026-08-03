---
title: "JAVA集合——常用单列集合"
description: "本文详细分析了Java中的Collection接口实现，包括ArrayList基于数组的有序可重复存储，LinkedList的双向链表结构，以及Set的不同子类如HashSet、LinkedHashSet和TreeSet的特性，重点讲解了扩容机制和线程安全问题。"
pubDate: 2024-03-20
tags: ["java"]
source: "https://blog.csdn.net/shanghuayao/article/details/136716855"
---
## Collection接口的实现UML

![在这里插入图片描述](/Blog/images/csdn/java-136716855/01-59382b61b9875470445398872db9151f.png)

### 1、List

#### 1.1 ArrayList

> **ArrayList**实现了**List**接口，通过源码可以看到它的内部维护了一个可变数组来存放数据。

![在这里插入图片描述](/Blog/images/csdn/java-136716855/02-70b93b1931dec29bdbd19409afcfa95d.png)

以下运行结果可知：

> ArrayList元素存放是有序的、可以重复的并且元素值可以为null

![在这里插入图片描述](/Blog/images/csdn/java-136716855/03-344611aad7abef40b25b13134c5205bf.png)

**扩容机制：**

> 当我们对ArrayList进行**无参构造**的初始化后，**首次**调用add()方法添加元素时，通过debug可以看到执行add()前，elementData数组大小为0。

![在这里插入图片描述](/Blog/images/csdn/java-136716855/04-8c31aca18bf096fcff32d4c57e73d5a2.png)

> 新增元素时，会执行下面的add方法，三个参数分别是：待添加的元素、内部维护的数组本身、size，判断条件size是否等于数组的长度，此时一定相等，因为ArrayList刚刚进行初始化，size为0，数组长度也为0，条件为true，进入grow()方法。

![在这里插入图片描述](/Blog/images/csdn/java-136716855/05-11138f45a3be7406ea1dcd979a314082.png)

> grows方法传入参数minCapactiy，此时的值为ArrayLsit.size+1，即原来的容量加上要新增的1个元素。
> grow()方法会调用newCapacity()方法**计算数组扩容的容量**，然后再进行数组复制copyOf扩容，扩容的重点就是这个方法，参数是上面传进来的minCapacity，可以理解为添加新元素时所需要的最小容量。

![在这里插入图片描述](/Blog/images/csdn/java-136716855/06-c4a4b0ebe409418da8b5992037adc857.png)

![在这里插入图片描述](/Blog/images/csdn/java-136716855/07-58cb0b2e9cf4bc55e1a4c281fa76fce1.png)

> **newCapacity方法的执行过程**：
> 1、将数组的长度赋值给变量oldCapacity
> 2、计算新的容量newCapacity，它的值为oldCapacity的1.5倍
> 3、判断newCapacity是否满足添加新元素所需的最小容量的需求，如果不满足，则判断当前数组是不是初始状态，空数组，如果是就返回默认容量10和minCapacity中最大的一个，当前只添加一个元素，所以返回的是10，如果当前数组不是空的，直接返回minCapacity。
> 4、如果满足则三目运算是否超出ArrayList的最大容量限制，最终返回newCapacity。

![在这里插入图片描述](/Blog/images/csdn/java-136716855/08-397efaa409ff2bc43c77113d72a1d3e6.png)

> 执行完毕后grow()方法根据得到的容量对数组进行扩容，层层返回至add()方法中，此时可以看到ArrayList内部的数组容量已经变为10，并且新增了一个元素为1，size也随之+1。

![在这里插入图片描述](/Blog/images/csdn/java-136716855/09-49f592d1d6a439ef85cd52ce6876299f.png)

> 当添加第11个元素时，newCapacity()方法的判断为newCapacity - minCapacity不是小于等于0，即10的1.5倍为15>最小需求容量11，所以会直接返回15，ArrayList的容量扩容为1.5倍。

![在这里插入图片描述](/Blog/images/csdn/java-136716855/10-449a41806810919b6c97d4fa54ffb274.png)

> 使用**有参构造进行初始化**时，不会进入数组是否是初始状态的判断，直接进行**1.5**倍的扩容。

#### 1.2 LinkedList

> LinkedList是双向链表结构的集合，在其内部拥有一个内部类Node用来存放元素，翻译成中文叫做“节点”。在节点中除了保存元素本身外，还会有一个next和prev，它们分别代表当前位置元素的下一个元素和上一个元素，多个节点按此方式连接像一条“链路”一样。

以下运行结果可知：

> LinkedList元素存放是有序的、可以重复、并且元素值可以为null

![添加元素](/Blog/images/csdn/java-136716855/11-06a792b2d74435b9207e1036db495fa4.png)

![内部类Node源码](/Blog/images/csdn/java-136716855/12-3b29004967392a287a7ab8df530e6a30.png)

> LinkedList集合还会保存当前的“first节点”和“last节点”，因为“first节点”的prev和“last节点”的next是没有的，在我们添加新元素的时候比较方便。

![链表节点结构](/Blog/images/csdn/java-136716855/13-0661812b43b5ba832e9d86f051ef5a46.png)

> 当我们add元素到集合尾部时，会先保存当前的last节点为l，创建一个Node，它的prev是当前集合的last节点，然后我们新添加的这个元素会成为集合的last节点。此时再判断刚开始赋值的l是否为null，如果是，则表明当前链表是空的，我们添加的这个元素节点就是first节点，否则他就是l节点的next节点。

![在这里插入图片描述](/Blog/images/csdn/java-136716855/14-2c0e45829018bed7111bb48e04d70dad.png)

#### 1.3 Vector

> Vector在Java1.0中出现，它和ArrayList很像，但是Vector的方法被synchronized关键字修饰，这说明它是**线程安全**的。

![在这里插入图片描述](/Blog/images/csdn/java-136716855/15-7fd16238a6ae4af5044528d5e0a75bea.png)

扩容机制：

> 在扩容方面和ArrayList基本一致，只是扩容的容量是**2**倍。

![Vector无参构造](/Blog/images/csdn/java-136716855/16-a307f74e3c1fb8b5ebcfd5bdd256b9bf.png)

![计算扩容容量](/Blog/images/csdn/java-136716855/17-f5f50535f161db2877140cdb80560097.png)

### 2、Set

#### 2.1 HashSet

> 运行结果可知，HashSet是无序的（插入和取出顺序不一致），不允许有重复值，只能有一个null值。

![运行](/Blog/images/csdn/java-136716855/18-5b63975e6e210c7b01027262f88d130b.png)

> HashSet的底层结构其实是HashMap。

![HashSet底层](/Blog/images/csdn/java-136716855/19-a16d99d29ef8b01fd49e09cb55c05861.png)

> 但HashMap是双列的键值对形式，而HashSet是单列的，因此我们在使用HashMap的时候是使用了Key的部分，Value的部分HashSet使用空的对象PRESENT来填充。

![在这里插入图片描述](/Blog/images/csdn/java-136716855/20-40dcc3b51e11af2510230ceeec379f0a.png)

> 当我们调用HashSet的add()方法的时候，其实是把要添加的元素作为Key，PRESENT座位Value，调用HashMap的put()方法来进行添加的。
> ![add](/Blog/images/csdn/java-136716855/21-01c1af1af2a4689d1c2bc0a417490fd8.png)

**所以这里来看一下HashMap的源码。**

##### 2.1.1 HashMap

![在这里插入图片描述](/Blog/images/csdn/java-136716855/22-6511df77b73ff1d4ec3379085d3d5a45.png)

**结构**

> HashMap的内部结构是哈希表 数组+链表。底层维护了一个Node类型的table数组，内部类Node的next连接下一个元素，形成单向链表。

**扩容机制**

> 当我们创建HashSet的时候，它的内部会创建一个HashMap，首次进行add操作时，会将map的容量初始化为16，扩容阈值为当前容量16乘以扩容银子0.75=12。
> 添加元素时，先计算hash值来确定当前元素在table数组中的位置，如果当前位置已经有元素了，则使用equals方法来判断待添加的元素和当前位置已有的元素是否相同，如果相同则不能添加，不相同就继续往后比较，知道比较的节点next为null说明到了链表尾部，前面所有元素都不同，放到尾部即可。
> **存放元素时判断是否相等的条件：1必须保证相同的hashCode才能放入同一节点。 2必须equals相等才能确定是同一个元素。**

![HashMap添加元素](/Blog/images/csdn/java-136716855/23-4e20f9e614598fd7573519ee5775bd90.png)

**关于扩容**

> 当HashMap的容量到达扩容因子的值时，会进行2倍的扩容。这是为了防止多线程添加数据到HashMap中时产生碰撞。

![扩容](/Blog/images/csdn/java-136716855/24-cb93dd65b213949e9558ed75667e38a5.png)

> 上述HashMap的底层实现就是HashSet的实现，不同的是HashSet在调用map的put()方法新增元素时的Value位置都用空数组做了填充。

#### 2.2 LinkedHashSet

> LinkedHashSet继承了HashSet类，它的底层其实是LinkedHashMap。

![在这里插入图片描述](/Blog/images/csdn/java-136716855/25-511dca317b5cf20ac876a7eafb3a5489.png)

> 从运行结果可知，LinkedHashSet是有序的，允许有一个null值，不可重复。

![添加元素](/Blog/images/csdn/java-136716855/26-d539b12b175b0cacddecb652ab84f737.png)

> LinkedHashSet的结构是Node[] table数组加双向链表的形式。新增元素时，其存放的其实是LinkedHashMap的内部类Entry，它继承自HashMap的内部类Node，在其基础上增加了before和after两项内容，用来记录新增元素时的前一个和后一个数据。

![新增元素时](/Blog/images/csdn/java-136716855/27-e829e1cb5fcbb220fa20014687578b76.png)

![Entry](/Blog/images/csdn/java-136716855/28-8d243a2f3c144cc8b44c4f8bf9bf0130.png)

> 当我们新增元素时，底层会调用LinNodeLast方法将元素放在双向链表的末尾。但**请注意，元素仍然是按hash值确定在table中的位置的，用双向链表的方式记录元素添加的顺序**。

![在这里插入图片描述](/Blog/images/csdn/java-136716855/29-f608aef323912907e3769119c07e9a9f.png)

#### 2.3 TreeSet

> TreeSet是可以**排序**的Set集合。它允许在构造时传入一个匿名内部类Comparator—**比较器**，重写该类的compare方法后，再添加元素时会使用给定的条件对元素进行比较，最终确定它在集合中存放的位置。

![在这里插入图片描述](/Blog/images/csdn/java-136716855/30-3afe89b653a130e0cbe47a9e073c53e0.png)

> 例如我们以字符串的长度为条件进行比较，在添加元素时会按长度进行排序。有相同长度的数据则不会被添加进去。

![以长度为条件的比较器](/Blog/images/csdn/java-136716855/31-a909235ce31eda848325a5d325054017.png)

> 在**TreeSet的内部其实维护的是一个TreeMap**。当我们构造TreeSet时实际是创建了一个带有比较器的TreeMap。添加元素时Value值的部分也是用一个空对象PRESENT进行填充。在添加元素时，会调用构造时添加的比较器进行元素之间的比较，根据结果确定元素的位置，如果**比较结果相同则不会进行添加**。**值得注意的是，如果我们没有传入比较器，TreeSet会使用元素父类自带的比较器（例如String类型的compareTo方法），如果找不到则会抛出类型转换异常。**

![TreeSet构造](/Blog/images/csdn/java-136716855/32-40a69cc0b6d12abc9f6bcf8fb3fd56c5.png)

![TreeMap内部实现](/Blog/images/csdn/java-136716855/33-bc3eb7b56dd30ab193d4756834c72bd1.png)

![类型检查](/Blog/images/csdn/java-136716855/34-2261cdb1d73c9f972f94c6f74c3ce1a3.png)
