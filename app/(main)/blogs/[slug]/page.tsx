"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  useEffect(() => {
    void Promise.all([apiFetch<Blog>(`/api/blogs/${params.slug}`), apiFetch<Blog[]>("/api/blogs")])
      .then(([blogData, allBlogs]) => {
        setBlog(blogData);
        setRelated(allBlogs.filter((entry) => entry.slug !== blogData.slug).slice(0, 3));
      })
      .catch((e) => setError((e as Error).message));
  }, [params.slug]);

  const toc = useMemo(() => blog?.sections.map((section) => ({ id: section.id, heading: section.heading })) || [], [blog]);

  if (!blog) {
    return <Card>{error || "Loading..."}</Card>;
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
              <a href={`#${entry.id}`} className="text-sm underline">
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
              <Link key={entry._id} href={`/blogs/${entry.slug}`} className="rounded-lg border px-3 py-2 text-sm">
                {entry.emoji} {entry.title}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/blogs/manage" className="mt-3 inline-block text-sm font-semibold underline">
          Edit This Guide
        </Link>
      </Card>
    </div>
  );
}

