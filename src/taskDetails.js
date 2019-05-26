import React from "react";
import { Input, Button, Alert, message, Card, Col, Row } from "antd";
import jenkinsContext from "./my/util/JenkinsContext";
import "./taskDetails.css";
const gridStyle = {
  width: "25%",
  textAlign: "center"
};
export default class TaskDetails extends React.Component {
  componentDidMount() {
    console.log(jenkinsContext.isLogin);
  }

  render() {
    return (
      <div className="wrapper">
        <div className="header">
          {/* 顶部登录模块 */}
          <div className="userLogin">
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
          <div className="middle">
            <div className="jobName">
              <Alert message="jobName" type="success" />
            </div>
            <div className="description">
              <Alert message="description" type="success" />
            </div>
            <div className="isRunning">
              <Alert message="isRunning" type="success" />
            </div>
          </div>
          {/* 是否运行 */}
          <div className="right">
            <div className="run">
              <Button type="primary" size="large">
                是否正在运行
              </Button>
            </div>
            <div className="isState">
              <Button type="primary" size="large">
                Disable/Enable
              </Button>
            </div>
          </div>
        </div>
        <div className="body">
          <div className="left">
            <Card title="Card Title" noHovering>
              <Card.Grid style={gridStyle}>Content</Card.Grid>
              <Card.Grid style={gridStyle}>Content</Card.Grid>
              <Card.Grid style={gridStyle}>Content</Card.Grid>
              <Card.Grid style={gridStyle}>Content</Card.Grid>
              <Card.Grid style={gridStyle}>Content</Card.Grid>
              <Card.Grid style={gridStyle}>Content</Card.Grid>
              <Card.Grid style={gridStyle}>Content</Card.Grid>
            </Card>
          </div>
          <div className="right" />
        </div>
      </div>
    );
  }
}
