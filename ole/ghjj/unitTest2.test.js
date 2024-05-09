const chai = require('chai');
const expect = chai.expect;
const beregnBasaltStofskifte = require('../../public/js/activityTracker').beregnBasaltStofskifte;

describe('beregnBasaltStofskifte', function() {
    it('should calculate correctly for a female under 3 years old', function() {
        let result = beregnBasaltStofskifte(10, 2, 'Kvinde');
        expect(result).to.equal('2.57'); // Expected output based on the function logic
    });

    it('should calculate correctly for a male over 75 years old', function() {
        let result = beregnBasaltStofskifte(70, 80, 'Mand');
        expect(result).to.equal('5.88'); // Expected output based on the function logic
    });

    // Add more tests for different age brackets and sexes
});








// VIRKER MEN VIRKER IKKE ///////////////////////////////////////////////////////////////////////

// // // Import the Chai library
// import { expect } from 'chai';

// // import { createUser } from '../../public/js/login.js';


// describe('User Creation', function() {
//     it('should fail if username does not include @', function() {
//         const result = createUser('username', 'Password123');
//         expect(result).to.be.false;
//     });

//     it('should fail if password is less than 10 characters', function() {
//         const result = createUser('user@example.com', 'Pass1');
//         expect(result).to.be.false;
//     });

//     it('should fail if password does not include a capital letter', function() {
//         const result = createUser('user@example.com', 'password123');
//         expect(result).to.be.false;
//     });

//     it('should pass if username and password meet all criteria', function() {
//         const result = createUser('user@example.com', 'Password123');
//         expect(result).to.be.true;
//     });
// });

// // Betingelser for den virker med 4 fails:
// // unitTest.cjs
// // database.cjs


/////////////////////////////////////////////////////////////////////////////////////////////

