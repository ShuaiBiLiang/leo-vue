<template>
  <div>
    <div v-if="listIn">


    <el-table
      height="150px"
      :data="listIn"
      v-loading="loading2"
      element-loading-text="加载中，请稍后"
      style="width: 900px!important;margin-left: 300px;border: 1px solid #dcdcdc;"
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

      <el-table-column prop="id" label="id" width="100" min-width="60" show-overflow-tooltip/>
      <el-table-column prop="orderType" label="orderType" width="100" min-width="60" show-overflow-tooltip/>
      <el-table-column prop="price" label="price" width="100" show-overflow-tooltip/>
      <el-table-column prop="cost" label="cost" width="100" show-overflow-tooltip/>
      <el-table-column prop="volume" label="volume" width="100" align="right" show-overflow-tooltip/>
      <el-table-column prop="status" label="status" width="80" show-overflow-tooltip/>
      <el-table-column prop="dateTime" label="dateTime" min-width="100" show-overflow-tooltip/>
    </el-table>
    </div>
    <div v-else>
      <p>暂无订单</p>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'dragDetail',
    props: ['list'],
    data () {
      return {
        loading2: false,
        listIn: [],
        loadSign: true
      };
    },
    created () {
      debugger
      this.listIn = this.list;
    },
    methods: {
      queryRecipeList () {

      }
    }
  };
</script>
