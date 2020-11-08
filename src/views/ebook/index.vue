<!-- 阅读器组件 -->
<template>
  <div class="ebook" ref="ebook">
    <!-- 电子书页眉组件 -->
    <ebook-header></ebook-header>
    <!-- 阅读器标题组件 -->
    <ebook-title></ebook-title>
    <!-- 阅读器组件 -->
    <ebook-reader></ebook-reader>
    <!-- 阅读器菜单组件 -->
    <ebook-menu></ebook-menu>
    <!-- 阅读器书签组件 -->
    <ebook-bookmark></ebook-bookmark>
    <!-- 电子书页脚组件 -->
    <ebook-footer></ebook-footer>
  </div>
</template>

<script>
  import EbookReader from '../../components/ebook/EbookReader'
  import EbookTitle from '../../components/ebook/EbookTitle'
  import EbookMenu from '../../components/ebook/EbookMenu'
  import EbookBookmark from '../../components/ebook/EbookBookmark'
  import EbookHeader from '../../components/ebook/EbookHeader'
  import EbookFooter from '../../components/ebook/EbookFooter'
  import { getReadTime, saveReadTime } from '../../utils/localStorage'
  import { ebookMixin } from '../../utils/mixin'

  export default {
    mixins: [ebookMixin],
    components: {
      EbookReader,
      EbookTitle,
      EbookMenu,
      EbookBookmark,
      EbookHeader,
      EbookFooter
    },
    watch: {
      // 监听用户下拉屏幕时滚动条的y轴数值
      offsetY(v) {
        // 判断如果菜单栏没有处于显示状态（如果菜单栏显示，优先响应菜单栏事件）
        // 并且电子书已经解析完毕（未解析完毕时无法获取currentLocation）
        if (!this.menuVisible && this.bookAvailable) {
          if (v > 0) {
            // 向下拉动屏幕时，调用move方法
            this.move(v)
          } else if (v === 0) {
            // y轴为0时，调用restore方法让屏幕回弹，松手时屏幕是无法自动回弹的，必须自己实现
            this.restore()
          }
        }
      }
    },
    methods: {
      restore() {
        // 将组件还原回原位
        this.$refs.ebook.style.top = 0
        // 设置过渡动画，产生回弹效果
        this.$refs.ebook.style.transition = 'all .2s linear'
        setTimeout(() => {
          // 200毫秒动画结束后，将过渡动画关闭，否则在下拉时也会产生过渡动画
          this.$refs.ebook.style.transition = ''
        }, 200)
      },
      move(v) {
        // 向下拉动屏幕时，组件随之移动
        this.$refs.ebook.style.top = v + 'px'
      },
      startLoopReadTime() {
        // 获取阅读时间
        let readTime = getReadTime(this.fileName)
        if (!readTime) {
          // 如果阅读时间不存在，则进行重置
          readTime = 0
        }
        // 开启定时任务，每秒更新一次阅读时间，每30秒记录一次阅读时间
        this.task = setInterval(() => {
          readTime++
          if (readTime % 30 === 0) {
            saveReadTime(this.fileName, readTime)
          }
        }, 1000)
      }
    },
    mounted() {
      // 开启记录阅读时间的定时任务
      this.startLoopReadTime()
    },
    beforeDestroy() {
      if (this.task) {
        // 关闭定时任务
        clearInterval(this.task)
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";

  .ebook {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
