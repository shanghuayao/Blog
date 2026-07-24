export const siteConfig = {
  name: "shanghuayao",
  brand: "shanghuayao的独立博客",
  role: "Java 开发工程师",
  identity: "Java Developer · Agent Learner · Vibe Coding",
  description:
    "shanghuayao的个人博客，记录 Java 开发、Agent 学习、项目实践和 vibe coding 时代的技术探索。",
  defaultTitle: "shanghuayao的个人博客",
  startDate: "2026-07-24",
  footerTagline: "Java Developer · Agent Learner · Built with Astro",
  home: {
    intro:
      "我是一名 Java 开发工程师，目前正往 Agent 方向学习，也在逐渐适应 vibe coding 时代的技术节奏。这个网站用来记录我的工程实践、学习笔记、项目复盘，以及和 AI 协作写代码时慢慢形成的方法。",
    featuredProjectsDescription: "整理项目实践、工程方案和正在推进的技术实验。",
    latestPostsDescription: "记录 Java、Agent、AI 编程和日常技术观察。",
  },
  attitudes: [
    {
      title: "工程先稳",
      body: "代码要能跑，也要能维护。比起追新，我更关心边界清晰、问题可定位、系统能长期演进。",
    },
    {
      title: "拥抱协作",
      body: "AI 不是替代思考的捷径，而是放大表达、验证和迭代速度的协作伙伴。",
    },
    {
      title: "持续生长",
      body: "Agent 和 vibe coding 还在快速变化，我希望用项目和记录把新能力沉淀成自己的工作流。",
    },
  ],
  about: {
    description:
      "shanghuayao的个人介绍：Java 开发工程师，正在学习 Agent 技术，探索 vibe coding 时代的开发方式。",
    intro:
      "我是shanghuayao，一名 Java 开发工程师。目前正在往 Agent 方向学习，逐渐适应 vibe coding 时代的技术变化。我希望把长期积累的后端工程经验，和 AI 辅助开发、自动化协作、智能体工作流结合起来，提升解决复杂问题的效率。",
    cards: [
      {
        title: "当前方向",
        body: "以 Java 后端开发为基础，持续学习 Agent、AI 工具链、自动化工作流和 AI 辅助编程实践。",
      },
      {
        title: "技术态度",
        body: "保持工程稳定性，也拥抱新的开发范式。用更快的反馈、更清晰的上下文和更好的工具协作，把想法落成可运行的项目。",
      },
      {
        title: "博客内容",
        body: "这里会记录 Java 开发经验、Agent 学习笔记、项目复盘、AI 编程体验，以及一些关于效率工具和技术趋势的观察。",
      },
      {
        title: "联系方式",
        body: "后续可以在这里补充 GitHub、邮箱、社交账号或项目链接，让别人更方便地了解你和你的作品。",
      },
    ],
  },
  rss: {
    titleSuffix: "博客",
    description: "文章、项目复盘和长期记录。",
  },
} as const;
