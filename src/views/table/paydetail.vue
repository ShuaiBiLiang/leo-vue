<template>
  <div>

    <p v-if="availableBalance" style="float: left; height: 60px; margin: 10px 15px 0px 20px;" class="el-tag">
      <span >可用币量：Ⱡ{{availableBalance}}</span>
      <br/>
      <span >收入账户：{{earningAccount}}</span>
    </p>
    <div v-if="listIn">


    <el-table
      height="80px"
      :data="listIn"
      v-loading="loading2"
      element-loading-text="加载中，请稍后"
      style="width: 700px!important;margin-left: 200px;border: 1px solid #dcdcdc;"
    >
      <el-table-column  width="40" type="index" label=" ">
      </el-table-column>

      <!-- cancelSuccess: false
      cookie: null
      cost: "14.52"
      dateTime: "Feb  1 2019  1:30AM"
      id: "Id=2076843"
      name: null
      orderType: "Sell"
      price: "0.1452"
      status: "Active"
      volume: "100" -->

      <el-table-column prop="id" label="编号" width="100" min-width="60" show-overflow-tooltip/>
      <!--<el-table-column prop="orderType" label="类型" width="100" min-width="60" show-overflow-tooltip/>-->
      <el-table-column prop="price" label="价格" width="100" show-overflow-tooltip/>
      <!--<el-table-column prop="cost" label="总价" width="100" show-overflow-tooltip/>-->
      <el-table-column prop="volume" label="数量" width="80" align="right" show-overflow-tooltip/>
      <el-table-column prop="status" label="状态" width="120" show-overflow-tooltip/>
      <el-table-column prop="dateTime" label="时间" min-width="100" show-overflow-tooltip/>
    </el-table>
    </div>
    <div v-else>
      <p>暂无订单数据</p>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'dragDetail',
    props: ['list','availableBalance','earningAccount'],
    data () {
      return {
        loading2: false,
        listIn: [],
        loadSign: true,
        availableBalance:null,
        earningAccount:null,
      };
    },
    created () {
      debugger
      this.listIn = this.list;
      // this.availableBalance = this.availableBalance;
      // this.earningAccount = this.earningAccount;
    },
    methods: {
      queryRecipeList () {

      }
    }
  };
</script>
