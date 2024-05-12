//js kører når html er indlæst 
document.addEventListener('DOMContentLoaded', function () {
    //Henter view selectoren fra html, laver en eventListner til den
    //kalder på funkitonen fetchDataForView med den valgte værdi som parameter 
    const viewSelector = document.getElementById('viewSelector');
    viewSelector.addEventListener('change', function () {
        fetchDataForView(this.value);
    });

    fetchDataForView(viewSelector.value);
});

//Funktion der kalder på den valgte værdi (24hours eller 30days)
function fetchDataForView(timeframe) {
    if (timeframe === '24hours') {
        //Kalder på funktionden der fecther data for 24 timer
        fetch24HoursData();
    } else {
        //Kalder på funktionen der fecther for 30 dage 
        fetchMonthlyData();
    }
}

//Funktion der henter data for 24 timer
function fetch24HoursData() {
    //Henter data fra severen ved at sende en andmodning til enpointet /user/basalstofskifte 
    fetch('/user/basalstofskifte')
        //Svaret fra serveren konverteres til js objekt ved brug af json
        .then(response => response.json())
        .then(bmrData => {
            //Hvis dataen er tilgængelig beregner den BMR per time ud fra den daglige
            if (bmrData.success && bmrData.data.length > 0) {
                //Gemmer brugerens basalforbrændning i en konstant 
                const basalMetabolicRate = bmrData.data[0].Basalforbrændning;
                //Dividerer med 24 for at have den for hver time
                const bmrPerHour = (basalMetabolicRate / 24).toFixed(2);

                //Anmoder om data om brugerens daglige indtag
                fetch('/user/daily-intake')
                    //Igen konverteres svaret til json
                    .then(response => response.json())
                    .then(dailyIntakeData => {
                        //Hvis daten er henetet oprettes et nyt array med 24 objekter (et til hver time)  
                        if (dailyIntakeData.success) {
                            //Laver et nyt array med et objekt med attributterne: time, kalorier, væske, bmr
                            const dataByHour = new Array(24).fill(null).map((_, hour) => ({
                                Hour: hour,
                                TotalCalories: 0,
                                TotalLiquid: 0,
                                BasalMetabolicRate: bmrPerHour,
                                ...dailyIntakeData.data.find(d => d.MealHour === hour)
                            }));
                            updateDailyIntakeTable(dataByHour, "24hours");
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

//Funktionen der henter for sidste 30 dage. Samme princip som funkitonen over til 24 timer
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
                            updateDailyIntakeTable(dailyData, "30hours");
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

//Funktion der tager værdien fra objekterne som parameter og opdaterer htmlen, så bruger kan få vist sin daily nutri
function updateDailyIntakeTable(hoursData, viewType) {
    //Henter tabellen fra htmlen og tømmer den 
    const table = document.getElementById('dailyNutriTable');
    table.innerHTML = ''; // Clear the current table contents

    //Laver en header til de fire kolonner
    let header = document.querySelector('.title-row');
    if (!header) {
        header = document.createElement('div');
        header.className = 'title-row';
        header.innerHTML = `
<div class="column-title">TIME/DATE</div>
<div class="column-title">CALORIE INTAKE</div>
<div class="column-title">LIQUID INTAKE</div>
<div class="column-title">CALORIES BURNT (BMR + ACTIVITIES)</div>
<div class="column-title">CALORIE SURPLUS/DEFICIT</div>
        `;
        table.appendChild(header);
    }

    const dailyBasalMetabolicRate = parseFloat(hoursData[0].BasalMetabolicRate) * 24;
    //Brugerens ligevægtsindtag
    let runningBalance = dailyBasalMetabolicRate

    //For hver time oprettes der en række i tabellen 
    hoursData.forEach(item => {
        const row = document.createElement('div');
        row.className = 'data-row';

        //Tideslot 
        const timeCell = document.createElement('div');
        timeCell.className = 'cell';
        timeCell.textContent = 'Hour' in item ? `${item.Hour}:00 - ${item.Hour + 1}:00` : formatDate(item.Date);
        row.appendChild(timeCell);

        //Spiste kalorier
        const caloriesCell = document.createElement('div');
        caloriesCell.className = 'cell';
        caloriesCell.textContent = `${parseFloat(item.TotalCalories).toFixed(0)} kcal`;
        row.appendChild(caloriesCell);

        //Indtaget væske
        const liquidCell = document.createElement('div');
        liquidCell.className = 'cell';
        liquidCell.textContent = `${item.TotalLiquid} ml`;
        row.appendChild(liquidCell);


        // 24 TIMERS VISNING
        if (viewType === '24hours') {

            //Forbrændte kalorier
            const totalBurnedCalories = parseFloat(item.BasalMetabolicRate) + (item.TotalCaloriesBurned || 0);
            const basalMR = document.createElement('div');
            basalMR.className = 'cell';
            basalMR.textContent = `${totalBurnedCalories} kcal`;
            row.appendChild(basalMR);

            // Opdaterer den løbende balance for hver time
            runningBalance -= parseFloat(item.TotalCalories);
            runningBalance += parseFloat(item.TotalCaloriesBurned ? item.TotalCaloriesBurned : 0);


            //Underskud / overskud
            const balanceCell = document.createElement('div');
            balanceCell.className = 'cell';
            balanceCell.textContent = `${runningBalance.toFixed(2)} kcal ${runningBalance < 0 ? '(Deficit)' : '(Surplus)'}`;

            row.appendChild(balanceCell);
        } else {
            //Forbrændte kalorier
            const totalBurnedCalories = dailyBasalMetabolicRate + (item.TotalCaloriesBurned || 0);
            const basalMR = document.createElement('div');
            basalMR.className = 'cell';
            basalMR.textContent = `${totalBurnedCalories} kcal`;
            row.appendChild(basalMR);

            // For 30 dage, genberegner vi balancen for hver dag
            runningBalance = parseFloat(item.TotalCalories) - totalBurnedCalories;


            //Underskud / overskud
            const balanceCell = document.createElement('div');
            balanceCell.className = 'cell';
            balanceCell.textContent = `${runningBalance.toFixed(2)} kcal ${runningBalance < 0 ? '(Deficit)' : '(Surplus)'}`;
            console.log(runningBalance)
            row.appendChild(balanceCell);

        }

        table.appendChild(row);
    });
}

//Konverter datostrengen til et læsbart format
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
}