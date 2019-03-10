<template>
  <div id="patient">
    <div class="patientMain container">
      <el-row>
        <el-col :span="18" class="condition_right">
        <div>
          <el-button v-has-permission="602" @click="handleCreate" class="operateBtn" style="float:right">
            <svg-icon class="icon" icon-class="add_t"></svg-icon> 新增
          </el-button>
        </div>
      </el-col>
      </el-row>
      <div class="line70"></div>
      <div class="tableBg" style="height: calc(100% - 90px)">
        <div class="table-container">
          <el-table ref="singleTable"
                    :data="page.pageList"
                    v-loading="loading2"
                    border
                    fit
                    height="600px"
                    element-loading-text="加载中，请稍后"
                    header-row-class-name="tableHeader"
                    highlight-current-row @current-change="handleCurrentRow">
            <el-table-column fixed width="40">
              <template slot-scope="scope">{{ scope.$index+1 }}</template>
            </el-table-column>
            <el-table-column prop="name" label="姓名" width="120" fixed sortable>
            </el-table-column>
            <el-table-column prop="pwd" label="密码" width="120" fixed sortable>
            </el-table-column>
            <el-table-column prop="endtime" label="到期时间" width="120" fixed sortable>
              <template slot-scope="scope">
                {{ scope.row.endtime | filterBirthDay }}
              </template>
            </el-table-column>
            <el-table-column prop="useSize" label="最大单日挂号数" width="220" fixed sortable>
            </el-table-column>
            <el-table-column prop="days" label="剩余天数" width="120" fixed sortable>
              <template slot-scope="scope">
                {{ scope.row.days }}天 {{ scope.row.hours }}小时
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作" fixed="right" min-width="120">
              <template slot-scope="scope">
                <el-button @click="handleUpdate(scope.row)" title="修改">
                  修改
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!--<div class="page">
        <div class="pagination-container">
          <el-pagination background :page-sizes="[10,20,30,40,100]" :page-size="page.pageSize"
                         layout=" total,sizes, prev, pager, next,  jumper" :total="page.totalCount"
                         >
          </el-pagination>
        </div>
      </div>-->
    </div>
    <!--</template>-->
    <!--新建修改子模块-->
    <addOrEdit ref="addOrEdit"
               v-on:getList="getList">
    </addOrEdit>
  </div>
</template>

<script>
  import addOrEdit from './addOrEdit';
  import request from '@/utils/request'

  export default {
    name: 'index',
    components: {addOrEdit},
    data () {
      return {
        loading2: false,
        showAddOrEdit: false,
        listLoading: false,
        currentRow: '',
        dataLists: [],
        page: {
          pageNum: 1,
          pageSize: 10,
          search: '',
          totalCount: 0,
          totalPage: 0,
          pageList: []
        },
      };
    },
    methods: {
      handleCreate () {
        this.showAddOrEdit = true;
        this.$refs.addOrEdit.create();
      },

      getList (obj) {
        this.loading2 = true;
        this.showAddOrEdit = false;
        this.listLoading = true;
        const params = {};
        params['page'] = this.page.pageNum;
        params['size'] = this.page.pageSize;

        request(
          {
            url: '/user/list',
            method: 'post',
            data: params
          }).then(data => {
          this.loading2 = false;
          let listData = data.data;
          this.page.pageList = listData;
          var time_now = new Date(); // 获取当前时间
          time_now = time_now.getTime();
          this.page.pageList.forEach((row,index,array) => {
            var time_distance = row.endtime - time_now; // 结束时间减去当前时间
            if(time_distance >= 0) {
              row.days = Math.floor(time_distance / 86400000)
              time_distance -= row.days * 86400000;
              row.hours =  Math.floor(time_distance/3600000)
            }else {
            }
          })

          /*this.page.totalCount = data.data.total;
          this.page.totalPage = (this.page.totalCount + this.page.pageSize - 1) / this.page.pageSize;*/
          this.listLoading = false;

        }).catch(({code, msg}) => {
          this.loading2 = false;
          this.$message.error(msg);
        }
        );
      },

      handleCurrentRow (val) { // 选中一行的数据
        this.currentRow = val;
      },

      handleUpdate (row) {
        this.showAddOrEdit = true;
        this.$refs.addOrEdit.create(row);
      },

      formateData (time) { // 格式化日期
        time = new Date(time);
        return this._formatDate(time, 'yyyy-MM-dd');
      },
    },
    created () {
      this.getList();
    }
  };
</script>
