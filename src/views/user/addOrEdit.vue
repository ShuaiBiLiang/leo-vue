<template>
  <el-dialog :title="textMap[dialogStatus]" custom-class="medium" @close='closeDialog'
             :visible.sync="dialogShow" :close-on-click-modal="false">
    <el-form :rules="rules1" ref="form" :model="form" label-width="120px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="姓名:" prop="name" class="customClass">
            <el-input v-model.trim="form.name" placeholder="请输入" maxlength="10">
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="密码:" prop="pwd" class="customClass">
            <el-input v-model.trim="form.pwd" placeholder="请输入" maxlength="10">
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="可挂号数量:" prop="useSize" class="customClass">
            <el-input v-model.trim="form.useSize" placeholder="请输入" maxlength="10">
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="到期时间:" prop="endtime" class="customClass">
            <el-date-picker v-model.trim="form.endtime" type="date"
                            :clearable="false" ref="endtime"
                            :picker-options="pickerOptions">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
         <el-button type="primary" @click="submitForm('form')">保 存</el-button>
         <el-button @click="dialogShow = false" >取 消</el-button>
      </span>
  </el-dialog>
</template>
<script>
  import request from '@/utils/request'

  export default {
    name: 'addOrEdit',
    props: [],

    data () {

      return {
        dialogStatus: '',
        pickerOptions: {// 出生日期不能超过当前时间
          disabledDate (time) {
            return time.getTime() < Date.now();
          }
        },
        textMap: {
          update: '【修改】',
          create: '【新增】'
        },
        dialogTitle: '【修改】',
        dialogShow: false,
        temp: {},
        form: {
          id:null,
          name: null,
          pwd:null,
          useSize:null,
          endtime:null
        },
        rules1: {
          name: [{required: true, message: '请输入姓名', trigger: 'blur'}],
          pwd: [{required: true, message: '请输入密码', trigger: 'blur'}],
          endtime: [{required: true, message: '请选择日期', trigger: 'blur'}],
        },
        pickerOptions: {// 出生日期不能超过当前时间
          disabledDate (time) {
            return time.getTime() < Date.now();
          }
        }
      };
    },
    created () {
    },
    mounted () {
    },
    methods: {
      create (row) {
        this.dialogStatus = 'create';
        this.dialogShow = true;
        this.$nextTick(() => {
          if (row) {
            Object.assign(this.form, row); // copy obj
            this.form.endtime = new Date(this.form.endtime);
            this.dialogStatus = 'update';
            this.dialogShow = true;
          } else {
            debugger
            this.$refs['form'].resetFields();
          }
        });
      },
      closeDialog () {
        this.$refs['form'].resetFields(() => {
          this.$emit('getList');
        });
      },
      submitForm (obj) { // 新增角色修改角色提交
        this.$refs[obj].validate((valid) => {
          if (valid) {
            let tip = '';
            this.form.endtime = new Date(this.form.endtime).getTime();
            if (this.dialogStatus === 'create') {
              tip = '新增成功!';
              this.form.id = null;
            } else {
              tip = '修改成功!';
            }
            request({
              url: '/user/save',
              method: 'post',
              data: this.form
            } ).then(data => {
              this.dialogShow = false;
              this.$message.success(tip);
              this.$emit('getList');
            }).catch(({code, msg}) => {
              this.$message.error(msg);
            });
          } else {
            return false;
          }
        });
      },
    }

  };
</script>

