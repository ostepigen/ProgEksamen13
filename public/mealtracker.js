document.addEventListener("DOMContentLoaded", function () {
    // Fetch and display logged meals from the backend when the page loads
    fetchLoggedMeals();
});

function fetchLoggedMeals() {
    fetch('/api/meals-eaten')
    .then(response => response.json())
    .then(mealsEaten => {
        const boxTrackedMeals = document.getElementById('boxTrackedMeals');
        boxTrackedMeals.innerHTML = ''; // Clear the container

        mealsEaten.forEach(meal => {
            const mealDiv = document.createElement('div');
            mealDiv.className = 'meal';

            const mealContent = `
                <h3>${meal.MealName}</h3>
                <p>Weight: ${meal.Weight} grams</p>
                <p>Date Eaten: ${new Date(meal.EatenDate).toLocaleString()}</p>
                <p>Calories: ${meal.TotalCalories}</p>
                <p>Protein: ${meal.TotalProtein}g</p>
                <p>Fat: ${meal.TotalFat}g</p>
                <p>Fiber: ${meal.TotalFiber}g</p>
            `;
            mealDiv.innerHTML = mealContent;
            boxTrackedMeals.appendChild(mealDiv);
        });
    })
    .catch(error => {
        console.error('Error fetching logged meals:', error);
    });
}
