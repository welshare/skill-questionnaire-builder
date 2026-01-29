/**
 * Base fields present on every Nillion collection record.
 */
export interface NillionRecord {
  _id: string;
  _created_at?: string;
  _updated_at?: string;
}

/**
 * A QuestionnaireResponse stored in a Nillion collection.
 *
 * Maps to FHIR QuestionnaireResponse semantics but flattened for
 * Nillion SecretVault storage.
 */
export interface QuestionnaireResponseRecord extends NillionRecord {
  /** FHIR Questionnaire canonical URL this response answers. */
  questionnaire_id: string;
  /** Publisher / organization that owns the questionnaire. */
  publisher_id: string;
  /** Application that captured the response (OAuth client-id or app DID). */
  application_id: string;
  /** DID of the subject who filled out the questionnaire. */
  subject_did: string;
  /** ISO-8601 timestamp when the response was submitted. */
  submitted_at: string;
  /** Optional status (completed | amended | entered-in-error). */
  status?: string;
}

/**
 * A binary file record stored in a Nillion collection (metadata only —
 * the blob itself lives in SecretBlob storage).
 */
export interface BinaryFileRecord extends NillionRecord {
  /** DID of the user who uploaded the file. */
  uploader_did: string;
  /** ISO-8601 timestamp of upload. */
  uploaded_at: string;
  /** MIME type (e.g. "image/png", "application/pdf"). */
  content_type: string;
  /** File size in bytes. */
  file_size: number;
  /** Reference to the SecretBlob store ID. */
  blob_store_id: string;
  /** Optional application / publisher context. */
  application_id?: string;
  /** Optional human-readable filename. */
  filename?: string;
}
