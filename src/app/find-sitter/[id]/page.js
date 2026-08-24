import PetSitterDetail from "@/components/PetSitterDetail";

export const metadata = {
  title: "Pet Sitter",
};

export default async function PetSitterDetailPage({ params }) {
  const { id } = await params;
  return <PetSitterDetail sitterId={id} />;
}
