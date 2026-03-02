"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/client";

type Blog = {
  _id: string;
  slug: string;
  title: string;
  emoji: string;
  estimatedRecovery: string;
  isPublished: boolean;
  sections: Array<{ id: string; heading: string; content: string; isWarning: boolean; sortOrder: number }>;
};

type Symptom = { _id: string; name: string; emoji: string };

export default function BlogsManagePage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<string>("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    emoji: "??",
    estimatedRecovery: "",
    isPublished: false,
    sections: [{ id: "first-steps", heading: "First Steps", content: "", isWarning: false, sortOrder: 1 }],
    symptomIds: [] as string[],
    relatedBlogIds: [] as string[],
  });

  async function load() {
    try {
      const [blogData, symptomData] = await Promise.all([
        apiFetch<Blog[]>("/api/blogs?all=true"),
        apiFetch<Symptom[]>("/api/symptoms"),
      ]);
      setBlogs(blogData);
      setSymptoms(symptomData);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const selectedBlog = useMemo(() => blogs.find((blog) => blog._id === selectedBlogId), [blogs, selectedBlogId]);

  function openForEdit(blog: Blog) {
    setSelectedBlogId(blog._id);
    setForm({
      title: blog.title,
      slug: blog.slug,
      emoji: blog.emoji || "??",
      estimatedRecovery: blog.estimatedRecovery,
      isPublished: blog.isPublished,
      sections: blog.sections.length
        ? blog.sections
        : [{ id: "first-steps", heading: "First Steps", content: "", isWarning: false, sortOrder: 1 }],
      symptomIds: [],
      relatedBlogIds: [],
    });
  }

  function addSection() {
    setForm((current) => ({
      ...current,
      sections: [
        ...current.sections,
        {
          id: `section-${current.sections.length + 1}`,
          heading: "New Section",
          content: "",
          isWarning: false,
          sortOrder: current.sections.length + 1,
        },
      ],
    }));
  }

  function updateSection(index: number, key: keyof Blog["sections"][number], value: string | number | boolean) {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section, idx) => (idx === index ? { ...section, [key]: value } : section)),
    }));
  }

  function toggleSymptom(id: string) {
    setForm((current) => ({
      ...current,
      symptomIds: current.symptomIds.includes(id)
        ? current.symptomIds.filter((item) => item !== id)
        : [...current.symptomIds, id],
    }));
  }

  async function createNew() {
    setSelectedBlogId("");
    setForm({
      title: "",
      slug: "",
      emoji: "??",
      estimatedRecovery: "",
      isPublished: false,
      sections: [{ id: "first-steps", heading: "First Steps", content: "", isWarning: false, sortOrder: 1 }],
      symptomIds: [],
      relatedBlogIds: [],
    });
  }

  async function saveBlog(publishNow: boolean) {
    try {
      if (selectedBlog) {
        await apiFetch(`/api/blogs/${selectedBlog.slug}`, {
          method: "PUT",
          body: JSON.stringify({ ...form, isPublished: publishNow || form.isPublished }),
        });
      } else {
        await apiFetch("/api/blogs", {
          method: "POST",
          body: JSON.stringify({ ...form, isPublished: publishNow || form.isPublished }),
        });
      }

      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function unpublish(slug: string) {
    try {
      await apiFetch(`/api/blogs/${slug}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <div className="space-y-4">
        <Card>
          <h1 className="mb-2 text-2xl font-bold">Manage Illness Guides</h1>
          <Button onClick={createNew}>Create New Guide</Button>
        </Card>

        {error ? <Card className="text-[var(--color-danger)]">{error}</Card> : null}

        <Card>
          <h2 className="mb-2 text-lg font-semibold">Published</h2>
          <ul className="space-y-2">
            {blogs
              .filter((blog) => blog.isPublished)
              .map((blog) => (
                <li key={blog._id} className="rounded-lg border p-3 text-sm">
                  <p className="font-semibold">
                    {blog.emoji} {blog.title}
                  </p>
                  <div className="mt-1 flex gap-2">
                    <Button variant="ghost" onClick={() => openForEdit(blog)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => unpublish(blog.slug)}>
                      Unpublish
                    </Button>
                  </div>
                </li>
              ))}
          </ul>

          <h2 className="mb-2 mt-4 text-lg font-semibold">Drafts</h2>
          <ul className="space-y-2">
            {blogs
              .filter((blog) => !blog.isPublished)
              .map((blog) => (
                <li key={blog._id} className="rounded-lg border p-3 text-sm">
                  <p className="font-semibold">
                    {blog.emoji} {blog.title}
                  </p>
                  <div className="mt-1 flex gap-2">
                    <Button variant="ghost" onClick={() => openForEdit(blog)}>
                      Edit
                    </Button>
                  </div>
                </li>
              ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="mb-2 text-xl font-semibold">{selectedBlog ? `Edit Guide: ${selectedBlog.title}` : "Create Guide"}</h2>

        <div className="grid gap-3 md:grid-cols-2">
          <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" />
          <Input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} placeholder="Slug" />
          <Input value={form.emoji} onChange={(e) => setForm((prev) => ({ ...prev, emoji: e.target.value }))} placeholder="Emoji" />
          <Input
            value={form.estimatedRecovery}
            onChange={(e) => setForm((prev) => ({ ...prev, estimatedRecovery: e.target.value }))}
            placeholder="Estimated recovery"
          />
        </div>

        <div className="mt-4">
          <p className="mb-2 font-semibold">Linked Symptoms</p>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom) => {
              const selected = form.symptomIds.includes(symptom._id);
              return (
                <button
                  key={symptom._id}
                  type="button"
                  onClick={() => toggleSymptom(symptom._id)}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    selected ? "border-transparent bg-[var(--color-primary)]" : "border-[var(--color-border)]"
                  }`}
                >
                  {symptom.emoji} {symptom.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <p className="font-semibold">Sections</p>
          {form.sections.map((section, index) => (
            <div key={section.id} className="rounded-xl border p-3">
              <Input
                value={section.heading}
                onChange={(e) => updateSection(index, "heading", e.target.value)}
                placeholder="Heading"
              />
              <textarea
                value={section.content}
                onChange={(e) => updateSection(index, "content", e.target.value)}
                className="mt-2 min-h-24 w-full rounded-xl border border-[var(--color-border)] p-3 text-sm"
                placeholder="Content"
              />
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={section.isWarning}
                  onChange={(e) => updateSection(index, "isWarning", e.target.checked)}
                />
                Warning style
              </label>
            </div>
          ))}

          <Button variant="ghost" onClick={addSection}>
            Add Section
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => saveBlog(false)}>Save Draft</Button>
          <Button variant="secondary" onClick={() => saveBlog(true)}>
            Save and Publish
          </Button>
        </div>
      </Card>
    </div>
  );
}

