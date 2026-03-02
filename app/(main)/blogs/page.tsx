"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/client";

type Blog = {
  _id: string;
  slug: string;
  title: string;
  emoji: string;
  estimatedRecovery: string;
  isPublished: boolean;
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<Blog[]>("/api/blogs")
      .then(setBlogs)
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Illness Guides</h1>
          <p className="text-sm text-zinc-600">Your personal reference when you&apos;re sick</p>
        </div>
        <Link href="/blogs/manage">
          <Button>Add New Guide</Button>
        </Link>
      </div>

      {error ? <Card className="text-[var(--color-danger)]">{error}</Card> : null}

      <div className="grid gap-3 md:grid-cols-3">
        {blogs.map((blog) => (
          <Link key={blog._id} href={`/blogs/${blog.slug}`}>
            <Card className="h-full hover:border-[var(--color-secondary)]">
              <p className="text-2xl">{blog.emoji}</p>
              <p className="font-semibold">{blog.title}</p>
              <p className="text-sm text-zinc-600">Estimated recovery: {blog.estimatedRecovery || "N/A"}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

