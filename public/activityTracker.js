//Krav 1 i opgaven 
//Henter aktiviteterne fra databasen, når siden loades 
document.addEventListener('DOMContentLoaded', function () {
    fetch('/activity-types')

        .then(response => response.json())
        .then(activityTypes => {
            const hverdagsListe = document.getElementById('almindeligeHverdagsaktiviteterListe');
            const sportsListe = document.getElementById('sportssaktiviteterListe');
            const arbejdeListe = document.getElementById('ForskelligeTyperArbejdeListe');

            //Tilføjer aktiviteterne fra databasen til html og knap der kalder på funktionen tilføjTilIDag
            activityTypes.forEach(activity => {
                const listItem = document.createElement('li');
                const button = document.createElement('button');
                const minutesInput = document.createElement('input');

                minutesInput.type = 'number';
                minutesInput.value = 60; // Standard varighed
                minutesInput.style.width = '50px'; // Styling af inputfeltet

                button.textContent = 'Registrer aktivtet';
                button.addEventListener('click', () => tilføjTilIDag(activity.ActivityName, activity.CaloriesPerHour, minutesInput.value));

                listItem.innerHTML = `<li>${activity.ActivityName} 
                - ${activity.CaloriesPerHour} kcal/t</li>`;
                listItem.appendChild(minutesInput);
                listItem.appendChild(button);

                switch (activity.Category) {
                    case 'Almindelige hverdagsaktiviteter':
                        hverdagsListe.appendChild(listItem);
                        break;
                    case 'Sportsaktiviteter':
                        sportsListe.appendChild(listItem);
                        break;
                    case 'Forskellige typer arbejde':
                        arbejdeListe.appendChild(listItem);
                        break;
                }
            });
        })
        .catch(error => {
            console.error('Fejl ved hentning af aktivitetstyper:', error);
        });
});

//Funktion der tilføjer dagens aktivitet samt en slet knap
function tilføjTilIDag(name, caloriesPerHour, minutes) {
    const dagensListe = document.getElementById('dagensAktiviteter');
    const nyAktivitet = document.createElement('li');
    const date = new Date().toISOString(); // Updated to include time
    const calories = (caloriesPerHour / 60) * minutes; // Calculating calories based on minutes

    nyAktivitet.textContent = `${date}: ${name} - ${calories.toFixed(2)} kcal (${minutes} min)`;

    dagensListe.appendChild(nyAktivitet);

    fetch('/add-activity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            calories: calories.toFixed(2),
            duration: minutes,
            date
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Activity saved:', data);
    })
    .catch((error) => {
        console.error('Error saving activity:', error);
    });
}


//EVT. lav SQL DELETE, der giver brugeren mulighed for at slette en gemt aktivitet?? men nej for ikke et krav

//Krav 2 i opgaven 
// Henter brugerens info og opdaterer deres basale stofskifte
function opdaterBasaltStofskifte() {
    fetch('/get-user-info') // get enpoint i server.js
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const { Weight, Age, Sex } = data.data;
            console.log(Weight, Age, Sex); // Tjekker værdierne 
            //1 Mj = 239 kcal
            const basaltStofskifte = beregnBasaltStofskifte(Weight, Age, Sex);
            document.getElementById('basalestofskifte').innerHTML = `
                <h3>Dit basale stofskifte ${basaltStofskifte} MJ pr dag beregnet ud fra din vægt, alder og køn</h3>
                <p>Dette svarer til ${basaltStofskifte * 239} kcal</p>
            `;
        })
        .catch(error => console.error('Fejl ved hentning af brugerinfo:', error));
}

// Beregner det basale stofskifte baseret på vægt, alder og køn (formel fra link i opgave beskrivelsen)
function beregnBasaltStofskifte(weight, age, sex) {
    //Tjekker lige om den henter rigtig data
    console.log(`Vægt: ${weight}, Alder: ${age}, Køn: ${sex}`);
    let mjBasalstofskifte;
    if (sex === 'Kvinde') {
        if (age < 3) mjBasalstofskifte = 0.244 * weight + 0.13;
        else if (age <= 10) mjBasalstofskifte = 0.085 * weight + 2.03;
        else if (age <= 18) mjBasalstofskifte = 0.056 * weight + 2.9;
        else if (age <= 30 )mjBasalstofskifte = 0.0615 * weight + 2.08;
        else if (age <= 60) mjBasalstofskifte = 0.0364 * weight + 3.47;
        else if (age <= 75) mjBasalstofskifte = 0.0386 * weight + 2.88;
        else mjBasalstofskifte = 0.0410 * weight + 2.61;
    } else if (sex === 'Mand') {
        if (age < 3) mjBasalstofskifte = 0.249 * weight - 0.13;
        else if (age <= 10) mjBasalstofskifte = 0.095 * weight + 2.11;
        else if (age <= 18) mjBasalstofskifte = 0.074 * weight + 2.75;
        else if (age <= 30) mjBasalstofskifte = 0.064 * weight + 2.84;
        else if (age <= 60) mjBasalstofskifte = 0.0485 * weight + 3.67;
        else if (age <= 75) mjBasalstofskifte = 0.0499 * weight + 2.93;
        else mjBasalstofskifte = 0.035 * weight + 3.43;
    }
    return mjBasalstofskifte.toFixed(2); // Returnerer værdien afrundet til to decimaler
}

// Når siden indlæses
document.addEventListener('DOMContentLoaded', () => {
    opdaterBasaltStofskifte();
});

