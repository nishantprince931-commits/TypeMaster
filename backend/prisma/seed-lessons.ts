import { prisma } from "../src/config/prisma";

const lessons = [
  {
    order: 1,
    title: "Home Row",
    subtitle: "ASDF JKL;",
    description: "Learn the foundation of touch typing.",
    content:
      "Place your fingers on the home row and practice ASDF JKL; with correct finger placement.",
    difficulty: "Beginner",
    locked: false,
  },
  {
    order: 2,
    title: "Upper Row",
    subtitle: "QWERTYUIOP",
    description: "Practice the top row of your keyboard.",
    content:
      "Practice reaching the upper row while keeping your fingers anchored on the home row.",
    difficulty: "Beginner",
    locked: false,
  },
  {
    order: 3,
    title: "Lower Row",
    subtitle: "ZXCVBNM",
    description: "Master the lower row keys.",
    content:
      "Practice the lower row keys using the correct fingers and controlled movements.",
    difficulty: "Beginner",
    locked: false,
  },
  {
    order: 4,
    title: "Numbers",
    subtitle: "1234567890",
    description: "Improve your number typing speed.",
    content:
      "Practice typing numbers accurately without looking down at the keyboard.",
    difficulty: "Intermediate",
    locked: false,
  },
  {
    order: 5,
    title: "Symbols",
    subtitle: "! @ # $ % &",
    description: "Practice common keyboard symbols.",
    content:
      "Practice common punctuation and symbols using Shift and the correct finger.",
    difficulty: "Intermediate",
    locked: false,
  },
  {
    order: 6,
    title: "Capital Letters",
    subtitle: "SHIFT + Letters",
    description: "Learn to type capital letters naturally.",
    content:
      "Practice capitalization with alternating hands and smooth Shift usage.",
    difficulty: "Intermediate",
    locked: false,
  },
  {
    order: 7,
    title: "Words",
    subtitle: "Common Words",
    description: "Build speed using everyday words.",
    content:
      "Practice common words to improve rhythm, speed, and accuracy.",
    difficulty: "Intermediate",
    locked: false,
  },
  {
    order: 8,
    title: "Sentences",
    subtitle: "Full Sentences",
    description: "Practice complete sentences with accuracy.",
    content:
      "Practice full sentences with punctuation, capitalization, and consistent spacing.",
    difficulty: "Advanced",
    locked: false,
  },
  {
    order: 9,
    title: "Paragraphs",
    subtitle: "Long Text",
    description: "Train your typing endurance with paragraphs.",
    content:
      "Practice longer passages to build endurance while maintaining accuracy.",
    difficulty: "Advanced",
    locked: false,
  },
  {
    order: 10,
    title: "Advanced Speed Training",
    subtitle: "Speed Challenge",
    description: "Push your typing speed to the next level.",
    content:
      "Use speed drills and timed passages to push toward advanced WPM targets.",
    difficulty: "Expert",
    locked: true,
  },
];

async function main() {
  for (const lesson of lessons) {
    const existing = await prisma.lesson.findFirst({
      where: {
        order: lesson.order,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      await prisma.lesson.update({
        where: {
          id: existing.id,
        },
        data: {
          title: lesson.title,
          subtitle: lesson.subtitle,
          description: lesson.description,
          content: lesson.content,
          difficulty: lesson.difficulty,
          locked: lesson.locked,
        },
      });
    } else {
      await prisma.lesson.create({
        data: lesson,
      });
    }
  }

  console.log(`Seeded ${lessons.length} lessons.`);
}

main()
  .catch((error) => {
    console.error("Lesson seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });