
/**
 * @Services Http请求
 *
 * @export get/post <function>
 * 
 * @param url: string 请求地址
 * @param param: object 请求参数
 * @return Promise
 * 
 * @author phuhoang 
 * @time 2018-01-16
 */
const App = getApp();

const Get = (url, params, ) => {
  return new Promise((resolve, reject) => {
    let requestPath = url.substr(0, 4) === 'http' ? url : `${App.domain + url}`;
    wx.request({
      url: requestPath,
      method: 'GET',
      data: params,
      dataType: 'json',
      success(res) {
        resolve(res.data);
      },
      fail(err) {
        reject(err);
        wx.hideLoading();
      }
    });
  });
}

const Post = (url, params) => {
  return new Promise((resolve, reject) => {
    let requestPath = url.substr(0, 4) === 'http' ? url : `${App.domain + url}`;
    wx.request({
      url: requestPath,
      method: "POST",
      data: Serialize(params),
      dataType: 'json',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        resolve(res.data);
      },
      fail(err) {
        reject(err);
        wx.hideLoading();
      }
    })
  })
}

const Serialize = (data) => {
  var val = "", str = "";
  for (var v in data) {
    str = v + "=" + data[v];
    val += str + '&';
  }
  return val.slice(0, val.length - 1);
}
module.exports = {
  get: Get,
  post: Post
}
