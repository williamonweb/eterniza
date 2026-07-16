"use client";

import { useEffect, useState } from "react";
import PetStoryExperience from "../../../../components/pets/PetStoryExperience";

export default function PetExperiencePublicPage({ params }) {
  const [experience, setExperience] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/pets/experiences/public/${params.slug}`, { cache:"no-store" })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) throw new Error(result.message || "Experiência não encontrada.");
        setExperience(result.experience);
      })
      .catch((err) => setError(err.message));
  }, [params.slug]);

  if (error) return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#02070b",color:"#fff"}}><h1>{error}</h1></main>;
  if (!experience) return <main style={{minHeight:"100vh",background:"#02070b"}} />;

  return <PetStoryExperience experience={experience} />;
}
