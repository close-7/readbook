# readbook
vue全家桶+epub 阅读器

## 阅读器原理--epub
1. 在METE-INF文件中找到containe.xml
2. 根据containe文件中，rootfile标签的full-path属性找到对应文件路径，也就是content.opf文件
3. content.opf文件中

    metadata-电子书的基本信息，
    
    menifest-电子书对应的所有资源文件及路径，
    
    spine-电子书的排列顺序，spine标签的toc属性对应电子书的目录，
    
    guide-电子书指南信息

#### epubjs阅读器引擎
基于JavaScript的epub引擎：https://github.com/futurepress/epub.js

##### epubjs 核心类
- Book---完成了阅读器的解析
- Rendition---实现阅读的渲染
- Locations---负责阅读器的定位
- Navigation---存储了目录信息
- View Manager---负责阅读器渲染出来的视图管理
- EpubCFI---利用epub的cfi标准实现文字级别的定位


## 项目准备工作
### 1 字体图标准备
-1.1 进入网站 www.iconfont.cn 搜索下载svg格式图标
-1.2 登陆 https://icomoon.io/app   新建集合 new empty set  然后导入下载的svg文件
-1.3 选中图标，点击generate font 然后下载，保留fonts文件夹和style.css文件到项目中
-1.4 通过import方式引用，通过class  icon-xxx 使用

### 2 项目依赖包
` npm i vuex epubjs vue-router node-sass sass-loader --save-dev`




