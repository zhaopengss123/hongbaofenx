const Http = require('./../../utils/request.js');
Page({
  data: {
    phone: '',
    code: '',
    getCodeTime: 60,
    verificationCode: null
  },
  onLoad: function (options) {

    let that = this;
    wx.login({
      success(res) {
        that.setData({
          code: res.code,
          openId : options.openId
        });
    
      }
    })
  },
  onShow: function () {

  },
  /* -------------------- 获取验证码 -------------------- */
  getCode() {
    if (this.data.getCodeTime != 60) { return; }
    let isMobile = /^1([3578][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/;
    if (isMobile.test(this.data.phone)) {
      wx.showLoading({
        title: '正在获取验证码',
        mask: true
      });

      Http.post('/user/getVerificationCode', {
        userPhone: this.data.phone
      }).then(res => {
        wx.hideLoading();
        if (res.code == 1000) {
          this.setIntervalCode();
          this.setData({
            verificationCode: res.result.verificationCode,
            getCodePhone: res.result.userPhone
          });

        } else {
          wx.showToast({
            icon: "none",
            title: '获取验证码失败',
          })
        }
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '请输入正确手机号',
      })
    }
  },

  /* ---------------- 倒计时 ---------------- */
  setIntervalCode() {
    let interval = setInterval(_ => {
      let getCodeTime = this.data.getCodeTime - 1;
      this.setData({ getCodeTime });
      if (getCodeTime <= 0) { clearInterval(interval); this.setData({ getCodeTime: 60 }); }
    }, 1000)
  },

  /* ---------------- 绑定电话号码 ---------------- */
  submit(e) {
    let that = this;
    let formId = e.detail.formId; //获取formid 
    if (!this.data.code) {
      wx.showToast({
        icon: "none",
        title: '请输入验证码',
      });
      return;
    }
    if (this.data.code != this.data.verificationCode || this.data.phone != this.data.getCodePhone) {
      wx.showToast({
        icon: "none",
        title: '验证码错误',
      });
      return;
    }
    wx.showLoading({
      title: '绑定中...',
      mask: true
    });
    Http.post('/user/modifyUserPhone', {
      paramJson: JSON.stringify({
        openId: this.data.openId,
        userPhone: this.data.phone,
        verificationCode: this.data.verificationCode,
      })
    }).then(res => {
      wx.hideLoading();
      if(res.code==1000){
          wx.redirectTo({
            url: `../index/index?userPhone=${that.data.phone}`,
          })
      }else{
        wx.showModal({
          title: '提示',
          content: res.info,
        })
      }
    })
  },
  phoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },
  codeInput(e) {
    this.setData({
      code: e.detail.value
    });
  }



})