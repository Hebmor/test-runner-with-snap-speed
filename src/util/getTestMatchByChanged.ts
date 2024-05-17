import path from "path";
import { convertMatchToRegex } from "./convertMatchToRegex";

export const EMPTY_MATCH = ['no-files'];

/**
 * Retrieves test match based on changed files.
 * 
 * @param options - The options object.
 * @param options.changedFiles - Array of changed files.
 * @param  options.testMatch - Array of test match patterns.
 * @param options.workingDir - Working directory.
 * 
 * @returns - Array of matched test files.
 */
export const getTestMatchByChanged = ({changedFiles, testMatch, workingDir}:{changedFiles: string[], testMatch: string[], workingDir: string}) => {
    if (changedFiles?.length) {
        const testPattern = testMatch.map(match => convertMatchToRegex(match));

        const result = changedFiles
            .map(file => path.join(workingDir, file.replaceAll('../', '')))
            .filter(file => testPattern.some(pattern => pattern.test(file)));

        return result.length ? result : EMPTY_MATCH;

    } else {
        return EMPTY_MATCH;
    }
}