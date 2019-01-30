// pages/ClassTable/ClassTable.js
const buttons = [{
    label: '刷新',
    icon: "/images/Refresh.png",
  },
  {
    openType: 'share',
    label: '分享',
    icon: "/images/Share.png",

  },
  {
    label: '切换按钮位置',
    icon: "/images/Switch.png",
  },
  {
    label: '导出课程表',
    icon: "/images/Export.png",
  }
]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    colorArrays: ["#ca8269", "#b23e52", "#008d56", "#455765", "#cd6118", "#474b42", "#6f6f43", "#48493f", "#6c2c2f", "#79520b", "#cd6118", "#104539", "#003a47", "#595455", "#6d3c14", "#005b98", "ee869a", "73b8e2", "b28c6e", "bce1df"],
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
    firstWeek: undefined,
    enableNow: undefined,
    weekNow: 0,
    buttons,
    day: undefined,
    p: 0,
    postion: ["bottomRight", "bottomLeft"],
    current: 0,
    showed: false
  },
  onClick(e) {
    if (e.detail.index === 0) {
      this.refresh()
    } else if (e.detail.index === 3) {
      if (this.data.courseTableRawData !== undefined && this.data.courseTableRawData[1]["count"] != 0) {
        wx.navigateTo({
          url: '/pages/Export/Export?tables=' + JSON.stringify(this.data.courseTableRawData),
        })
      }
    } else if (e.detail.index === 2) {
      this.setData({
        p: this.data.p + 1
      })
    }
  },
  preventTouchMove: function() {},
  closethis: function() {
    this.setData({
      showMoreInformation: false,
      showCardsList: []
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
  cancel: function(e) {
    //关闭模态弹窗
    this.setData({
      isShowModel: false
    })
  },
  //确定事件
  confirm: function(e) {
    var that = this
    if (this.data.vcode != "") {
      this.setData({
        isShowModel: false
      })

      if (!(this.data.name === "" || this.data.name === "")) {
        wx.showToast({
          title: '加载中',
          icon: 'loading',
          duration: 10000
        })
        wx.request({
          url: 'https://cdn.dreace.top/coursetable',
          data: {
            name: this.data.name,
            passwd: this.data.passwd,
            vcode: this.data.vcode,
            cookie: this.data.cookie
          },
          success: function(res) {
            wx.hideToast()
            that.handleData({
              data: res.data
            })
          },
          fail: function(e) {
            wx.showToast({
              title: '未能完成请求',
              image: '/images/Error.png',
              duration: 3000
            })
          },
          complete: function() {
            that.setData({
              vcode: ""
            })
          }
        })
      }
    }
  },
  inputvcode: function(e) {
    this.setData({
      vcode: e.detail.value
    })
  },
  handleData: function(e) {
    this.setData({
      day: new Date().getDay()
    })
    var data = e.data
    if (data === undefined) {
      return;
    }
    var that = this
    if (data[0]["code"] === "-1") {
      wx.showToast({
        title: '服务器异常',
        image: '/images/Error.png',
        duration: 3000
      })
      return
    }
    if (data[0]["code"] === "1") {
      wx.showToast({
        title: '系统错误',
        image: '/images/Error.png',
        duration: 3000
      })
      return
    }
    if (data[0]["code"] === "0") {
      wx.showToast({
        title: '没有课程表',
        image: '/images/Sad.png',
        duration: 3000
      })
      return
    }
    if (data[0]["code"] === "2") {
      var that = this;
      this.setData({
        tips: "账号或密码错误",
        showTopTips: true
      });
      setTimeout(function() {
        that.setData({
          showTopTips: false
        });
      }, 3000);
      return
    }
    var count = data[1]["count"]
    var terms = []
    for (var i = count + 1; i > 1; i--) {
      terms.push(data[i][1])
    }
    that.setData({
      terms: terms,
      count: count,
      tables: data
    })
    that.setData({
      table: that.data.tables[that.data.count + 1 - that.data.termsIndex][2]
    })
    that.setData({
      courseTableRawData: data
    })
    that.handleMoreData()
    wx.setStorageSync("courseTableRawData", data)
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
    if (this.data.firstWeek.length >= 1) {
      var enableNow = new Array()
      var weekNow = Math.floor(((new Date()).getTime() - (new Date(this.data.firstWeek)).getTime()) / (24 * 3600 * 1000 * 7)) + 1
      that.setData({
        weekNow: weekNow
      })
      for (var i = 0; i < this.data.table.length; i++) {
        var t = this.handleWeek({
          data: this.data.table[i]["Course_Week"]
        })
        if (t.indexOf(weekNow) != -1) {
          enableNow[i] = true
        } else {
          enableNow[i] = false
        }
      }
      that.setData({
        enableNow: enableNow
      })
    }
    that.setData({
      hasData: hasData,
      toRight: toRight,
      cardToIndex: cardToIndex,
      indexToCard: indexToCard
    })
  },
  handleWeek: function(e) {
    var weekList = []
    var tempList = undefined
    tempList = this.removeChinese(e.data).split(",")
    for (var i = 0; i < tempList.length; i++) {
      var str = String(tempList[i])
      if (str.indexOf("-") != -1) {
        var t = str.split("-")
        for (var j = Number(t[0]); j <= Number(t[1]); j++) {
          weekList.push(j)
        }
      } else {
        weekList.push(Number(str))
      }
    }
    return weekList
  },
  removeChinese: function(strValue) {
    if (strValue != null && strValue != "") {
      var reg = /[\u4e00-\u9fa5]/g;
      return strValue.replace(reg, "");
    } else
      return "";
  },
  getCourseTable: function(e) {
    var that = this
    if (this.data.loading) {
      var that = this;
      this.setData({
        tips: "数据加载中，请勿操作",
        showTopTips: true
      });
      setTimeout(function() {
        that.setData({
          showTopTips: false
        });
      }, 1500);
      return
    }
    var app = getApp()
    this.setData({
      name: app.globalData.name,
      passwd: app.globalData.passwd,
      autoVcode: app.globalData.autoVcode,
      isShowModel: false,
      vcode: ""
    })
    var that = this

    if (app.globalData.name === "" || app.globalData.passwd === "") {
      if (this.data.showed) {
        return
      }
      this.setData({
        showed: true
      })
      wx.showModal({
        title: '信息未设置',
        content: '你好像还没有设置教务账号\n请前往"我的"进行设置',
        success: function(res) {
          that.setData({
            showed: false
          })
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/Account/Account',
            })
          }
        }
      })
      return
    }
    wx.request({
      url: 'https://cdn.dreace.top/getdate',
      success: function(res) {
        that.setData({
          firstWeek: res.data
        })
        wx.setStorageSync("firstWeek", res.data)
      },
    })
    this.getCourseTableWithoutVcode()
  },
  getCourseTableWithoutVcode: function() {
    var that = this
    if (!(this.data.name === "" || this.data.passwd === "")) {
      wx.showToast({
        title: '加载中',
        mask: true,
        icon: 'loading',
        duration: 60000
      })
      that.setData({
        loading: true
      })
      wx.request({
        url: 'https://cdn.dreace.top/coursetable',
        data: {
          name: this.data.name,
          passwd: this.data.passwd
        },
        success: function(res) {
          wx.hideToast()
          that.handleData({
            data: res.data
          })
        },
        fail: function() {
          wx.showToast({
            title: '未能完成请求',
            mask: true,
            image: '/images/Error.png',
            duration: 3000
          })
        },
        complete: function() {
          that.setData({
            loading: false
          })
        }
      })
    }
  },
  showCardView: function(e) {
    var index = e.currentTarget.dataset.courseindex
    var showCardsList = []
    var card = this.data.indexToCard[index]
    for (var i = 0; i < card.length; i++) {
      var p = this.data.cardToIndex[card[i]["x"]][card[i]["y"]]
      showCardsList = showCardsList.concat(p)
    }
    showCardsList = Array.from(new Set(showCardsList))
    console.log(showCardsList)
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
    var that = this
    var app = getApp()
    app.globalData.firstWeek = wx.getStorageSync("firstWeek")
    this.setData({
      firstWeek: app.globalData.firstWeek
    })
    wx.request({
      url: 'https://cdn.dreace.top/getdate',
      success: function(res) {
        that.setData({
          firstWeek: res.data
        })
        wx.setStorageSync("firstWeek", res.data)
      },
    })
    if (options.courseTableRawData != undefined) {
      wx.navigateTo({
        url: 'CourseTableFriend/CourseTableFriend?courseTableRawData=' + options.courseTableRawData,
      })
    }
    app.globalData.courseTableRawData = wx.getStorageSync("courseTableRawData")
    app.globalData.autoVcode = true
    if (app.globalData.courseTableRawData != "") {
      this.handleData({
        data: app.globalData.courseTableRawData
      })
    } else {
      this.getCourseTable()
    }
  },
  bindTermChange: function(e) {
    this.setData({
      termsIndex: e.detail.value
    })
    this.setData({
      table: this.data.tables[this.data.count + 1 - this.data.termsIndex][2]
    })
    this.handleMoreData()
  },
  refresh: function() {
    this.getCourseTable()
  },
  onShareAppMessage: function(e) {
    return {
      title: '我的课程表',
      path: 'pages/CourseTable/CourseTable?courseTableRawData=' + JSON.stringify(this.data.courseTableRawData),
    }
  },
  onShow: function() {
    var app = getApp()
    if (app.globalData.clearFlagCourseTable) {
      this.setData({
        name: "",
        passwd: "",
        count: 0,
        terms: [],
        termsIndex: 0,
        table: [],
        tables: [],
        courseIndex: 0,
        enableRefresh: true,
        courseTableRawData: [],
        showCardsList: [],
      })
      app.globalData.clearFlagCourseTable = false
    }
    if (app.globalData.updateCourseTable) {
      this.getCourseTable()
      app.globalData.updateCourseTable = false
      return
    }
    if (this.data.courseTableRawData !== undefined && this.data.courseTableRawData.length > 1) {
      this.handleData({
        data: this.data.courseTableRawData
      })
    } else {
      this.getCourseTable()
    }

  },
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh()
  }
})