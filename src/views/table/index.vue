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
          <el-input  style="width:400px" v-model="form.userInfo" :autosize="{ minRows: 2, maxRows: 3}" type="textarea" placeholder="请输入 ‘账号 密码 验证码’ 如果有多个，请换行。"/>
          <el-button type="primary" style="width:80px" @click="getCookies">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-tag type="danger" style="font-size: 18px;">当前价格：{{ currentPrice }}   &nbsp;&nbsp; {{ currentPriceTime }} {{batchPriceMsg}}</el-tag>

    <div style="margin: 10px 0px;">

      <div><!--<el-button type="primary" @click="batchShowAccount" style="float:right;margin:0 5px" size="medium" round>批量看详情</el-button>-->
        <el-button type="primary" @click="batchCancelOrder" style="float:right;margin:0 5px" size="medium" round>批量取消订单</el-button>
        <el-button type="primary" @click="batchShowOrder" style="float:right;margin:0 5px" size="medium" round>批量查询订单</el-button>
      <el-button type="primary" @click="batchCommit" style="float:right;margin:0 5px" size="medium" round>批量提交</el-button></div>

      <div>
        <el-input style="width:120px" v-model="batchPrice" placeholder="请输入价格"></el-input><el-button @click="batchUpdatePrice" style="margin:0 5px" size="medium" round>批量填写价格</el-button>
        <el-input style="width:120px" v-model="batchQt" placeholder="请输入数量"></el-input><el-button @click="batchUpdateQt" style="margin:0 5px" size="medium" round>批量填写数量</el-button>
        <!--<span style="color:red;">当前价格：{{ currentPrice }}   &nbsp;&nbsp; {{ currentPriceTime }}</span>-->
        <!--<el-tag type="danger" style="font-size: 18px;">当前价格：{{ currentPrice }}   &nbsp;&nbsp; {{ currentPriceTime }} {{batchPriceMsg}}</el-tag>-->
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
      :row-key="getRowKeys"
      :expand-row-keys="expands"
      @header-click="expandOrClose"
      @selection-change="handleSelectionChange"
      @select="handleSelect"
      @select-all="handleSelectAll"
    >
      <el-table-column align="center"
                       type="selection"
        width="33"/>
      <el-table-column align="center" label="序号" label-class-name="color-black" min-width="50">
        <template slot-scope="scope">
          {{ scope.$index+1 }}
        </template>
      </el-table-column>
      <el-table-column label="账号" label-class-name="color-black" min-width="60" align="center" >
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="密码" label-class-name="color-black" min-width="50" align="center" >
        <template slot-scope="scope">
          <!--<span>{{ scope.row.pwd }}</span>-->
          <el-input :maxlength=20 size="small"
                    v-model.trim="scope.row.pwd"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="验证码" label-class-name="color-black" min-width="60" align="center">
        <template slot-scope="scope">
          <!--{{ scope.row.code }}-->
          <el-input :maxlength=20 size="small"
                    v-model.trim="scope.row.code"></el-input>
        </template>
      </el-table-column>
      <el-table-column  label-class-name="color-black" label="是否登录" min-width="80" align="center">
        <template slot-scope="scope">
          <div>
            <span class='' v-if="scope.row.waitLogin">等待中...</span>
            <span class='color-green' v-else-if="scope.row.cookie && !scope.row.loginError">已登录</span>
            <span class='color-red' v-else>登录失败{{ scope.row.loginMsg }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label-class-name="color-black" label="价格" min-width="50" align="center">
        <template slot-scope="scope">
          <el-input v-model.trim="scope.row.price" :maxlength="10" size="small" @change="showQt(scope.row.price)"/>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label-class-name="color-black" label="数量"  min-width="50" align="center">
        <template slot-scope="scope">
          <el-input v-model.trim="scope.row.qt" :maxlength="10" size="small" @change="showQt(scope.row.qt)"/>
        </template>
      </el-table-column>
      <el-table-column type="expand" width="80" :label="expandAll?'收起订单':'展开订单'" >
        <template slot-scope="scope">
          <paydetail :list="scope.row.list" :availableBalance="scope.row.availableBalance" :earningAccount="scope.row.earningAccount"></paydetail>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label-class-name="color-black" label="操作结果" min-width="150" align="center">
        <template slot-scope="scope">
          <span :class="scope.row.resultClass">{{ scope.row.result }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="300" align="center" prop="created_at" label-class-name="color-black" label="操作" >
        <template slot-scope="scope">
          <!--<i class="el-icon-time"/>-->
          <el-button :loading="scope.row.waitLogin || scope.row.waitGetCode" type="text" @click="loginLeo(scope.row, scope.$index)">重新登录</el-button>
          <el-button :loading="scope.row.waitGetCode" type="text" @click="getCode(scope.row, scope.$index)">取验证码</el-button>
          <el-button type="text" @click="delRow(scope.row, scope.$index)">删除</el-button>
          <el-button :loading="scope.row.waitLogin || scope.row.waitCommit" type="text" @click="commitRow(scope.row, scope.$index)">提交</el-button>
          <el-button :loading="scope.row.waitLogin || waitRefresh" type="text" @click="refreshRow(scope.row, scope.$index)">刷新价格</el-button>
          <el-button :loading="scope.row.waitLogin || scope.row.waitShowOrders" type="text" @click="showOrders(scope.row, scope.$index)">查看订单</el-button>
          <el-button :loading="scope.row.waitLogin || scope.row.waitCancel" type="text" @click="cancelOrders(scope.row, scope.$index)">取消订单</el-button>
          <!--<el-button :loading="scope.row.waitLogin || scope.row.waitAccount" type="text" @click="showAccount(scope.row, scope.$index)">详情</el-button>-->
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
      batchPriceMsg:'',
      batchQt:'100',
      timeOutVar:null,
      websock:null,
      user:null,
      expandAll:false,
      stopWs:false,
      waitRefresh:false,
      // 获取row的key值
      getRowKeys(row) {
        return row.name;
      },
      // 要展开的行，数值的元素是row的key值
      expands: []
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
      row.resultClass="";
      this.$set(this.userList,index,row);
      let userinfo = row.name+' '+row.pwd+' '+row.code;
      // this.websocketsend("{asdf}");
      setTimeout(() => {
        let rowTemp = this.searchRow(this.userList,row.name);
        if(rowTemp.waitLogin){
          rowTemp.waitLogin = false;
          // this.$message({
          //   message: row.name+'登录超时，请稍后再试!',
          //   type: 'warning'
          // })
        }
      }, 300000);
      request({
        url: '/leo/getCookies',
        method: 'post',
        data: { userInfo: userinfo }
      }).then(response => {
      })

    },
    getCode(row, index) {
      row.waitGetCode = true;
      row.result = "等待中……";
      row.resultClass="";
      this.$set(this.userList,index,row);
      let userinfo = row.name+' '+row.pwd+' '+row.code;
      // this.websocketsend("{asdf}");
      setTimeout(() => {
        let rowTemp = this.searchRow(this.userList,row.name);
        if(rowTemp.waitSendCode){
          rowTemp.waitSendCode = false;
          // this.$message({
          //   message: row.name+'登录超时，请稍后再试!',
          //   type: 'warning'
          // })
        }
      }, 300000);
      request({
        url: '/leo/getCode',
        method: 'post',
        data: [{ name: row.name, pwd: row.pwd }]
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
    handleSelect(val, row) {
      debugger
      console.log(val);
      console.log(row);
      console.log(this.userList);
    },
    handleSelectAll(val) {
      debugger
      console.log(val);
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
        let indexTemp = this.search(this.userList,row);
        this.commitRow(row,indexTemp);
      })
    },
    batchShowOrder() {
      if(this.multipleSelection.length === 0){
        this.$message({
          message: '未选中记录!',
          type: 'warning'
        })
        return;
      }
      debugger
      this.multipleSelection.forEach((row,index,array) => {
        let indexTemp = this.search(this.userList,row);
        this.showOrders(row,indexTemp);
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
      this.multipleSelection.forEach((row,index,array) => {
        let indexTemp = this.search(this.userList,row);
        this.cancelOrders(row,indexTemp);
      })

    },
    batchShowAccount() {
      if(this.multipleSelection.length === 0){
        this.$message({
          message: '未选中记录!',
          type: 'warning'
        })
        return;
      }
      this.multipleSelection.forEach((row,index,array) => {
        let indexTemp = this.search(this.userList,row);
        this.showAccount(row,indexTemp);
      })

    },
    commitRow(row, index) {
      if(!row.cookie){
        // this.$message({
        //   message: row.name+'登录失败，不能操作！',
        //   type: 'warning'
        // })
        return
      }

      debugger
      if(!row.price || !row.qt){
        row.result = "价格和数量必填！";
        row.resultClass="el-tag el-tag--danger";
        return;
      }
      row.waitCommit = true;
      row.result = "等待中……";
      row.resultClass="";
      this.$set(this.userList,index,row);
      setTimeout(() => {
        let rowTemp = this.searchRow(this.userList,row.name);
        let rowIndex = this.search(this.userList,rowTemp);
        if(rowTemp.waitCommit){
          rowTemp.waitCommit = false;
          // rowTemp.result = "提交超时,请稍后再试！";
          // rowTemp.resultClass="el-tag el-tag--danger";
          // this.$set(this.userList,rowIndex,rowTemp);
        }
      }, 200000);
      request({
        url: '/leo/commit',
        method: 'post',
        data: [{ name: row.name, cookie: row.cookie, price: row.price, num: row.qt }]
      }).then(response => {
      }
      ).catch(() => {

      })
    },
    refreshRow(row, index) {
      if(!row.cookie){
        // this.$message({
        //   message: row.name+'登录失败，不能操作！',
        //   type: 'warning'
        // })
        return
      }
      debugger
      this.waitRefresh = true
      setTimeout(() => {
        if(this.waitRefresh){
          this.waitRefresh = false;
          this.$message({
            message: row.name+'刷新价格，返回超时，请稍后再试!',
            type: 'warning'
          })
          this.batchPriceMsg = "刷新价格，返回超时，请稍后再试!";
        }
      }, 300000);
      this.batchPriceMsg = "";
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
    showAccount(row, index) {
      if(row.loginError){
        return
      }
      debugger

      setTimeout(() => {
        let rowTemp = this.searchRow(this.userList,row.name);
        let rowIndex = this.search(this.userList,rowTemp);
        if(rowTemp.waitAccount){
          rowTemp.waitAccount = false;
          // rowTemp.result = "提交超时,请稍后再试！";
          // rowTemp.resultClass="el-tag el-tag--danger";
          this.$set(this.userList,rowIndex,rowTemp);
        }
      }, 200000);
      row.result = "等待中……";
      row.resultClass="";
      row.waitAccount = true;
      this.$set(this.userList,index,row);
      this.removeExpands(row.name);

      request({
        url: '/leo/showAccount',
        method: 'post',
        data: [{ name: row.name, cookie: row.cookie }]
      }).then(response => {
        }
      ).catch(() => {
      })
    },
    removeExpands(name){
      this.expands = this.expands.filter(function (item) {
        return item!==name;
      })
    },
    addExpands(name){
      this.expands = this.expands.filter(function (item) {
        return item!==name;
      })
      this.expands.push(name);
    },
    expandOrClose(column, event){
      console.log(column)
      if(column.type == 'expand'){
        if(this.expands.length >0 && this.expands.length === this.userList.length){
          this.expandAll = true;
        }

        if(this.expandAll){
          this.expands = [];
        }else {
          this.userList.forEach((row,index,array) => {
            this.expands.push(row.name);
          })
        }
        this.expandAll = !this.expandAll;
      }

    },
    showOrders(row, index) {
      debugger
      if(!row.cookie){
        // this.$message({
        //   message: row.name+'登录失败，不能操作！',
        //   type: 'warning'
        // })
        return;
      }

      row.waitShowOrders = true;
      row.result = "等待中……";
      row.resultClass="";
      this.$set(this.userList,index,row);
      setTimeout(() => {
        let rowTemp = this.searchRow(this.userList,row.name);
        let rowIndex = this.search(this.userList,rowTemp);
        if(rowTemp.waitShowOrders){
          rowTemp.waitShowOrders = false;
          // rowTemp.result = "查询超时，请稍后再试！";
          // row.resultClass="el-tag el-tag--danger";
          // this.$set(this.userList,rowIndex,rowTemp);
        }
      }, 300000);
      debugger
      this.removeExpands(row.name);
      request({
        url: '/leo/getOrders',
        method: 'post',
        data: [{ name: row.name, cookie: row.cookie, price: row.price, num: row.qt
                , availableBalance:row.availableBalance
                ,earningAccount:row.earningAccount}]
      }).then(response => {
          debugger
        }
      ).catch(() => {

      })
    },
    cancelOrders(row, index) {
      if(!row.cookie){
        // this.$message({
        //   message: row.name+'登录失败，不能操作！',
        //   type: 'warning'
        // })
        return
      }

      debugger
      this.removeExpands(row.name);
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
          row.resultClass="el-tag el-tag--danger";
          this.$set(this.userList,index,row)
          return;
        }
        row.waitCancel = true;
        row.result = "等待中……";
        row.resultClass="";
        this.$set(this.userList,index,row);
        request({
          url: '/leo/cancelOrders',
          method: 'post',
          data: orders
        }).then(response => {

          }
        ).catch(() => {
        })
        setTimeout(() => {
          let rowTemp = this.searchRow(this.userList,row.name);
          let rowIndex = this.search(this.userList,rowTemp);
          if(rowTemp.waitCancel){
            rowTemp.waitCancel = false;
            // rowTemp.result = "取消订单返回超时!";
            // row.resultClass="el-tag el-tag--danger";
            // this.$set(this.userList,rowIndex,rowTemp);
          }
        }, 300000);
      }else {
        row.result = "请先查询订单，再【取消】订单！";
        row.resultClass="el-tag el-tag--danger";
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
            // this.$message({
            //   message: '发送请求成功，保持登录信息有效性!',
            //   type: 'warning'
            // })
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
      // const wsuri = "ws://120.79.253.140:80/websocket";
      // const wsuri = "ws://120.79.253.140:4099/websocket";
      const wsuri = "ws://127.0.0.1:8085/websocket";
      // const wsuri = "ws://120.79.253.140:4099/websocket";
      this.websock = new WebSocket(wsuri);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onclose = this.websocketclose;
    },
    websocketonopen(){ //连接建立之后执行send方法发送数据
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
      debugger
      if(response.msgType === 1){
        // 登录
        let row = response.data;
        let index = this.search(this.userList, row);
        let arr = this.multipleSelection;
        let index_selection = arr.findIndex(item => item.name === row.name);
        arr.splice(index_selection, 1)
        this.multipleSelection=arr;
        row.waitLogin = false;
        this.$set(this.userList,index,row)
        if(index_selection>-1){
          this.$refs.singleTable1.toggleRowSelection(row,true);
        }
      }else if(response.msgType ===2){
        // 查询订单
        debugger
        let query_name = response.data.name;

        let row = this.searchRow(this.userList,query_name);
        if(row){
          this.$refs.singleTable1.toggleRowExpansion(row,false);
        }

        this.userList.forEach((row,index,array) => {
          let name = row.name;
          if(name === query_name  && response.data.orderDetails){
            row.waitShowOrders = false;
            row.list = response.data.orderDetails;
            this.addExpands(row.name);
            if(response.data.orderDetails && response.data.orderDetails.length>0){
              row.result = "订单查询成功！";
              row.resultClass="el-tag el-tag--success";
            }else {
              row.result = "订单查询失败！";
              row.resultClass="el-tag el-tag--danger";
            }
          }
        })
      }else if(response.msgType === 3){
        // 提交订单
        debugger
        let query_name = response.data.name;
        let iserror = response.data.loginError;
        this.userList.forEach((row,index,array) => {
          let name = row.name;

          if(name === query_name ){
            row.waitCommit = false;
            row.result = response.data.msg;
            if(iserror){
              row.resultClass="el-tag el-tag--danger";
            }else {
              row.resultClass="el-tag el-tag--success";
            }
            this.$set(this.userList,index,row)
          }
        })

      }else if(response.msgType === 4){
        // 刷新价格
        this.currentPrice = response.data.price;
        let iserror = response.data.loginError;
        let priceTime = response.data.endTime;
        if(iserror){
            this.batchPriceMsg = response.data.msg;
        }else{
          this.batchPriceMsg = "";
        }
        this.batchPrice = this.currentPrice;
        this.waitRefresh = false;
        if(priceTime){
          this.currentPriceTime =priceTime;
        }else {
          const time1 = new Date().Format("yyyy-MM-dd hh:mm:ss");
          this.currentPriceTime = time1;
        }
      }else if(response.msgType === 5){
        //取消订单
        debugger

        let query_name = response.data.name;
        let cancelSuccess = response.data.cancelSuccess;
        this.userList.forEach((row,index,array) => {
          let name = row.name;
          if(name === query_name ){
            row.waitCancel = false;
            if(cancelSuccess){
              row.result = "取消订单成功！";
              row.resultClass="el-tag el-tag--success";
            }else {
              row.result = "取消订单失败！";
              row.resultClass="el-tag el-tag--danger";
            }

            this.$set(this.userList,index,row)
          }
        })

      }else if(response.msgType===6){
        // 服务器发命令断开连接
        this.stopWs = true;
        this.websock.close();
      }else if(response.msgType === 7){
        //获取验证码
        debugger

        let query_name = response.data.name;
        let error_flag = response.data.loginError;
        this.userList.forEach((row,index,array) => {
          let name = row.name;
          if(name === query_name ){
            row.waitGetCode = false;
            if(!error_flag){
              row.result = "获取验证码成功！";
              row.resultClass="el-tag el-tag--success";
            }else {
              row.result = "获取验证码失败！"+response.data.msg;
              row.resultClass="el-tag el-tag--danger";
            }

            this.$set(this.userList,index,row)
          }
        })

      }else if(response.msgType === 8){
        //查看币量、收入
        debugger
        let query_name = response.data.name;
        let error_flag = response.data.loginError;
        let availableBalance = response.data.availableBalance;
        let earningAccount = response.data.earningAccount;
        this.userList.forEach((row,index,array) => {
          let name = row.name;
          if(name === query_name ){
            row.waitAccount = false;

            if(!error_flag){
              // row.result = "查看账户详情成功！";
              // row.resultClass="el-tag el-tag--success";
              row.availableBalance = availableBalance;
              row.earningAccount = earningAccount;
            }else {
              // row.result = "查看账户详情失败！"+response.data.msg;
              // row.resultClass="el-tag el-tag--danger";
            }
            this.$set(this.userList,index,row);
            // this.addExpands(name);
          }
        })

        // // 查询订单
        // debugger
        // let query_name = response.data.name;
        // this.userList.forEach((row,index,array) => {
        //   let name = row.name;
        //   if(name === query_name  && response.data.orderDetails){
        //     row.waitShowOrders = false;
        //     row.list = response.data.orderDetails;
        //     this.addExpands(row.name);
        //     if(response.data.orderDetails && response.data.orderDetails.length>0){
        //       row.result = "订单查询成功！";
        //       row.resultClass="el-tag el-tag--success";
        //     }else {
        //       row.result = "订单查询失败！";
        //       row.resultClass="el-tag el-tag--danger";
        //     }
        //   }
        // })

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
    },
    searchRow(arr,username){
      for(var i=0;i<arr.length;i++){
        if(arr[i].name == username){
          return arr[i];
        }
      }
      return null;
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
  #leo-main .el-table__expanded-cell[class*=cell] {
    padding: 5px 0px;
  }
  #leo-main .el-table__expanded-cell {
    padding: 5px 0;
  }
  #leo-main .el-table {
    /*font-size: 18px;*/
  }
  /*#leo-main .el-table th>.cell{*/
    /*color: #000;*/
  /*}*/
#leo-main .el-table .cell{
  padding: 0px 3px;
}
#leo-main .el-table td, .el-table th {
  padding: 6px 0;
}
#leo-main .el-input__inner{
  padding: 0 2px;
}
  .color-black {
    color: #000;
  }
  .color-green {
    color: #67c23a;
  }
  .color-red {
    color: #CD0000;
  }
  .el-table th.el-table__expand-column{
    /*border-color: transparent;*/
    color: #409eff;
    background: transparent;
    padding-left: 0;
    padding-right: 0;
    /*color: #fff;*/
    /*background-color: #409EFF;*/
    /*border-color: #409EFF;*/
    /*display: inline-block;*/
    /*line-height: 1;*/
    /*white-space: nowrap;*/
    cursor: pointer;
    /*-webkit-appearance: none;*/
    /*text-align: center;*/
    /*box-sizing: border-box;*/
    /*outline: 0;*/
    /*margin: 0;*/
    /*transition: .1s;*/
    /*font-weight: 500;*/
    /*padding: 12px 20px;*/
    /*font-size: 14px;*/
    /*border-radius: 4px;*/
  }
</style>
