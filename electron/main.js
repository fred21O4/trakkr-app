const { app, BrowserWindow, ipcMain, Menu, screen, dialog } = require('electron');
const { watchJournalChanges } = require('./events/journal');
const { getMissionDetails } = require('./events/mission');
const { getConfig, createConfig, updateConfig } = require('./data/config');
const commodityData = require('./data/json/commodities.json');
const path = require('path');
const { getState, setState } = require('./data/state');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;
let splashWindow = null;

function createSplashScreen() {
    splashWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false, // hide title bar
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
        },
    });

    if (app.isPackaged) {
        splashWindow.loadFile(`${path.join(__dirname, '../dist/index.html')}`)
    } else {
        splashWindow.loadURL('http://localhost:5173');
    }

    splashWindow.on('ready-to-show', () => {
        const state = getState();
    
        if (!state) {
            createDefaultState();
        }
    });

}

function createWindow() {
    Menu.setApplicationMenu(null);

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const iconPath = process.platform === 'win32'
        ? path.join(__dirname, '../public/favicon-32x32.ico')
        : path.join(__dirname, '../public/favicon-16x16.png');

    mainWindow = new BrowserWindow({
        width,
        height,
        icon: iconPath,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });


    if (app.isPackaged) {
        const indexedPath = `${path.join(__dirname, '../dist/index.html')}`;
        mainWindow.loadFile(indexedPath).then(() => {
            mainWindow.webContents.executeJavaScript(`window.location.hash = '#/main';`);
        });
    } else {
        mainWindow.webContents.openDevTools();
        mainWindow.loadURL('http://localhost:5173/#/main');
    }

    mainWindow.on('ready-to-show', () => {
        // Watch journals in realtime updates
        const state = getState();
        watchJournalChanges(mainWindow, state.journalFolder);
    });


    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createSplashScreen();

    setTimeout(() => {
        splashWindow.close();
        createWindow();

    }, 3000);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

function createDefaultState(state) {
    // First check for user local state, then for commodityConfig
    if (!state) {
        setState({
            theme: 'jet',
            commodityConfig: {},
            activeCommander: {
                active: [],
                completed: [],
            },
            journalFolder: path.join(
                process.env.HOME || process.env.USERPROFILE || '',
                'Saved Games',
                'Frontier Developments',
                'Elite Dangerous'
            )
        });
    }

    if ((state && !state.commodityConfig) ||
        (state && Object.keys(state.commodityConfig).length === 0)
    ) {
        // If commodity doesn't exist, set it with default config
        setState({
            commodityConfig: commodityData
        });
    }

    if (!state || state && !state.userCargo) {
        setState({
            cargoData: {}
        });
    }
}

// REGISTER ELECTRON FUNCTIONS
ipcMain.handle('get-mission-details', async () => {
    return getMissionDetails();
});

ipcMain.handle('get-config', async () => {
    return getConfig();
});
ipcMain.handle('update-config', async (event, data) => {
    return updateConfig(data);
});

ipcMain.handle('set-state', async (event, data) => {
    return setState(data);
});
ipcMain.handle('get-state', async () => {
    return getState();
});
ipcMain.handle('choose-journal', async () => {
    let dir = dialog.showOpenDialog({ properties: ["openDirectory"] });
    return dir;
})