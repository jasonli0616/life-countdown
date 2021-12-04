const { ipcRenderer } = require('electron');

// Get HTML elements
const birthdayInput = document.getElementById('birthday-input');
const countdownButton = document.getElementById('countdown-button');
const clearButton = document.getElementById('clear-button');


// Check if date exists
ipcRenderer.send('getDate');
ipcRenderer.on('getDate',
    /**
     * Get data response
     * @param {Event} event 
     * @param {object} data { error: boolean, data: string yyyy-mm-dd }
     */
    (event, data) => {
        if (!data.err) {
            // If exists, insert into input
            birthdayInput.value = data.data.birthday;
        };
    }
);


countdownButton.addEventListener('click',
    /**
     * Set birthday on countdown button click
     * @param {Event} event 
     */
    (event) => {
        let birthday = undefined;
        try {
            // Get birthday input in format yyyy-mm-dd
            birthday = new Date(document.getElementById('birthday-input').value).toISOString().split('T')[0];
        } catch {
            // If no date entered
        }
        ipcRenderer.send('setDate', birthday);
        if (birthday)
            window.close();
    }
);


clearButton.addEventListener('click',
    /**
     * Reset birthday on button click
     * @param {Event} event 
     */
    (event) => {
        ipcRenderer.send('clearDate');
        birthdayInput.value = '';
    }
);