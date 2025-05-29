export function extractQuotedHeading(heading: string) {
  // Match text in quotes, fallback to heading if not found
  const match = heading.match(/"([^"]+)"/);
  return match ? match[1] : heading;
}