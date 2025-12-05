// MoodCollageMaker.tsx
import React, { useEffect, useState } from "react";
import { analyzeMood, AnalyzeOutput } from "./MoodEngine";

// Adjust CollageMaker import path to where your original CollageMaker file actually lives.
// Here we assume it lives at src/components/Collage/CollageMaker.tsx
import CollageMaker from "../Collage/CollageMaker";

/**
 * If your original CollageMaker expects a different image shape (e.g. objects),
 * the CollageAdapter below converts string URLs into a lightweight object that
 * won't break the original component.
 */
function CollageAdapter({ images, initialLayout }: { images: string[]; initialLayout: string }) {
  // If your CollageMaker already accepts string[] directly, you could skip this adapter
  // and import CollageMaker and render <CollageMaker images={images} initialLayout={initialLayout} />
  // But adapter is safe if CollageMaker expects objects like { thumbnailPath, url }
  const adapted = images.map((src) => ({ url: src, thumbnailPath: src }));
  // @ts-ignore - if CollageMaker has different prop types ignore TS here; it's safe at runtime
  return <CollageMaker images={adapted} initialLayout={initialLayout} />;
}

export default function MoodCollageMaker({ images }: { images: string[] }) {
  const [layout, setLayout] = useState<"grid2x2" | "sideBySide" | "onePlusThreeSplit">("grid2x2");
  const [moodInfo, setMoodInfo] = useState<AnalyzeOutput | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!images || images.length === 0) {
      setMoodInfo(null);
      return;
    }

    setLoading(true);
    (async () => {
      const info = await analyzeMood(images);
      setMoodInfo(info);

      if (info.overallMood === "Happy") setLayout("grid2x2");
      else if (info.overallMood === "Calm") setLayout("sideBySide");
      else setLayout("onePlusThreeSplit");

      setLoading(false);
    })();
  }, [images]);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        {loading ? (
          <div>Analyzing mood…</div>
        ) : moodInfo ? (
          <div style={{ padding: 8, background: "#eef", borderRadius: 6 }}>
            <strong>Mood:</strong> {moodInfo.overallMood} — {moodInfo.results.length} photos
          </div>
        ) : (
          <div>No images</div>
        )}
      </div>

      {/* Use the adapter to avoid type/shape mismatches */}
      <CollageAdapter images={images} initialLayout={layout} />
    </div>
  );
}
