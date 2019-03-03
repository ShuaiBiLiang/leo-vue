<template>
  <div class="app-container" id="leo-main">
    <!--<el-button type="primary" @click="showDialog = !showDialog">填写/关闭</el-button>-->
    <el-switch
      v-model="showDialog"
      active-color="#13ce66"
      inactive-color="#ff4949"/>
    <div v-if="showDialog" class="">
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="账号 密码 验证码">
          <el-input v-model="form.userInfo" :autosize="{ minRows: 2, maxRows: 4}" style="width:30%;" type="textarea" placeholder="请输入 ‘账号 密码 验证码’ 如果有多个，请换行。"/>
          <el-button type="primary" style="width:80px" @click="getCookies">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div style="margin: 10px 0px;">
      <div style="margin: 0 auto;"><span style="color:red;">当前价格：{{ currentPrice }}   &nbsp;&nbsp; {{ currentPriceTime }}</span>
      </div>
      <span><el-button type="primary" @click="batchCancelOrder" style="float:right;margin:0 5px" size="medium" round>批量取消订单</el-button></span>
      <span><el-button type="primary" @click="batchShowOrder" style="float:right;margin:0 5px" size="medium" round>批量查询订单</el-button></span>
      <span><el-button type="primary" @click="batchCommit" style="float:right;margin:0 5px" size="medium" round>批量提交</el-button></span>

      <div>
        <el-input style="width:150px" v-model="batchPrice" placeholder="请输入价格"></el-input><el-button @click="batchUpdatePrice" style="margin:0 5px" size="medium" round>批量填写价格</el-button>
        <el-input style="width:150px" v-model="batchQt" placeholder="请输入数量"></el-input><el-button @click="batchUpdateQt" style="margin:0 5px" size="medium" round>批量填写数量</el-button>
      </div>
    </div>

    <el-table ref="singleTable1"
      v-loading="listLoading"
      :data="userList"
      element-loading-text="Loading"
      border
      stripe
      fit
      highlight-current-row
              style="color: #000;"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55"/>
      <el-table-column align="center" label="序号" width="60">
        <template slot-scope="scope">
          {{ scope.$index+1 }}
        </template>
      </el-table-column>
      <el-table-column label="账号名"  width="100">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="密码" width="150" align="center" >
        <template slot-scope="scope">
          <!--<span>{{ scope.row.pwd }}</span>-->
          <el-input :maxlength=20 size="small"
                    v-model.trim="scope.row.pwd"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="验证码" width="110" align="center">
        <template slot-scope="scope">
          <!--{{ scope.row.code }}-->
          <el-input :maxlength=20 size="small"
                    v-model.trim="scope.row.code"></el-input>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="是否登录" width="110" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.waitLogin">等待中...</span>
          <span v-else-if="scope.row.loginError">登录失败：{{ scope.row.cookie }}</span>
          <span v-else>已登录</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="价格" width="110" align="center">
        <template slot-scope="scope">
          <el-input v-model.trim="scope.row.price" :maxlength="10" size="small" @change="showQt(scope.row.price)"/>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="数量" min="10" width="90" align="center">
        <template slot-scope="scope">
          <el-input v-model.trim="scope.row.qt" :maxlength="10" size="small" @change="showQt(scope.row.qt)"/>
        </template>
      </el-table-column>
      <el-table-column type="expand" width="60" label="+/-" @click="alert('aa');">
        <template slot-scope="scope">
          <paydetail :list="scope.row.list"></paydetail>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="操作结果" width="150">
        <template slot-scope="scope">
          {{ scope.row.result }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="操作">
        <template slot-scope="scope">
          <!--<i class="el-icon-time"/>-->
          <el-button :loading="scope.row.waitLogin" type="text" @click="loginLeo(scope.row, scope.$index)">重新登录</el-button>
          <el-button type="text" @click="delRow(scope.row, scope.$index)">删除</el-button>
          <el-button :loading="scope.row.waitCommit" type="text" @click="commitRow(scope.row, scope.$index)">提交</el-button>
          <el-button :loading="waitRefresh" type="text" @click="refreshRow(scope.row, scope.$index)">刷新价格</el-button>
          <el-button :loading="scope.row.waitShowOrders" type="text" @click="showOrders(scope.row, scope.$index)">查看订单</el-button>
          <el-button :loading="scope.row.waitCancel" type="text" @click="cancelOrders(scope.row, scope.$index)">取消订单</el-button>
        </template>
      </el-table-column>
    </el-table>



  </div>
</template>

<script>
import { getList } from '@/api/table'
import { Message, MessageBox } from 'element-ui'
import request from '@/utils/request'
import paydetail from './paydetail';


export default {
  components: {paydetail},
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      listLoading: false,
      userList: [],
      showDialog: true,
      form: {
        userInfo: ''
      },
      multipleSelection: [],
      currentPrice: null,
      currentPriceTime: null,
      batchPrice:'',
      batchQt:'',
      timeOutVar:null,
      websock:null,
      user:null,
      expandAll:false,
      stopWs:false,
      waitRefresh:false
    }
  },
  created() {
    this.initWebSocket();
    let userInfo = sessionStorage.getItem('user');
    if(userInfo){
      this.user = JSON.parse(userInfo);
    }

  },
  destroyed() {
    this.websock.close() //离开路由之后断开websocket连接
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        this.list = response.data.items
        this.listLoading = false
      })
    },
    getCookies() {
      this.timeoutEnd()
      debugger
      this.userList = [];
      this.listLoading = true
      request({
        url: '/leo/getCookies',
        method: 'post',
        data: { userInfo: this.form.userInfo }
      }).then(response => {
        // console.log(response)
        debugger
        this.timeoutEnd()
        this.userList = response.data

        this.userList.forEach((row,index,array) => {
          row.waitLogin = true;
          this.$set(array,index,row)
        })
        this.listLoading = false
        this.showDialog = false
        this.timeoutBegin();
      }
      ).catch((res) => {
        console.log(res.status);
        if (res.status === 88 ) {
          MessageBox.confirm(
            '<p>'+res.msg+'</p>',
            '警告',
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {

          })
        }
        this.listLoading = false
      })
    },
    loginLeo(row, index) {
      row.waitLogin = true;
      row.result = "等待中……";
      this.$set(this.userList,index,row);
      let userinfo = row.name+' '+row.pwd+' '+row.code;
      // this.websocketsend("{asdf}");
      setTimeout(() => {
        if(row.waitLogin){
          row.waitLogin = false;
          row.result = "登录返回超时！";
          this.$set(this.userList,index,row);
          // this.$message({
          //   message: row.name+'登录，返回超时!',
          //   type: 'warning'
          // })
        }
      }, 60000);
      request({
        url: '/leo/getCookies',
        method: 'post',
        data: { userInfo: userinfo }
      }).then(response => {
      })

    },
    delRow(row, index) {
      console.log(row.name)
      debugger
      this.userList.splice(index, 1)
    },
    showQt(qt) {
      console.log(qt)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    batchCommit() {

      if(this.multipleSelection.length === 0){
        this.$message({
          message: '未选中记录!',
          type: 'warning'
        })
        return;
      }
      this.multipleSelection.forEach((row,index,array) => {
        this.commitRow(row,index);
      })
      //
      // const dataArray = []
      // if(this.multipleSelection.length === 0){
      //   this.$message({
      //     message: '未选中记录!',
      //     type: 'warning'
      //   })
      //   return;
      // }
      // this.multipleSelection.forEach(row => {
      //   const data = { name: row.name, cookie: row.cookie, price: row.price, num: row.qt }
      //   dataArray.push(data)
      // })
      // // this.listLoading = true
      // request({
      //   url: '/leo/commit',
      //   method: 'post',
      //   data: dataArray
      // }).then(response => {
      //     // debugger
      //     // let textHtml = '';
      //     // response.data.forEach(function(value,index,array){
      //     //   textHtml += value.name+":"+value.msg +"<br/>";
      //     //   console.log(value.name+":"+value.msg);
      //     // })
      //     // this.listLoading = false
      //     //
      //     // this.$confirm(textHtml, '提示', {
      //     //   confirmButtonText: '确 定',
      //     //   cancelButtonText: '取 消',
      //     //   closeOnClickModal: false,
      //     //   dangerouslyUseHTMLString: true,
      //     //   type: 'warning'
      //     // }).then(() => {
      //     //
      //     // }).catch(() => {
      //     //
      //     // });
      // }
      // ).catch(() => {
      //   this.listLoading = false
      //   debugger
      //   this.$message({
      //     message: '成功!',
      //     type: 'warning'
      //   })
      // })
    },
    batchShowOrder() {
      if(this.multipleSelection.length === 0){
        this.$message({
          message: '未选中记录!',
          type: 'warning'
        })
        return;
      }
      this.multipleSelection.forEach(row => {
        this.showOrders(row);
      })

    },
    batchCancelOrder() {
      if(this.multipleSelection.length === 0){
        this.$message({
          message: '未选中记录!',
          type: 'warning'
        })
        return;
      }
      this.multipleSelection.forEach(row => {
        this.cancelOrders(row);
      })

    },
    commitRow(row, index) {
      debugger
      if(row.qt<10){
        this.$message({
          message: '数量不能小于10',
          type: 'warning'
        })
        return;
      }
      row.waitCommit = true;
      row.result = "等待中……";
      this.$set(this.userList,index,row);
      setTimeout(() => {
        if(row.waitCommit){
          row.waitCommit = false;
          row.result = "提交返回超时！";
          this.$set(this.userList,index,row);
        }
      }, 60000);
      request({
        url: '/leo/commit',
        method: 'post',
        data: [{ name: row.name, cookie: row.cookie, price: row.price, num: row.qt }]
      }).then(response => {
      }
      ).catch(() => {
        debugger
        this.listLoading = false
        this.$message({
          message: '成功!',
          type: 'warning'
        })
      })
    },
    refreshRow(row, index) {
      debugger
      this.waitRefresh = true
      setTimeout(() => {
        if(this.waitRefresh){
          this.waitRefresh = false;
          this.$message({
            message: row.name+'刷新价格，返回超时!',
            type: 'warning'
          })
        }
      }, 90000);
      request({
        url: '/leo/price',
        method: 'post',
        data: { userInfo: row.cookie }
      }).then(response => {
        // this.listLoading = false
        //   debugger
        //   this.currentPrice = response.data.price
        //   this.batchPrice = this.currentPrice
        //   const time1 = new Date().Format("yyyy-MM-dd hh:mm:ss");
        //   console.log(time1)
        //   this.currentPriceTime = time1
        }
      ).catch(() => {

      })
    },
    showOrders(row, index) {
      row.waitShowOrders = true;
      row.result = "等待中……";
      this.$set(this.userList,index,row);
      setTimeout(() => {
        if(row.waitShowOrders){
          row.waitShowOrders = false;
          row.result = "查看订单返回超时!";
          this.$set(this.userList,index,row);
          // this.$message({
          //   message: row.name+'查看订单，返回超时!',
          //   type: 'warning'
          // })
        }
      }, 60000);
      debugger
      // row.list = []
      this.$refs.singleTable1.toggleRowExpansion(row,false);
      // row.list = [];
      // this.$refs.singleTable1.toggleRowExpansion(row,true);
      request({
        url: '/leo/getOrders',
        method: 'post',
        data: [{ name: row.name, cookie: row.cookie, price: row.price, num: row.qt }]
      }).then(response => {
          debugger
        // this.userList.forEach((row,index,array) => {
        //   let name = row.name;
        //   if(response.data[name]){
        //     row.list = response.data[name];
        //   }
        // })
        // this.$refs.singleTable1.toggleRowExpansion(row,true);
        //
        //   this.$message({
        //     message: '成功!',
        //     type: 'warning'
        //   })
          //
          // this.$confirm(textHtml, '提示', {
          //   confirmButtonText: '确 定',
          //   cancelButtonText: '取 消',
          //   closeOnClickModal: false,
          //   dangerouslyUseHTMLString: true,
          //   type: 'warning'
          // }).then(() => {
          //
          // }).catch(() => {
          //
          // });
        }
      ).catch(() => {

      })
    },
    cancelOrders(row, index) {

      setTimeout(() => {
        if(this.waitCancel){
          row.waitCancel = false;
          row.result = "取消订单返回超时!";
          this.$set(this.userList,index,row);
          // this.$message({
          //   message: row.name+'取消订单，返回超时!',
          //   type: 'warning'
          // })
        }
      }, 60000);
      debugger
      this.$refs.singleTable1.toggleRowExpansion(row,false);
      let orders = [];
      let cookie = row.cookie;
      if(row.list){
        row.list.forEach(function(value,index,array){
          if(value.id){
            let order = {cookie:cookie, id:value.id, name:row.name, volume:value.volume};
            orders.push(order);
          }
        })

        if(orders.length===0){
          row.result = "无可取消订单！";
          this.$set(this.userList,index,row)
          return;
        }
        row.waitCancel = true;
        row.result = "等待中……";
        this.$set(this.userList,index,row);
        request({
          url: '/leo/cancelOrders',
          method: 'post',
          data: orders
        }).then(response => {
            // debugger
            // this.$message({
            //   message: '成功!',
            //   type: 'warning'
            // })

          }
        ).catch(() => {
          // debugger
          // this.$message({
          //   message: '失败!',
          //   type: 'warning'
          // })
        })
      }else {
        row.result = "无可取消订单！";
        this.$set(this.userList,index,row)
      }

    },
    batchUpdatePrice() {
      let currentPrice = this.batchPrice;
      this.userList.forEach((row,index,array) => {
        row.price = currentPrice;
        this.$set(array,index,row)
      })
    },
    batchUpdateQt() {
      let currentQt = this.batchQt;
      this.userList.forEach((row,index,array) => {
        row.qt = currentQt;
        this.$set(array,index,row)
      })
    },
    timeoutBegin(){
      let orders = [];
      this.userList.forEach(function(row,index,array){
        let order = { name: row.name, cookie: row.cookie };
        if(!row.loginError){
          orders.push(order);
        }
      })
      if(orders.length>0){
        request({
          url: '/leo/activeCookie',
          method: 'post',
          data: orders
        }).then(response => {
            debugger
            this.$message({
              message: '发送请求成功，保持登录信息有效性!',
              type: 'warning'
            })
          }
        ).catch(() => {
          debugger
          this.$message({
            message: '失败!',
            type: 'warning'
          })
        })
      }

      this.timeOutVar = setTimeout(() => {
        this.timeoutBegin();
      }, 60000);
    },
    timeoutEnd(){
      clearTimeout(this.timeOutVar)
    },
    initWebSocket(){ //初始化weosocket
      const wsuri = "ws://120.79.253.140:80/websocket";
      // const wsuri = "ws://120.79.253.140:4099/websocket";
      // const wsuri = "ws://127.0.0.1:8085/websocket";
      this.websock = new WebSocket(wsuri);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onclose = this.websocketclose;
    },
    websocketonopen(){ //连接建立之后执行send方法发送数据
      // let actions = {"test":"12345"};
      // this.websocketsend(JSON.stringify(actions));
      this.websocketsend(this.user.name);
    },
    websocketonerror(){//连接建立失败重连
      debugger
      if(!this.stopWs){
        this.initWebSocket();
      }
    },
    websocketonmessage(e){ //数据接收
      const response = JSON.parse(e.data);
      if(response.msgType === 1){
        // 登录
        let row = response.data;
        let index = this.search(this.userList, row);
        row.waitLogin = false;
        this.$set(this.userList,index,row)
        // if(row.loginError){
        //   row.result = "登录失败！";
        // }else{
        //   row.result = "登录成功！";
        // }
      }else if(response.msgType ===2){
        // 查询订单
        debugger
        let query_name = response.data.name;
        this.userList.forEach((row,index,array) => {
          let name = row.name;
          if(name === query_name  && response.data.orderDetails){
            row.waitShowOrders = false;
            row.list = response.data.orderDetails;
            // this.$set(row,"list",response.data.orderDetails);
            // this.$nextTick(_ => {
            this.$refs.singleTable1.toggleRowExpansion(row,true);
            // })
            if(response.data.orderDetails && response.data.orderDetails.length>0){
              row.result = "订单查询成功！";
            }else {
              row.result = "网络拥堵！订单查询失败！";
            }
          }
        })
      }else if(response.msgType === 3){
        // 提交订单
        debugger
        let query_name = response.data.name;
        this.userList.forEach((row,index,array) => {
          let name = row.name;
          if(name === query_name ){
            row.waitCommit = false;
            //response.data.name+":"+
            row.result = response.data.msg;
            this.$set(this.userList,index,row)
          }
        })

        // textHtml += response.data.name+":"+response.data.msg +"<br/>";
        // this.$confirm(textHtml, '提示', {
        //   confirmButtonText: '确 定',
        //   cancelButtonText: '取 消',
        //   closeOnClickModal: false,
        //   dangerouslyUseHTMLString: true,
        //   type: 'warning'
        // }).then(() => {
        //
        // }).catch(() => {
        //
        // });
      }else if(response.msgType === 4){
        // 刷新价格
        this.currentPrice = response.data.price;
        this.batchPrice = this.currentPrice;
        this.waitRefresh = false;
        const time1 = new Date().Format("yyyy-MM-dd hh:mm:ss");
        this.currentPriceTime = time1;
      }else if(response.msgType === 5){
        //取消订单
        debugger
        // let query_name = response.data.name;
        // this.userList.forEach((row,index,array) => {
        //   let name = row.name;
        //   if(name === query_name ){
        //     this.$refs.singleTable1.toggleRowExpansion(row,false);
        //     row.waitCancel = false;
        //     row.result = name+"，取消订单成功。数量："+response.data.volume;
        //   }
        // })

        let query_name = response.data.name;
        let cancelSuccess = response.data.cancelSuccess;
        this.userList.forEach((row,index,array) => {
          let name = row.name;
          if(name === query_name ){
            row.waitCancel = false;
            if(cancelSuccess){
              row.result = "取消订单成功！";
            }else {
              row.result = "取消订单失败！";
            }
            this.$set(this.userList,index,row)
          }
        })

        // textHtml += response.data.name+"，取消订单成功。数量："+response.data.volume;
        // this.$confirm(textHtml, '取消订单提示', {
        //   confirmButtonText: '确 定',
        //   cancelButtonText: '取 消',
        //   closeOnClickModal: false,
        //   dangerouslyUseHTMLString: true,
        //   type: 'warning'
        // }).then(() => {
        //
        // }).catch(() => {
        //
        // });
      }else if(response.msgType===6){
        // 服务器发命令断开连接
        this.stopWs = true;
        this.websock.close();
      }
    },
    websocketsend(Data){//数据发送
      this.websock.send(Data);
    },
    websocketclose(e){  //关闭，服务器断开连接
      console.log('断开连接:状态='+this.websock.readyState,e);
      debugger
      if(this.stopWs){
        return;
      }

      if(!this.websock){
        this.initWebSocket();
        return
      }else if (this.websock.readyState>=2){
        this.initWebSocket();
        return
      }
    },
    search(arr,user){
      for(var i=0;i<arr.length;i++){
        if(arr[i].name == user.name){
          return i;
        }
      }
      return false;
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  #leo-main .el-table__expanded-cell[class*=cell] {
    padding: 5px 0px;
  }
  #leo-main .el-table__expanded-cell {
    padding: 5px 0;
  }
  #leo-main .el-table {
    font-size: 18px;
  }
</style>
