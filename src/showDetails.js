import React from "react";
import { Input, Button, Alert, Table, Icon } from "antd";
import jenkinsContext from "./my/util/JenkinsContext";
import "./showDetails.css";
const Search = Input.Search;
const columns = [
  {
    title: "Jobame",
    dataIndex: "name",
    render: text => <a href="javascript:;">{text}</a>
  },
  {
    title: "Editable",
    dataIndex: "editable"
  }
];
const data = [
  {
    key: "1",
    name: "John Brown",
    editable: (
      <Icon
        type="edit"
        onClick={() => {
          console.log("click");
        }}
      />
    )
  },
  {
    key: "2",
    name: "Jim Green",
    editable: " "
  },
  {
    key: "3",
    name: "Joe Black",
    editable: <Icon type="edit" />
  }
];
export default class ShowDetails extends React.Component {
  state = {};
  componentDidMount() {}
  render() {
    return (
      <div className="showWraper">
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
        <div id="searchWrap">
          <Search
            placeholder="input search text"
            onSearch={value => console.log(value)}
            style={{ width: 200 }}
            size="large"
          />
        </div>
        <Button type="primary" size="large" id="newTask">
          <a href="#/">新建任务</a>
        </Button>
        <div id="detailsBody">
          <Table
            columns={columns}
            dataSource={data}
            bordered
            title={() => "工作列表"}
            footer={() => " "}
          />
        </div>
      </div>
    );
  }
}
