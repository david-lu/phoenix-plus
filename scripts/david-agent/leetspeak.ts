/** Replace common letters, preserving all other characters and whitespace. */
export function convertToLeetspeak(text: string): string {
  const replacements: Partial<Record<string, string>> = {
    a: "4",
    e: "3",
    i: "1",
    l: "1",
    o: "0",
    s: "5",
    t: "7",
  };
  return text.replace(
    /[aeilost]/gi,
    (character) => replacements[character.toLowerCase()] ?? character
  );
}
