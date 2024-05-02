const apiUrl = '/water-intake';

function removeLiquid(item, waterIntakeId) {
    fetch(`${apiUrl}/${waterIntakeId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            item.parentNode.removeChild(item);
        } else {
            console.error('Failed to delete the water intake record');
        }
    })
    .catch(error => console.error('Error:', error));
}

function addLiquid() {
    const liquidName = document.getElementById('liquidName').value;
    const amount = document.getElementById('amount').value;

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ liquidName, amount })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to add liquid intake');
        }
    })
    .then(data => {
        appendToLiquidList(data);  // Append only the new liquid to the list
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




function seeLoggedWater() {
    fetch('/water-intake')
    .then(response => response.json())
    .then(waters => {
        const waterContainer = document.getElementById('liquidList');
        waterContainer.innerHTML = ''; // Clear previous entries
        waters.forEach(water => {
            const waterDiv = document.createElement('div');
            waterDiv.classList.add('loggedWater');
            waterDiv.innerHTML = `
                <p>${water.liquidName} - ${water.amount} ml</p>
                <p>Consumed at: ${new Date(water.intakeDateTime).toLocaleString()}</p>
                <button onclick="removeLiquid(this.parentNode, ${water.waterIntakeId})">Delete</button>
            `;
            waterContainer.appendChild(waterDiv);
        });
    })
    .catch(error => {
        console.error('Error fetching logged water intakes:', error);
    });
}



document.addEventListener("DOMContentLoaded", function () {
    seeLoggedWater();  // Initialize the water list on page load
});

// Go back to mealtracker.html
function goBack() {
    window.location.href = "mealtracker.html";
}