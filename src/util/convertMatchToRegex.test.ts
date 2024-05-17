import { convertMatchToRegex } from './convertMatchToRegex';

describe('convertMatchToRegex', () => {
    it('should correctly handle global MDX file pattern', () => {
        const match = 'C:\\Users\\username\\Documents\\project\\stories\\**\\*.mdx';
        const tested = 'C:\\Users\\username\\Documents\\project\\stories\\atoms\\Button.stories.mdx';

        const regex = convertMatchToRegex(match);
        expect(regex.test(tested)).toBe(true);
    });

    it('should correctly handle MDX file pattern in docs directory', () => {
        const match = 'C:\\Users\\username\\Documents\\project\\stories\\docs\\**\\*.mdx';
        const tested = 'C:\\Users\\username\\Documents\\project\\stories\\docs\\molecules\\Header.stories.mdx';

        const regex = convertMatchToRegex(match);
        expect(regex.test(tested)).toBe(true);
    });

    it('should correctly handle MDX or Stories file pattern in atoms directory', () => {
        const match = 'C:\\Users\\username\\Documents\\project\\stories\\atoms\\**\\*.@(mdx|stories.@(js|jsx|mjs|ts|tsx))';
        const tested = 'C:\\Users\\username\\Documents\\project\\stories\\atoms\\Header.stories.mdx';

        const regex = convertMatchToRegex(match);
        expect(regex.test(tested)).toBe(true);
    });

    it('should correctly handle MDX or Stories file pattern in molecules directory', () => {
        const match = 'C:\\Users\\username\\Documents\\project\\stories\\molecules\\**\\*.@(mdx|stories.@(js|jsx|mjs|ts|tsx))';
        const tested = 'C:\\Users\\username\\Documents\\project\\stories\\molecules\\Header.stories.tsx';

        const regex = convertMatchToRegex(match);
        expect(regex.test(tested)).toBe(true);
    });

    it('should correctly handle Stories file pattern in pages directory', () => {
        const match = 'C:\\Users\\username\\Documents\\project\\stories\\pages\\**\\*.stories.@(js|jsx|ts|tsx)';
        const tested = 'C:\\Users\\username\\Documents\\project\\stories\\pages\\Page.stories.tsx';

        const regex = convertMatchToRegex(match);
        expect(regex.test(tested)).toBe(true);
    });

    it('should return correct regex for special character pattern', () => {
        const match = 'C:\\Users\\username\\Documents\\project\\stories\\atoms\\**\\*.@(mdx|stories.@(js|jsx|mjs|ts|tsx))';
        const expected = 'C:\\\\Users\\\\username\\\\Documents\\\\project\\\\stories\\\\atoms\\\\.*\\.(mdx|stories\\.(js|jsx|mjs|ts|tsx))';
        
        const regex = convertMatchToRegex(match);
        expect(regex.source).toBe(expected);
    });

    it('should return true for a matching file', () => {
        const match = 'C:\\Users\\username\\Documents\\SpecialProjects\\frontend\\packages\\ui\\src\\.*.*\\.*.stories.(js|jsx|ts|tsx|mdx)';
        const tested = 'C:\\Users\\username\\Documents\\SpecialProjects\\frontend\\packages\\ui\\src\\components\\common\\Notification\\Notification.stories.tsx';

        const regex = convertMatchToRegex(match);
        expect(regex.test(tested)).toBe(true);
    });

    it('should return false for a non-matching file', () => {
        const match = 'C:\\Users\\username\\Documents\\SpecialProjects\\frontend\\packages\\ui\\src\\docs\\.*.*\\.*.stories.(js|jsx|ts|tsx|mdx)';
        const tested = 'C:\\Users\\username\\Documents\\SpecialProjects\\frontend\\packages\\ui\\src\\components\\common\\Notification\\Notification.stories.tsx';

        const regex = convertMatchToRegex(match);
        expect(regex.test(tested)).toBe(false);
    });

    it('should return true for special characters', () => {
        const match = '*.*@';
        const regex = convertMatchToRegex(match);
        expect(regex.test('test.any@')).toBe(true);
    });
});
