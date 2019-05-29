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
  EdgePanel
} from "gg-editor";
import "antd/dist/antd.css";
import StepEditor from "./my/editor/function/StepEditor";
import EdgeEditor from "./my/editor/EdgeEditor";
import TopBar from "./my/component/topBar";
import pipelineStore from "./my/service/PipelineStore";
import jenkinsContext from "./my/util/JenkinsContext";
import { convertInternalModelToJson } from "./my/service/PipelineSyntaxConverter";
import NodeEditor from "./my/editor/NodeEditor";

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
              type: "function",
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
        <GGEditor className="GGEditor">
          <button
            onClick={() => {
              let anyStage = pipelineStore.createAnyStage("test");
              let post = {
                condition: "always"
              };
              let step = {
                id: 123,
                name: "testName",
                label: "testLabel",
                isContainer: false,
                data: {}
              };
              pipelineStore.addOldStepToPost(post, step);
              pipelineStore.addOldPost(anyStage, post);
              pipelineStore.setPipeline(anyStage);

              console.log(
                "convertInternalModelToJson:" +
                  JSON.stringify(
                    convertInternalModelToJson(pipelineStore.pipeline)
                  )
              );
            }}
          >
            测试
          </button>
          <TopBar id="TopBar" />
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
            结构节点
            <Item
              type="node"
              size="72*72"
              shape="flow-circle"
              model={{
                color: "blue",
                label: "when",
                myProps: {
                  type: "structure",
                  stepType: "when"
                }
              }}
              src="http://prsv4ko2y.bkt.clouddn.com/when.svg"
            />
            <Item
              type="node"
              size="72*72"
              shape="flow-circle"
              model={{
                color: "blue",
                label: "post",
                myProps: {
                  type: "structure",
                  stepType: "post"
                }
              }}
              src="http://prsv4ko2y.bkt.clouddn.com/post.svg"
            />
            功能节点
            <Item
              type="node"
              size="72*72"
              shape="flow-circle"
              model={{
                color: "red",
                label: "shellScript",
                myProps: {
                  type: "function",
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
                  type: "function",
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
                  type: "function",
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
            noEndEdge={false}
            onAfterItemSelected={e => {
              if (e.item.type === "node") {
                console.log("你点中了节点");
                if (e.item.model.myProps.stageType === "leader") {
                  e.item.model.color = "red";
                }
                if (e.item.model.myProps.stageType === "follower") {
                  e.item.model.color = "green";
                }
              }
              if (e.item.type === "edge") {
                console.log(e.item);

                console.log("你点中了边线");
                // graph.addItem("edge", {
                //   label:"true"
                // });
              }
            }}
          />
          <DetailPanel>
            <NodePanel>
              <NodeEditor />
            </NodePanel>
            <EdgePanel>
              <EdgeEditor />
            </EdgePanel>
          </DetailPanel>
        </GGEditor>
      </div>
    );
  }
}
export default App;
