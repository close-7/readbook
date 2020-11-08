import Vue from 'vue'
import Router from 'vue-router'
import Ebook from './views/ebook/index'
import EbookReader from './components/ebook/EbookReader'
import Store from './views/store/index'
import StoreShelf from './views/store/StoreShelf'
import StoreCategory from './views/store/StoreCategory'
import StoreHome from './views/store/StoreHome'
import StoreList from './views/store/StoreList'
import StoreDetail from './views/store/StoreDetail'
import StoreSpeaking from './views/store/StoreSpeaking'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/store'
    },
    {
      path: '/ebook',
      component: Ebook,
      children: [
        {
          path: ':fileName',
          component: EbookReader
        }
      ]
    },
    {
      path: '/store',
      component: Store,
      redirect: '/store/shelf',
      children: [
        {
          path: 'shelf',
          component: StoreShelf
        },
        {
          path: 'category',
          component: StoreCategory
        },
        {
          path: 'home',
          component: StoreHome
        },
        {
          path: 'list',
          component: StoreList
        },
        {
          path: 'detail',
          component: StoreDetail
        },
        {
          path: 'speaking',
          component: StoreSpeaking
        }
      ]
    }
  ]
})
