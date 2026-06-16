import { redirect } from "next/navigation";

// The map was merged into the property page (shown as a section). Redirect old
// links to that page.
export default function MapRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/properties/${params.id}`);
}
