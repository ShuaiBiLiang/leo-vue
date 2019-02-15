<template>
  <div class="app-container">
    <!--<el-button type="primary" @click="showDialog = !showDialog">填写/关闭</el-button>-->
    <el-switch
      v-model="showDialog"
      active-color="#13ce66"
      inactive-color="#ff4949"/>
    <div v-if="showDialog" class="">
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="账号 密码 验证码">
          <el-input v-model="form.userInfo" type="textarea" placeholder="请输入 ‘账号 密码 验证码’ 如果有多个，请换行。"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getCookies">提交</el-button>
          <!--<el-button @click="onCancel">Cancel</el-button>-->
        </el-form-item>
      </el-form>
    </div>
    <br>
    <div style="margin: 0 auto;"><span style="color:red;">当前价格：{{ currentPrice }}   &nbsp;&nbsp; {{ currentPriceTime }}</span>
    </div>
    <span><el-button type="primary" @click="batchCancelOrder" style="float:right;">批量取消订单</el-button></span>
    <span><el-button type="primary" @click="batchShowOrder" style="float:right;">批量查询订单</el-button></span>
    <span><el-button type="primary" @click="batchCommit" style="float:right;">批量提交</el-button></span>

    <div>
      <el-input style="width:150px" v-model="batchPrice" placeholder="请输入价格"></el-input><el-button @click="batchUpdatePrice">批量填写价格</el-button>
      <el-input style="width:150px" v-model="batchQt" placeholder="请输入数量"></el-input><el-button @click="batchUpdateQt">批量填写数量</el-button>
    </div>
    <el-table ref="singleTable1"
      v-loading="listLoading"
      :data="userList"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55"/>
      <el-table-column align="center" label="序号" width="95">
        <template slot-scope="scope">
          {{ scope.$index+1 }}
        </template>
      </el-table-column>
      <el-table-column label="账号名">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="密码" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.pwd }}</span>
          <el-input size="small"
                    class="input60" :maxlength=20
                    v-model.trim="scope.row.pwd"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="验证码" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.code }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="是否登录" width="110" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.loginError">登录失败：{{ scope.row.cookie }}</span>
          <span v-else>已登录</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="价格" width="110" align="center">
        <template slot-scope="scope">
          <el-input v-model.trim="scope.row.price" :maxlength="10" size="small" @change="showQt(scope.row.price)"/>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="数量" min="10" width="110" align="center">
        <template slot-scope="scope">
          <el-input v-model.trim="scope.row.qt" :maxlength="10" size="small" @change="showQt(scope.row.qt)"/>
        </template>
      </el-table-column>
      <el-table-column type="expand" width="20">
        <template slot-scope="scope">
          <paydetail :list="scope.row.list"></paydetail>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="操作" width="400">
        <template slot-scope="scope">
          <!--<i class="el-icon-time"/>-->
          <el-button size="mini" @click="loginLeo(scope.row, scope.$index)">重新登陆</el-button>
          <el-button size="mini" @click="delRow(scope.row, scope.$index)">删除</el-button>
          <el-button size="mini" @click="commitRow(scope.row, scope.$index)">提交</el-button>
          <el-button size="mini" @click="refreshRow(scope.row, scope.$index)">刷新价格</el-button>
          <el-button size="mini" @click="showOrders(scope.row, scope.$index)">查看订单</el-button>
          <el-button size="mini" @click="cancelOrders(scope.row, scope.$index)">取消订单</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--<el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row>
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="Title">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="Author" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Pageviews" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.pageviews }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="Status" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="Display_time" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time"/>
          <span>{{ scope.row.display_time }}</span>
        </template>
      </el-table-column>
    </el-table>-->
  </div>
</template>

<script>
import { getList } from '@/api/table'
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
      userList: null,
      showDialog: true,
      form: {
        userInfo: ''
      },
      multipleSelection: [],
      currentPrice: null,
      currentPriceTime: null,
      batchPrice:'',
      batchQt:'',
      timeOutVar:null
    }
  },
  created() {
    // this.fetchData()
    // this.getCookies()
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
      debugger
      this.listLoading = true
      request({
        url: '/getCookies',
        method: 'post',
        data: { userInfo: this.form.userInfo }
      }).then(response => {
        // console.log(response)
        debugger
        this.timeoutEnd()
        this.userList = response.data
        this.listLoading = false
        this.showDialog = false
        this.timeoutBegin();
      }
      ).catch(() => {
        this.listLoading = false
      })
    },
    loginLeo(row, index) {
      let userinfo = row.name+' '+row.pwd+' '+row.code;
      request({
        url: '/getCookies',
        method: 'post',
        data: { userInfo: userinfo }
      }).then(response => {
        row = response.data[0];
      })
      /*
      data: [{ name: row.name, cookie: row.cookie, price: row.price, num: row.qt }]
      request({
        url: '/getCookies',
        method: 'post'
      }).then(response => {
          console.log(response)
          this.userList = response.data
          this.listLoading = false
        }
      )*/
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

      const dataArray = []
      if(this.multipleSelection.length === 0){
        this.$message({
          message: '未选中记录!',
          type: 'warning'
        })
        return;
      }
      this.multipleSelection.forEach(row => {
        const data = { name: row.name, cookie: row.cookie, price: row.price, num: row.qt }
        dataArray.push(data)
      })
      this.listLoading = true
      request({
        url: '/commit',
        method: 'post',
        data: dataArray
      }).then(response => {
          debugger
          let textHtml = '';
          response.data.forEach(function(value,index,array){
            textHtml += value.name+":"+value.msg +"<br/>";
            console.log(value.name+":"+value.msg);
          })
          this.listLoading = false

          this.$confirm(textHtml, '提示', {
            confirmButtonText: '确 定',
            cancelButtonText: '取 消',
            closeOnClickModal: false,
            dangerouslyUseHTMLString: true,
            type: 'warning'
          }).then(() => {

          }).catch(() => {

          });
      }
      ).catch(() => {
        this.listLoading = false
        debugger
        this.$message({
          message: '成功!',
          type: 'warning'
        })
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
      }
      this.listLoading = true
      request({
        url: '/commit',
        method: 'post',
        data: [{ name: row.name, cookie: row.cookie, price: row.price, num: row.qt }]
      }).then(response => {
        debugger
          this.listLoading = false
        let textHtml = '';
        response.data.forEach(function(value,index,array){
          textHtml += value.name+":"+value.msg +"<br/>";
          console.log(value.name+":"+value.msg);
        })
        this.$message({
          message: '成功!',
          type: 'warning'
        })

        this.$confirm(textHtml, '提示', {
            confirmButtonText: '确 定',
            cancelButtonText: '取 消',
            closeOnClickModal: false,
            dangerouslyUseHTMLString: true,
            type: 'warning'
          }).then(() => {

          }).catch(() => {

          });
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
      this.listLoading = true
      request({
        url: '/price',
        method: 'post',
        data: { userInfo: row.cookie }
      }).then(response => {
        this.listLoading = false
          debugger
          this.currentPrice = response.data.price
          this.batchPrice = this.currentPrice
          const time1 = new Date().Format("yyyy-MM-dd hh:mm:ss");
          console.log(time1)
          this.currentPriceTime = time1
        }
      ).catch(() => {
        this.listLoading = false
      })
    },
    showOrders(row, index) {
      debugger
      this.$refs.singleTable1.toggleRowExpansion(row,false);
      request({
        url: '/getOrders',
        method: 'post',
        data: [{ name: row.name, cookie: row.cookie, price: row.price, num: row.qt }]
      }).then(response => {
          debugger
        this.userList.forEach((row,index,array) => {
          let name = row.name;
          if(response.data[name]){
            row.list = response.data[name];
          }
        })
        this.$refs.singleTable1.toggleRowExpansion(row,true);

          this.$message({
            message: '成功!',
            type: 'warning'
          })
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
        debugger
        this.$message({
          message: '订单查询失败!',
          type: 'warning'
        })
      })
    },
    cancelOrders(row, index) {
      debugger
      this.$refs.singleTable1.toggleRowExpansion(row,false);
      let orders = [];
      let cookie = row.cookie;
      if(row.list){
        row.list.forEach(function(value,index,array){
          let order = {cookie:cookie, id:value.id};
          orders.push(order);
        })

        request({
          url: '/cancelOrders',
          method: 'post',
          data: orders
        }).then(response => {
            debugger
            this.$message({
              message: '成功!',
              type: 'warning'
            })
            this.showOrders(row,index)
          }
        ).catch(() => {
          debugger
          this.$message({
            message: '失败!',
            type: 'warning'
          })
        })
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
        orders.push(order);
      })

      request({
        url: '/activeCookie',
        method: 'post',
        data: orders
      }).then(response => {
          debugger
          this.$message({
            message: '发送请求成功，保持登陆信息有效性!',
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
      this.timeOutVar = setTimeout(() => {
        this.timeoutBegin();
      }, 20000);
    },
    timeoutEnd(){
      clearTimeout(this.timeOutVar)
    }
  }
}
</script>
