---
title: "logback 根据不同参数创建logger并将内容输出到不同文件"
description: "【代码】logback 根据不同参数创建logger并将内容输出到不同文件。_logback输出到不同文件"
pubDate: 2023-05-31
tags: ["logback", "java", "开发语言", "log4j"]
source: "https://blog.csdn.net/shanghuayao/article/details/130973524"
---
```java
private IotLoggerFactory() {}
	private static LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
	private static PatternLayoutEncoder encoder = new PatternLayoutEncoder();

	static {
		encoder.setPattern("%d{HH:mm:ss} [%5.20logger{39}] : %m%n");
		encoder.setCharset(StandardCharsets.UTF_8);
		encoder.setContext(loggerContext);
		encoder.setOutputPatternAsHeader(false);
		encoder.start();
	}

	public static Logger getLogger(String moduleName) {
		//控制台输出
		ConsoleAppender<ILoggingEvent> consoleAppender = new ConsoleAppender<>();
		if(!consoleAppender.isStarted()) {
			consoleAppender.setContext(loggerContext);
			consoleAppender.setName(moduleName+"_console");
			consoleAppender.setEncoder(encoder);
			consoleAppender.start();
		}
		//文件输出
		ResourceBundle rb = ResourceBundle.getBundle("log4iot");
		String logPath = "/logs";
		RollingFileAppender<ILoggingEvent> rollingFileAppender =  new RollingFileAppender<>();
		if(!rollingFileAppender.isStarted()) {
			rollingFileAppender.setContext(loggerContext);
			rollingFileAppender.setAppend(true);
			rollingFileAppender.setName(moduleName+"_rollingFile");
			rollingFileAppender.setFile(logPath + moduleName +"_" + new SimpleDateFormat("yyyy-MM-dd").format(new Date()));

			TimeBasedRollingPolicy<ILoggingEvent> rollingPolicy = new TimeBasedRollingPolicy<>();
			rollingPolicy.setFileNamePattern(logPath + moduleName + "_%d{yyyy-MM-dd}.log");
			rollingPolicy.setCleanHistoryOnStart(true);
			rollingPolicy.setMaxHistory(7);
			rollingPolicy.setContext(loggerContext);
			rollingPolicy.setTotalSizeCap(FileSize.valueOf("10gb"));
			rollingPolicy.setParent(rollingFileAppender);
			rollingPolicy.start();
			rollingFileAppender.setRollingPolicy(rollingPolicy);

			SizeBasedTriggeringPolicy triggeringPolicy= new SizeBasedTriggeringPolicy<>();
			triggeringPolicy.setMaxFileSize(FileSize.valueOf("1mb"));
			triggeringPolicy.start();
			rollingFileAppender.setTriggeringPolicy(triggeringPolicy);

			rollingFileAppender.setEncoder(encoder);
			rollingFileAppender.start();
		}
		Logger rootLogger = loggerContext.getLogger(moduleName);
		rootLogger.detachAndStopAllAppenders();
		rootLogger.addAppender(consoleAppender);
		rootLogger.addAppender(rollingFileAppender);
		rootLogger.setLevel(Level.INFO);
//		作用在于 children-logger是否使用 rootLogger配置的appender进行输出。
//		false：表示只用当前logger的appender-ref。
//		true：表示当前logger的appender-ref和rootLogger的appender-ref都有效。
		rootLogger.setAdditive(false);
		return rootLogger;
	}
```

```

```
