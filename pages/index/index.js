  const app = getApp()
const Http = require('./../../utils/request.js');
Page({
  data: {
    userInfo: {},
    isUserinfo:false,
    hasUserInfo: false,
    ownShareList:[],
    windowWidth:'',
    canPutforwardMoney:'0.00',
    alreadyPutforwardMoney:'0.00',
    shareMoney: '0.0',
    shareGetMoney:'0.00',
    IsWithdrawMoney:'1',
    activityId: 1,
    storeId: 0,
    userPhone:'',
    clickToxcx: false,
    iscanvas:true,
    activityRule:false,
    choice:1,
    showLoading: true,
    getToken:true,
    isaccredit: true,
    qrcode:null,
    openBTn:false
  },

  onLoad: function (options) {
    let that = this;
    let path = ""; 
  //从分享进来  
    if( options.shareUserPhone ){
       that.setData({
         shareUserPhone: options.shareUserPhone,
         clickToxcx: true,
         choice: options.choice
       }) 
      if (options.shareStoreId){
        that.setData({
          shareStoreId: options.shareStoreId
        })           
      }
      return false;
    }
    
  //从别的小程序跳转  
    if (options.userPhone){
      that.setData({
        userPhone: options.userPhone,
      })
    }
    if (options.choice) {
      that.setData({
        choice: options.choice
      })
    }    
    if (options.activityId){
      that.setData({
        activityId: Number(options.activityId),
      })
    }
    if (options.storeId) {
      that.setData({
        storeId: Number(options.storeId),
      })
    }
    if (options.shareMoney) {
      that.setData({
        shareMoney: options.shareMoney,
      })
    }    
    if (options.shareMoney) {
      that.setData({
        shareMoney: options.shareMoney,
      })
    }      

    //请求页面的宽高
    wx.getSystemInfo({
      success: function (res) {
        console.log();
      if (res.windowHeight / res.windowWidth>1.5){
        that.setData({
          canvasWidth: res.windowWidth*0.9,
          canvasHeight: res.windowWidth * 0.9 *1.375,
          openBTn: true
        })  
      }else{
          that.setData({
            canvasWidth: res.windowWidth * 0.8,
            canvasHeight: res.windowWidth * 0.8 * 1.375,
            openBTn: false
          }) 
      }



      }
    })
  },
  onShow(){
    let that = this;
    //获取用户code
    wx.login({
      success(res) {
        that.setData({
          code: res.code
        });

        if (!that.data.shareUserPhone){
          that.getUserMessage(res.code);
        }
      },fail(res){
        console.log(res);
      }
    })
 
  },

  //绑定头像用户名信息
  getUserInfo: function(e) {
    let that = this;
    if (e.detail.userInfo){
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
        isUserinfo:false
      })
      this.modifyUserMessage();
      that.getlistShareMessage();
    }
  },
   /****** 获取邀请的好友列表 *******/
  getlistShareMessage(){
    let that = this;
    let paramJson;
      paramJson = JSON.stringify({
        userPhone: that.data.userPhone,
        activityId: that.data.activityId,
        storeId: that.data.storeId,
        sellPrice: that.data.shareMoney
      });
    if (that.data.getToken) {
      that.getAccessToken();
    }      
    that.setData({
      getToken: false
    })  

    
    Http.post('/share/listShareMessage', { paramJson }).then(res => {
        if(res.code==1000){
          that.setData({
            ownShareList: res.result.ownShareList,
            alreadyPutforwardMoney: res.result.alreadyPutforwardMoney,
            canPutforwardMoney: res.result.canPutforwardMoney,
            IsWithdrawMoney: res.result.IsWithdrawMoney,
            activityFriendPicture: res.result.activityFriendPicture,
            activityFriendCircle: res.result.activityFriendCircle
          })
          if (res.result.shareGetMoney){
              that.setData({
                shareGetMoney: res.result.shareGetMoney,
              })
          }
          if (res.result.shopAddress){
            that.setData({
              shopAddress:res.result.shopAddress,
              shopName: res.result.shopName,
              coupon: res.result.coupon,
              originalPrice: res.result.originalPrice,
              shopTel: res.result.shopTel
            })
          }
 
        }
    }, _ => {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '网络错误'
      })
    });     
  },

  /****** 校验用户是否需要获取用户名和头像 *******/
  getUserMessage(code){
  
    let that = this;
    let paramJson = JSON.stringify({
        code:code,
        userPhone: that.data.userPhone
    });
    Http.post('/user/getUserMessage', { paramJson }).then(res => {
      if (!res.result.userPhone){
        if (!that.data.shareUserPhone){
            wx.redirectTo({
              url: `../bindphone/bindphone?openId=${res.result.openId}`,
            })
            return false;
        }
        }
        if(res.code == 1003){
          that.setData({
            isUserinfo:true,
            openid: res.result.openId,
          })
        }else{
          that.setData({
            openid: res.result.openId,
            userPhone: res.result.userPhone,
          })
          that.getlistShareMessage();
        }
      
    }, _ => {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '网络错误'
            })
    });
  },
  /****** 绑定用户名和头像 *******/
  modifyUserMessage(){
    let that = this;
    let paramJson = JSON.stringify({
      openId: that.data.openid, 
      userPhone: that.data.userPhone,
      code:that.data.code,
      userName: that.data.userInfo.nickName,
      headImage: that.data.userInfo.avatarUrl
    });   
    Http.post('/user/modifyUserMessage', { paramJson }).then(res => {
      if (res.code == 1000) {
        that.getlistShareMessage();
      }
    }, _ => {
    });
  },
  /*********** 首次分享得红包 ***************/
  firstShare(){
    let that = this;
    let paramJson = JSON.stringify({
      openId: that.data.openid
    });
    Http.post('/share/firstShare', { paramJson }).then(res => {
      if (res.code == 1000) {
          let paramJsons = JSON.stringify({
            userPhone: that.data.userPhone,
            openId: that.data.openid
          });
          
        Http.post('/share/firstShareGetMoney', { paramJson: paramJsons }).then(res => {
          that.getlistShareMessage();
          }, _ => {
          });
      }
          
    }, _ => {
      // wx.showModal({
      //   title: '提示',
      //   showCancel: false,
      //   content: '网络错误'
      // }) 
    });
  },
  /*************立即提现****************/
  putforwardmoney(){
    let that = this;
wx.showModal({
  title: '提示',
  content: `确认提现`,
  success(res){
    if (!res.cancel) {
    wx.showLoading({
      title: '加载中……',
    });
    let paramJsons = JSON.stringify({
      userPhone: that.data.userPhone,
      openId: that.data.openid,
      userName: '鱼乐贝贝',
      activityId: that.data.activityId
    });
    Http.post('/transaction/putforwardmoney', { paramJson: paramJsons }).then(res => {
      if (res.code == 1000) {
        wx.showToast({
          title: '操作成功！',
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.info,
          showCancel: false

        })
      }
      that.getlistShareMessage();
      wx.hideLoading();
    }, _ => {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '网络错误'
      })

    }); 
  }
  }
})
    
 
  },
  drewCanvas(){

    let that = this;
    let context = wx.createCanvasContext('canvasimage');
   let canvasbg = that.data.activityFriendCircle;
    let qrcode = that.data.qrcode;
    
    if(that.data.storeId){
      
    wx.getImageInfo({
      src: canvasbg,    //请求的背景图片路径
      success: function (res) {
        context.drawImage(res.path, 0, 0, that.data.canvasWidth, that.data.canvasHeight);
          //请求二维码图片路径
        wx.getImageInfo({
          src: qrcode,    //请求二维码图片路径
          success: function (res) {
            context.drawImage(res.path, that.data.canvasWidth * 0.374, that.data.canvasHeight * 0.45, that.data.canvasWidth * 0.251, that.data.canvasWidth * 0.28);
            //金额
            context.font = `${Math.floor(that.data.canvasWidth * 0.18)}px Arial`;
            context.fillStyle = "#ff6d85";
            context.fillText(that.data.coupon, that.data.canvasWidth*0.314,that.data.canvasHeight * 0.36);
            //门店名称
            context.font = `${Math.floor(that.data.canvasWidth * 0.05)}px Arial`;
            context.fillStyle = "#000";
            context.fillText(that.data.shopName, that.data.canvasWidth * 0.056, that.data.canvasHeight * 0.82);
            //门店价钱
            context.font = `${Math.floor(that.data.canvasWidth * 0.06)}px Arial`;
            context.fillStyle = "#ff1f52";
            context.fillText(that.data.originalPrice+'元', that.data.canvasWidth * 0.056, that.data.canvasHeight * 0.88);
            //门店价钱介绍
            context.font = `${Math.floor(that.data.canvasWidth * 0.04)}px Arial`;
            context.fillStyle = "#989898";
            context.fillText("单游价", that.data.canvasWidth * 0.23, that.data.canvasHeight * 0.88);
            //门店电话
            context.font = `${Math.floor(that.data.canvasWidth * 0.04)}px Arial`;
            context.fillStyle = "#989898";
            context.fillText(that.data.shopTel, that.data.canvasWidth * 0.056, that.data.canvasHeight * 0.93);
            //门店地址
            context.font = `${Math.floor(that.data.canvasWidth * 0.04)}px Arial`;
            context.fillStyle = "#989898";
            context.fillText(that.data.shopAddress, that.data.canvasWidth * 0.056, that.data.canvasHeight * 0.97);

            context.draw(false, function () {
              let count  = 1; 
              setTimeout(function(){
                getcanvasw();
              },1000);
              
             function getcanvasw(){
                wx.canvasToTempFilePath({
                  width: that.data.canvasWidth, 
                  heght: that.data.canvasHeight,
                  destWidth: that.data.canvasWidth*3, 
                  destHeight: that.data.canvasHeight*3,
                  canvasId: 'canvasimage',
                  success: function (res) {
                    // 获得图片临时路径
                    that.setData({
                      imageTempPath: res.tempFilePath
                    })

                  },
                  fail:function(res){   
                    count++;     
                    if(count<4){
                      getcanvasw();  
                    }     
                  }
                })
               wx.hideLoading();
               that.setData({
                 showLoading: false
               })   
             }
         
            });
          }
        })        
      },fail(res){
        console.log(res);
      }
    })
    }else{
      
      wx.getImageInfo({
        src: canvasbg,    //请求的背景图片路径
        success: function (res) {
          context.drawImage(res.path, 0, 0, that.data.canvasWidth, that.data.canvasHeight);
          //请求二维码图片路径
          wx.getImageInfo({
            src: qrcode,    //请求二维码图片路径
            success: function (res) {
              if(that.data.choice != 4){
                context.drawImage(res.path, that.data.canvasWidth * 0.366, that.data.canvasHeight * 0.65, that.data.canvasWidth * 0.268, that.data.canvasWidth * 0.305);
              }else{
                context.drawImage(res.path, that.data.canvasWidth * 0.366, that.data.canvasHeight * 0.65, that.data.canvasWidth * 0.268, that.data.canvasWidth * 0.268);

              }
              context.draw(false, function () {
                let count = 1;
                setTimeout(function () {
                  getcanvasw();
                }, 1000);

                function getcanvasw() {
                  wx.canvasToTempFilePath({
                    width: that.data.canvasWidth,
                    heght: that.data.canvasHeight,
                    destWidth: that.data.canvasWidth*3,
                    destHeight: that.data.canvasHeight*3,
                    canvasId: 'canvasimage',
                    success: function (res) {
                      
                      // 获得图片临时路径
                      that.setData({
                        imageTempPath: res.tempFilePath
                      })

                    },
                    fail: function (res) {

                    }
                  })
                  wx.hideLoading();
                  that.setData({
                    showLoading: false
                  })
                }
         
              });
            }
          })
        },fail(res){
          console.log(res);
        }
      })
    }
  },
  /******** 分享好友 *********/

  onShareAppMessage: function () {
    this.firstShare();
    //判断是从哪个小程序跳转的//第一个是门店小程序
    if (this.data.choice != 2 && this.data.choice != 3){
          if(this.data.activityId==1){  
          /**************没有活动id*******************/
                return {
                  title: '首次游泳体验卡快去领，请叫我雷锋~',
                  path: `/pages/index/index?shareUserPhone=${this.data.userPhone}&choice=${this.data.choice}`,
                  imageUrl: this.data.activityFriendPicture
                }
          }else{
            return {
              //title: '首次游泳体验卡快去领，请叫我雷锋~',
              title: '鱼乐贝贝 ，宝宝的天堂！各种活动，超级嗨翻天！速来围观~',
              path: `/pages/index/index?shareUserPhone=${this.data.userPhone}&shareStoreId=${this.data.storeId}&choice=${this.data.choice}`,
              imageUrl: this.data.activityFriendPicture
            } 
            

          } 
    } else if (this.data.choice == 2){
      return {
        title: '鱼乐感恩季，百万门票等你拿~',
        path: `/pages/index/index?shareUserPhone=${this.data.userPhone}&choice=${this.data.choice}`,
        imageUrl: this.data.activityFriendPicture
      }
    } else if(this.data.choice == 3){
      return {
        title: '参与投票即可获得多重好礼~',
        path: `/pages/index/index?shareUserPhone=${this.data.userPhone}&choice=${this.data.choice}`,
        imageUrl: this.data.activityFriendPicture
      }      
    }
  },
  //分享打开后跳转到指定小程序
  clickToxcx(){
    let path = "";
    if (this.data.choice==1){
        if (this.data.shareStoreId) {
          path = `pages/index/detail/detail?shareUserPhone=${this.data.shareUserPhone}&shareStoreId=${this.data.shareStoreId}`;
        
        } else {
          path = `pages/index/index?shareUserPhone=${this.data.shareUserPhone}`;
        }
        wx.navigateToMiniProgram({
          appId: 'wx15bc903bd3ce9d4a', // 要跳转的小程序的appid
          path: path, // 跳转的目标页面
          extarData: {
            open: 'auth'
          },
          success(res) {
            // 打开成功  
          },
          fail(res) {
            console.log(res);
          }
        })
    } else if(this.data.choice == 2){
      path = `pages/index/index?shareUserPhone=${this.data.shareUserPhone}`;
        wx.navigateToMiniProgram({
          appId: 'wxe82911cb7ee5ccbd', // 要跳转的小程序的appid
          path: path, // 跳转的目标页面
          extarData: {
            open: 'auth'
          },
          success(res) {
            // 打开成功  
          },
          fail(res) {
            console.log(res);
          }
        })
    } else if (this.data.choice == 3){ 
      //英语引流小程序
      path = `pages/index/index?shareUserPhone=${this.data.shareUserPhone}`;
      console.log(path);
      wx.navigateToMiniProgram({
        appId: 'wx32f222ff90410043', // 要跳转的小程序的appid
        path: path, // 跳转的目标页面
        extarData: {
          open: 'auth'
        },
        success(res) {
          // 打开成功  
        },
        fail(res) {
          console.log(res);
        }
      })
    }
  },
//保存图片
  wxsaveImage(){
let that = this;
  wx.saveImageToPhotosAlbum({
    filePath: that.data.imageTempPath,
    success(res) {
     wx.showToast({
       title: '保存成功',
     }) 
      that.setData({
        iscanvas: true
      })
    },
    fail(res) {
      wx.showModal({
        title: '警告',
        content: '若不打开授权，则无法将图片保存在相册中,请点击重新授权！',
        showCancel: false
      })
      that.setData({
        isaccredit : false
      })

    }
  })
  },
  handleSetting: function (e) {
    let that = this;
    // 对用户的设置进行判断，如果没有授权，即使用户返回到保存页面，显示的也是“去授权”按钮；同意授权之后才显示保存按钮
    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      wx.showModal({
        title: '警告',
        content: '若不打开授权，则无法将图片保存在相册中！',
        showCancel: false
      })
      that.setData({
        isaccredit: false,
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您已授权，赶紧将图片保存在相册中吧！',
        showCancel: false
      })
      that.setData({
        isaccredit: true,
      })
    }
  },





  shareFriendCircle(){
    let that = this;
  let set;
  set = setInterval(function(){
    if (that.data.qrcode){
        that.drewCanvas();
        clearInterval(set);
      }
  },500);
    if (this.data.showLoading ){
      wx.showLoading({
        title: '正在生成……',
        mask:true
      })
    }
    this.firstShare();
    this.setData({
      iscanvas:false
    })
  },
  //规则弹窗
  activityRule(){
      let that = this;
      that.setData({
        activityRule:true
      })
  },
 //规则弹窗关闭 
  activityRuleClose(){
    let that = this;
    that.setData({
      activityRule: false
    })    
  },
//获取AccessToken
  getAccessToken(){
    let that = this;
    if ( that.data.choice != 4 ){
        Http.post('/user/getOtherProgramAccessToken', { choice: Number(that.data.choice) }).then(res => {
          if(res.code==1000){ 
            that.setData({
              accessToken: res.result.accessToken
            })
            that.uploadAliyun();
          }else{
            wx.showModal({
              title: '提示',
              content: res.info,
              showCancel: false
            })
          }  
        }, _ => {

        });
    }else{
      let path = "http://wx.beibeiyue.com/ylbb-activity-oldAndNewUser?sharePhone=" + this.data.userPhone;
      Http.post('/user/uploadQrCodeAliyun', { path: path }).then(res => {
        if (res.code == 1000) {
          that.setData({
            qrcode: res.result
          })   
          
        } else {
          wx.showModal({
            title: '提示',
            content: res.info,
            showCancel: false
          })
        }
      }, _ => {

      }); 
    }        
  },
 //给后台二维码路径 
uploadAliyun(){
  let path = "";
  let that = this;
  if (this.data.storeId) {
    path = "" + `pages/index/detail/detail?shareUserPhone=${this.data.userPhone}%26shareStoreId=${this.data.storeId}`;
  } else {
    path = `pages/index/index?shareUserPhone=${this.data.userPhone}`;
  }
  Http.post('/user/uploadAliyun', { path: path, accessToken: that.data.accessToken }).then(res => {
      if(res.code==1000){
        that.setData({
          qrcode: res.result
        })        
      }
  }, _ => {

  }); 
},
//关闭图片框
  closecanvas(){
      this.setData({
        iscanvas:true
      })
  }
})
