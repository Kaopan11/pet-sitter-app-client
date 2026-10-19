import PetSitterDetail from "@/components/PetSitterDetail";

export const metadata = {
  title: "Pet Sitter",
};

export default async function PetSitterDetailPage({ params }) {
  // Route param only — PetSitterDetail fetches the sitter client-side.
  const { id } = await params;
  return <PetSitterDetail sitterId={id} />;
}
