document.addEventListener('DOMContentLoaded', function() {
    // First fetch the BMR data
    fetch('/user/basalstofskifte')
    .then(response => response.json())
    .then(bmrData => {
        if (bmrData.success && bmrData.data.length > 0) {
            // Fetch the daily intake data
            fetch('/user/daily-intake')
            .then(response => response.json())
            .then(dailyIntakeData => {
                if (dailyIntakeData.success) {
                    // Calculate BMR per hour
                    const basalMetabolicRate = bmrData.data[0].Basalforbrændning; // Assuming the BMR value is in the first object of the array
                    const bmrPerHour = (basalMetabolicRate / 24).toFixed(2);
                    console.log(bmrPerHour); // Now this should correctly log the BMR per hour

                    // Prepare data by hour
                    const dataByHour = new Array(24).fill(null).map((_, hour) => ({
                        Hour: hour,
                        TotalCalories: 0,
                        TotalLiquid: 0,
                        BasalMetabolicRate: bmrPerHour,
                        ...dailyIntakeData.data.find(d => d.MealHour === hour)
                    }));
                    // Update the UI with the prepared data
                    updateDailyIntakeTable(dataByHour);
                } else {
                    console.error('Failed to load daily intake data:', dailyIntakeData.message);
                }
            })
            .catch(error => console.error('Error fetching daily intake data:', error));
        } else {
            console.error('Failed to load BMR data:', bmrData.message);
        }
    })
    .catch(error => console.error('Error fetching BMR data:', error));
});





function updateDailyIntakeTable(hoursData) {
    const table = document.getElementById('dailyNutriTable');
    table.innerHTML = ''; // Clear the current table contents

    let header = document.querySelector('.title-row');
    if (!header) {
        header = document.createElement('div');
        header.className = 'title-row';
        header.innerHTML = `
<div class="column-title">TIDSPUNKT</div>
<div class="column-title">KALORIEINDTAG</div>
<div class="column-title">VÆSKEINDTAG</div>
<div class="column-title">FORBRÆNDING (BMR + aktiviteter)</div>
<div class="column-title">KALORIE UNDERSKUD/OVERSKUD</div>
        `;
        table.appendChild(header);
    }

    const dailyBasalMetabolicRate = parseFloat(hoursData[0].BasalMetabolicRate) * 24;
    let runningBalance = dailyBasalMetabolicRate  // Starter med BMR * 24 minus den første times BMR

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

        const totalBurned = parseFloat(item.BasalMetabolicRate) + (item.TotalCaloriesBurned ? parseFloat(item.TotalCaloriesBurned) : 0);
        const combustionCell = document.createElement('div');
        combustionCell.className = 'cell';
        combustionCell.textContent = `${totalBurned.toFixed(2)} kcal`;

        // Opdaterer den løbende balance for hver time
        runningBalance -= parseFloat(item.TotalCalories); // Fratræk kalorier spist
        runningBalance += parseFloat(item.TotalCaloriesBurned ? item.TotalCaloriesBurned : 0); // Tilføj kalorier forbrændt fra aktiviteter

        const balanceCell = document.createElement('div');
        balanceCell.className = 'cell';
        balanceCell.textContent = `${runningBalance.toFixed(2)} kcal ${runningBalance < 0 ? '(Underskud)' : '(Overskud)'}`;

        // Tilføjer celler til rækken
        row.appendChild(hourCell);
        row.appendChild(caloriesCell);
        row.appendChild(liquidCell);
        row.appendChild(combustionCell);
        row.appendChild(balanceCell);

        table.appendChild(row);
    });
}
