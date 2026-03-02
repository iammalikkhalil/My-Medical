import { connectToDatabase } from "@/lib/mongodb";
import { slugify } from "@/lib/slug";
import { Blog, BlogSymptom, Category, Symptom } from "@/models";

const categories = [
  { name: "Pain & Fever", emoji: "??", description: "Pain and fever management", sortOrder: 1 },
  { name: "Stomach", emoji: "??", description: "Stomach issues", sortOrder: 2 },
  { name: "Allergy", emoji: "??", description: "Allergy relief", sortOrder: 3 },
  { name: "Supplement", emoji: "??", description: "Supplements", sortOrder: 4 },
  { name: "Mental Health", emoji: "??", description: "Mental health support", sortOrder: 5 },
  { name: "Other", emoji: "??", description: "Other medicines", sortOrder: 99 },
];

const symptoms = [
  { name: "Fever", emoji: "??", isCommon: true, sortOrder: 1 },
  { name: "Headache", emoji: "??", isCommon: true, sortOrder: 2 },
  { name: "Nausea", emoji: "??", isCommon: true, sortOrder: 3 },
  { name: "Cold & Flu", emoji: "??", isCommon: true, sortOrder: 4 },
  { name: "Body Pain", emoji: "??", isCommon: true, sortOrder: 5 },
  { name: "Allergy", emoji: "??", isCommon: true, sortOrder: 6 },
  { name: "Stomach Pain", emoji: "??", isCommon: true, sortOrder: 7 },
  { name: "Insomnia", emoji: "??", isCommon: true, sortOrder: 8 },
  { name: "Anxiety", emoji: "??", isCommon: true, sortOrder: 9 },
  { name: "Congestion", emoji: "??", isCommon: false, sortOrder: 10 },
  { name: "Runny Nose", emoji: "??", isCommon: false, sortOrder: 11 },
];

const blogSeeds = [
  {
    title: "What To Do When You Have Fever",
    emoji: "???",
    estimatedRecovery: "2-3 days",
    isPublished: true,
    sections: [
      {
        id: "first-steps",
        heading: "First Steps - Do This Immediately",
        content: "Rest, hydrate, and monitor temperature every 4-6 hours.",
        isWarning: false,
        sortOrder: 1,
      },
      {
        id: "warning-signs",
        heading: "Warning Signs",
        content: "If fever is very high or persists for multiple days, consult a doctor.",
        isWarning: true,
        sortOrder: 2,
      },
    ],
    symptomNames: ["Fever", "Body Pain", "Headache"],
  },
  {
    title: "Cold & Flu Recovery Guide",
    emoji: "??",
    estimatedRecovery: "3-5 days",
    isPublished: true,
    sections: [
      {
        id: "first-steps",
        heading: "First Steps",
        content: "Rest, warm fluids, and steam inhalation can help.",
        isWarning: false,
        sortOrder: 1,
      },
      {
        id: "see-doctor",
        heading: "When To See A Doctor",
        content: "Difficulty breathing or worsening symptoms need medical advice.",
        isWarning: true,
        sortOrder: 2,
      },
    ],
    symptomNames: ["Cold & Flu", "Congestion", "Runny Nose"],
  },
];

async function runSeed() {
  await connectToDatabase();

  for (const category of categories) {
    await Category.updateOne(
      { slug: slugify(category.name) },
      {
        name: category.name,
        slug: slugify(category.name),
        emoji: category.emoji,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      { upsert: true },
    );
  }

  for (const symptom of symptoms) {
    await Symptom.updateOne(
      { slug: slugify(symptom.name) },
      {
        name: symptom.name,
        slug: slugify(symptom.name),
        emoji: symptom.emoji,
        isCommon: symptom.isCommon,
        sortOrder: symptom.sortOrder,
        isActive: true,
      },
      { upsert: true },
    );
  }

  const symptomMap = new Map((await Symptom.find({ isActive: true })).map((symptom) => [symptom.name, symptom]));

  for (const blogSeed of blogSeeds) {
    await Blog.updateOne(
      { slug: slugify(blogSeed.title) },
      {
        slug: slugify(blogSeed.title),
        title: blogSeed.title,
        emoji: blogSeed.emoji,
        estimatedRecovery: blogSeed.estimatedRecovery,
        isPublished: blogSeed.isPublished,
        sections: blogSeed.sections,
      },
      { upsert: true },
    );

    const blog = await Blog.findOne({ slug: slugify(blogSeed.title) });
    if (!blog) continue;

    await BlogSymptom.deleteMany({ blogId: blog._id });

    const linkedSymptoms = blogSeed.symptomNames
      .map((name) => symptomMap.get(name))
      .filter((value): value is NonNullable<typeof value> => Boolean(value));

    if (linkedSymptoms.length) {
      await BlogSymptom.insertMany(
        linkedSymptoms.map((symptom, index) => ({
          blogId: blog._id,
          symptomId: symptom._id,
          isPrimary: index === 0,
        })),
      );
    }
  }

  console.log("Seed completed successfully.");
}

runSeed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

