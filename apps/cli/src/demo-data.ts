import {
  InMemoryCollectionReader,
  COLLECTIONS,
  type QuestionnaireResponseRecord,
  type BinaryFileRecord,
} from "@welshare/sdk";

/**
 * Seed the in-memory reader with realistic-looking sample data so the CLI
 * can be exercised without a live Nillion connection.
 *
 * Generates records spread over the last 7 days across a few
 * applications / publishers / uploaders.
 */
export function seedDemoData(reader: InMemoryCollectionReader): void {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const apps = ["app-brainhealth", "app-wellness", "app-onboarding"];
  const publishers = ["pub-welshare", "pub-partner-a", "pub-partner-b"];
  const uploaders = ["did:web:alice.example", "did:web:bob.example", "did:web:carol.example"];
  const mimeTypes = ["image/png", "application/pdf", "image/jpeg"];

  // -- Questionnaire responses -----------------------------------------------
  const responses: QuestionnaireResponseRecord[] = [];
  let responseId = 0;

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    // Vary volume per day (more on weekdays, fewer on weekends)
    const count = dayOffset < 5 ? 8 + Math.floor(Math.random() * 12) : 2 + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(
        now - dayOffset * DAY - Math.floor(Math.random() * DAY),
      );
      responses.push({
        _id: `qr-${++responseId}`,
        questionnaire_id: `http://welshare.app/fhir/Questionnaire/demo-${(i % 3) + 1}`,
        publisher_id: publishers[i % publishers.length],
        application_id: apps[i % apps.length],
        subject_did: `did:web:subject-${(i % 20) + 1}.example`,
        submitted_at: timestamp.toISOString(),
        status: "completed",
      });
    }
  }

  reader.seed(COLLECTIONS.QUESTIONNAIRE_RESPONSES, responses);

  // -- Binary file uploads ---------------------------------------------------
  const files: BinaryFileRecord[] = [];
  let fileId = 0;

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const count = dayOffset < 5 ? 4 + Math.floor(Math.random() * 6) : 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(
        now - dayOffset * DAY - Math.floor(Math.random() * DAY),
      );
      files.push({
        _id: `bf-${++fileId}`,
        uploader_did: uploaders[i % uploaders.length],
        uploaded_at: timestamp.toISOString(),
        content_type: mimeTypes[i % mimeTypes.length],
        file_size: 1024 + Math.floor(Math.random() * 500_000),
        blob_store_id: `blob-${++fileId}`,
        application_id: apps[i % apps.length],
        filename: `upload-${fileId}.${mimeTypes[i % mimeTypes.length].split("/")[1]}`,
      });
    }
  }

  reader.seed(COLLECTIONS.BINARY_FILES, files);
}
