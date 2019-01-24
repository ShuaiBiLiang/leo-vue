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
          <el-input v-model="form.desc" type="textarea" placeholder="请输入 ‘账号 密码 验证码’ 如果有多个，请换行。"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getCookies">提交</el-button>
          <!--<el-button @click="onCancel">Cancel</el-button>-->
        </el-form-item>
      </el-form>
    </div>
    <br>
    <span><el-button type="primary" @click="batchCommit">批量提交</el-button></span>
    <span style="color:red;">{{ currentPrice }}</span>
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
          {{ scope.row.cookie }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="价格" width="110" align="center">
        <template slot-scope="scope">
          <el-input v-model.trim="scope.row.price" :maxlength="10" size="small" @change="showQt(scope.row.price)"/>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="数量" width="110" align="center">
        <template slot-scope="scope">
          <el-input v-model.trim="scope.row.qt" :maxlength="10" size="small" @change="showQt(scope.row.qt)"/>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="Display_time" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time"/>
          <el-button type="mini" @click="loginLeo">重新登录</el-button>
          <el-button @click="delRow(scope.row, scope.$index)">删除</el-button>
          <el-button @click="commitRow(scope.row, scope.$index)">提交</el-button>
          <el-button @click="refreshRow(scope.row, scope.$index)">刷新价格</el-button>
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
      currentPrice: null
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
        method: 'post'
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
      this.multipleSelection.forEach(row => {
        console.log(row.name + row.pwd)
      })
    },
    commitRow(row, index) {
      /* const name = row.name
      const pwd = row.pwd
      const cookie = row.cookie
      const price = row.price
      const num = row.num*/
      debugger
      request({
        url: '/getCookies',
        method: 'post'
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
    refreshRow(row, index) {
      /* const name = row.name
      const pwd = row.pwd
      const cookie = row.cookie
      const price = row.price
      const num = row.num*/
      debugger
      request({
        url: '/leo/price',
        method: 'post'
      }).then(response => {
        // console.log(response)
        debugger
        this.currentPrice = response.data.price
      }
      ).catch(() => {
        this.listLoading = false
      })
    }
  }
}
</script>
