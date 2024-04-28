// Base URL for the API endpoints
const apiUrl = '/water-intake';

// Function to remove a water intake record
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

// Function to add a water intake record
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
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Assuming the server returns the ID and datetime of the new record
            addToList(data.waterIntakeId, liquidName, amount, data.datetime);
        } else {
            console.error('Failed to create the water intake record');
        }
    })
    .catch(error => console.error('Error:', error));
}


// Function to create and append a list item to the DOM
function addToList(waterIntakeId, name, amount, datetime) {
    const formattedDatetime = (datetime);
    const listItem = document.createElement('li');
    listItem.textContent = `${name} - ${amount} ml ${datetime.slice(0,16) || 'just now'})`;
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Slet';
    deleteButton.onclick = function() {
        removeLiquid(listItem, waterIntakeId);
    };

    listItem.appendChild(deleteButton);
    document.getElementById('liquidList').appendChild(listItem);
}

// Function to initialize the list from the server
function initializeList() {
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        const liquidList = document.getElementById('liquidList');
        data.forEach(liquid => {
            addToList(liquid.WaterIntakeId, liquid.LiquidName, liquid.Amount, liquid.IntakeDateTime);
        });
    })
    .catch(error => console.error('Error:', error));
}

// Call the initialization function when the page loads
document.addEventListener('DOMContentLoaded', initializeList);

// Go back to mealtracker.html
function goBack() {
    window.location.href = "mealtracker.html";
}
