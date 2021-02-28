# Overview

基于sqlite的检索工具

+ 可对本地的sqlite数据库检索, 并将数据持久化
+ 对检索条件进行GUI结构化, 适用于不会写sql语句的用户
+ 数据的结构可通过fieds.json定义
    - windows下fields.json的路径为当前目录
    - macOS下fields.json的路径为/Users/xxx/.retriever/fields.json
    - 运行前请确保fields.json存在
    - 如fields.json中的数据库结构更改, 请删除旧的数据库文件后重新导入
+ 当fields.json中admin为true时开启管理员模式, 可以增删改任何数据

![avatar](/img/gif.gif)

# Build

```
git clone https://github.com/samlior/retriever.git
cd retriever
cnpm i
cd page-main
yarn
yarn build
cd ../page-add-conditon
yarn
yarn build
cd ../page-update
yarn
yarn build
cd ..
npm start
```
为什么用cnpm安装包呢? 因为sqlite3这个库用npm安装不了-_-, 有懂的大佬还请指教