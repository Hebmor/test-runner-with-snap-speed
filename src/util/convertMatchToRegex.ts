/**
 * Converts a match pattern to a regular expression.
 * 
 * @param match - The match pattern to convert.
 * @returns - The regular expression generated from the match pattern.
 */
export const convertMatchToRegex = (match: string) => {
    const processedMatch = match.replaceAll('\\**\\','\\').replaceAll('\\','\\\\').replaceAll('*','.*').replaceAll('.@', '\\.');

    return new RegExp(processedMatch);
}