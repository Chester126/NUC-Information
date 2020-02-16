// pages/Add/Add.js
const app = getApp()
let id = undefined
Page({
  data: {
    error0: true,
    error1: true,
    error2: true,
    error3: true,
    error4: true,
    value0: undefined,
    value1: undefined,
    value2: undefined,
    value3: undefined,
    values: [],
  },
  add: function() {
    var map = {
      "Course_Number": this.data.values[1],
      "Course_Name": this.data.values[0],
      "Course_Credit": this.data.values[3],
      "Course_Attribute": this.data.values[4],
      "Course_Teacher": this.data.values[2],
      "Course_Week": this.data.values[10] + "周",
      "Course_Color": Math.floor(Math.random() * 21),
      "Course_Time": this.data.values[5],
      "Course_Start": this.data.values[6],
      "Course_Length": this.data.values[7],
      "Course_Building": this.data.values[8],
      "Course_Classroom": this.data.values[9],
      "Additional": true
    }
    var app = getApp()
    if (id) {
      app.globalData.additionalData[id] = map
    } else {
      app.globalData.additionalData.push(map)
    }
    wx.setStorageSync("additionalData", app.globalData.additionalData)
    app.eventBus.emit("refreshCourseTable")
    wx.navigateBack({

    })
  },
  onChange(e) {
    this.data.values[parseInt(e.currentTarget.dataset.index)] = e.detail.value
  },
  onChange0(e) {
    this.setData({
      error0: e.detail.value.length < 1,
      value0: e.detail.value,
    })
    this.data.values[0] = e.detail.value
  },
  onChange1(e) {
    this.setData({
      error1: e.detail.value > 7 || e.detail.value < 1,
      value1: e.detail.value
    })
    this.data.values[5] = e.detail.value
  },
  onChange2(e) {
    this.setData({
      error2: e.detail.value > 11 || e.detail.value < 1,
      value2: e.detail.value
    })
    this.data.values[6] = e.detail.value
  },
  onChange3(e) {
    var t = parseInt(e.detail.value) + parseInt(this.data.value2)
    this.setData({
      error3: t > 12 || isNaN(t) || parseInt(e.detail.value) <= 0,
      value3: e.detail.value
    })
    this.data.values[7] = e.detail.value
  },
  onChange4(e) {
    let flag = false
    for (let x of e.detail.value) {
      let m = parseInt(x)
      if (isNaN(m) && (x !== ',' && x !== '-')) {
        flag = true
      }
    }
    for (let x of e.detail.value.split(",")) {
      if (x.indexOf("-") == -1) {
        if (isNaN(parseInt(x))) {
          flag = true
        }
      } else {
        var t = x.split("-")
        if (isNaN(parseInt(t[0])) || isNaN(parseInt(t[1]))) {
          flag = true
        }
      }
    }
    if (e.detail.value == "") {
      flag = true
    }
    this.setData({
      error4: flag
    })
    this.data.values[10] = e.detail.value
  },
  onError(e) {
    wx.showModal({
      title: e.currentTarget.dataset.message,
      showCancel: !1,
    })
  },
  onLoad: function(e) {
    let values = []
    for (let i = 0; i <= 10; i++) {
      values[i] = ""
    }
    id = e.id
    if (id) {
      let data = app.globalData.additionalData[id]
      values[0] = data["Course_Name"]
      values[1] = data["Course_Number"]
      values[3] = data["Course_Credit"]
      values[4] = data["Course_Attribute"]
      values[2] = data["Course_Teacher"]
      values[10] = data["Course_Week"].replace("周", "")
      values[5] = data["Course_Time"]
      values[6] = data["Course_Start"]
      values[7] = data["Course_Length"]
      values[8] = data["Course_Building"]
      values[9] = data["Course_Classroom"]
      this.setData({
        error0: false,
        error1: false,
        error2: false,
        error3: false,
        error4: false,
        value2: values[6]
      })
    }
    this.setData({
      values: values,
    })
  }
})