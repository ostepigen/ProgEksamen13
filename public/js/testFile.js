// Beregner det basale stofskifte baseret på vægt, alder og køn (formel fra link i opgave beskrivelsen)
function beregnBasaltStofskifte(weight, age, sex) {
    let mjBasalstofskifte;
    if (sex === 'Woman') {
        if (age < 3) mjBasalstofskifte = 0.244 * weight + 0.13;
        else if (age <= 10) mjBasalstofskifte = 0.085 * weight + 2.03;
        else if (age <= 18) mjBasalstofskifte = 0.056 * weight + 2.9;
        else if (age <= 30 )mjBasalstofskifte = 0.0615 * weight + 2.08;
        else if (age <= 60) mjBasalstofskifte = 0.0364 * weight + 3.47;
        else if (age <= 75) mjBasalstofskifte = 0.0386 * weight + 2.88;
        else mjBasalstofskifte = 0.0410 * weight + 2.61;
    } else if (sex === 'Man') {
        if (age < 3) mjBasalstofskifte = 0.249 * weight - 0.13;
        else if (age <= 10) mjBasalstofskifte = 0.095 * weight + 2.11;
        else if (age <= 18) mjBasalstofskifte = 0.074 * weight + 2.75;
        else if (age <= 30) mjBasalstofskifte = 0.064 * weight + 2.84;
        else if (age <= 60) mjBasalstofskifte = 0.0485 * weight + 3.67;
        else if (age <= 75) mjBasalstofskifte = 0.0499 * weight + 2.93;
        else mjBasalstofskifte = 0.035 * weight + 3.43;
    }
    return mjBasalstofskifte.toFixed(2);
}

module.exports = beregnBasaltStofskifte;