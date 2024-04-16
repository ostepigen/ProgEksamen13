// Hent reference til det element i HTML, hvor tabellen skal indsættes
const tableContainer = document.getElementById('dailyNutriTable');

// Opret en ny tabel
const table = document.createElement('table');

// Opret en overskriftsrække (thead)
const headerRow = document.createElement('tr');
headerRow.innerHTML = '<th>Tidspunkt</th><th>Antal Måltider</th><th>Væskeindtag (L)</th><th>Kalorieindtag</th>';

// Tilføj overskriften til tabellen
// table.appendChild(headerRow);

// Indsæt tabellen i HTML-elementet
tableContainer.appendChild(table);

// Array med tidspunkter for hver time af dagen
const timeRanges = [
    '00 - 01', '01 - 02', '02 - 03', '03 - 04', '04 - 05',
    '05 - 06', '06 - 07', '07 - 08', '08 - 09', '09 - 10',
    '10 - 11', '11 - 12', '12 - 13', '13 - 14', '14 - 15',
    '15 - 16', '16 - 17', '17 - 18', '18 - 19', '19 - 20',
    '20 - 21', '21 - 22', '22 - 23', '23 - 00'
];

// Opret et objekt til at tælle antallet af måltider, væskeindtag og kalorier for hvert tidspunkt
const mealCounts = {};
const fluidIntakes = {};
const calorieIntakes = {};

// Initialiser tælleren for hvert tidspunkt til 0
timeRanges.forEach(timeRange => {
    mealCounts[timeRange] = 0;
    fluidIntakes[timeRange] = 0;
    calorieIntakes[timeRange] = 0;
});

// Hent loggedMaltider og trackedWater fra localStorage
const loggedMeals = JSON.parse(localStorage.getItem('loggedMaltider')) || [];
const trackedWater = JSON.parse(localStorage.getItem('trackedWater')) || [];

// Funktion til at konvertere en datostring til et JavaScript Date-objekt
function parseDate(dateString) {
    const dateParts = dateString.split(/[ ,.:/]/);
    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const year = parseInt(dateParts[2]);
    const hour = parseInt(dateParts[3]);
    const minute = parseInt(dateParts[4]);
    const second = parseInt(dateParts[5] || 0); // Hvis sekunder ikke er angivet, brug 0
    return new Date(year, month, day, hour, minute, second);
}

// Funktion til at bestemme om en dato er inden for de seneste 24 timer
function withinLast24Hours(dateString) {
    const date = parseDate(dateString);
    if (!date) return false; // Håndter ugyldige datoer
    const now = new Date();
    return (now - date) / (1000 * 60 * 60) < 24;
}

function parseDate(dateString) {
    // Kontroller, om dateString er defineret og ikke er null eller undefined
    if (!dateString) return null;

    // Håndterer forskellige datoformater
    const parts = dateString.split(/[ ,.:/]+/);
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Måneder er 0-indekserede
    const year = parseInt(parts[2]);
    let hour = 0;
    let minute = 0;

    if (parts.length > 3) {
        hour = parseInt(parts[3]);
        if (parts.length > 4) {
            minute = parseInt(parts[4]);
        }
    }

    return new Date(year, month, day, hour, minute);
}

// Gennemgå alle loggedMaltider
loggedMeals.forEach(meal => {
    // Find tidspunktet for måltidet
    let mealDateTime = meal.datetime || meal.dateTime;

    // Tjek om måltidet er inden for de seneste 24 timer
    if (withinLast24Hours(mealDateTime)) {
        // Find det tidspunkt (timeRange) for måltidet baseret på dets tidspunkt
        const timeRange = timeRanges.find(range => {
            const startHour = parseInt(range.split('-')[0]);
            const endHour = parseInt(range.split('-')[1]);
            const mealHour = parseInt(mealDateTime.split(',')[1].trim().split(':')[0]);
            return mealHour >= startHour && mealHour < endHour;
        });

        // Hvis tidspunktet findes, øg antallet af måltider for dette tidspunkt
        if (timeRange) {
            mealCounts[timeRange]++;

            // Tjek om måltidet har en kalorieattribut på den ene eller anden måde
            if (meal.nutrition && meal.nutrition.Kalorier) {
                // Tilføj kalorierne til den samlede kalorieindtag for dette tidspunkt
                calorieIntakes[timeRange] += parseFloat(meal.nutrition.Kalorier);
            } else if (meal.ingredients && meal.ingredients.length > 0 && meal.ingredients[0].nutrition && meal.ingredients[0].nutrition.calories) {
                // Hvis der ikke er en 'Kalorier' attribut, men 'calories' i ingredienserne
                calorieIntakes[timeRange] += parseFloat(meal.ingredients[0].nutrition.calories);
            }
        }
    }
});

// Gennemgå alle trackedWater
trackedWater.forEach(water => {
    // Find tidspunktet for væskeindtaget
    let waterDateTime = water.datetime;

    // Tjek om væskeindtaget er inden for de seneste 24 timer
    if (withinLast24Hours(waterDateTime)) {
        // Find det tidspunkt (timeRange) for væskeindtaget baseret på dets tidspunkt
        const timeRange = timeRanges.find(range => {
            const startHour = parseInt(range.split('-')[0]);
            const endHour = parseInt(range.split('-')[1]);
            const waterHour = parseInt(waterDateTime.split(' ')[1].split('.')[0]);
            return waterHour >= startHour && waterHour < endHour;
        });

        // Hvis tidspunktet findes, tilføj mængden af væskeindtag for dette tidspunkt
        if (timeRange) {
            // Tjek om mængden af væske er angivet
            if (water.amount) {
                // Konverter mængden af væske til liter og tilføj til den samlede mængde for dette tidspunkt
                fluidIntakes[timeRange] += parseFloat(water.amount) / 1000;
            }
        }
    }
});

// Gennemgå alle tidspunkter og opret en række for hver
timeRanges.forEach(timeRange => {
    const row = document.createElement('div');
    row.classList.add('data-row'); // Tilføj klassenavnet til rækken

    // Opret og tilføj celler til rækken (detaljer afhænger af dine data)
    const timeCell = document.createElement('div');
    timeCell.textContent = timeRange;
    row.appendChild(timeCell);

    const mealCountCell = document.createElement('div');
    mealCountCell.textContent = mealCounts[timeRange];
    row.appendChild(mealCountCell);

    const fluidIntakeCell = document.createElement('div');
    fluidIntakeCell.textContent = `${fluidIntakes[timeRange].toFixed(1)} L`;
    row.appendChild(fluidIntakeCell);

    const calorieIntakeCell = document.createElement('div');
    calorieIntakeCell.textContent = calorieIntakes[timeRange].toFixed(1);
    row.appendChild(calorieIntakeCell);

    // Tilføj rækken til dokumentet
    document.getElementById('dailyNutriTable').appendChild(row);
});


// Tilføj tabellen til containeren i HTML-dokumentet
tableContainer.appendChild(table);



















// // Hent reference til det element i HTML, hvor tabellen skal indsættes
// const tableContainer = document.getElementById('dailyNutriTable');

// // Opret en ny tabel
// const table = document.createElement('table');

// // Opret en overskriftsrække (thead)
// const headerRow = document.createElement('tr');

// // Tilføj overskriften til tabellen
// table.appendChild(headerRow);

// // Indsæt tabellen i HTML-elementet
// tableContainer.appendChild(table);


// // Array med tidspunkter for hver time af dagen
// const timeRanges = [
//     '00 - 01', '01 - 02', '02 - 03', '03 - 04', '04 - 05',
//     '05 - 06', '06 - 07', '07 - 08', '08 - 09', '09 - 10',
//     '10 - 11', '11 - 12', '12 - 13', '13 - 14', '14 - 15',
//     '15 - 16', '16 - 17', '17 - 18', '18 - 19', '19 - 20',
//     '20 - 21', '21 - 22', '22 - 23', '23 - 00'
// ];

// // Opret et objekt til at tælle antallet af måltider, væskeindtag og kalorier for hvert tidspunkt
// const mealCounts = {};
// const fluidIntakes = {};
// const calorieIntakes = {};

// // Initialiser tælleren for hvert tidspunkt til 0
// timeRanges.forEach(timeRange => {
//     mealCounts[timeRange] = 0;
//     fluidIntakes[timeRange] = 0;
//     calorieIntakes[timeRange] = 0;
// });

// // Hent loggedMaltider og trackedWater fra localStorage
// const loggedMeals = JSON.parse(localStorage.getItem('loggedMaltider')) || [];
// const trackedWater = JSON.parse(localStorage.getItem('trackedWater')) || [];

// // Gennemgå alle loggedMaltider
// loggedMeals.forEach(meal => {
//     // Find tidspunktet for måltidet
//     let mealDateTime = meal.datetime || meal.dateTime;

//     // Tjek om måltidet har en gyldig datetime eller dateTime-attribut
//     if (mealDateTime) {
//         // Find det tidspunkt (timeRange) for måltidet baseret på dets tidspunkt
//         const timeRange = timeRanges.find(range => {
//             const startHour = parseInt(range.split('-')[0]);
//             const endHour = parseInt(range.split('-')[1]);
//             const mealHour = parseInt(mealDateTime.split(',')[1].trim().split(':')[0]);
//             return mealHour >= startHour && mealHour < endHour;
//         });

//         // Hvis tidspunktet findes, øg antallet af måltider for dette tidspunkt
//         if (timeRange) {
//             mealCounts[timeRange]++;

//             // Tjek om måltidet har en kalorieattribut på den ene eller anden måde
//             if (meal.nutrition && meal.nutrition.Kalorier) {
//                 // Tilføj kalorierne til den samlede kalorieindtag for dette tidspunkt
//                 calorieIntakes[timeRange] += parseFloat(meal.nutrition.Kalorier);
//             } else if (meal.ingredients && meal.ingredients.length > 0 && meal.ingredients[0].nutrition && meal.ingredients[0].nutrition.calories) {
//                 // Hvis der ikke er en 'Kalorier' attribut, men 'calories' i ingredienserne
//                 calorieIntakes[timeRange] += parseFloat(meal.ingredients[0].nutrition.calories);
//             }
//         }
//     }
// });

// // Gennemgå alle trackedWater
// trackedWater.forEach(water => {
//     // Find tidspunktet for væskeindtaget
//     let waterDateTime = water.datetime;

//     // Tjek om væskeindtaget har en gyldig datetime-attribut
//     if (waterDateTime) {
//         // Find det tidspunkt (timeRange) for væskeindtaget baseret på dets tidspunkt
//         const timeRange = timeRanges.find(range => {
//             const startHour = parseInt(range.split('-')[0]);
//             const endHour = parseInt(range.split('-')[1]);
//             const waterHour = parseInt(waterDateTime.split(' ')[1].split('.')[0]);
//             return waterHour >= startHour && waterHour < endHour;
//         });

//         // Hvis tidspunktet findes, tilføj mængden af væskeindtag for dette tidspunkt
//         if (timeRange) {
//             // Tjek om mængden af væske er angivet
//             if (water.amount) {
//                 // Konverter mængden af væske til liter og tilføj til den samlede mængde for dette tidspunkt
//                 fluidIntakes[timeRange] += parseFloat(water.amount) / 1000;
//             }
//         }
//     }
// });

// // Tilføj måltal, væskeindtag og kalorier til tabellen
// timeRanges.forEach(timeRange => {
//     const rowContainer = document.createElement('div'); // Opret en container til rækken
//     rowContainer.classList.add('data-row'); // Tilføj en klasse til containeren

//     const timeCell = document.createElement('div');
//     timeCell.textContent = timeRange;
//     rowContainer.appendChild(timeCell);

//     const mealCountCell = document.createElement('div');
//     mealCountCell.textContent = mealCounts[timeRange];
//     rowContainer.appendChild(mealCountCell);

//     const fluidIntakeCell = document.createElement('div');
//     fluidIntakeCell.textContent = `${fluidIntakes[timeRange].toFixed(1)} L`;
//     rowContainer.appendChild(fluidIntakeCell);

//     const calorieIntakeCell = document.createElement('div');
//     calorieIntakeCell.textContent = calorieIntakes[timeRange].toFixed(1);
//     rowContainer.appendChild(calorieIntakeCell);

//     // Tilføj containeren til dokumentet
//     tableContainer.appendChild(rowContainer);
// });

