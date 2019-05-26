import React, { Component, PropTypes } from "react";
import jenkinsContext from "../util/JenkinsContext";
import { Input, Button, Alert, message } from "antd";
import store from '../store.js';
class userState extends React.Component {
  state = {
    isLogin: false,
    enable: false,
    userId:'',
    IPaddress:''
  };
  render() {
    var _this = this;
    function getUser(userId) {
      console.log("你点击了登录按钮");
      fetch("http://149.129.127.108:9090/user?userId=" + _this.state.userId)
        .then(res => res.json())
        .then(data => {
          console.log(data);
          if (data.code === 200) {
            message.success("登录成功！");
            console.log("获取主机名称：" + data.data);
            // jenkinsContext.isLogin = !jenkinsContext.isLogin;
            // jenkinsContext.IPaddress = data.data;
            _this.setState({
              isLogin: true,
              enable: true,
              IPaddress:data.data
            });
          } else {
            message.error("登录失败，请重试！");
          }
        }).then(()=>{
          Object.assign(store, this.state.isLogin)
        });
    }
    function getTaskList(userId) {
      fetch("http://149.129.127.108:9090/job/types?userId=" + userId)
        .then(res => res.json())
        .then(data => {
          console.log(data.data);
          console.log(userId);
          jenkinsContext.dataList = data.data;
          console.log(jenkinsContext.dataList);
        });
    }
    return (
      <div>
        <div
          className={[
            "Homeuser",
            false === this.state.isLogin ? null : "noDisplay"
          ].join(" ")}
        >
          <div className="name">
            <Input
              type="text"
              size="large"
              placeholder="id"
              onChange={e => {
                console.log(e.target.value);
                // jenkinsContext.userId = e.target.value;
                this.setState({
                  userId:e.target.value
                })
              }}
            />
          </div>
          <div className="homeId">
            <Button
              type="primary"
              size="large"
              onClick={() => {
                getUser(jenkinsContext.userId);
                getTaskList(jenkinsContext.userId);
                this.setState({});
              }}
            >
              登录
            </Button>
          </div>
        </div>
        <div
          className={[
            "Homeuser",
            true === this.state.isLogin ? null : "noDisplay"
          ].join(" ")}
        >
          <div id="loginState">
            <Alert
              message={this.state.userId}
              description={this.state.IPaddress}
              type="success"
              className="Alert"
            />
          </div>
        </div>
      </div>
    );
  }
}
export default userState;
