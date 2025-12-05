// MoodEngine.ts
// Simple, TypeScript-safe mood analyzer (no external deps)

export interface MoodResult {
  src: string;
  color: { r: number; g: number; b: number };
  mood: "Happy" | "Calm" | "Nostalgic";
  score: number; // -1..1
}

export interface AnalyzeOutput {
  results: MoodResult[];
  overallMood: "Happy" | "Calm" | "Nostalgic";
}

/**
 * analyzeMood(images)
 * images: string[] (blob URLs, data URLs, or same-origin image URLs)
 */
export async function analyzeMood(images: string[]): Promise<AnalyzeOutput> {
  const results: MoodResult[] = [];

  for (const src of images) {
    try {
      const color = await getDominantColor(src);
      const moodScore = (color.r - color.b) / 255 + (color.g - color.r) / 255;
      const score = Math.max(-1, Math.min(1, moodScore));

      let mood: AnalyzeOutput["overallMood"] = "Calm";
      if (score > 0.4) mood = "Happy";
      else if (score < -0.2) mood = "Nostalgic";

      results.push({
        src,
        color,
        mood,
        score: Number(score.toFixed(2)),
      });
    } catch (err) {
      // Skip any images that fail to load/paint (CORS or broken URL)
      // Still return results for the others.
      console.warn("MoodEngine: skipping image", src, err);
    }
  }

  const overall = computeOverall(results.map((r) => r.score));
  return { results, overallMood: overall };
}

function computeOverall(scores: number[]): AnalyzeOutput["overallMood"] {
  if (scores.length === 0) return "Calm";
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (avg > 0.4) return "Happy";
  if (avg < -0.2) return "Nostalgic";
  return "Calm";
}

function getDominantColor(src: string): Promise<{ r: number; g: number; b: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const W = 50;
        const H = 50;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, W, H);
        const data = ctx.getImageData(0, 0, W, H).data;
        let r = 0,
          g = 0,
          b = 0,
          count = 0;
        // sample pixels (skip many for speed)
        for (let i = 0; i < data.length; i += 4 * 8) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        if (!count) return resolve({ r: 128, g: 128, b: 128 });
        resolve({ r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(new Error("Failed to load image: " + src));
    img.src = src;
  });
}
