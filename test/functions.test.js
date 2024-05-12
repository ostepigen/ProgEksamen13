// Dynamisk import af chai og expect
let chai, expect;

describe('Basal Metabolic Rate Calculation', function () {
    // Før alle tests udføres, importeres chai og expect
    before(async function () {
        chai = await import('chai');
        expect = chai.expect;
    });

    // Test for korrekt BMR for en kvinde under 3 år
    it('should return correct BMR for a female under 3 years old', async function () {
        // Importerer funktionen til BMR-beregning
        const { default: beregnBasaltStofskifte } = await import('../public/js/testFile.js');
        // Udfører funktionen med specifikke parametre
        const result = beregnBasaltStofskifte(10, 2, 'Woman');
        // Forventer at resultatet matcher den forventede værdi
        expect(result).to.equal('2.57');
    });

    it('should return correct BMR for a male aged 18 years', async function () {
        const { default: beregnBasaltStofskifte } = await import('../public/js/testFile.js');
        const result = beregnBasaltStofskifte(50, 18, 'Man');
        expect(result).to.equal('6.45'); // Udregnet på baggrund af data fra opgivne link: (0.056 * 50) + 2.9 = 6.45
    });

    it('should return correct BMR for a male aged 70 years', async function () {
        const { default: beregnBasaltStofskifte } = await import('../public/js/testFile.js');
        const result = beregnBasaltStofskifte(65, 70, 'Woman'); // fejlen ligger i det er en kvinde der søges efter
        expect(result).to.equal('6.17'); // Udregnet på baggrund af data fra opgivne link: (0.0499 * 65) + 2.93 = 6.17
    });

    it('should fail for a male aged 30 years old with incorrect expected result', async function () {
        const { default: beregnBasaltStofskifte } = await import('../public/js/testFile.js');
        const result = beregnBasaltStofskifte(70, 30, 'Man');
        expect(result).to.equal('0.00'); // Intet vil matche et basalt stofskifte på: '0.00'
    });
});
