export function formatCharacters(input: string, wordCount: number, charCount: number, addEllipsis: boolean = true): string {
    if (!input) return '';
    const words = input.trim().split(/\s+/);

    // If input has fewer words than requested, return as is
    if (words.length < wordCount) {
        return words.join(' ');
    }

    // Take all full words except the last one to be truncated
    const fullWords = words.slice(0, wordCount - 1);
    const lastWord = words[wordCount - 1]?.slice(0, charCount);

    const result = [...fullWords, lastWord].join(' ');
    return addEllipsis ? `${result}...` : result;
}

export function formatNameCharacters(
  input: string,
  maxLength: number = 15,
  addEllipsis: boolean = true
): string {
  if (!input) return '';

  // If input is shorter than limit, return as is
  if (input.length <= maxLength) {
    return input;
  }

  // Cut string to desired length
  const truncated = input.slice(0, maxLength);

  // Append ellipsis if enabled
  return addEllipsis ? `${truncated}...` : truncated;
}

export function formatText(text: string, maxLength: number): string {
  if (!text) return "";

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}






