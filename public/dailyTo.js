document.addEventListener('DOMContentLoaded', function() {
    const viewSelector = document.getElementById('viewSelector');
    viewSelector.addEventListener('change', function() {
        fetchDataForView(this.value);
    });
    
    // Initial fetch for the default view
    fetchDataForView(viewSelector.value);
});

function fetchDataForView(timeframe) {
    if (timeframe === '24hours') {
        // Fetch data for the last 24 hours
        fetch24HoursData();
    } else {
        // Fetch data for the last 30 days
        fetchMonthlyData();
    }
}

function fetch24HoursData() {
    fetch('/user/basalstofskifte')
    .then(response => response.json())
    .then(bmrData => {
        if (bmrData.success && bmrData.data.length > 0) {
            const basalMetabolicRate = bmrData.data[0].Basalforbrændning; // Assuming the BMR value is in the first object of the array
            const bmrPerHour = (basalMetabolicRate / 24).toFixed(2);
            
            fetch('/user/daily-intake')
            .then(response => response.json())
            .then(dailyIntakeData => {
                if (dailyIntakeData.success) {
                    const dataByHour = new Array(24).fill(null).map((_, hour) => ({
                        Hour: hour,
                        TotalCalories: 0,
                        TotalLiquid: 0,
                        BasalMetabolicRate: bmrPerHour,
                        ...dailyIntakeData.data.find(d => d.MealHour === hour)
                    }));
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
}

function fetchMonthlyData() {
    fetch('/user/basalstofskifte')
    .then(response => response.json())
    .then(bmrData => {
        if (bmrData.success && bmrData.data.length > 0) {
            const basalMetabolicRate = bmrData.data[0].Basalforbrændning;
            const bmrPerDay = (basalMetabolicRate / 24).toFixed(2);
            
            fetch('/user/monthly-intake')
            .then(response => response.json())
            .then(monthlyData => {
                if (monthlyData.success) {
                    const dailyData = monthlyData.data.map(day => ({
                        Date: day.MealDay,
                        TotalCalories: day.TotalCalories,
                        TotalLiquid: day.TotalLiquid,
                        BasalMetabolicRate: bmrPerDay,
                        TotalCaloriesBurned: day.TotalCaloriesBurned
                    }));
                    updateDailyIntakeTable(dailyData);
                } else {
                    console.error('Failed to load monthly intake data:', monthlyData.message);
                }
            })
            .catch(error => console.error('Error fetching monthly intake data:', error));
        } else {
            console.error('Failed to load BMR data:', bmrData.message);
        }
    })
    .catch(error => console.error('Error fetching BMR data:', error));
}

function updateDailyIntakeTable(hoursData) {
    const table = document.getElementById('dailyNutriTable');
    table.innerHTML = ''; // Clear the current table contents

    let header = document.querySelector('.title-row');
    if (!header) {
        header = document.createElement('div');
        header.className = 'title-row';
        header.innerHTML = `
<div class="column-title">TIME/DATE</div>
<div class="column-title">CALORIE INTAKE</div>
<div class="column-title">LIQUID INTAKE</div>
<div class="column-title">COMBUSTION (BMR + ACTIVITIES)</div>
<div class="column-title">CALORIE SURPLUS/DEFICIT</div>
        `;
        table.appendChild(header);
    }

    const dailyBasalMetabolicRate = parseFloat(hoursData[0].BasalMetabolicRate) * 24;
    let runningBalance = dailyBasalMetabolicRate  // Starter med BMR * 24 minus den første times BMR

    hoursData.forEach(item => {
        const row = document.createElement('div');
        row.className = 'data-row';

        const timeCell = document.createElement('div');
        timeCell.className = 'cell';
        // Check if the 'Hour' property exists to decide between showing the hour or the formatted date
        timeCell.textContent = 'Hour' in item ? `${item.Hour}:00 - ${item.Hour + 1}:00` : formatDate(item.Date);


        const caloriesCell = document.createElement('div');
        caloriesCell.className = 'cell';
        caloriesCell.textContent = `${parseFloat(item.TotalCalories).toFixed(0)} kcal`;

        const liquidCell = document.createElement('div');
        liquidCell.className = 'cell';
        liquidCell.textContent = `${item.TotalLiquid} ml`;

        const totalBurnedCalories = parseFloat(item.BasalMetabolicRate) + (item.TotalCaloriesBurned || 0);
        const combustionCell = document.createElement('div');
        combustionCell.className = 'cell';
        // Decide the format based on whether the decimal part is zero
        combustionCell.textContent = `${formatCalories(totalBurnedCalories)} kcal`;



        // Opdaterer den løbende balance for hver time
        runningBalance -= parseFloat(item.TotalCalories); // Fratræk kalorier spist
        runningBalance += parseFloat(item.TotalCaloriesBurned ? item.TotalCaloriesBurned : 0); // Tilføj kalorier forbrændt fra aktiviteter

        const balanceCell = document.createElement('div');
        balanceCell.className = 'cell';
        balanceCell.textContent = `${runningBalance.toFixed(2)} kcal ${runningBalance < 0 ? '(Underskud)' : '(Overskud)'}`;

        

        // Append cells to the row
        row.appendChild(timeCell);
        row.appendChild(caloriesCell);
        row.appendChild(liquidCell);
        row.appendChild(combustionCell);
        row.appendChild(balanceCell);

        table.appendChild(row);
    });
}

function formatCalories(calories) {
    // Check if the decimal part is zero and format accordingly
    if (calories % 1 === 0) { // No decimal part
        return calories.toFixed(0);
    } else { // There is a decimal part
        return calories.toFixed(2);
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // Splits the ISO string and takes only the date part
}