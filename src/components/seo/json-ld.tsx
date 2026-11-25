interface JsonLdProps {
  /** One or more schema.org graph objects to serialize. */
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Renders a schema.org JSON-LD <script> block. Used for Course, FAQPage,
 * and Organization structured data (PRD Task 5.1).
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe inside a script tag as long as it is
      // encoded for HTML — Next escapes the attribute context; we escape
      // the "<" sequence to prevent script-tag breakout.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
