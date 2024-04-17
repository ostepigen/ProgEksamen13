document.addEventListener("DOMContentLoaded", function () {
     // Funktionen kaldes, når DOM'en er blevet fuldt indlæst

    // Hent loggede måltider fra localStorage
    let loggedMeals = JSON.parse(localStorage.getItem('loggedMaltider'));

// Hent containeren, hvor de loggede måltider vil blive vist
    const trackedMealsContainer = document.getElementById('boxTrackedMeals');

    // Tjek om der er loggede måltider til stede
    if (loggedMeals && loggedMeals.length > 0) {
        // Iterér gennem hvert loggede måltid eller ingrediens
        loggedMeals.forEach((mealOrIngredient, index) => {
            // Opret et div-element for hvert måltid eller ingrediens
            const mealDiv = document.createElement('div');
            mealDiv.classList.add('maltider');

            // Udtræk relevante oplysninger baseret på datastrukturen
            let name, quantity, calories, fat, protein, fiber, datetime, latitude, longitude;
            if (mealOrIngredient.name && mealOrIngredient.ingredients) {
                name = mealOrIngredient.name;
                quantity = mealOrIngredient.ingredients[0].quantity;
                calories = mealOrIngredient.ingredients[0].nutrition.calories;
                fat = mealOrIngredient.ingredients[0].nutrition.fat;
                protein = mealOrIngredient.ingredients[0].nutrition.protein;
                fiber = mealOrIngredient.ingredients[0].nutrition.fiber;
                datetime = mealOrIngredient.ingredients[0].datetime;
                latitude = mealOrIngredient.ingredients[0].location.latitude;
                longitude = mealOrIngredient.ingredients[0].location.longitude;
            } else {
                name = mealOrIngredient.name;
                quantity = mealOrIngredient.quantity;
                calories = mealOrIngredient.nutrition.Kalorier;
                fat = mealOrIngredient.nutrition.Fedt;
                protein = mealOrIngredient.nutrition.Protein;
                fiber = mealOrIngredient.nutrition.Fiber;
                datetime = mealOrIngredient.dateTime;
                latitude = mealOrIngredient.coordinates.latitude;
                longitude = mealOrIngredient.coordinates.longitude;
            }

            // Opret overskriftselement for navn
            const nameHeading = document.createElement('h3');
            nameHeading.textContent = name;

            // Opret ul-element til ernæringsoplysninger
            const nutritionList = document.createElement('ul');

            // Tilføj mængde til ernæringslisten
            const gramsLi = document.createElement('li');
            gramsLi.textContent = `Mængde målt i gram: ${quantity}`;
            nutritionList.appendChild(gramsLi);

            // Tilføj ernæringsoplysninger til ernæringslisten
            const caloriesLi = document.createElement('li');
            caloriesLi.textContent = `Kalorier: ${parseFloat(calories).toFixed(1)}`; // Formatér til 1 decimal
            nutritionList.appendChild(caloriesLi);

            const fatLi = document.createElement('li');
            fatLi.textContent = `Fedt: ${parseFloat(fat).toFixed(1)}`; // Formatér til 1 decimal
            nutritionList.appendChild(fatLi);

            const proteinLi = document.createElement('li');
            proteinLi.textContent = `Protein: ${parseFloat(protein).toFixed(1)}`; // Formatér til 1 decimal
            nutritionList.appendChild(proteinLi);

            const fiberLi = document.createElement('li');
            fiberLi.textContent = `Fiber: ${parseFloat(fiber).toFixed(1)}`; // Formatér til 1 decimal
            nutritionList.appendChild(fiberLi);

            // Opret li-element for dato og tid
            const datetimeLi = document.createElement('li');
            datetimeLi.textContent = `Dato & Tid: ${datetime}`;

            // Opret li-element for koordinater
            const coordinatesLi = document.createElement('li');
            coordinatesLi.textContent = `Koordinater: (${latitude}, ${longitude})`;

            // Opret redigeringsknap
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit-button');
            editButton.addEventListener('click', () => {
                // Prompt brugeren for nye værdier
                const newQuantity = prompt('Den nye mængde målt i gram', quantity);
                const newDatetime = prompt('Dato og tidspunkt', datetime);
                const newLatitude = prompt('Første koordinat, breddegrad', latitude);
                const newLongitude = prompt('Andet koordinat, længdegrad', longitude);

                // Sørger for, at brugeren ikke har annulleret operationen, og at de nye værdier er gyldige
                if (newQuantity !== null && newDatetime !== null && newLatitude !== null && newLongitude !== null) {
                    // Beregner forholdet for ernæringsværdierne baseret på den nye mængde
                    const ratio = parseFloat(newQuantity) / quantity;

                    // Opdater måltid eller ingrediensdata i loggede måltider
                    if (mealOrIngredient.name && mealOrIngredient.ingredients) {
                        // Opdater ingrediensdata
                        loggedMeals[index].ingredients[0].quantity = parseFloat(newQuantity);
                        loggedMeals[index].ingredients[0].nutrition.calories = parseFloat(calories) * ratio;
                        loggedMeals[index].ingredients[0].nutrition.fat = parseFloat(fat) * ratio;
                        loggedMeals[index].ingredients[0].nutrition.protein = parseFloat(protein) * ratio;
                        loggedMeals[index].ingredients[0].nutrition.fiber = parseFloat(fiber) * ratio;
                        loggedMeals[index].ingredients[0].datetime = newDatetime;
                        loggedMeals[index].ingredients[0].location.latitude = parseFloat(newLatitude);
                        loggedMeals[index].ingredients[0].location.longitude = parseFloat(newLongitude);
                    } else {
                        // Opdater måltidsdata
                        loggedMeals[index].quantity = parseFloat(newQuantity);
                        loggedMeals[index].nutrition.Kalorier = parseFloat(calories) * ratio;
                        loggedMeals[index].nutrition.Fedt = parseFloat(fat) * ratio;
                        loggedMeals[index].nutrition.Protein = parseFloat(protein) * ratio;
                        loggedMeals[index].nutrition.Fiber = parseFloat(fiber) * ratio;
                        loggedMeals[index].dateTime = newDatetime;
                        loggedMeals[index].coordinates.latitude = parseFloat(newLatitude);
                        loggedMeals[index].coordinates.longitude = parseFloat(newLongitude);
                    }

                    // Opdaterer localStorage
                    localStorage.setItem('loggedMaltider', JSON.stringify(loggedMeals));

                    // Opdater de viste oplysninger
                    gramsLi.textContent = `Mængde målt i gram: ${parseFloat(newQuantity)}`;
                    caloriesLi.textContent = `Kalorier: ${parseFloat(calories) * ratio}`;
                    fatLi.textContent = `Fedt: ${parseFloat(fat) * ratio}`;
                    proteinLi.textContent = `Protein: ${parseFloat(protein) * ratio}`;
                    fiberLi.textContent = `Fiber: ${parseFloat(fiber) * ratio}`;
                    datetimeLi.textContent = `Dato & Tid: ${newDatetime}`;
                    coordinatesLi.textContent = `Koordinater: (${parseFloat(newLatitude)}, ${parseFloat(newLongitude)})`;
                }
            });

            // Der bliver oprettet en slet knap
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => {
                // Fjerner måltidet eller ingrediensen fra loggedMeals-arrayet
                loggedMeals.splice(index, 1);
                // Opdaterer localStorage med det ændrede array
                localStorage.setItem('loggedMaltider', JSON.stringify(loggedMeals));
                // Fjerner måltidet eller ingrediensen fra UI'en
                mealDiv.remove();

                // Tjek om det er en ingrediens eller et måltid baseret på strukturen og fjern det fra localStorage
                if (mealOrIngredient.name && mealOrIngredient.ingredients) {
                    let filteredMeals = loggedMeals.filter(item => item.ingredients[0].datetime !== datetime);
                    localStorage.setItem('loggedMaltider', JSON.stringify(filteredMeals));
                } else {
                    let filteredMeals = loggedMeals.filter(item => item.dateTime !== datetime);
                    localStorage.setItem('loggedMaltider', JSON.stringify(filteredMeals));
                }
            });

            // Tilføjer elementer til måltidsdiv'en
            mealDiv.appendChild(nameHeading);
            mealDiv.appendChild(nutritionList);
            mealDiv.appendChild(datetimeLi);
            mealDiv.appendChild(coordinatesLi);
            mealDiv.appendChild(editButton);
            mealDiv.appendChild(deleteButton);

            // Tilføj måltidsdiv til containeren med tracked meals
            trackedMealsContainer.appendChild(mealDiv);
        });
    } else {
        // Hvis der ikke er loggede måltider, vis en besked
        trackedMealsContainer.innerHTML = '<p>Intet måltid eller ingrediens er blevet valgt.</p>';
    }
});
