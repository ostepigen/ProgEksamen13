document.addEventListener('DOMContentLoaded', function() {
    fetch('/user/daily-intake')
    .then(response => response.json()) // Konverter response til JSON
    .then(data => {
        if (data.success) {
            const dataByHour = new Array(24).fill(null).map((_, hour) => ({
                Hour: hour,
                TotalCalories: 0,
                TotalLiquid: 0,
                BasalMetabolicRate: 0,
                ...data.data.find(d => d.MealHour === hour)
            }));
            updateDailyIntakeTable(dataByHour);
        } else {
            console.error('Failed to load data:', data.message);
        }
    })
    .catch(error => {
        console.error('Error fetching hourly meals:', error);
    });
});

function updateDailyIntakeTable(hoursData) {
    const table = document.getElementById('dailyNutriTable');
    table.innerHTML = ''; // Tømmer de nuværende tabeller

   // Laver de små overskrifter
   let header = document.querySelector('.title-row');
   if (!header) {
       header = document.createElement('div');
       header.className = 'title-row';
       header.innerHTML = `
           <div class="column-title">TIDSPUNKT</div>
           <div class="column-title">KALORIEINDTAG</div>
           <div class="column-title">VÆSKEINDTAG</div>
           <div class="column-title">BASALFORBRÆNDNING</div>
       `;
       table.appendChild(header);
   }


    hoursData.forEach(item => {
        const row = document.createElement('div');
        row.className = 'data-row';
        
        const hourCell = document.createElement('div');
        hourCell.className = 'cell';
        hourCell.textContent = `${item.Hour}:00 - ${item.Hour + 1}:00`;

        const caloriesCell = document.createElement('div');
        caloriesCell.className = 'cell';
        caloriesCell.textContent = `${item.TotalCalories} kcal`;

        const liquidCell = document.createElement('div');
        liquidCell.className = 'cell';
        liquidCell.textContent = `${item.TotalLiquid} ml`;

        const combustionCell = document.createElement('div');
        combustionCell.className = 'cell';
        combustionCell.textContent = `${item.BasalMetabolicRate} kcal`;

        row.appendChild(hourCell);
        row.appendChild(caloriesCell);
        row.appendChild(liquidCell);
        row.appendChild(combustionCell);

        table.appendChild(row);
    });
}




// document.addEventListener('DOMContentLoaded', function() {
//     fetch('/user/meals/hourly')
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             const table = document.getElementById('dailyNutriTable');
//             data.data.forEach(hourData => {
//                 const row = document.createElement('div');
//                 row.className = 'data-row';
                
//                 const hourCell = document.createElement('div');
//                 hourCell.className = 'cell';
//                 hourCell.textContent = `${hourData.MealHour}:00 - ${hourData.MealHour + 1}:00`;
                
//                 const caloriesCell = document.createElement('div');
//                 caloriesCell.className = 'cell';
//                 caloriesCell.textContent = `${hourData.TotalCalories} kcal`;
                
//                 row.appendChild(hourCell);
//                 row.appendChild(caloriesCell);
                
//                 table.appendChild(row);
//             });
//         } else {
//             console.error(data.message);
//         }
//     })
//     .catch(error => console.error('Error fetching hourly meals:', error));
// });
