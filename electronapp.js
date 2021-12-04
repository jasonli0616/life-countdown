const { app, Tray, Menu, nativeImage, BrowserWindow, ipcMain, dialog } = require('electron');
const storage = require('electron-json-storage');
const path = require('path');
const { objectIsNotEmpty, getDeathDate } = require('./calculations');
const increments = require('./increments');


/**
 * GUI to change/set birthday
 */
const changeDate = () => {
    const win = new BrowserWindow({
        width: 400,
        height: 400,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    
    win.on('close', (event) => {
        countdownTray();
    })
    
    win.loadFile(path.join(__dirname, 'views/index.html'))
};

// Hide on dock
app.dock.hide();
app.on('window-all-closed', () => {
    // Do nothing when window all closed
});

ipcMain.on('setDate', 
    /**
     * Sets the date (called from renderrer)
     * @param {Event} event 
     * @param {string} birthday Birthday in format yyyy-mm-dd
     */
    (event, birthday) => {
        if (!birthday)
            dialog.showErrorBox('Error', 'No date entered');
        else
            storage.set('date', {birthday: birthday});
    }
);

ipcMain.on('clearDate',
    /**
     * Clears all date stored (called from renderer)
     * @param {Event} event 
     */
    (event) => {
        storage.set('date', {});
        storage.set('increment', {});
    }
);

ipcMain.on('getDate',
    /**
     * Called from renderer
     * @param {Event} event 
     * @returns {object} { error: boolean, data: string yyyy-mm-dd }
     */
    (event) => {
        storage.get('date', (err, data) => {
            if (objectIsNotEmpty(data))
                event.reply('getDate', {err: false, data: data});
            event.reply('getDate', {err: true});
        });
    }
);

/**
 * Menubar tray that shows the countdown
 */
const countdownTray = () => {

    // Set clock icon
    let iconPath = path.join(__dirname, 'icons/iconTemplate.png');

    let tray = new Tray(nativeImage.createFromPath(iconPath));
    tray.setToolTip('Test')

    // Set increment
    storage.get('increment', (err, data) => {
        if (objectIsNotEmpty(data))
            increment = data.increment;
        else 
            storage.set('increment', {increment: increments.Seconds});
    });

    // Menubar:
    // - Change date - runs the change date GUI
    // - Quit - quits the app
    let menubarTemplate = [
        {
            label: 'Change date', click: async () => {
                changeDate();
                tray.destroy();
                clearInterval(countdownLoop);
            }
        },
        { type: 'separator' },
        {
            label: 'Increment',
            submenu: Object.keys(increments).map((increment) = (increment) => {
                return {
                    label: increment,
                    type: 'radio',
                    checked: storage.getSync('increment').increment === increments[increment],
                    click: async () => {
                        storage.set('increment', {increment: increments[increment]});
                    }
                }
            })
        },
        { type: 'separator' },
        { label: 'Quit', click: app.quit }
    ];
    let contextMenu = Menu.buildFromTemplate(menubarTemplate);
    tray.setContextMenu(contextMenu);

    // Show on hover
    tray.setToolTip('Seconds until your death');

    // Loop that counts down the death
    let countdownLoop = setInterval(() => {
        try {
            let data = storage.getSync('date');
            let bday = data.birthday;
            let dday = getDeathDate(bday);
            let timeUntilDeath = Math.round(Math.round(((new Date(dday)).getTime() / 1000) - ((new Date()).getTime() / 1000)) / storage.getSync('increment').increment);

            tray.setTitle(String(timeUntilDeath));
        } catch {
            dialog.showErrorBox('Error', 'No date entered');
            clearInterval(countdownLoop);
        }
    }, 1000);
};

module.exports = startApp = () => {
    // Start app
    app.whenReady().then(() => {
        storage.get('date', (err, data) => {
            if (err)
                throw err;

            if (objectIsNotEmpty(data))
                // Start countdown if data
                countdownTray();
            else
                // Else show set date GUI
                changeDate();
        });

    });
};