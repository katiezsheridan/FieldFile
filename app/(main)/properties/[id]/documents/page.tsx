import { redirect } from "next/navigation";

// Documents were merged into the property page (activities show their evidence
// inline, with a Land Documents section). Redirect old links to that page.
export default function DocumentsRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/properties/${params.id}`);
}
