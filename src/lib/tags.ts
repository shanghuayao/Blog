import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export interface PostTagInput {
  title: string;
  tags: string[];
}

export interface TaxonomyTag {
  parentName: string;
  parentSlug: string;
  childName?: string;
  childSlug?: string;
  count?: number;
}

export interface ParentTagSummary {
  name: string;
  slug: string;
  count: number;
  children: TaxonomyTag[];
}

interface TaxonomyChild {
  name: string;
  slug: string;
  aliases?: string[];
  titlePatterns?: RegExp[];
}

interface TaxonomyParent {
  name: string;
  slug: string;
  aliases?: string[];
  fallbackChild?: TaxonomyChild;
  children: TaxonomyChild[];
}

const taxonomy: TaxonomyParent[] = [
  {
    name: "Java",
    slug: "java",
    aliases: ["java", "jdk", "jvm", "\u5f00\u53d1\u8bed\u8a00", "\u7f16\u7a0b\u8bed\u8a00"],
    fallbackChild: { name: "\u57fa\u7840", slug: "basics" },
    children: [
      {
        name: "\u96c6\u5408\u6846\u67b6",
        slug: "collections",
        titlePatterns: [/collection/i, /\u96c6\u5408/],
      },
      {
        name: "\u5e76\u53d1\u7f16\u7a0b",
        slug: "concurrency",
        aliases: ["\u591a\u7ebf\u7a0b", "\u5e76\u53d1\u7f16\u7a0b"],
        titlePatterns: [/synchronized/i, /\u9501/],
      },
      {
        name: "\u8bbe\u8ba1\u6a21\u5f0f",
        slug: "design-patterns",
        aliases: ["\u8bbe\u8ba1\u6a21\u5f0f", "\u7b56\u7565\u6a21\u5f0f", "\u8d23\u4efb\u94fe\u6a21\u5f0f"],
      },
      {
        name: "\u65e5\u5fd7",
        slug: "logging",
        aliases: ["logback", "log4j"],
        titlePatterns: [/logger/i, /logback/i, /log4j/i, /\u65e5\u5fd7/],
      },
      {
        name: "JVM / JDK",
        slug: "jvm-jdk",
        aliases: ["jdk", "jvm"],
      },
      {
        name: "\u5f00\u53d1\u5de5\u5177",
        slug: "tools",
        aliases: ["ide", "intellij-idea"],
        titlePatterns: [/cursor/i, /idea/i],
      },
    ],
  },
  {
    name: "\u540e\u7aef\u5de5\u7a0b",
    slug: "backend",
    aliases: ["spring", "tomcat", "\u7f51\u7edc\u63a5\u53e3", "\u5b89\u5168"],
    children: [
      {
        name: "\u63a5\u53e3\u5b89\u5168",
        slug: "api-security",
        aliases: ["\u7f51\u7edc\u63a5\u53e3", "\u5b89\u5168"],
      },
      {
        name: "Spring / Tomcat",
        slug: "spring-tomcat",
        aliases: ["spring", "tomcat"],
        titlePatterns: [/tomcat/i, /spring/i],
      },
    ],
  },
  {
    name: "\u6570\u636e\u5e93",
    slug: "database",
    aliases: ["mysql", "\u6570\u636e\u5e93"],
    children: [
      {
        name: "MySQL",
        slug: "mysql",
        aliases: ["mysql", "\u6570\u636e\u5e93"],
      },
    ],
  },
  {
    name: "\u8fd0\u7ef4",
    slug: "ops",
    aliases: ["linux", "centos", "yum", "docker"],
    children: [
      {
        name: "Linux",
        slug: "linux",
        aliases: ["linux", "centos", "yum"],
      },
      {
        name: "Docker",
        slug: "docker",
        aliases: ["docker"],
      },
    ],
  },
  {
    name: "\u5de5\u7a0b\u5b9e\u8df5",
    slug: "practice",
    aliases: ["astro", "\u535a\u5ba2", "\u5efa\u7ad9", "\u9879\u76ee", "\u65b9\u6cd5"],
    children: [
      {
        name: "\u5efa\u7ad9",
        slug: "site-building",
        aliases: ["astro", "\u535a\u5ba2", "\u5efa\u7ad9"],
      },
      {
        name: "\u9879\u76ee\u65b9\u6cd5",
        slug: "project-methods",
        aliases: ["\u9879\u76ee", "\u65b9\u6cd5"],
      },
    ],
  },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function matchesAliases(sourceTags: Set<string>, aliases: string[] = []) {
  return aliases.some((alias) => sourceTags.has(normalize(alias)));
}

function matchesTitle(title: string, patterns: RegExp[] = []) {
  return patterns.some((pattern) => pattern.test(title));
}

function keyOf(tag: TaxonomyTag) {
  return `${tag.parentSlug}/${tag.childSlug ?? ""}`;
}

export function taxonomyHref(tag: TaxonomyTag, base = import.meta.env.BASE_URL) {
  const parent = encodeURIComponent(tag.parentSlug);
  const child = tag.childSlug ? `${encodeURIComponent(tag.childSlug)}/` : "";
  return `${base}tags/${parent}/${child}`;
}

export function taxonomyLabel(tag: TaxonomyTag) {
  return tag.childName ? `${tag.parentName} / ${tag.childName}` : tag.parentName;
}

export function getTaxonomyTags(input: PostTagInput) {
  const rawTags = new Set(input.tags.map(normalize));
  const result = new Map<string, TaxonomyTag>();

  for (const parent of taxonomy) {
    const matchedChildren = parent.children.filter(
      (child) => matchesAliases(rawTags, child.aliases) || matchesTitle(input.title, child.titlePatterns),
    );

    if (matchedChildren.length > 0) {
      for (const child of matchedChildren) {
        const tag = {
          parentName: parent.name,
          parentSlug: parent.slug,
          childName: child.name,
          childSlug: child.slug,
        };
        result.set(keyOf(tag), tag);
      }
      continue;
    }

    if (matchesAliases(rawTags, parent.aliases)) {
      const fallback = parent.fallbackChild;
      const tag = fallback
        ? {
            parentName: parent.name,
            parentSlug: parent.slug,
            childName: fallback.name,
            childSlug: fallback.slug,
          }
        : {
            parentName: parent.name,
            parentSlug: parent.slug,
          };
      result.set(keyOf(tag), tag);
    }
  }

  return [...result.values()].slice(0, 3);
}

export function getTagSummaries(posts: BlogPost[]) {
  const parents = new Map<string, ParentTagSummary>();

  for (const post of posts) {
    const postTags = getTaxonomyTags({ title: post.data.title, tags: post.data.tags });
    const seenParents = new Set<string>();

    for (const tag of postTags) {
      const parent = parents.get(tag.parentSlug) ?? {
        name: tag.parentName,
        slug: tag.parentSlug,
        count: 0,
        children: [],
      };

      if (!seenParents.has(tag.parentSlug)) {
        parent.count += 1;
        seenParents.add(tag.parentSlug);
      }

      if (tag.childSlug) {
        const child = parent.children.find((item) => item.childSlug === tag.childSlug);
        if (child) {
          child.count = (child.count ?? 0) + 1;
        } else {
          parent.children.push({ ...tag, count: 1 });
        }
      }

      parents.set(parent.slug, parent);
    }
  }

  return [...parents.values()]
    .map((parent) => ({
      ...parent,
      children: parent.children.sort((a, b) => (b.count ?? 0) - (a.count ?? 0) || taxonomyLabel(a).localeCompare(taxonomyLabel(b))),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function filterPostsByTaxonomy(posts: BlogPost[], parentSlug: string, childSlug?: string) {
  return posts.filter((post) =>
    getTaxonomyTags({ title: post.data.title, tags: post.data.tags }).some(
      (tag) => tag.parentSlug === parentSlug && (!childSlug || tag.childSlug === childSlug),
    ),
  );
}