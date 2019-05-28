import React from "react";
import PropTypes from "prop-types";
import { Input, Button, Alert, message, Select, Checkbox } from "antd";
import jenkinsContext from "../util/JenkinsContext";
import pipelineStore from "../service/PipelineStore";
import { convertInternalModelToJson } from "../service/PipelineSyntaxConverter";
import { withPropsAPI } from "gg-editor";
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
  resolveData = data => {
    //获取起始节点的stage,完成全局初始化
    let nodeList = data.nodes;
    let edgeList = data.edges;
    let contextNode = nodeList.filter(currentValue => {
      return currentValue.id === "00000";
    })[0];

    let contextStage = jenkinsContext.stageMap[9999];
    pipelineStore.setPipeline(JSON.parse(JSON.stringify(contextStage)));
    if (!edgeList) {
      message.error("起始节点未连接！");
      return;
    }
    let currentEdges = edgeList.filter(currentValue => {
      return currentValue.source === "00000";
    });
    if (currentEdges.length !== 1) {
      return;
    }
    let currentEdge = currentEdges[0];
    let currentStage = JSON.parse(JSON.stringify(contextStage));

    while (currentEdge) {
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
        pipelineStore.addSequentialStage(currentStage);
      }
      pipelineStore.addOldStep(currentStage, null, currentNode.myProps.step);
      let currentEdges = edgeList.filter(currentValue => {
        return currentValue.source === currentNode.id;
      });
      if (currentEdges.length !== 1) {
        break;
      }
      currentEdge = currentEdges[0];
    }

    //第一个请求，获取jenkinsfile
    fetch(
      "http://149.129.127.108:9090/job/convert/jsonToJenkinsfile?jenkinsJson=" +
        encodeURIComponent(
          JSON.stringify(convertInternalModelToJson(pipelineStore.pipeline))
        ) +
        "&userId=" +
        jenkinsContext.userId,
      {
        method: "POST"
      }
    )
      .then(res => res.json())
      .then(data => {
        jenkinsContext.jenkinsfile = data.data.jenkinsfile;
        jenkinsContext.jenkinsfile = encodeURIComponent(
          jenkinsContext.jenkinsfile
        );
        if (data.data.result === "failure") {
          // message.error("缺少输入脚本！");
        }
      })
      .then(() => {
        fetch(
          "http://149.129.127.108:9090/job/create?description=" +
            jenkinsContext.description +
            "&init=" +
            jenkinsContext.isAutoRun +
            "&jenkinsfile=" +
            jenkinsContext.jenkinsfile +
            "&jobName=" +
            jenkinsContext.jobName +
            "&jobType=" +
            jenkinsContext.dataList[0] +
            "&projectUrl=" +
            jenkinsContext.handleURL +
            "&userId=" +
            jenkinsContext.userId,
          {
            method: "POST"
          }
        )
          .then(res => res.json())
          .then(data => {
            message.success("请求保存成功，正在运行..");
            // console.log(data);
          });
      });
  };
  handleSaveClick = () => {
    const { propsAPI } = this.props;
    let data = propsAPI.save();
    this.resolveData(data);
  };
  validate = name => {
    console.log("点击校验按钮");
    console.log(name);

    if (!name) {
      message.error("缺少参数！");
    }
  };
  saveData = () => {
    fetch(
      "http://149.129.127.108:9090/job/jobData?jobData=" +
        jenkinsContext.jobData +
        "&jobName=" +
        jenkinsContext.jobName +
        "&userId=" +
        jenkinsContext.userId,
      {
        method: "POST"
      }
    )
      .then(res => res.json())
      .then(data => {
        // console.log(data);
        if (data.data === "undefined") {
          // message.error("请输入任务名！");
        }
      });
  };
  taskDetails = () => {
    console.log("点击查看详情信息");
    message.loading("请求数据中..", 0);
    fetch(
      "http://149.129.127.108:9090/job/detail?jobName=git-checkout&userId=aaa"
    )
      .then(res => res.json())
      .then(data => {
        message.destroy();
        console.log(data.data);
        jenkinsContext.isRunning = data.data.buildModels[0].building;
        jenkinsContext.state = data.data.buildModels[0].result;
        jenkinsContext.id = data.data.buildModels[0].id;
        jenkinsContext.shortDescription =
          data.data.buildModels[0].actions[0].causes[0].shortDescription;
        jenkinsContext.duration = data.data.buildModels[0].duration;
        jenkinsContext.timestamp = data.data.buildModels[0].timestamp;
        
      });
  };
  render() {
    var _this = this;
    function getUser(userId) {
      fetch("http://149.129.127.108:9090/user?userId=" + userId)
        .then(res => res.json())
        .then(data => {
          if (data.code === 200) {
            message.success("登录成功！");
            jenkinsContext.isLogin = !jenkinsContext.isLogin;
            jenkinsContext.IPaddress = data.data;
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
      fetch("http://149.129.127.108:9090/job/types?userId=" + userId)
        .then(res => res.json())
        .then(data => {
          jenkinsContext.dataList = data.data;
          _this.setState({ dataList: data.data });
        });
    }
    function handleChange(value) {}

    return (
      <div className="TopBar">
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
                  jenkinsContext.userId = e.target.value;
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
        <Button
          type="primary"
          size="large"
          className="taskDetails"
          onClick={() => {
            this.taskDetails(jenkinsContext.jobName, jenkinsContext.userId);
          }}
        >
          <a href="#/taskDetails">查看任务详情</a>
        </Button>
        <Button
          id="saveData"
          type="primary"
          onClick={() => {
            const { propsAPI } = this.props;
            let data = propsAPI.save();
            jenkinsContext.jobData = encodeURIComponent(JSON.stringify(data));
            this.saveData();
          }}
          size="large"
        >
          保存编辑数据
        </Button>
        <Button
          disabled={!jenkinsContext.isLogin}
          id="saveBtn"
          type="primary"
          onClick={() => {
            this.validate(jenkinsContext.jobName);
            this.validate(jenkinsContext.dataList);
            this.validate(jenkinsContext.handleURL);
            this.saveData();
            this.handleSaveClick();
          }}
          size="large"
        >
          保存并运行
        </Button>
        <div>
          <div className="navInput">
            <Input
              size="large"
              placeholder="Job Name"
              onChange={e => {
                jenkinsContext.jobName = e.target.value;
              }}
            />
            <Select
              defaultValue="选择类型"
              style={{ width: 120 }}
              onChange={handleChange}
              size="large"
            >
              <Option value="caseO">{this.state.dataList[0]}</Option>
            </Select>
            <Input
              size="large"
              placeholder="接受触发工程URL"
              onChange={e => {
                jenkinsContext.handleURL = e.target.value;
              }}
            />
            <Input
              size="large"
              placeholder="项目描述"
              id="todoCheck"
              onChange={e => {
                jenkinsContext.description = e.target.value;
              }}
            />
            <Checkbox
              onChange={e => {
                console.log(`checked = ${e.target.checked}`);
                jenkinsContext.isAutoRun = e.target.checked && true;
              }}
              defaultChecked={true}
            >
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
