# 专注果园

专注果园是一个番茄钟学习应用，包含 Flutter Material 3 Android 版和 Electron Windows 桌面版。应用用植物成长来呈现专注进度，完成学习后可以收获植物，并支持学习计划、历史记录、黑白/深色模式切换，以及 Android 宽通知桌宠。

## 功能概览

- 专注计时：开始、暂停、重置当前学习任务。
- 植物成长：专注时植物逐步从种子成长到成熟。
- 植物收藏：成熟后可收获并加入收藏柜。
- 学习计划：添加、完成、删除学习计划。
- 历史记录：记录完成的专注会话。
- 番茄模式：支持单番茄钟、循环多番茄钟、自定义番茄钟。
- 主题切换：支持跟随系统、浅色、深色模式。
- Android 高级通知：通知图片作为桌宠，通知文字显示倒计时。
- Windows 桌宠：桌面版保留原有桌宠窗口和托盘体验。

## 已生成产物

### Android 正式签名 APK

```text
build\app\outputs\flutter-apk\app-release.apk
```

当前已验证：

- APK 已成功构建。
- APK 已通过 `apksigner verify` 验证。
- 签名方案：APK Signature Scheme v2。
- 应用名：专注果园。
- 图标：桌面版同款番茄图标。

### Windows 安装包

```text
dist\专注果园 Setup 1.1.2.exe
```

### Windows 解包版可执行文件

```text
dist\win-unpacked\专注果园.exe
```

说明：Windows 版当前使用原 Electron 桌面目标构建，因为本机缺少 Flutter Windows 原生构建所需的 Visual Studio C++ 工具链。

## Android 构建

### 环境要求

- Flutter 3.41.5 或兼容版本。
- JDK 17。
- Android SDK。
- Android NDK `28.2.13676358`。
- Android Build Tools。

本机当前使用的工具链位于：

```text
C:\Users\DnepsMas\tools\focarm-build
```

### 安装依赖

```powershell
flutter pub get
```

### 检查代码

```powershell
flutter analyze
flutter test
```

### 构建 debug APK

```powershell
flutter build apk --debug
```

输出路径：

```text
build\app\outputs\flutter-apk\app-debug.apk
```

### 构建正式签名 APK

```powershell
flutter build apk --release
```

输出路径：

```text
build\app\outputs\flutter-apk\app-release.apk
```

### 验证 APK 签名

```powershell
apksigner verify --verbose --print-certs build\app\outputs\flutter-apk\app-release.apk
```

## Android 签名证书

签名证书和签名配置保存在仓库外：

```text
C:\Users\DnepsMas\tools\focarm-build\signing\focarm-release.jks
C:\Users\DnepsMas\tools\focarm-build\signing\focarm-release.properties
```

请备份整个 `signing` 目录。以后更新同一个 Android 包名必须继续使用同一套 keystore，否则系统会认为这是不同签名的应用，无法覆盖安装。

不要把签名配置文件或 keystore 提交到 git。

## Windows 桌面版构建

### 安装依赖

```powershell
npm install
```

### 启动开发版

```powershell
npm start
```

### 构建安装包

```powershell
npm run dist
```

输出路径：

```text
dist\专注果园 Setup 1.1.2.exe
dist\win-unpacked\专注果园.exe
```

## 主要目录

```text
lib\                         Flutter 应用源码
lib\domain\                  领域模型：植物、番茄模式、会话状态
lib\features\                页面功能：专注、计划、收藏、历史、设置
lib\services\                本地存储和 Android 通知桥接
android\                     Flutter Android 平台工程
windows\                     Flutter Windows 平台工程文件
assets\images\plants\        植物成长图片
assets\icons\icon.png        应用图标源图
assests\                     Electron 桌面版图标资源
dist\                        Electron Windows 构建产物
build\app\outputs\           Flutter APK 构建产物
```

## 安装到 Android 设备

连接设备并开启 USB 调试后运行：

```powershell
adb install -r build\app\outputs\flutter-apk\app-release.apk
```

## 注意事项

- Android 版是 Flutter Material 3 重构版。
- Windows 版是 Electron 桌面版构建，已改名为“专注果园”。
- 如果要构建 Flutter 原生 Windows 版，需要先安装 Visual Studio C++ 桌面开发工具链。
- Kotlin 版本当前会出现即将弃用提示，但不影响当前 APK 构建。