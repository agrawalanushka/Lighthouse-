import { callClaude } from "./index";
import { getEmbedding } from "./embeddings";
import { personalizedNewsRewritingPrompt } from "./prompts";
import { UserProfile, NewsItem } from "@/lib/types";

// Example test: one news item + one user profile → one personalized summary
export async function testPersonalizedNews() {
  const mockUser: UserProfile = {
    id: "user-1",
    email: "student@nus.edu.sg",
    fullName: "Alice Tan",
    university: "NUS",
    yearOfStudy: 3,
    major: "Computer Science",
    skills: ["TypeScript", "React", "Next.js", "Python"],
    targetRoles: ["Full Stack Engineer", "ML Engineer"],
    interests: ["web", "ml"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockNews: NewsItem = {
    id: "news-1",
    title: "PyTorch 2.5 Released with Performance Improvements",
    summary:
      "PyTorch 2.5 brings major performance optimizations for deep learning models, including improved CUDA support and distributed training enhancements.",
    url: "https://pytorch.org/blog/pytorch-2.5",
    source: "pytorch.org",
    publishedAt: new Date().toISOString(),
    relevantSkills: ["Python", "Deep Learning", "CUDA"],
  };

  try {
    console.log("\n=== Testing Claude Personalization ===\n");

    // Step 1: Generate personalized news using Claude
    const prompt = personalizedNewsRewritingPrompt(mockNews, mockUser);
    const response = await callClaude({ prompt, maxTokens: 500 });

    console.log("Claude Response:");
    console.log(response);
    console.log("\n");

    // Step 2: Test embeddings
    const newsEmbedding = await getEmbedding(mockNews.title);
    console.log(
      `Generated embedding for news (${newsEmbedding.length} dimensions)`
    );
    console.log(`First 5 values: ${newsEmbedding.slice(0, 5).join(", ")}\n`);

    const userSkillsText = mockUser.skills.join(", ");
    const skillsEmbedding = await getEmbedding(userSkillsText);
    console.log(`Generated embedding for user skills`);

    // Compute similarity
    const similarity = computeCosineSimilarity(newsEmbedding, skillsEmbedding);
    console.log(`Cosine similarity between news and user skills: ${similarity.toFixed(3)}\n`);

    console.log("✅ Test passed! Claude and embedding APIs are working.\n");

    return { response, newsEmbedding, skillsEmbedding, similarity };
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

function computeCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}
