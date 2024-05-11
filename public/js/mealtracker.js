//Funktion der viser de loggede måltider
function seeLoggedMeals() {
    //Get anmodning for at hente loggede måltider 
    fetch('/api/logged-meals')
    //Konveterer til jso
    .then(response => response.json())
    .then(meals => {
        const mealContainer = document.getElementById('boxTrackedMeals');
        mealContainer.innerHTML = ''; 

        //Loop gennem hvert måltid og opretter html
        meals.forEach(meal => {
            const mealDiv = document.createElement('div');
            mealDiv.classList.add('loggedMeal');
            mealDiv.innerHTML = `
                <h3> ${meal.mealName}</h3>
                <p>Original Weight: ${meal.weight} grams</p>
                <p>Time: ${new Date(meal.dateTime).toLocaleString()}</p>
                <p>Location: ${meal.location}</p>
                <p>Total Calories: ${meal.totalCalories} kcal</p>
                <p>Total Protein: ${meal.totalProtein} g</p>
                <p>Total Fat: ${meal.totalFat} g</p>
                <p>Total Fiber: ${meal.totalFiber} g</p>
            `;

            //Nye div tilføjes 
            mealContainer.appendChild(mealDiv);
        });
    })
    .catch(error => {
        console.error('Error fetching logged meals:', error);
    });
}

//Kalder funktionen når siden læseses
document.addEventListener("DOMContentLoaded", function () {
    seeLoggedMeals();
});