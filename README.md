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
  1.1 进入网站 www.iconfont.cn 搜索下载svg格式图标	<br/>
  1.2 登陆 https://icomoon.io/app   新建集合 new empty set  然后导入下载的svg文件	<br/>
  1.3 选中图标，点击generate font 然后下载，保留fonts文件夹和style.css文件到项目中	<br/>
  1.4 通过import方式引用，通过class  icon-xxx 使用	<br/>

### 2 项目依赖包
` npm i vuex epubjs vue-router node-sass sass-loader --save-dev`


### 3 准备web字体
```
    @font-face {
        font-family:'Cabin';       //字体名称
        font-style:normal;          //字体样式：斜体/正常
        font-weight:400;            //字体粗细
        src: url('cabin.woff2') format('woffw');    //字体文件路径 字体文件格式
        unicode-range:.....             //unicode范围
    }
```
字体文件来源  
通过 fonts.googleapis.com/css？family=Tangerine:bold,bolditalic|lnconsolata:italic|Droid+Sans 这个网址配置并找到我们想要的字体	<br/>

使用web字体  
通过link方式引入或者通过import方式在mainjs中全局引入

### 4 viewport配置和rem设置
`<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no">`  
maximum-scale=1.0 ----- 最大缩放比例1.0  
minimum-scale=1.0 ----- 最小缩放比例1.0  
user-scalable=no ------ 不允许用户进行缩放  

rem设置  
```
//app.vue中
document.addEventListener('DOMContentLoaded', () => {
    let fontSize = window.innerWidth / 10
    fontSize = fontSize > 50 ? 50 : fontSize
    const html = document.querySelector('html')
    html.style.fontSize = fontSize + 'px'
  })
```

### 5 初始化样式
5.1 通过复制 https://meyerweb.com/eric/tools/css/reset 创建本地 reset.scss文件  
并增加内容 `html,body{width:100%;height:100%;user-select:none(不许常按);overflow:hidden;font-family:'xxx'}`  
5.2 创建global.scss文件
```
@import "./reset"

$ratio: 375 / 10;
@function px2rem($px){
    @return $px / $ratio + rem;
}
```
页面中使用
```
@import "./assets/global.scss"

.text{
font-size:px2rem(20)
}
```

### 6 nginx搭建静态资源服务器
1 brew install nginx  
2 启动nginx--- sudo nginx；关闭nginx sudo nginx -s stop ；重启nginx sudo nginx -s reload；测试nginx nginx -t
3 查看nginx配置文件 sudo vim /usr/local/etc/nginx/nginx.conf  
4 创建自己的server
```
server {      
        listen 8081;
        server_name resouce;
        root /Users/qiufeng/desktop/resource;
        autoindex on;   
        location / {
            add_header Access-Control-Allow-Origin *;   //允许跨域
        }
        add_header Cache-Control "no-cache, must-revalidate";   //不做缓存
    }
```


## 阅读器功能开发
### 阅读器解析和渲染
1 引入阅读器```import Epub from 'epubjs'
global.ePub = Epub```  
2 解析并渲染
```
initEpub(){
    const url = 'http://localhost:8081/epub/'+this.fileName //获取路径
    //渲染电子书
    this.book = new Epub(url)    //创建电子书实例
    this.rendition = this.book.renderTo('read',{  //配置宽高
        width:innerWidth,
        height:innerHeight,
        method:'defult'
    })
    this.rendition.display()  //执行渲染
    console.log(this.book)
}
```
### 阅读器翻页功能
1 绑定方法到rendition,获取x轴偏移量和滑动时间 
```
this.rendition.on('touchstart',event=>{   //通过on方法将事件绑定到渲染上
    console.log(event)
    this.touchStarX = event.changedTouches[0].clientX;
    this.touchStartTime = event.timeStamp
})
this.rendition.on('touchend',event=>{
    console.log(event)
    const offsetX = event.changedTouches[0].clientX - this.touchStarX
    const time = event.timeStamp - this.touchStartTime
    if(time<500 && offsetX>40){
        this.prevPage()
    }else if(time<500 && offsetX <-40){
        this.nextPage()
    }else{
        this.toggleTitleAndMenu()
    }
    // event.preventDefault();
    event.stopPropagation();
})
```  
2 调用rendition提供的prev()和next()
```
nextPage(){
    if(this.rendition){
        this.rendition.next()
    }
},
prevPage(){
    if(this.rendition){
        this.rendition.prev()
    }
},
```

### 通过vue mixin机制实现组建间解耦和复用
1 大量重复代码影响开发效率不利于修改  
```
import { mapGetters } from 'vuex'
export default {
    computed:{
        ...mapGetters(['menuVisible'])
    },
```
2 创建/utils/mixin.js 将重复代码放入，并导出
```
import { mapGetters } from 'vuex'
export const ebookMixin = {
    computed: {
        ...mapGetters([
            'fileName',
            'menuVisible'
        ])
    },
}
```
3 通过vue mixin机制 引入代码
```
import { mapGetters, mapActions } from 'vuex'
export const ebookMixin = {
    computed: {
        ...mapGetters([
            'fileName',
            'menuVisible'
        ])
    },
    methods: {
        ...mapActions(['setMenuVisible'])
    },
}
```

### vue cli 中在客户端代码中使用环境变量
1. 创建文件 .env.development
`VUE_APP_RES_URL = http://localhost:8081`  
2. 在组件中引入
```
this.rendition.hooks.content.register(contents=>{
    Promise.all([
        contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`),
        contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/cabin.css`),
        contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`),
        contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`)
    ]).then(()=>{})  
})
```

### 通过localstorage实现离线存储
1. 安装`npm i --save web-storage-cache`---将传入的字符串变成json存储  
2. 在utils文件夹中创建localStorage.js 引入 web-storage-cache 封装对localstorage的操作  
3. 
```
import Storage from 'web-storage-cache'

const localStorage = new Storage()

export function setLocalStorage(key, value) {
    return localStorage.set(key, value)
}

export function getLocalStorage(key) {
    return localStorage.get(key)
}

export function removeLocalStorage(key) {
    return localStorage.delete(key)
}
```  
4. 使用
```
import { getLocalStorage, setLocalStorage } from '../../utils/localStorage'

mounted(){
    setLocalStorage(this.fileName,this.defaultFontFamily)
    console.log(getLocalStorage(this.fileName))
},
```  
5. 优化localstorage存储,将书籍对应的字体字号等属性存到一个key下
```
export function setBookObject(fileName, key, value) {
    let book = getLocalStorage(`${fileName}-info`)
    if (!book) {
        book = {}
    }
    book[key] = value
    setLocalStorage(`${fileName}-info`, book)
}

export function getBookObject(fileName, key) {
    let book = getLocalStorage(`${fileName}-info`)
    if (book) {
        return book[key]
    } else {
        return null
    }
}
```
| :Key: | :Value: |
| :History/2013_Book_FungalDiseaseInBritainAndTheUn.epub-info: | :{"c":1604412057344,"e":253402300799000,"v":"{\"fontFamily\":\"Cabin\"}"}: |


### 国际化
1. 在src目录下创建leng文件夹，放入cn.js en.js
```
cn.js
const messages = {
  home: {
    title: '书城',
    hint: '计算机科学和软件工程',
    guessYouLike: '猜你喜欢',
    change: '换一批',
  }
}
export default messages

en.js
const messages = {
  home: {
    title: 'Book Store',
    hint: 'Computer Science And Software Engineering',
    guessYouLike: 'Guess You Like',
  }
}
export default messages
```  
2. npm i --save vue-i18n 安装vue-i18n lang文件夹下创建index.js---余下操作类似路由，在main.js中引入并挂载
```
import Vue from 'vue'
import VueI18N from 'vue-i18n'
import en from './en'
import cn from './cn'
import { getLocale, saveLocale } from '../utils/localStorage'

Vue.use(VueI18N)  //运用插件，加载插件

const messages = {
  en,
  cn
}

let locale = getLocale()
if (!locale) {
  locale = 'cn'
  saveLocale(locale)
}

const i18n = new VueI18N({ //实例化i8n
  locale,
  messages
})

export default i18n
```  
3. 使用`<span class="icon-down2">{{$t('book.selectFont')}}</span>`








