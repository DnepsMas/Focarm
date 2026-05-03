const { app, BrowserWindow, ipcMain, Tray, Menu, Notification, screen } = require('electron');
const path = require('path');

let mainWindow;
let petWindow; // 桌宠窗口
let tray = null;
let isPetVisible = true; // 默认显示桌宠

function createWindow() {
   const iconPath = process.platform === 'win32' 
    ? path.join(__dirname, 'assests', 'icon.ico')  // Windows 使用 .ico
    : path.join(__dirname, 'assests', 'icon.png'); // macOS/Linux 使用 .png
  mainWindow = new BrowserWindow({
    width: 420,
    height: 750,
    minWidth: 400,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      backgroundThrottling: false,
    },
    titleBarStyle: 'default',
    autoHideMenuBar: true,
    resizable: true,
    focusable: true,
    show: false,
    frame: true,
    minimizable: true,
    // 添加这些选项来防止滚动条
    icon: iconPath, // 设置窗口图标
    useContentSize: true,
    // 可选：设置最小尺寸避免内容被裁剪
    minWidth: 400,
    minHeight: 600
  });
    // 加载后执行 JavaScript 来隐藏滚动条
      mainWindow.webContents.on('dom-ready', () => {
        mainWindow.webContents.executeJavaScript(`
          // 强制隐藏所有滚动条
          const style = document.createElement('style');
          style.textContent = \`
            * {
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
            }
            *::-webkit-scrollbar {
              width: 0 !important;
              height: 0 !important;
              display: none !important;
            }
            body {
              overflow: hidden !important;
            }
          \`;
          document.head.appendChild(style);
        `);
      });

      mainWindow.loadFile('index.html');
      
  mainWindow.on('ready-to-show', () => {
    mainWindow.focus();
    mainWindow.show();
    // 主窗口显示时隐藏桌宠
    if (petWindow) {
      petWindow.hide();
    }
  });
  
  mainWindow.on('minimize', () => {
    console.log('窗口已最小化');
    // 主窗口最小化时显示桌宠
    if (petWindow && isPetVisible) {
      petWindow.show();
    }
  });
  
  mainWindow.on('restore', () => {
    console.log('窗口已恢复');
    mainWindow.focus();
    // 主窗口恢复时隐藏桌宠
    if (petWindow) {
      petWindow.hide();
    }
  });

  mainWindow.on('show', () => {
    // 主窗口显示时隐藏桌宠
    if (petWindow) {
      petWindow.hide();
    }
  });

  mainWindow.on('hide', () => {
    // 主窗口隐藏时显示桌宠
    if (petWindow && isPetVisible) {
      petWindow.show();
    }
  });

  // 监听窗口关闭事件，隐藏窗口而不是关闭
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      showTrayNotification();
      return false;
    }
    return true;
  });
}

// 创建桌宠窗口
function createPetWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  petWindow = new BrowserWindow({
    width: 200,
    height: 250,
    x: width - 220, // 默认放在右下角
    y: height - 270,
    frame: false, // 无边框
    alwaysOnTop: true, // 始终置顶
    resizable: false,
    skipTaskbar: true, // 不在任务栏显示
    transparent: true, // 透明背景
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      enableRemoteModule: true, // 添加这行以支持 remote 模块
    },
    show: false // 初始不显示，等主窗口隐藏后再显示
  });

  petWindow.loadFile('pet.html');
  
  // 允许拖拽
  petWindow.setIgnoreMouseEvents(false);
  
  petWindow.on('closed', () => {
    petWindow = null;
  });

  // 开发时打开调试工具
  // petWindow.webContents.openDevTools();
}

// 显示系统托盘通知
function showTrayNotification() {
  if (Notification.isSupported()) {
    const trayNotification = new Notification({
      title: '专注果园',
      body: '番茄钟已收入托盘，程序继续在后台运行',
      icon: path.join(__dirname, 'assets', 'icon.png')
    });
    
    trayNotification.show();
    
    trayNotification.on('click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
    
    setTimeout(() => {
      trayNotification.close();
    }, 3000);
  }
}

// 创建系统托盘
function createTray() {
  const iconPath = path.join(__dirname, 'assests', 'icon.png');
  tray = new Tray(iconPath);
  
  tray.setToolTip('专注果园\n点击显示/隐藏窗口');
  
  // 更新托盘菜单
  updateTrayMenu();
  
  // 点击托盘图标切换窗口显示/隐藏
  tray.on('click', () => {
    toggleWindow();
  });
}

// 更新托盘菜单
function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏主窗口',
      click: () => {
        toggleWindow();
      }
    },
    {
      label: '显示桌宠',
      type: 'checkbox',
      checked: isPetVisible,
      click: (menuItem) => {
        isPetVisible = menuItem.checked;
        if (petWindow) {
          if (isPetVisible && !mainWindow.isVisible()) {
            petWindow.show();
          } else if (!isPetVisible) {
            petWindow.hide();
          }
        }
        updateTrayMenu();
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
}

// 切换窗口显示/隐藏
function toggleWindow() {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
    showTrayNotification();
  } else {
    mainWindow.show();
    mainWindow.focus();
    
    const { x, y } = mainWindow.getBounds();
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    
    if (x < 0 || x > screenWidth || y < 0 || y > screenHeight) {
      mainWindow.center();
    }
  }
}

// IPC 通信处理
ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.hide();
    showTrayNotification();
  }
});

// 接收来自主窗口的状态更新
ipcMain.on('update-pet-status', (event, data) => {
  if (petWindow) {
    petWindow.webContents.send('pet-status-update', data);
  }
});
// 接收隐藏桌宠窗口的消息
ipcMain.on('hide-pet-window', () => {
  if (petWindow) {
    petWindow.hide();
    isPetVisible = false;
    updateTrayMenu(); // 更新托盘菜单状态
  }
});

// 应用准备就绪
app.whenReady().then(() => {
  createWindow();
  createPetWindow(); // 创建桌宠窗口
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      createPetWindow();
    }
  });
});

// 所有窗口关闭时（在 macOS 上除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // 不直接退出，等待托盘退出
  }
});

// 应用即将退出时清理
app.on('before-quit', () => {
  app.isQuitting = true;
  if (tray) {
    tray.destroy();
  }
});