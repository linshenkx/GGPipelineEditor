import React from "react";
import { Input, Button, Alert, Table, Divider, Tag } from "antd";
import jenkinsContext from "./my/util/JenkinsContext";
import "./taskDetails.css";

// const data = [
//   {
//     key: "1",
//     result: this.state.result,
//     ID: this.state.ID,
//     shortDescription: this.state.shortDescription,
//     duration: this.state.duration,
//     timestamp: this.state.timestamp
//   }
// ];
// const columns = [
//   {
//     title: "状态",
//     dataIndex: "result",
//     key: "result",
//     render: result => (
//       <Tag color={result === "SUCCESS" ? "green" : "red"} key={result}>
//         {result.toUpperCase()}
//       </Tag>
//     )
//   },
//   {
//     title: "ID",
//     dataIndex: "ID",
//     key: "ID"
//   },
//   {
//     title: "触发信息",
//     dataIndex: "shortDescription",
//     key: "trigger"
//   },
//   {
//     title: "持续时间",
//     key: "duration",
//     dataIndex: "duration"
//   },
//   {
//     title: "执行日期",
//     key: "timestamp",
//     dataIndex: "timestamp"
//   }
// ];

export default class TaskDetails extends React.Component {
  state={
    state:jenkinsContext.result,
    ID:jenkinsContext.id,
    trigger:jenkinsContext.id,
    shortDescription:jenkinsContext.shortDescription,
    duration:jenkinsContext.duration,
    timestamp:jenkinsContext.timestamp,
  }
  componentDidMount() {
    console.log(jenkinsContext.isLogin);
  }
  render() {
    return (
      <div className="wrap">
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
                    jenkinsContext.getUser(jenkinsContext.userId);
                    jenkinsContext.getTaskList(jenkinsContext.userId);
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
              <Alert message={jenkinsContext.jobName} type="success" />
            </div>
            <div className="description">
              <Alert message={jenkinsContext.description} type="success" />
            </div>
            <div className="isRunning">
              <Alert message={jenkinsContext.isRunning} type="success" />
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
          <div className="body_left">
            <Table
              columnWidth={"100"}
              // columns={columns}
              // dataSource={data}
              id="showTable"
            />
          </div>
        </div>
      </div>
    );
  }
}
