import React, { Component } from "react";
import SaveButton from "./SaveButton";
import PropTypes from "prop-types";
import { Input, Button, Alert, message, Select, Checkbox } from "antd";
import jenkinsContext from "../util/JenkinsContext";
import pipelineStore from "../service/PipelineStore";
import { convertInternalModelToJson } from "../service/PipelineSyntaxConverter";
import {withPropsAPI} from "gg-editor";

const Option = Select.Option;
class topBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: false,
      enable: false,
      userId: "",
      IPaddress: "",
      dataList: []
    };
  }
     resolveData=(data)=> {
        console.log("保存:" + JSON.stringify(data));

        //获取起始节点的stage,完成全局初始化
        let nodeList = data.nodes;
        let edgeList = data.edges;
        let contextNode = nodeList.filter(currentValue => {
            return currentValue.id === "00000";
        })[0];

        let contextStage = jenkinsContext.stageMap[9999];

        console.log("contextStage:" + JSON.stringify(contextStage));

        pipelineStore.setPipeline(JSON.parse(JSON.stringify(contextStage)));
        console.log(
            "pipelineStore.pipeline:" + JSON.stringify(pipelineStore.pipeline)
        );
        if (!edgeList) {
            message.error("起始节点未连接！");
            console.log("起始节点未连接！");
            return;
        }
        let currentEdges = edgeList.filter(currentValue => {
            return currentValue.source === "00000";
        });
        if (currentEdges.length !== 1) {
            console.log(
                contextNode.label +
                "节点" +
                contextNode.id +
                "有" +
                currentEdges.length +
                "条边！"
            );
            return;
        }
        let currentEdge = currentEdges[0];
        let currentStage = JSON.parse(JSON.stringify(contextStage));

        while (currentEdge) {
            console.log("currentEdge:" + JSON.stringify(currentEdge));
            //找出下一节点
            let targetId = currentEdge.target;
            let currentNode = nodeList.filter(currentValue => {
                return currentValue.id === targetId;
            })[0];
            if (!targetId) {
                break;
            }
            if (currentNode.myProps.stageType === "leader") {
                currentStage = JSON.parse(
                    JSON.stringify(jenkinsContext.stageMap[currentNode.myProps.stageId])
                );
                console.log("addSequentialStage:" + currentStage);
                pipelineStore.addSequentialStage(currentStage);
            }
            console.log("add step:" + JSON.stringify(currentNode.myProps.step));
            pipelineStore.addOldStep(currentStage, null, currentNode.myProps.step);

            let currentEdges = edgeList.filter(currentValue => {
                return currentValue.source === currentNode.id;
            });
            if (currentEdges.length !== 1) {
                console.log(
                    currentNode.label +
                    "节点" +
                    currentNode.id +
                    "有" +
                    currentEdges.length +
                    "条边！"
                );
                break;
            }
            currentEdge = currentEdges[0];
        }

        console.log(
            "convertInternalModelToJson:" +
            JSON.stringify(convertInternalModelToJson(pipelineStore.pipeline))
        );
        console.log(
            encodeURIComponent(convertInternalModelToJson(pipelineStore.pipeline))
        );
        fetch(
            "http://149.129.127.108:9090/job/convert/jsonToJenkinsfile?jenkinsJson=" +
            encodeURIComponent(
                convertInternalModelToJson(pipelineStore.pipeline)
            ),
            {
                method: "POST"
            }
        )
            .then(res => res.json())
            .then(data => {
                console.log("data json:" + JSON.stringify(data));
            })
            .catch(err => {
                console.log("error json:" + JSON.stringify(err));
            });
        console.log("contextStage last:" + JSON.stringify(contextStage));
    };
    handleSaveClick=()=> {
        const { propsAPI } = this.props;
        let data = propsAPI.save();
        this.resolveData(data);
    };
  render() {
    var _this = this;
    function getUser(userId) {
      console.log("你点击了登录按钮");
      fetch("http://149.129.127.108:9090/user?userId=" + userId)
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
              IPaddress: data.data
            });
          } else {
            message.error("登录失败，请重试！");
          }
        })
        .then(() => {
          // Object.assign(store, this.state.isLogin)
        });
    }
    function getTaskList(userId) {
      console.log("正在获取任务类型...");
      fetch("http://149.129.127.108:9090/job/types?userId=" + userId)
        .then(res => res.json())
        .then(data => {
          console.log(data.data);
          // jenkinsContext.dataList = data.data;
          // console.log("jenkinsContext:" + jenkinsContext.dataList[0]);
          _this.setState({dataList: data.data})
        });
    }
    function handleChange(value) {
      console.log(`selected ${value}`);
    }
    function onChange(e) {
      console.log(`checked = ${e.target.checked}`);
    }


    return (
      <div className="TopBar">
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
                message={jenkinsContext.userId}
                description={this.state.IPaddress}
                type="success"
                className="Alert"
              />
            </div>
          </div>
        </div>
        <Button
          disabled={!this.state.isLogin}
          id="saveBtn"
          type="primary"
          onClick={() => {
            this.handleSaveClick();
          }}
          size="large"
        >
          保存
        </Button>
        <div>
          <div className="navInput">
            <Input size="large" placeholder="Job Name" />
            <Select
              defaultValue="选择类型"
              style={{ width: 120 }}
              onChange={handleChange}
              size="large"
            >
              <Option value="caseO">{this.state.dataList[0]}</Option>
            </Select>
            <Input size="large" placeholder="接受触发工程URL" />
            <Input size="large" placeholder="项目描述" id="todoCheck" />
            <Checkbox onChange={onChange} defaultChecked={true}>
              保存自动运行
            </Checkbox>
          </div>
        </div>
      </div>
    );
  }
}
topBar.propTypes = {
  enable: PropTypes.bool
};
export default withPropsAPI(topBar);
