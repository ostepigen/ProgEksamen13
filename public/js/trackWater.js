const apiUrl = '/water-intake';

function getUserLiquids() {
    const userId = document.getElementById('userId').value;
    if (!userId) {
        alert('Please enter a user ID.');
        return;
    }

    fetch(`${apiUrl}/user/${userId}`)
    .then(response => response.json())
    .then(data => {
        const waterContainer = document.getElementById('liquidList');
        waterContainer.innerHTML = '';  // Clear existing entries
        data.forEach(water => appendToLiquidList(water));
    })
    .catch(error => {
        console.error('Error fetching user liquids:', error);
        alert('Failed to fetch liquids for the specified user.');
    });
}

function appendToLiquidList(water) {
    const waterContainer = document.getElementById('liquidList');
    const waterDiv = document.createElement('div');
    waterDiv.classList.add('loggedWater');
    // Check if water.waterIntakeId is defined
    waterDiv.innerHTML = `
        <p>${water.liquidName} - ${water.amount} ml</p>
        <p>Consumed at: ${new Date(water.intakeDateTime).toLocaleString()}</p>
        <button onclick="removeLiquid(this.parentNode, ${water.waterIntakeId})">Delete</button>
    `;
    waterContainer.appendChild(waterDiv);
}


// Existing functions (addLiquid, removeLiquid, etc.) are unchanged


function removeLiquid(element, waterIntakeId) {
    console.log("Attempting to delete WaterIntakeId:", waterIntakeId); // Check what's being sent
    fetch(`/water-intake/${waterIntakeId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Water intake deleted successfully');
            element.remove();  // Remove the water intake entry from the DOM
        } else {
            throw new Error(result.message);
        }
    })
    .catch(error => {
        console.error('Error deleting water intake:', error);
        alert('Failed to delete water intake. Please try again.');
    });
}


function addLiquid() {
    const liquidName = document.getElementById('liquidName').value;
    const amount = document.getElementById('amount').value;

    if (!liquidName || !amount) {
        alert('Please enter both the name of the liquid and the amount.');
        return;
    }

    const newLiquid = {
        liquidName: liquidName,
        amount: amount,
        intakeDateTime: new Date().toISOString()  // assuming current time as intake time
    };

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLiquid)
    })
    .then(response => {
        if (response.ok) {
            appendToLiquidList(newLiquid);  // Display new liquid in the list immediately
            return response.json();
        } else {
            throw new Error('Failed to add liquid intake');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add liquid intake. Please try again.');
    });
}

function appendToLiquidList(water) {
    const waterContainer = document.getElementById('liquidList');
    const waterDiv = document.createElement('div');
    waterDiv.classList.add('loggedWater');
    waterDiv.innerHTML = `
        <p>${water.liquidName} - ${water.amount} ml</p>
        <p>Consumed at: ${new Date(water.intakeDateTime).toLocaleString()}</p>
        <button onclick="removeLiquid(this.parentNode, ${water.waterIntakeId})">Delete</button>
    `;
    waterContainer.appendChild(waterDiv);
}

document.addEventListener("DOMContentLoaded", function () {
    // You might want to load existing data here or keep it empty for fresh sessions
});

// Go back to mealtracker.html
function goBack() {
    window.location.href = "mealtracker.html";
}




