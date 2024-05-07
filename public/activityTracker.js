//KRAV 1 I ACTIVITY TRACKER

//Henter aktiviteterne fra databasen, når siden loades 
document.addEventListener('DOMContentLoaded', function () {
    ///activity-types sender en GET anmodning til severen
    fetch('/activity-types')
        //Konveterer json
        .then(response => response.json())
        //Det konveretede objekt bruges til at opdatere brugerens side, så de kan få vist aktivteterne 
        .then(activityTypes => {
            //Henter de tre lister fra html
            const hverdagsListe = document.getElementById('almindeligeHverdagsaktiviteterListe');
            const sportsListe = document.getElementById('sportssaktiviteterListe');
            const arbejdeListe = document.getElementById('ForskelligeTyperArbejdeListe');

            //Tilføjer allke aktiviteterne fra databasen til html og knap der kalder på funktionen tilføjTilIDag
            activityTypes.forEach(activity => {
                const listItem = document.createElement('li');
                const button = document.createElement('button');
                const minutesInput = document.createElement('input');

                minutesInput.type = 'number';
                //Vi sætter en time som standart varighed
                minutesInput.value = 60; 
                //Styling af inputfeltet
                minutesInput.style.width = '50px';

                //Når brugeren klikker på registrer aktivtet, 
                //kaldes funktionen med den bestemte aktivtes navn og kalorier fra datasættet,
                //samt den indtastede værdi i minut inputtet, som parametre. 
                button.textContent = 'Registrer aktivtet';
                button.addEventListener('click', () => 
                tilføjTilIDag(activity.ActivityName, activity.CaloriesPerHour, minutesInput.value, activity.ActivityTypeID));

                //Tilføjer navn, kaloier pr time, tidsindput og kanp til html
                listItem.innerHTML = `<li>${activity.ActivityName} 
                - ${activity.CaloriesPerHour} kcal/t</li>`;
                listItem.appendChild(minutesInput);
                listItem.appendChild(button);

                //Tager kategorien som parameter, så de er sotereret rigtigt på sidens lister
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
        //catch der håndterer fejl i promiset, log fejlen så vi kan se hvad der er galt
        .catch(error => {
            console.error('Fejl ved hentning af aktivitetstyper:', error);
        });
});

//Funktion der tilføjer dagens aktivitet til både html og POST 
//Den her funktion bliver kaldt ovenover når brugeren klikker på knappen
//Egentlig er det ikke et krav at det vises på siden? skal vi fjerne det??
function tilføjTilIDag(name, caloriesPerHour, minutes, activityTypeID) {
    const dagensListe = document.getElementById('dagensAktiviteter');
    const nyAktivitet = document.createElement('li');
   
    //Til at gemme dato og tid
    const date = new Date().toISOString(); 
    //Beregner kalorierne fra paramterenes input
    const calories = (caloriesPerHour / 60) * minutes; 

    //Gøt så brugren kan se den nuye registrerede aktivtet på siden
    nyAktivitet.textContent = `${date}: ${name} - ${calories.toFixed(2)} kcal (${minutes} min)`;
    dagensListe.appendChild(nyAktivitet);

    fetch('/add-activity', {
        method: 'POST',
        headers: {
            //Fortæller serveren at dataen sendes i json format
            'Content-Type': 'application/json'
        },
        //Indeholder brugerens data, der sendes til serveren (konverteret til json-string)
        body: JSON.stringify({
            name,
            calories: calories.toFixed(2),
            duration: minutes,
            date,
            activityTypeID
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Aktivtet gemt:', data);
    })
    .catch((error) => {
        console.error('Error saving activity:', error);
    });
}



//KRAV 2 I ACTIVITY TRACKER 
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

