import { EMPTY_MATCH, getTestMatchByChanged } from './getTestMatchByChanged';

describe('getTestMatchByChanged', () => {
    const changedFiles = [
        '\\stories\\atoms\\Button.stories.tsx',
        '\\stories\\expected-failures\\Failure.stories.tsx',
        '\\stories\\pages\\Page.stories.tsx',
        '\\stories\\atoms\\StressTest.stories.js',
        '\\stories\\molecules\\Header.stories.tsx'
    ];
    
    const testMatch = [
        'C:\\Users\\username\\Documents\\test-runner-with-snap-speed\\stories\\docs\\.*.mdx',
        'C:\\Users\\username\\Documents\\test-runner-with-snap-speed\\stories\\atoms\\.*\.(mdx|stories\.(js|jsx|mjs|ts|tsx))',
        'C:\\Users\\username\\Documents\\test-runner-with-snap-speed\\stories\\molecules\\.*\.(mdx|stories\.(js|jsx|mjs|ts|tsx))',
        'C:\\Users\\username\\Documents\\test-runner-with-snap-speed\\stories\\pages\\.*.stories\.(js|jsx|ts|tsx)'
    ];

    const workingDir = 'C:\\Users\\username\\Documents\\test-runner-with-snap-speed';

    it('should return matching test files', () => {
        const result = getTestMatchByChanged({ changedFiles, testMatch, workingDir });
        expect(result).toEqual([
            'C:\\Users\\username\\Documents\\test-runner-with-snap-speed\\stories\\atoms\\Button.stories.tsx',
            'C:\\Users\\username\\Documents\\test-runner-with-snap-speed\\stories\\pages\\Page.stories.tsx',
            'C:\\Users\\username\\Documents\\test-runner-with-snap-speed\\stories\\atoms\\StressTest.stories.js',
            'C:\\Users\\username\\Documents\\test-runner-with-snap-speed\\stories\\molecules\\Header.stories.tsx',
        ]);
    });

    it('should return "no-files" when changedFiles is empty', () => {
        const result = getTestMatchByChanged({ changedFiles: [], testMatch, workingDir });
        expect(result).toEqual(EMPTY_MATCH);
    });

    it('should return "no-files" when no matching files found', () => {
        const noMatchFiles = [
            'C:\\Users\\username\\Documents\\test-runner-with-snap-speed\\stories\\docs\\Readme.md',
            'C:\\Users\\username\\Documents\\test-runner-with-snap-speed\\stories\\expected-failures\\Image.stories.tsx',
            'C:\\Users\\username\\Documents\\test-runner-with-snap-speed\\stories\\molecules\\Footer.stories.bs'
        ];
        const result = getTestMatchByChanged({ changedFiles: noMatchFiles, testMatch, workingDir });
        expect(result).toEqual(EMPTY_MATCH);
    });
});