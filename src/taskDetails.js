import React from "react";
import { Input, Button, Alert, message } from "antd";
import jenkinsContext from "./my/util/JenkinsContext";

export default class TaskDetails extends React.Component {
  componentDidMount() {
    console.log(jenkinsContext.isLogin);
  }

  render() {
    return (
      <div className="wrapper">
        {/* 顶部登录模块 */}
        <div>
          <div
            className={[
              "Homeuser",
              false === jenkinsContext.isLogin ? null : "noDisplay"
            ].join(" ")}
          >
            <div className="name">
              <Input
                type="text"
                size="large"
                placeholder="id"
                onChange={e => {
                  console.log(e.target.value);
                  jenkinsContext.userId = e.target.value;
                  // this.setState({
                  //   userId:e.target.value
                  // })
                }}
              />
            </div>
            <div className="homeId">
              <Button
                type="primary"
                size="large"
                onClick={() => {
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
              true === jenkinsContext.isLogin ? null : "noDisplay"
            ].join(" ")}
          >
            <div id="loginState">
              <Alert
                message={jenkinsContext.userId}
                description={jenkinsContext.IPaddress}
                type="success"
                className="Alert"
              />
            </div>
          </div>
        </div>
        {/* 信息栏 */}
      </div>
    );
  }
}
