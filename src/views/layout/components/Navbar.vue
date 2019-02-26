<template>
  <div>
  <el-menu class="navbar" mode="horizontal">
    <hamburger :toggle-click="toggleSideBar" :is-active="sidebar.opened" class="hamburger-container"/>
    <breadcrumb />
    <div class="avatar-container">
      <span style="padding: 10px;color:#97a8be;" >{{ user.name }}</span>
      <!--<span style="padding: 10px;color:#97a8be;" >到期时间：{{ user.endtime| filterBirthDay}}</span>
      <span style="padding: 10px;color:#97a8be;" >剩余：{{ user.days}}天</span>-->
      <span id="times_wrap" class="time_num">
        剩余时间：
        <span class="time_w">
          <b id="times_d" class="time"> </b>天
          <b id="times_h" class="time"> </b>时
          <b id="times_m" class="time"> </b>分
          <b id="times_s" class="time"> </b>秒
        </span>
      </span>

  <span style="padding: 10px;color:#97a8be;" >单日可挂号数：{{ user.useSize}}</span>
  <el-button type="text" style="padding: 10px;font-size:16px" @click="logout">退出</el-button>
  <!--<el-button type="text" style="padding: 10px;font-size:16px" @click="modifyPwd">修改密码</el-button>-->
  <el-button type="text" style="padding: 10px;font-size:16px" @click="modifyPwd">修改密码</el-button>
    </div>
  </el-menu>

    <!--<el-dropdown class="avatar-container" >

      &lt;!&ndash;<div class="avatar-wrapper">
        <svg-icon icon-class="user2" />
        <i class="el-icon-caret-bottom"/>
      </div>
      <el-dropdown-menu slot="dropdown" class="user-dropdown">
        &lt;!&ndash;<router-link class="inlineBlock" to="/">
          <el-dropdown-item>
            Home
          </el-dropdown-item>
        </router-link>&ndash;&gt;
        <el-dropdown-item divided>
          <span style="display:block;" @click="logout">退出</span>
        </el-dropdown-item>
      </el-dropdown-menu>&ndash;&gt;
    </el-dropdown>-->


    <div class="reset-container">


    <el-dialog title="修改密码" :visible.sync="dialogFormVisible" >
      <el-form :model="form" :rules="rules1" ref="userPwd">
        <el-form-item label="旧密码"  prop="oldPwd" label-width="120px">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
          <el-input :type="pwdType"  v-model="form.oldPwd" autocomplete="off"></el-input>
          <span class="show-pwd" @click="showPwd">
              <svg-icon icon-class="eye" />
            </span>
        </el-form-item>
        <el-form-item label="新密码"  prop="pwd" label-width="120px">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
          <el-input :type="pwdType"  v-model="form.pwd" autocomplete="off"></el-input>
            <span class="show-pwd" @click="showPwd">
              <svg-icon icon-class="eye" />
            </span>
        </el-form-item>
        <!--<el-form-item label="活动区域" :label-width="formLabelWidth">
          <el-select v-model="form.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="resetPwd">确 定</el-button>
      </div>
    </el-dialog>
    </div>
    <!--<el-dialog title="修改密码" custom-class="medium"
               :close-on-click-modal="false">
      <el-form :rules="rules1" ref="userPwd" :model="user" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="新密码:" prop="pwd" class="customClass">
              <el-input v-model.trim="user.pwd" placeholder="请输入" maxlength="10">
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
         <el-button type="primary" @click="resetPwd('form')">保 存</el-button>
         <el-button @click="dialogShow = false" >取 消</el-button>
      </span>
    </el-dialog>-->
  </div>
</template>

<script>

import request from '@/utils/request'
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'

export default {
  data() {
    const validatePass = (rule, value, callback) => {
      if (value.length < 5) {
        callback(new Error('密码不能小于5位'))
      } else {
        callback()
      }
    }
    return {
      user:{name:'',endtime:'',useSize:''},
      dialogShow:true,
      dialogFormVisible:false,
      time_end:null,
      form:{
          id:null,
        oldPwd:null,
        pwd:null,
      },
      rules1: {
        pwd: [{required: true, message: '新密码不能小于5位', trigger: 'blur', validator: validatePass}],
        oldPwd: [{required: true, message: '请输入旧密码', trigger: 'blur'}],
      },
      pwdType: 'password',
      timeOutVar:null,
    }
  }
,
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  created(){
    debugger
    let userInfo = sessionStorage.getItem('user');
    if(userInfo){
      this.user = JSON.parse(userInfo);
    }else {
      this.$router.push({ path: '/login' })
    }

  },
  mounted(){
    debugger
    if(!sessionStorage.getItem('user')){
      this.$router.push({ path: '/form/index' })
    }
    if(this.user){
      this.time_end = this.user.endtime;
      this.show_time();
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload() // 为了重新实例化vue-router对象 避免bug
      })
    },
    modifyPwd(){
      this.dialogFormVisible = true;
     /* this.$refs.userPwd.resetFields(()=>{
        this.form.id = this.user.id;
      });*/
      this.form.id = this.user.id;
      this.form.oldPwd = '';
      this.form.pwd = '';

    },
    resetPwd(){

      this.$refs.userPwd.validate(valid => {
        if (valid) {
          request({
            url: '/user/resetPwd',
            method: 'post',
            data: this.form
          } ).then(data => {
            this.dialogFormVisible = false;
            this.$message.success("修改密码成功");
          }).catch(({status, msg}) => {
            this.$message.error(msg);
          });
        } else {
          console.log('error submit!!')
          return false
        }
      })

    },
    showPwd() {
      if (this.pwdType === 'password') {
        this.pwdType = ''
      } else {
        this.pwdType = 'password'
      }
    },
    show_time(){

      debugger
      var time_wrap = document.getElementById("times_wrap");
      var time_d = document.getElementById("times_d");
      var time_h = document.getElementById("times_h");
      var time_m = document.getElementById("times_m");
      var time_s = document.getElementById("times_s");

      var time_now = new Date(); // 获取当前时间
      time_now = time_now.getTime();
      var time_distance = this.time_end - time_now; // 结束时间减去当前时间
      var int_day, int_hour, int_minute, int_second;
      if(time_distance >= 0){
        // 天时分秒换算
        int_day = Math.floor(time_distance/86400000)
        time_distance -= int_day * 86400000;
        int_hour = Math.floor(time_distance/3600000)
        time_distance -= int_hour * 3600000;
        int_minute = Math.floor(time_distance/60000)
        time_distance -= int_minute * 60000;
        int_second = Math.floor(time_distance/1000)

        // 时分秒为单数时、前面加零站位
        if(int_hour < 10)
          int_hour = "0" + int_hour;
        if(int_minute < 10)
          int_minute = "0" + int_minute;
        if(int_second < 10)
          int_second = "0" + int_second;

        // 显示时间
        time_d.innerHTML = int_day;
        time_h.innerHTML = int_hour;
        time_m.innerHTML = int_minute;
        time_s.innerHTML = int_second;

        this.timeOutVar = setTimeout(() => {
          this.show_time();
        }, 1000);
      }else{
        time_d.innerHTML = time_d.innerHTML;
        time_h.innerHTML = time_h.innerHTML;
        time_m.innerHTML = time_m.innerHTML;
        time_s.innerHTML = time_s.innerHTML;

        // clearTimeout(timerID)
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  $bg:#2d3a4b;
  $light_gray:#eee;
  $dark_gray:#889aa4;
.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  .avatar-wrapper{
    font-size:35px;
  }
  .time_num{
    padding: 10px;color:#97a8be;
  }
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  .screenfull {
    position: absolute;
    right: 90px;
    top: 16px;
    color: red;
  }
  .avatar-container {
    height: 50px;
    display: inline-block;
    position: absolute;
    right: 35px;
    .avatar-wrapper {
      cursor: pointer;
      margin-top: 5px;
      position: relative;
      line-height: initial;
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 10px;
      }
      .el-icon-caret-bottom {
        position: absolute;
        right: -20px;
        top: 25px;
        font-size: 12px;
      }
    }
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}

.reset-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: #fff !important;
      }
    }
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.5);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

