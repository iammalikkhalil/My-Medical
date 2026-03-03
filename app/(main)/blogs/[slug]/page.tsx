"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/client";

type Blog = {
  _id: string;
  slug: string;
  title: string;
  emoji: string;
  estimatedRecovery: string;
  sections: Array<{ id: string; heading: string; content: string; isWarning: boolean }>;
};

export default function BlogDetailPage() {
  const params = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [related, setRelated] = useState<Blog[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setError("");

    void Promise.all([apiFetch<Blog>(`/api/blogs/${params.slug}`), apiFetch<Blog[]>("/api/blogs")])
      .then(([blogData, allBlogs]) => {
        setBlog(blogData);
        setRelated(allBlogs.filter((entry) => entry.slug !== blogData.slug).slice(0, 3));
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setIsLoading(false));
  }, [params.slug]);

  const toc = useMemo(() => blog?.sections.map((section) => ({ id: section.id, heading: section.heading })) || [], [blog]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <Skeleton className="mb-2 h-9 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
        <Card>
          <Skeleton className="mb-2 h-6 w-48" />
          <Skeleton className="mb-2 h-5 w-full" />
          <Skeleton className="mb-2 h-5 w-5/6" />
          <Skeleton className="h-5 w-2/3" />
        </Card>
        <Card>
          <Skeleton className="mb-2 h-8 w-56" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </Card>
      </div>
    );
  }

  if (!blog) {
    return <Card>{error || "Blog not found."}</Card>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-3xl font-bold">
          {blog.emoji} {blog.title}
        </h1>
        <p className="text-sm">Estimated recovery: {blog.estimatedRecovery || "N/A"}</p>
      </Card>

      <Card>
        <p className="mb-2 font-semibold">Table of Contents</p>
        <ul className="space-y-1">
          {toc.map((entry) => (
            <li key={entry.id}>
              <a href={`#${entry.id}`} className="text-sm underline transition hover:opacity-75">
                {entry.heading}
              </a>
            </li>
          ))}
        </ul>
      </Card>

      {blog.sections.map((section) => (
        <Card key={section.id} className={section.isWarning ? "border-[var(--color-danger)] bg-red-50" : ""}>
          <h2 id={section.id} className="text-xl font-semibold">
            {section.heading}
          </h2>
          <p className="whitespace-pre-wrap text-sm">{section.content}</p>
        </Card>
      ))}

      <Card>
        <Link href="/illness/start">
          <Button>I Have These Symptoms - Start Illness Log</Button>
        </Link>
        <div className="mt-3">
          <p className="font-semibold">Related Guides</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {related.map((entry) => (
              <Link key={entry._id} href={`/blogs/${entry.slug}`} className="rounded-lg border px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:shadow-sm">
                {entry.emoji} {entry.title}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/blogs/manage" className="mt-3 inline-block text-sm font-semibold underline transition hover:opacity-75">
          Edit This Guide
        </Link>
      </Card>
    </div>
  );
}
