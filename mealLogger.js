document.addEventListener("DOMContentLoaded", function () {
    let latitude, longitude; // Deklarer breddegrads- og længdegradsvariabler

    // Anmod om tilladelse til at få adgang til geolocation
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        console.log('Geolocation er ikke tilgængelig');
    }

    function success(position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log('Breddegrad:', latitude, 'Længdegrad:', longitude);
    }

    function error() {
        console.log('Kan ikke hente din placering');
    }

    // Udfyld dato- og tidsfelter med aktuelle værdier
    const currentDate = new Date();
    document.getElementById("hourInput").value = currentDate.getHours();
    document.getElementById("minuteInput").value = currentDate.getMinutes();
    document.getElementById("dayInput").value = currentDate.getDate();
    document.getElementById("monthInput").value = currentDate.getMonth() + 1; // Måneden er nulbaseret
    document.getElementById("yearInput").value = currentDate.getFullYear();

    // Hent måltider fra localStorage
    const meals = JSON.parse(localStorage.getItem("gemtMaltider"));

    // Vælg dropdown- og inputelementer
    const mealDropdown = document.getElementById("mealDropdown");
    const gramsInput = document.getElementById("gramsInput");
    const hourInput = document.getElementById("hourInput");
    const minuteInput = document.getElementById("minuteInput");
    const dayInput = document.getElementById("dayInput");
    const monthInput = document.getElementById("monthInput");
    const yearInput = document.getElementById("yearInput");
    const logButton = document.getElementById("logButton");

    // Udfyld dropdown med måltidsmuligheder
    meals.forEach(meal => {
        const option = document.createElement("option");
        option.text = meal.name;
        option.value = JSON.stringify(meal);
        mealDropdown.add(option);
    });

    // Eventlistener for klik på logknap
    logButton.addEventListener("click", function () {
        // Hent valgt måltid, mængde og dato/tid
        const selectedMeal = JSON.parse(mealDropdown.value);
        const grams = parseFloat(gramsInput.value);
        const hour = parseInt(hourInput.value);
        const minute = parseInt(minuteInput.value);
        const day = parseInt(dayInput.value);
        const month = parseInt(monthInput.value) - 1; // Måneden er nulbaseret
        const year = parseInt(yearInput.value);

        // Beregn samlet ernæring for valgt måltid
        let totalCalories = 0;
        let totalFat = 0;
        let totalProtein = 0;
        let totalFiber = 0;
        selectedMeal.ingredients.forEach(ingredient => {
            totalCalories += (ingredient.nutrition.calories * grams) / 100;
            totalFat += (ingredient.nutrition.fat * grams) / 100;
            totalProtein += (ingredient.nutrition.protein * grams) / 100;
            totalFiber += (ingredient.nutrition.fiber * grams) / 100;
        });

        // Begræns antallet af decimaler til én
        totalCalories = totalCalories.toFixed(1);
        totalFat = totalFat.toFixed(1);
        totalProtein = totalProtein.toFixed(1);
        totalFiber = totalFiber.toFixed(1);

        // Opret unikt ID for det loggede måltid
        const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

        // Opret objekt for det loggede måltid med unikt ID, dato/tid og koordinater
const loggedMeal = {
    id: uniqueId,
    name: selectedMeal.name,
    quantity: grams,
    // Konverter datoen til ønsket format
    dateTime: `${day}/${month + 1}/${year}, ${hour}:${minute < 10 ? '0' + minute : minute}:${new Date().getSeconds()}`,
    nutrition: {
        Kalorier: totalCalories,
        Fedt: totalFat,
        Protein: totalProtein,
        Fiber: totalFiber
    },
    coordinates: {
        latitude: latitude,
        longitude: longitude
    }
};

        // Hent loggede måltider fra localStorage eller opret hvis det ikke eksisterer
        const loggedMeals = JSON.parse(localStorage.getItem("loggedMaltider")) || [];

        // Tilføj det loggede måltid til loggede måltider-arrayet
        loggedMeals.push(loggedMeal);

        // Gem opdateret loggede måltider-array i localStorage
        localStorage.setItem("loggedMaltider", JSON.stringify(loggedMeals));

        window.location.href = "mealtracker.html";
    });
});

// Funktion til at gå tilbage til mealcreator.html
function goBack() {
    window.location.href = "mealtracker.html";
}

