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
import SaveButton from "./my/component/SaveButton";
import pipelineStore from "./my/service/PipelineStore";
import { convertInternalModelToJson } from "./my/service/PipelineSyntaxConverter";
import jenkinsContext from "./my/util/JenkinsContext";
import StepEditor from "./my/editor/steps/StepEditor";

import TopBar from "./my/component/topBar";
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
    return (
      <div className="App ">
        <TopBar />
        <GGEditor className="GGEditor">
          <SaveButton
            text="保存"
            enable={jenkinsContext.isLogin === true}
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
              if (!edgeList) {
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
              );
              console.log(
                encodeURIComponent(
                  convertInternalModelToJson(pipelineStore.pipeline)
                )
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
            }}
          />
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
          />
          <DetailPanel>
            <NodePanel>
              <StepEditor />
            </NodePanel>
          </DetailPanel>
        </GGEditor>
      </div>
    );
  }
}

export default App;
