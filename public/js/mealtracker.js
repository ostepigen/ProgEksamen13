// Define seeLoggedMeals at the top level so it's available globally
function seeLoggedMeals() {
    fetch('/api/logged-meals')
    .then(response => response.json())
    .then(meals => {
        const mealContainer = document.getElementById('boxTrackedMeals');
        mealContainer.innerHTML = ''; // Clear the container before appending new data
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
            mealContainer.appendChild(mealDiv);
        });
    })
    .catch(error => {
        console.error('Error fetching logged meals:', error);
    });
}



// When DOM is fully loaded, fetch meals
document.addEventListener("DOMContentLoaded", function () {
    seeLoggedMeals();
});



////////////////////////// DENNE KAN HØJEST SANDSYNLIGT GODT SLETTES NU //////////////////////////
// document.addEventListener("DOMContentLoaded", function () {
//     // Fetch and display logged meals from the backend when the page loads
//     fetchLoggedMeals();
// });

// function fetchLoggedMeals() {
//     fetch('/api/meals-eaten')
//     .then(response => response.json())
//     .then(mealsEaten => {
//         const boxTrackedMeals = document.getElementById('boxTrackedMeals');
//         boxTrackedMeals.innerHTML = ''; // Clear the container

//         mealsEaten.forEach(meal => {
//             const mealDiv = document.createElement('div');
//             mealDiv.className = 'meal';

//             const mealContent = `
//                 <h3>${meal.MealName}</h3>
//                 <p>Weight: ${meal.Weight} grams</p>
//                 <p>Date Eaten: ${new Date(meal.EatenDate).toLocaleString()}</p>
//                 <p>Calories: ${meal.TotalCalories}</p>
//                 <p>Protein: ${meal.TotalProtein}g</p>
//                 <p>Fat: ${meal.TotalFat}g</p>
//                 <p>Fiber: ${meal.TotalFiber}g</p>
//             `;
//             mealDiv.innerHTML = mealContent;
//             boxTrackedMeals.appendChild(mealDiv);
//         });
//     })
//     .catch(error => {
//         console.error('Error fetching logged meals:', error);
//     });
// }