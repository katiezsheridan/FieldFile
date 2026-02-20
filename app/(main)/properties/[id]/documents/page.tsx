"use client";

import { getProperty } from "@/lib/demo-data";
import { DocumentVault } from "@/components/documents/DocumentVault";
import { Document } from "@/lib/types";
import { useParams } from "next/navigation";

export default function DocumentsPage() {
  const params = useParams();
  const id = params.id as string;
  const property = getProperty(id);

  if (!property) {
    return (
      <div className="min-h-screen bg-field-cream p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-field-ink">
            Property not found
          </h1>
          <p className="text-field-ink/60 mt-2">
            The property you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  // Collect all documents from all activities
  const allDocuments: Document[] = property.activities.flatMap(
    (activity) => activity.documents
  );

  const handleUpload = (files: File[]) => {
    console.log("Files uploaded:", files);
    files.forEach((file) => {
      console.log(`- ${file.name} (${file.type}, ${file.size} bytes)`);
    });
  };

  return (
    <div className="min-h-screen bg-field-cream">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-field-ink">
            {property.name}
          </h1>
          <p className="text-field-ink/60 mt-1">{property.address}</p>
        </div>

        <DocumentVault
          documents={allDocuments}
          onUpload={handleUpload}
          activities={property.activities}
          groupByActivity={true}
        />
      </div>
    </div>
  );
}
