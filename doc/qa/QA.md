# 常见问题集

## Nginx相关
### 错误1：nginx启动失败
- 原因：配置文件中listen拼写错误，出现原因在于对Nginx不够熟悉，所以大家在实际配置过程中一定要细心
- 解决：正常拼写问题解决

### 错误2：nginx启动后提示500
- 原因：操作系统将root的路径`Desktop\resource`识别成`Desktopsource`，系统认为`\r`是一个分隔符
- 解决：将resource目录改名为html（其他名称也行），问题解决
- 排查技巧：通过`logs/error.log`错误日志进行问题定位

### 错误3：nginx启动后提示10013错误
- 原因：nginx设置的端口号被占用
- 解决：将被占用端口号对应的应用关闭，或者修改nginx的端口号即可
- 特别提醒：新版macOS操作系统，处于对安全的考虑，已经不允许开放80端口，请设置其他端口号

### 错误4：vue下载nginx中资源时出现跨域错误
- 原因：nginx没有进行cors跨域设置
- 解决：在nginx配置文件中添加跨域设置
```
location / {
    add_header Access-Control-Allow-Origin *;
}
```
其中`location /`匹配了所有的路由，`add_header`在响应的头部添加跨域设置即可解决这个问题

### 错误5：在Nginx中添加了如下的跨域设置，但是通过vue访问Nginx中的文件时，仍然会提示跨域错误
```
location / {
    add_header Access-Control-Allow-Origin *;
}
```
- 原因：打开Network，仔细观察请求，会发现资源文件后会带有`from disk`的提示，表示本次请求直接从磁盘获取缓存文件，没有请求Nignx获取文件，如果不通过Nginx请求，会导致add_header语句无法执行
- 解决：添加如下配置，设置不使用缓存即可
```
add_header Cache-Control "no-cache, must-revalidate";
```

## Nodejs相关
### 错误1：windows执行nvm install提示写入失败
- 原因：windows下将nvm安装到Program Files下，而当前登录用户没有对Program Files写入权限导致
- 解决：将nvm卸载，并重新安装到当前登录用户的目录下即可（按默认安装路径就行），这样当前登录用户对nvm就有写入权限了
- 排查技巧：识别权限设置，从权限角度入手考虑

## Git相关
### 错误1：git下载源码时提示Authentication failed
- 原因：git认证失败
- 解决：使用慕课网登录的用户名和密码来访问git


## 开发相关
### 错误1：EbookSlideContents获取metadata.title失败
- 原因：metadata通过异步方式解析获取，在vue渲染dom时metadata的值还没有生成，而其初始值为null
- 解决：增加metadata是否为null的判断即可
```html
<div class="slide-contents-book-title">{{metadata ? metadata.title : ''}}</div>
<div class="slide-contents-book-author">{{metadata ? metadata.creator : ''}}</div>
```

### 错误2：EbookReader中初始化手势没有生效
- 原因：渲染方法中增加了method属性导致，该属性在最新版本的epubjs中已经废弃，但是微信中正常显示必须加入该属性，在后续课程中有另外的实现方式实现翻页
- 解决：将渲染方法中的`method:'default'`注释即可
```javascript
this.rendition = this.book.renderTo('read', {
  width: window.innerWidth,
  height: window.innerHeight
  // method: 'default'
})
```

### 错误3：手势操作时提示`Unable to preventDefault inside passive event listener invocation.`
- 原因：手势操作默认开启事件的被动模式，在该模式下preventDefault会被忽略，所以抛出这个错误
- 解决：去掉preventDefault即可
```javascript
this.rendition.on('touchend', event => {
  // ...
  // event.preventDefault()
  event.stopPropagation()
})
```

### 错误4：国际化vue-i18n没有效果，提示：Cannot translate the value of keypath 'xxx'
- 原因：没有找到指定的key
- 解决：检查messages参数，注意拼写错误，因为键值对由messages参数管理
```javascript
const i18n = new VueI18n({
  locale,
  messages
})
```

### 错误5：EbookMenu中的按钮点击事件不生效，点击后菜单会隐藏，不能正确响应
- 原因：EbookMenu组件的z-index小于EbookReader组件mask的z-index，导致浏览器响应mask的点击事件，而没有响应EbookMenu的事件
- 解决：将EbookMenu组件的z-index设置大于EbookReader组件mask的z-index
