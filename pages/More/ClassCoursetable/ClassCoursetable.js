// pages/More/ClassCoursetable/ClassCoursetable.js
var app = getApp()
var classNumber = ""
Page({

  /**
   * 页面的初始数据
   */
  data: {
    colorArrays: ["#99CCFF", "#FFCC99", "#FFCCCC", "#CC6699", "#99CCCC", "#FF6666", "#CCCC66", "#66CC99", "#FF9966", "#66CCCC", "#6699CC", "#99CC99", "#669966", "#99CC99", "#99CCCC", "#66CCFF", "#CCCCFF", "#99CC66", "#CCCC99", "#FF9999"],
    loading: false,
    name: "",
    passwd: "",
    autoVcode: false,
    vcode: "",
    count: 0,
    terms: [],
    termsIndex: 0,
    table: undefined,
    tables: [],
    vcodeImage: "",
    cookie: "",
    courseIndex: 0,
    isShowModel: false, //控制弹窗是否显示，默认不显示
    isShowConfirm: false, //是否只显示确定按钮，默认不是
    ModelId: 0, //弹窗id
    ModelTitle: '验证码', //弹窗标题
    ModelContent: '', //弹窗文字内容
    showMoreInformation: false,
    showTopTips: false,
    tips: "",
    enableRefresh: true,
    courseTableRawData: undefined,
    hasData: undefined,
    toRight: undefined,
    showCardsList: undefined,
    cardToIndex: undefined,
    indexToCard: undefined,
    current: 0,
  },
  bindSearchInput(e) {
    classNumber = e.detail.value
  },
  tapSearchButton() {
    this.searchClass(classNumber)
  },
  searchClass(e) {
    var that = this
    app.API.getData("getclasscoursetable", {
      'class': e
    }, (data) => {
      if (data) {
        that.setData({
          table: data
        })
        that.handleMoreData()
      }
    })
  },
  preventTouchMove: function() {},
  closethis: function() {
    this.setData({
      showMoreInformation: false
    })
  },
  showInformation: function(e) {
    this.setData({
      showMoreInformation: true
    })
  },
  showInformationConfirm: function() {
    this.setData({
      showMoreInformation: false
    })
  },
  showModel: function(e) {
    this.setData({
      isShowModel: true,
      ModelContent: e.ModelContent
    })
  },
  handleData: function(e) {
    console.log(e)
    var data = e.data
    var that = this
    var terms = []
    terms[0] = data.term
    that.setData({
      terms: terms,
      table: data.table
    })
    that.handleMoreData()
  },
  handleMoreData: function() {
    var hasData = new Array()
    var toRight = new Array()
    var that = this
    for (var i = 0; i < 8; i++) {
      hasData[i] = new Array()
      for (var j = 0; j < 12; j++) {
        hasData[i][j] = false
      }
    }
    for (var i = 0; i < this.data.table.length; i++) {
      toRight[i] = false
      if (this.data.table[i]["Course_Start"] === '') {
        continue
      }
      var flag = false
      for (var j = Number(this.data.table[i]["Course_Start"]); j < Number(this.data.table[i]["Course_Length"]) + Number(this.data.table[i]["Course_Start"]); j++) {
        if (hasData[Number(this.data.table[i]["Course_Time"])][j]) {
          flag = true
          break
        }
      }
      if (flag) {
        toRight[i] = true
      }
      for (var j = Number(this.data.table[i]["Course_Start"]); j < Number(this.data.table[i]["Course_Length"]) + Number(this.data.table[i]["Course_Start"]); j++) {
        hasData[Number(this.data.table[i]["Course_Time"])][j] = true
      }
    }
    var cardToIndex = []
    var indexToCard = []
    for (var i = 0; i < 8; i++) {
      cardToIndex[i] = new Array()
      for (var j = 0; j < 12; j++) {
        cardToIndex[i][j] = []
      }
    }
    for (var i = 0; i < this.data.table.length; i++) {
      indexToCard[i] = []
      for (var j = Number(this.data.table[i]["Course_Start"]); j < Number(this.data.table[i]["Course_Length"]) + Number(this.data.table[i]["Course_Start"]); j++) {
        indexToCard[i].push({
          "x": Number(this.data.table[i]["Course_Time"]),
          "y": j
        })
        cardToIndex[Number(this.data.table[i]["Course_Time"])][j].push(i)
      }
    }
    that.setData({
      hasData: hasData,
      toRight: toRight,
      cardToIndex: cardToIndex,
      indexToCard: indexToCard
    })
  },
  showCardView: function(e) {
    var index = e.currentTarget.dataset.courseindex
    var showCardsList = []
    console.log(index)
    var card = this.data.indexToCard[index]
    for (var i = 0; i < card.length; i++) {
      var p = this.data.cardToIndex[card[i]["x"]][card[i]["y"]]
      showCardsList = showCardsList.concat(p)
    }
    showCardsList = Array.from(new Set(showCardsList))
    this.setData({
      showCardsList: showCardsList,
      showMoreInformation: true,
      current: 0
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh()
  }
})