<template>
  <div class="ebook-reader">
    <div id="read"></div>
  </div>
</template>

<script>
import Epub from 'epubjs'
import {mapGetters} from 'vuex'
global.ePub = Epub
export default {
    computed:{
        ...mapGetters(['fileName'])
    },
    methods:{
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
        toggleTitleAndMenu(){

        },
        initEpub(){
            const url = 'http://localhost:8081/epub/'+this.fileName
            //渲染电子书
            this.book = new Epub(url)
            this.rendition = this.book.renderTo('read',{
                width:innerWidth,
                height:innerHeight,
                // method:'defult'
            })
            this.rendition.display()
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
