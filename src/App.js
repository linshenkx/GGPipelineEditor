import React from "react";
import "./App.css";
import GGEditor, {
  Flow,
  Item,
  ItemPanel,
  Command,
  Toolbar,
  DetailPanel,
  NodePanel,
  EdgePanel,
  GroupPanel,
  MultiPanel,
  CanvasPanel
} from "gg-editor";
import "antd/dist/antd.css";
import { Input, Button, Select, Checkbox, Alert, message } from "antd";
import SaveButton from "./my/component/SaveButton";
import pipelineStore from "./my/service/PipelineStore";
import { convertInternalModelToJson } from "./my/service/PipelineSyntaxConverter";
import jenkinsContext from "./my/util/JenkinsContext";
import StepEditor from "./my/editor/steps/StepEditor";
const Option = Select.Option;

class App extends React.Component {

  render() {
    const data = {
      nodes: [
        {
          type: "node",
          size: "70*70",
          shape: "flow-circle",
          color: "#FA8C16",
          label: "起止节点",
          x: 55,
          y: 55,
          id: "00000",
          index: 0,
          myProps: {
            stepType: "first",
            stageType: "first",
            stageId: 9999
          }
        }
      ]
    };
    let graph = {
      container: "mountNode",
      width: 1300,
      height: 800
    };
    let grid = {
      cell: 1
    };
    function handleChange(value) {
      console.log(`selected ${value}`);
    }
    function onChange(e) {
      console.log(`checked = ${e.target.checked}`);
    }
    // 这里踩坑，this的指向有问题，必须全局的this
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
            jenkinsContext.isLogin=!jenkinsContext.isLogin;
            jenkinsContext.IPaddress=data.data;
          } else {
            message.error("登录失败，请重试！");
          }
        });
    }
    function getTaskList(userId) {
      fetch("http://149.129.127.108:9090/job/types?userId=" + userId)
        .then(res => res.json())
        .then(data => {
          console.log(data.data);
          console.log(userId);
          jenkinsContext.dataList=data.data;
          console.log(jenkinsContext.dataList);
        });
    }
    return (
      <div className="App ">
        {/* 登录模块（未登录状态） */}
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
                jenkinsContext.userId=e.target.value;
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
        {/* 已登录状态 */}
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
        <div className="navInput">
          <Input size="large" placeholder="Job Name" />
          <Select
            defaultValue="选择类型"
            style={{ width: 120 }}
            onChange={handleChange}
            size="large"
          >
            <Option value="caseO">{jenkinsContext.dataList[0]}</Option>
          </Select>
          <Input size="large" placeholder="接受触发工程URL" />
          <Input size="large" placeholder="项目描述" id="todoCheck" />
          <Checkbox onChange={onChange} checked>
            保存自动运行
          </Checkbox>
        </div>
        <GGEditor className="GGEditor">
          <Toolbar className="Toolbar">
            <Command name="clear" className="item">
              清空
            </Command>
            <Command name="selectAll" className="item">
              全选
            </Command>
            <Command name="undo" className="item">
              撤销
            </Command>
            <Command name="delete" className="item">
              删除
            </Command>
            <Command name="zoomIn" className="item">
              放大
            </Command>
            <br />
            <br />
            <Command name="zoomOut" className="item">
              缩小
            </Command>
            <Command name="autoZoom" className="item">
              自适应
            </Command>
            <Command name="resetZoom" className="item">
              实际
            </Command>
            <Command name="copy" className="item">
              复制
            </Command>
            <Command name="paste" className="item">
              粘贴
            </Command>
            <SaveButton
              text="保存"
              enable={jenkinsContext.isLogin===true}
              resolveData={data => {
                console.log("保存:" + JSON.stringify(data));

                //获取起始节点的stage,完成全局初始化
                let nodeList = data.nodes;
                let edgeList = data.edges;
                let contextNode = nodeList.filter(currentValue => {
                  return currentValue.id === "00000";
                })[0];

                let contextStage = jenkinsContext.stageMap[9999];

                console.log("contextStage:" + JSON.stringify(contextStage));

                pipelineStore.setPipeline(
                  JSON.parse(JSON.stringify(contextStage))
                );
                console.log(
                  "pipelineStore.pipeline:" +
                    JSON.stringify(pipelineStore.pipeline)
                );
                if(!edgeList){
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
                      JSON.stringify(
                        jenkinsContext.stageMap[currentNode.myProps.stageId]
                      )
                    );
                    console.log("addSequentialStage:" + currentStage);
                    pipelineStore.addSequentialStage(currentStage);
                  }
                  console.log(
                    "add step:" + JSON.stringify(currentNode.myProps.step)
                  );
                  pipelineStore.addOldStep(
                    currentStage,
                    null,
                    currentNode.myProps.step
                  );

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
                    JSON.stringify(
                      convertInternalModelToJson(pipelineStore.pipeline)
                    )

                  //json文件发送
                );
                console.log(encodeURIComponent(convertInternalModelToJson(pipelineStore.pipeline)))
                fetch(
                  "http://149.129.127.108:9090/job/convert/jsonToJenkinsfile?jenkinsJson=" +
                    (encodeURIComponent(convertInternalModelToJson(pipelineStore.pipeline))),
                    {
                      method : 'POST',
                    }

                )
                  .then(res => res.json())
                  .then(data => {
                    console.log("data json:"+JSON.stringify(data));
                  }).catch(err => {
                  console.log("error json:"+JSON.stringify(err));
                });
                console.log(
                  "contextStage last:" + JSON.stringify(contextStage)
                );
              }}
            />
          </Toolbar>
          <ItemPanel className="ItemPanel">
            <Item
              type="node"
              size="72*72"
              shape="flow-circle"
              model={{
                color: "red",
                label: "shellScript",
                myProps: {
                  stepType: "sh"
                }
              }}
              src="http://prsv4ko2y.bkt.clouddn.com/shell.svg"
            />
            <Item
              type="node"
              size="72*72"
              shape="flow-circle"
              model={{
                color: "green",
                label: "echo",
                myProps: {
                  stepType: "echo"
                }
              }}
              src="http://prsv4ko2y.bkt.clouddn.com/echo.svg"
            />
            <Item
              type="node"
              size="72*72"
              shape="flow-circle"
              model={{
                color: "blue",
                label: "git",
                myProps: {
                  stepType: "git"
                }
              }}
              src="http://prr2i4muo.bkt.clouddn.com/git.svg"
            />
          </ItemPanel>
          <Flow
            data={data}
            graph={graph}
            grid={grid}
            onClick={e => {
              console.log("点击画布");
              console.log(e);
            }}
            getSelected={e => {
              console.log("点击选中" + e);
            }}
            onDrop={e => {
              console.log("放置节点");
              // console.log(e.item.model);
            }}
            onAfterItemSelected={e => {
              console.log("选中后");
              console.log(e.item.model);
              if (e.item.model.myProps.stageType === "leader") {
                e.item.model.color = "red";
              }
              if (e.item.model.myProps.stageType === "follower") {
                e.item.model.color = "green";
              }
            }}
            onNodeClick={e => {
              console.log("点击节点");
              console.log(e.item.model);
            }}
            onEdgeClick={e => {
              console.log("点击边线");
              console.log(e);
            }}
            onAnchorDragStart={e => {
              console.log("鼠标开始拖拽事件\n\n");
              // console.log(e);
            }}
            onAnchorDrag={e => {
              console.log("鼠标拖拽事件\n");
              // console.log(e);
            }}
            onAnchorDragEnd={e => {
              console.log("鼠标拖拽结束事件");
              // console.log(e);
            }}
            onAnchorDragEnter={e => {
              console.log("鼠标拖拽进入事件");
              // console.log(e);
            }}
            onAnchorDragLeave={e => {
              console.log("鼠标拖拽移出事件");
              // console.log(e);
            }}
            onAnchorDrop={e => {
              console.log("鼠标拖拽放置事件");
              console.log(e);
              console.log(
                "action:" + e.action,
                "item:" + e.item,
                "shape:" + e.shape,
                "x:" + e.x,
                "y:" + e.y,
                "domX:" + e.domX,
                "domY:" + e.domY,
                "domEvent:" + e.domEvent,
                "currentItem:" + e.currentItem,
                "currentShape:" + e.currentShape,
                "toShape:" + e.toShape,
                "toItem:" + e.toItem
              );
            }}
            onGroupClick={e => {
              console.log("点击群组");
              console.log(e);
            }}
            onGuideClick={e => {
              console.log("点击导引");
              console.log(e);
            }}
            onAnchorClick={e => {
              console.log("点击锚点");
              console.log(e);
            }}
          />
          <DetailPanel>
            <NodePanel>
              {/*<ShellScriptStepEditor step={getNewStep()}*/}
              {/*                  onChange={step => {*/}
              {/*                    console.log("修改后的step：" + JSON.stringify(step.data));*/}
              {/*                  }*/}
              {/*                  }/>*/}
              <StepEditor />
            </NodePanel>

            <EdgePanel>{/* <EdgeDetail /> */}</EdgePanel>

            <GroupPanel>{/* <GroupDetail /> */}</GroupPanel>

            <MultiPanel>{/* <MultiDetail /> */}</MultiPanel>

            <CanvasPanel>{/* <CanvasDetail /> */}</CanvasPanel>
          </DetailPanel>
        </GGEditor>
      </div>
    );
  }
}

export default App;
