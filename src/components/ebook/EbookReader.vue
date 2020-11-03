<template>
  <div class="ebook-reader">
    <div id="read"></div>
  </div>
</template>

<script>
// import { mapActions }  from 'vuex'
import Epub from 'epubjs'
global.ePub = Epub
import { ebookMixin } from '../../utils/mixin.js'
import { getFontFamily,saveFontFamily,getFontSize,saveFontSize,getTheme,
    saveTheme, } from '../../utils/localStorage.js'

export default {
    mixins:[ebookMixin],
    methods:{
        // ...mapActions(['setMenuVisible']),
        nextPage(){
            if(this.rendition){
                this.rendition.next()
                this.hideTitleAndMenu()
            }
        },
        prevPage(){
            if(this.rendition){
                this.rendition.prev()
                this.hideTitleAndMenu()
            }
        },
        toggleTitleAndMenu(){
            // console.log('ok')
            // this.$store.dispatch('setMenuVisible',!this.menuVisible)
            
           
            if(this.menuVisible){
                this.setSettingVisible(-1)
                this.setFontFamilyVisible(false)
            }
            this.setMenuVisible(!this.menuVisible);
        },
        hideTitleAndMenu(){
            // this.$store.dispatch('setMenuVisible',false)
            this.setMenuVisible(false)
            this.setSettingVisible(-1)
            this.setFontFamilyVisible(false)
        },
        initTheme() {
            let defaultTheme = getTheme(this.fileName)
            if (!defaultTheme) {
                defaultTheme = this.themeList[0].name
                saveTheme(this.fileName, defaultTheme)
            }
            this.setDefaultTheme(defaultTheme)
            this.themeList.forEach(theme => {
                this.rendition.themes.register(theme.name, theme.style)
            })
            this.rendition.themes.select(defaultTheme)
        },
        //第一次进入设置默认字号
        initFontSize() {
            let fontSize = getFontSize(this.fileName)
            if (!fontSize) {
                saveFontSize(this.fileName, this.defaultFontSize)
            } else {
                this.rendition.themes.fontSize(fontSize)
                this.setDefaultFontSize(fontSize)
            }
        },
        //第一次进入设置默认字体
        initFontFamily() {
            let font = getFontFamily(this.fileName)
            if (!font) {
                saveFontFamily(this.fileName, this.defaultFontFamily)
            } else {
                this.rendition.themes.font(font)
                this.setDefaultFontFamily(font)
            }
        },
        initEpub(){
            const url = 'http://localhost:8081/epub/'+this.fileName
            //渲染电子书
            this.book = new Epub(url)
            this.setCurrentBook(this.book)
            this.rendition = this.book.renderTo('read',{
                width:innerWidth,
                height:innerHeight,
                // method:'continuous',
            })
            this.rendition.display().then(()=>{
                this.initTheme()
                this.initFontSize()
                this.initFontFamily()
                this.initGlobalStyle()
            })
            console.log(this.book)
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
            this.rendition.hooks.content.register(contents=>{
                Promise.all([
                    contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`),
                    contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/cabin.css`),
                    contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`),
                    contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`)
                ]).then(()=>{})  
            })
        }
    },
    mounted(){
        const baseUrl = 'http://localhost:8081/'   //资源服务器地址
        // History|2015_Book_PlantSelectionForBioretentionS
        const fileName = this.$route.params.fileName.split('|').join('/')
        //获取路由参数的名字---电子书名字
        console.log(`${baseUrl}${fileName}.epub`)
        //电子书所对应资源服务器文件路径
        this.$store.dispatch('setFileName',fileName).then(()=>{
            this.initEpub()
        })
    }

}
</script>

<style lang="scss" scoped>
.hello{
  color:red
}
</style>
