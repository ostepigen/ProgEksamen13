// Først definér vi funktioner til at hjælpe med datamanipulation
function parseDate(dateString) {
    return dateString ? new Date(dateString) : null;
}

function withinLast24Hours(date) {
    const now = new Date();
    return now - date < 24 * 60 * 60 * 1000; // 24 timer i millisekunder
}

// Så definér vi funktionen til at hente og opdatere data
function updateNutritionTable() {
    fetch('/get-nutrition-data')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Her forbereder vi datastrukturen til at holde på de akkumulerede værdier
                const nutritionDataByHour = {};

                // Behandler væskeindtaget
                data.waterIntake.forEach(entry => {
                    const hour = entry.Hour;
                    if (!nutritionDataByHour[hour]) {
                        nutritionDataByHour[hour] = { waterIntake: 0, calories: 0 };
                    }
                    nutritionDataByHour[hour].waterIntake += entry.TotalWaterIntake;
                });

                // Behandler kalorieindtaget
                data.mealCalories.forEach(entry => {
                    const hour = entry.Hour;
                    if (!nutritionDataByHour[hour]) {
                        nutritionDataByHour[hour] = { waterIntake: 0, calories: 0 };
                    }
                    nutritionDataByHour[hour].calories += entry.TotalCalories;
                });

                // Nu opdaterer vi tabellen med de nye data
                const tableContainer = document.getElementById('dailyNutriTable');

                // Rens den eksisterende tabel først
                tableContainer.innerHTML = '';

                // Tilføj en titelrække som før
                tableContainer.innerHTML = `
                    <div class="title-row">
                        <div class="column-title">TIDSPUNKT</div>
                        <div class="column-title">MÅLTIDER</div>
                        <div class="column-title">VÆSKEINDTAG</div>
                        <div class="column-title">KALORIER INDTAGET</div>
                    </div>
                `;

                // Skab og tilføj rækker for hvert tidspunkt med data
                Object.keys(nutritionDataByHour).forEach(hour => {
                    const dataRow = document.createElement('div');
                    dataRow.classList.add('data-row');

                    dataRow.innerHTML = `
                        <div>${hour}:00 - ${parseInt(hour) + 1}:00</div>
                        <div>${nutritionDataByHour[hour].meals || 0}</div>
                        <div>${nutritionDataByHour[hour].waterIntake.toFixed(2)} L</div>
                        <div>${nutritionDataByHour[hour].calories.toFixed(2)}</div>
                    `;

                    tableContainer.appendChild(dataRow);
                });
            } else {
                console.error('Failed to retrieve data:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Kald updateNutritionTable når dokumentet indlæses
document.addEventListener('DOMContentLoaded', updateNutritionTable);










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

