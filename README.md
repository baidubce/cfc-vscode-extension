# Baidu Serverless VSCode Extension

Baidu Serverless VSCode Extension 是百度云 Serverless 产品 CFC 的 VSCode 插件，该插件结合了 CFC 本地命令行工具 BSAM CLI，可以帮您快速创建、管理本地的 CFC 函数，同时借助 Docker 轻松实现函数在本地的执行和 Debug。

## 功能概览

  * 本地函数快速创建
  * 本地函数的编译与依赖安装
  * 本地函数执行
  * Nodejs、Python、Java 函数本地 Debug
  * 本地函数部署到云端
  * 自定义测试事件的创建
  * 多地域云端函数列表、下载
  * 云端函数调用

## 安装与设置

  1. 创建您的[百度云账号](https://cloud.baidu.com/)，并在个人信息的[『安全认证』](https://console.bce.baidu.com/iam/#/iam/accesslist)中创建一个 Access Key;
  2. 执行 `pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple bce-sam-cli` 以安装 BSAM CLI。插件在启动时也会检测 BSAM CLI 是否已安装，您可根据插件的提示来操作安装；
  3. 安装 Docker。您可访问 [Docker 官网](https://www.docker.com/get-started)，根据您的操作系统下载不同的安装包进行安装。

## 本地函数功能

### 函数创建

进入插件面板，在『本地函数』栏点击『···』，并选择『创建函数』，根据弹窗的提示步骤即可完成本地函数的创建，函数默认存储路径为当前打开的工作空间的根目录。新函数均使用模板代码，您可在函数创建后修改函数的代码与配置。

<img src="https://pic.rmb.bdstatic.com/bjh/f94cf4e9eafd06fa1fe68d328583564c.png" width = "553" height = "200" alt="创建函数" align=center />

以 NodeJS 函数为例，创建后的目录结构如下：

```bash
.
├── README.md
├── src                         <-- 源文件文件夹，存放函数源码和依赖库
│   ├── index.js                <-- nodejs 函数源码
│   ├── package.json            <-- nodejs 依赖管理文件
│   └── tests                   <-- 单元测试
│       └── unit
│           └── test_handler.js
└── template.yaml               <-- BSAM 模型文件，存储函数配置信息
```

函数创建完成后，您可在『本地函数』栏中看到新创建的函数，每行函数均有快捷功能图标，如下图所示。

<img src="https://pic.rmb.bdstatic.com/bjh/0e18eb93bd5c09e5bea6d298db79e72d.png" width = "528" height = "328" alt="本地函数图标" align=center />

### 依赖安装与编译
函数执行前可能需要下载依赖包和执行编译，CFC 函数的执行环境是 Linux，您在本地下载的依赖和编译结果可能与 CFC 执行环境不兼容。为了避免这一情况，本插件集成了依赖安装与编译功能，您无需手动为函数来安装依赖与编译。
在『本地函数』栏对某个函数点击右键，选择『安装依赖与编译』，插件即会根据函数的运行时类型来做相关的操作。

### 自定义测试事件
插件集成了 CFC 云端所有触发器事件，若您想用自定义测试事件来执行函数，您可以在『本地函数』栏对某个函数点击右键，选择『创建测试事件』，根据弹窗提示在本地创建一个测试文件，创建完成后您可自行修改该文件，在执行函数时选择该事件。 

### 函数执行与 Debug
为了保证函数能够执行与 Debug，请您确定您已安装 Docker 并启动。
执行函数有两种方式，一种是通过点击『本地函数』栏函数所在行的执行图标，一种是在函数代码编辑框中，点击 handler 函数上方的 "Local Invoke"。

Debug 函数同样可使用这两种方式启动，您需要首先在函数文件中添加断点，才可启动 Debug。插件目前支持 NodeJS、Python 和 Java 函数的 Debug 功能。

<img src="https://pic.rmb.bdstatic.com/bjh/9cae932988108fe36535b84d54017294.png" width = "450" height = "150" alt="codelens" align=center />

### 函数部署
若您已登录云端账号，在『本地函数』栏对某个函数点击右键，选择『上传函数』，即可将函数部署到 CFC 云端。若您尚未登录，请您先参考下面的云端账号功能进行登录。

## 云端函数功能

### 云端账号
如下图所示，在『云端函数』栏点击『···』，并选择『绑定新账户』，根据提示输入您账号的 AK、SK 及自定义别名。

<img src="https://pic.rmb.bdstatic.com/bjh/46cb341fb84ba97a13c237cd3cb4634d.png" width = "544" height = "176" alt="绑定账号" align=center />

您可以绑定多个账户，通过『切换账户』来使用不同的账户，通过『切换地域』来显示当前账号下对应区域的云端函数列表。

### 云端函数执行与下载
在绑定好百度云账户后，『云端函数』栏会显示您的云端函数列表，如下图所示。

<img src="https://pic.rmb.bdstatic.com/bjh/7be69ff201c16843d36803aaf8720641.png" width = "677" height = "193" alt="云端函数图标" align=center />

您可点击执行图标来调用云端函数，点击下载图标来把云端函数下载到本地目录。对非编译型语言，比如 NodeJS、Python 等，下载后插件会自动为函数生成 Template.yaml 文件。但是对编译型语言 Java、Golang 等，由于下载结果可能不包含函数源码文件，因此不为其生成 .yaml 文件。

## 用户配置项
您可在 VSCode 的 Settings->Extensions->BCE Serverless Configuration 中查看插件的配置项，如图所示。

<img src="https://pic.rmb.bdstatic.com/bjh/14a15956fb6ebf5c93eac00a99862116.png" width = "560" height = "200" alt="配置" align=center />

- *Bsam Cli Location*： 默认情况下，插件会在您的 `$PATH` 路径下查找 BSAM CLI 的可执行文件，一般情况下您通过 pip3 安装后无需手动配置该项。若您安装在非 `$PATH` 路径下，您可修改该配置。
- *插件日志*： 在您对插件的操作过程中，相关的日志会输出到 VSCode OUTPUT 的 "BaiduBCE CFC" 中。默认日志输出 Level 为 INFO，您可在 Log Level 项中修改 Level。
- *Deploy Endpoint*：在您配置了云端函数的地域后，该配置会自动切换为对应地域的域名。若您期望把函数部署到私有服务地址，可修改该配置。

- *Max Detect Depth*：插件会在当前工作空间下的路径下查找函数，该项用于配置查找函数的路径深度。
- *Skip Pull Image*：默认情况下，插件每次执行、Debug 函数时会从百度镜像仓库检查镜像是否有更新，若有更新则更新后再继续执行。检查操作会耗费一点时间，若您网络状况不好或期望能快速执行函数，可以勾选此项。

## 开发指南
### 快速开始

使用 VSCode 打开项目代码，按 `F5` 或执行菜单项 `Run->Start Debugging` 即可在本地启动插件。

### 测试

```
# 安装依赖
npm install

# 执行测试用例
npm test
```

### 如何贡献
请采用 typescript 编写，所有合理的改动、修复、测试用例或者文档的提交都会被接收。

### 维护者
[xinglsh6937](https://github.com/xinglsh6937)

### 讨论
百度如流讨论群: 3254091