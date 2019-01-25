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
    <span><el-button type="primary" @click="batchCommit" style="float:right;">批量提交</el-button></span>
    <div>
      <el-input style="width:150px" v-model="batchPrice" placeholder="请输入价格"></el-input><el-button @click="batchUpdatePrice">批量填写价格</el-button>
      <el-input style="width:150px" v-model="batchQt" placeholder="请输入数量"></el-input><el-button @click="batchUpdateQt">批量填写数量</el-button>
    </div>
    <el-table
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
      <el-table-column align="center" prop="created_at" label="操作" width="400">
        <template slot-scope="scope">
          <!--<i class="el-icon-time"/>-->
          <el-button size="mini" @click="loginLeo">重新登录</el-button>
          <el-button size="mini" @click="delRow(scope.row, scope.$index)">删除</el-button>
          <el-button size="mini" @click="commitRow(scope.row, scope.$index)">提交</el-button>
          <el-button size="mini" @click="refreshRow(scope.row, scope.$index)">刷新价格</el-button>
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



export default {
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
      listLoading: true,
      userList: null,
      showDialog: true,
      form: {
        userInfo: ''
      },
      multipleSelection: [],
      currentPrice: null,
      currentPriceTime: null,
      batchPrice:'',
      batchQt:''
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
      request({
        url: '/getCookies',
        method: 'post',
        data: { userInfo: this.form.userInfo }
      }).then(response => {
        // console.log(response)
        debugger
        this.userList = response.data
        this.listLoading = false
        this.showDialog = false
      }
      ).catch(() => {
        this.listLoading = false
      })
    },
    loginLeo() {
      /* request({
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
        this.$message({
          message: '成功!',
          type: 'warning'
        })
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
      request({
        url: '/commit',
        method: 'post',
        data: [{ name: row.name, cookie: row.cookie, price: row.price, num: row.qt }]
      }).then(response => {
        debugger
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
        this.$message({
          message: '成功!',
          type: 'warning'
        })
      })
    },
    refreshRow(row, index) {
      debugger
      request({
        url: '/price',
        method: 'post',
        data: { userInfo: row.cookie }
      }).then(response => {
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
    }
  }
}
</script>
