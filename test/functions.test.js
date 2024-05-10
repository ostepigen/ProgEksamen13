// Dynamic import for chai and expect
let chai, expect;

describe('Basal Metabolic Rate Calculation', function() {
    before(async function() {
        chai = await import('chai');
        expect = chai.expect;
    });

    it('should return correct BMR for a female under 3 years old', async function() {
        const { default: beregnBasaltStofskifte } = await import('../public/js/testFile.js');
        const result = beregnBasaltStofskifte(10, 2, 'Woman');
        expect(result).to.equal('2.57');
    });

    it('should return correct BMR for a male aged 18 years', async function() {
        const { default: beregnBasaltStofskifte } = await import('../public/js/testFile.js');
        const result = beregnBasaltStofskifte(50, 18, 'Man');
        expect(result).to.equal('6.45'); // Expected based on the formula: (0.056 * 50) + 2.9 = 6.45
    });
    
    it('should return correct BMR for a male aged 70 years', async function() {
        const { default: beregnBasaltStofskifte } = await import('../public/js/testFile.js');
        const result = beregnBasaltStofskifte(65, 70, 'Woman'); // fejlen ligger i det er en kvinde der søges efter
        expect(result).to.equal('6.17'); // Expected based on the formula: (0.0499 * 65) + 2.93 = 6.17
    });

    it('should fail for a male aged 30 years old with incorrect expected result', async function() {
        const { default: beregnBasaltStofskifte } = await import('../public/js/testFile.js');
        const result = beregnBasaltStofskifte(70, 30, 'Man');
        expect(result).to.equal('0.00'); // Deliberate failure: correct calculation would not match '0.00'
    });
});
