// 全局过滤器

import Vue from 'vue';
import store from '@/store';

const SEX = {1: '男', 2: '女', 3: '未知'};

const dateFtt = function (date, fmt) { // author: meizz
  var o = {
    'M+': date.getMonth() + 1,                 // 月份
    'd+': date.getDate(),                    // 日
    'h+': date.getHours(),                   // 小时
    'm+': date.getMinutes(),                 // 分
    's+': date.getSeconds(),                 // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds()             // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }
  return fmt;
};

// 性别转化
Vue.filter('filterSex', function (val, obj) {
  if (!val) return '';
  return SEX[val];
});

// 出生日期转换
Vue.filter('filterBirthDay', function (val) {
  val = new Date(val);
  val = dateFtt(val, 'yyyy-MM-dd');
  return val;
});
// 超出文字宽度显示省略号
Vue.filter('showEllipsis', function (str, len) {
  if (!str || str.length === 0) {
    return;
  }
  var charlength = 0;
  for (var i = 0; i < str.length; i++) {
    var sonstr = str.charAt(i);
    encodeURI(sonstr).length > 2 ? charlength += 1 : charlength += 0.5;
    if (charlength >= len) {
      var sublen = charlength = len ? i + 1 : i;
      str = str.substr(0, sublen) + '...';
      break;
    }
  }
  return str;
});

// 过滤转换出生日期
Vue.filter('birthDayToAge', function (time) {
  time = new Date(time);
  time = dateFtt(time, 'yyyy-MM-dd');
  if (time === '1970-01-01' || time === 'NaN-aN-aN') {
    return '';
  }
  let d_in = new Date(time.replace(/-/g, '/'));
  let d_now = new Date();
  // 两月后时间
  let d2m = new Date(time.replace(/-/g, '/'));
  d2m.setMonth(d2m.getMonth() + 2);
  // 两年后时间
  let d2y = new Date(time.replace(/-/g, '/'));
  d2y.setFullYear(d2y.getFullYear() + 2);
  // 获取天数差
  let day = parseInt((d_now.getTime() - d_in.getTime()) / (1000 * 60 * 60 * 24));
  // 获取月数差
  let month = (d_now.getFullYear() * 12 + d_now.getMonth()) - (d_in.getFullYear() * 12 + d_in.getMonth());
  // 获取年数差
  let year = d_now.getFullYear() - d_in.getFullYear();
  if (d_now.getTime() > d2m.getTime()) {
    if (d_now.getTime() > d2y.getTime()) {
      return year + '岁';
    } else {
      return month + '月';
    }
  } else {
    return day + '天';
  }
});
// 出生日期转岁数
Vue.filter('Ageless14', function (time, sex) {
  time = new Date(time);
  const newYear = new Date();
  const ageDiff = newYear.getFullYear() - time.getFullYear();
  if (ageDiff <= 14) {
    return 'boy';
  } else {
    if (sex === 115074396530689) {
      return 'man';
    } else if (sex === 115074403159041) {
      return 'women';
    } else {
      return 'wenhao';
    }
  }
});

/**
 * 通用转换字典方法
 * @param val key值
 * @param comonObj 数组
 * */
Vue.filter('commonDic', function (val, commonObj) {
  if (!val) {
    return '';
  }
  let valtemp = eval(val);
  if (typeof valtemp === 'object') {
    let temp = [];
    try {
      valtemp.forEach((item, i) => {
        let obj = _.filter(commonObj, function (o) {
          return o.key == item;
        });
        temp.push(obj[0].value);
      });
    } catch (e) {
    }
    return temp.join(',');
  } else {
    try {
      let obj = _.filter(commonObj, function (o) {
        return o.key == val;
      });
      if (obj.length === 0) {
        return obj.value;
      } else {
        return obj[0].value;
      }
    } catch (e) {
      return '';
    }
  }
});

/**
 * 通用转换字典方法
 * @param val key,value值
 * @param comonObj 数组
 * */
Vue.filter('commonDicommon', function (val, key, value, commonObj) {
  let valtemp = eval(val);
  if (typeof valtemp === 'object') {
    let temp = [];
    try {
      valtemp.forEach((item, i) => {
        let obj = _.filter(commonObj, function (o) {
          return o[key] === item;
        });
        temp.push(obj[0][value]);
      });
    } catch (e) {
    }
    return temp.join(',');
  } else {
    try {
      let obj = _.filter(commonObj, function (o) {
        if (o[key] === val) {
          // console.log(o)
        }
        return o[key] === val;
      });
      if (obj.length === 0) {
        return obj[value];
      } else {
        return obj[0][value];
      }
    } catch (e) {
      return '';
    }
  }
});

/**
 * 时间戳格式化
 * @param val key值
 * @param comonObj 数组
 * */
Vue.filter('filterTime', function (val) {
  if (!val) {
    return '';
  }
  var date = new Date(val);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
});

Vue.filter('filterDate', function (val) {
  if (!val) {
    return '';
  }
  var date = new Date(val);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  return  m + '-' + d + ' ' + h + ':' + minute;
});

/**
 * 库存转换
 * @param val 库存数
 * @param xs 系数
 * @param packUnit 包装单位key
 * @param baseUnit 基本单位key
 * @param comonObj 数组
 * */
Vue.filter('commonUnit', function (val, xs, packUnit, baseUnit, commonObj) {
  try {
    let packUnitStr = '';
    let packUnitObj = _.filter(commonObj, function (o) {
      return o.key === packUnit;
    });
    if (packUnitObj.length === 0) {
      packUnitStr = packUnitObj.value;
    } else {
      packUnitStr = packUnitObj[0].value;
    }
    if (!val && val !== 0) {
      return;
    } else if (val === 0) {
      return 0;
    } else if (packUnit === baseUnit) {
      return val + packUnitStr;
    } else {
      // let packUnitStr = '';
      let baseUnitStr = '';
      // let packUnitObj = _.filter(commonObj, function (o) {
      //   return o.key === packUnit;
      // });
      // if (packUnitObj.length === 0) {
      //   packUnitStr = packUnitObj.value;
      // } else {
      //   packUnitStr = packUnitObj[0].value;
      // }
      let baseUnitObj = _.filter(commonObj, function (o) {
        return o.key === baseUnit;
      });
      if (baseUnitObj.length === 0) {
        baseUnitStr = baseUnitObj.value;
      } else {
        baseUnitStr = baseUnitObj[0].value;
      }
      let isfus = false;
      if (val < 0) {
        val = Math.abs(val);
        isfus = true;
      }
      let unitCoeffi = Math.floor(val / xs);
      let baseCoeffi = val % xs;
      if (baseCoeffi === 0) {
        return (isfus ? '-' : '') + unitCoeffi + packUnitStr;
      } else {
        return (isfus ? '-' : '') + (unitCoeffi === 0 ? '' : (unitCoeffi + packUnitStr)) + baseCoeffi + baseUnitStr;
      }
    }
  } catch (e) {
    return '';
  }
});
