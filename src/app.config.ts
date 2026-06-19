export default defineAppConfig({
  pages: [
    'pages/publish/index',
    'pages/enroll/index',
    'pages/countdown/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#D94B4B',
    navigationBarTitleText: '临招急发',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#D94B4B',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/publish/index',
        text: '急招发布'
      },
      {
        pagePath: 'pages/enroll/index',
        text: '报名确认'
      },
      {
        pagePath: 'pages/countdown/index',
        text: '到店倒计时'
      }
    ]
  }
})
