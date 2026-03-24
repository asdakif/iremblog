interface JsonLdProps {
  headline: string;
  description?: string | null;
  datePublished: Date | string;
  url: string;
  imageUrl?: string | null;
}

export default function JsonLd({
  headline,
  description,
  datePublished,
  url,
  imageUrl,
}: JsonLdProps) {
  const published =
    datePublished instanceof Date
      ? datePublished.toISOString()
      : new Date(datePublished).toISOString();

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    datePublished: published,
    author: {
      "@type": "Organization",
      name: "Irem Blog",
      url: "https://iremblog.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Irem Blog",
      url: "https://iremblog.com",
    },
    url,
  };

  if (description) schema.description = description;
  if (imageUrl) {
    schema.image = {
      "@type": "ImageObject",
      url: imageUrl,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
