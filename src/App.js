import React from "react";
import "./App.css";
import GGEditor, {
  Flow,
  Item,
  ItemPanel,
  Command,
  Toolbar,
  DetailPanel,
  NodePanel
} from "gg-editor";
import "antd/dist/antd.css";
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
        <GGEditor className="GGEditor">
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
            onAfterItemSelected={e => {
              if (e.item.model.myProps.stageType === "leader") {
                e.item.model.color = "red";
              }
              if (e.item.model.myProps.stageType === "follower") {
                e.item.model.color = "green";
              }
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
