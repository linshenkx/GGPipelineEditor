import React from 'react';
import './App.css';

import GGEditor, {
  Flow, Item, ItemPanel, Command, Toolbar, DetailPanel,
  NodePanel,
  EdgePanel,
  GroupPanel,
  MultiPanel,
  CanvasPanel,

} from 'gg-editor';
import 'antd/dist/antd.css';
import { Input,Button } from 'antd';
import SavesButten from './my/component/PropsButten'
import pipelineStore from './my/service/PipelineStore'
import {convertInternalModelToJson} from './my/service/PipelineSyntaxConverter'
import jenkinsContext from './my/util/JenkinsContext'
import StepEditor from './my/editor/steps/StepEditor'


class App extends React.Component {


  render() {
    const data = {
      nodes: [{
        type: 'node',
        size: '70*70',
        shape: 'flow-circle',
        color: '#FA8C16',
        label: '起止节点',
        x: 55,
        y: 55,
        id: '00000',
        index: 0,
        myProps:{
            stepType:'first',
            stageType:'first',
            stageId:9999
        }
      }],
      // edges: [{
      //   source: 'ea1184e8',
      //   sourceAnchor: 2,
      //   target: '481fbb1a',
      //   targetAnchor: 0,
      //   id: '7989ac70',
      //   index: 1,
      //   myProp: {}
      // }],
    };
    let graph = {
      container: 'mountNode',
      width: 1300,
      height: 800,
    };
    let grid = {
      cell: 1
    };
    return <div className="App">
    <div className="Homeuser">
                <div className="name">
                    <Input type='text' size="large" placeholder='id' />
                </div>
                <div className="homeId">
                    <Button type="primary" size="large">登录</Button>
                </div>
            </div>
      <GGEditor className="GGEditor">
        <Toolbar className="Toolbar">
          <Command name="clear" className="item">清空画布</Command>
          <Command name="selectAll" className="item">全选</Command>
          <Command name="undo" className="item">撤销</Command>
          <Command name="redo" className="item">重做</Command>
          <Command name="delete" className="item">删除</Command>
          <Command name="zoomIn" className="item">放大</Command>
          <Command name="zoomOut" className="item">缩小</Command>
          <Command name="autoZoom" className="item">自适应尺寸</Command>
          <Command name="resetZoom" className="item">实际尺寸</Command>
          <Command name="copy" className="item">复制</Command>
          <Command name="paste" className="item">粘贴</Command>
          <SavesButten text="保存" resolveData={
            (data)=>{
                console.log("保存:" + JSON.stringify(data));

                //获取起始节点的stage,完成全局初始化
                let nodeList= data.nodes;
                let edgeList= data.edges;
                let contextNode= nodeList.filter((currentValue)=>{
                    return currentValue.id==='00000';
                })[0];

                let contextStage=jenkinsContext.stageMap[9999];

                console.log("contextStage:"+JSON.stringify(contextStage));

                pipelineStore.setPipeline(JSON.parse(JSON.stringify(contextStage)));
                console.log("pipelineStore.pipeline:"+JSON.stringify(pipelineStore.pipeline));

                let currentEdges= edgeList.filter((currentValue)=>{
                    return currentValue.source==='00000';
                });
                if(currentEdges.length!==1){
                    console.log(contextNode.label+"节点"+contextNode.id+"有"+currentEdges.length+"条边！");
                    return;
                }
                let currentEdge=currentEdges[0];
                let  currentStage=JSON.parse(JSON.stringify(contextStage));

                while (currentEdge){
                    console.log("currentEdge:"+JSON.stringify(currentEdge));
                    //找出下一节点
                    let targetId= currentEdge.target;
                    let currentNode= nodeList.filter((currentValue)=>{
                        return currentValue.id===targetId;
                    })[0];
                    if (!targetId){
                        break;
                    }
                    if(currentNode.myProps.stageType==="leader"){
                        currentStage=JSON.parse(JSON.stringify(jenkinsContext.stageMap[currentNode.myProps.stageId]));
                        console.log("addSequentialStage:"+currentStage);
                        pipelineStore.addSequentialStage(currentStage);
                    }
                    console.log("add step:"+JSON.stringify(currentNode.myProps.step));
                    pipelineStore.addOldStep(currentStage,null,currentNode.myProps.step);

                    let currentEdges= edgeList.filter((currentValue)=>{
                        return currentValue.source===currentNode.id;
                    });
                    if(currentEdges.length!==1){
                        console.log(currentNode.label+"节点"+currentNode.id+"有"+currentEdges.length+"条边！");
                        break;
                    }
                    currentEdge=currentEdges[0];
                }

                console.log("convertInternalModelToJson:"+JSON.stringify(convertInternalModelToJson(pipelineStore.pipeline)));
                console.log("contextStage last:"+JSON.stringify(contextStage));

            }

          }/>
        </Toolbar>
        <ItemPanel className="ItemPanel">
          <Item
              type="node"
              size="72*72"
              shape="flow-circle"
              model={{
                color: '#FA8C16',
                label: 'shellScript',
                myProps:{
                    stepType:'sh'
                }
              }}
              src="http://prsv4ko2y.bkt.clouddn.com/shell.svg"
          />
          <Item
              type="node"
              size="72*72"
              shape="flow-circle"
              model={{
                color: '#FA8C16',
                label: 'echo',
                myProps:{
                    stepType:'echo'
                }
              }}
              src="http://prsv4ko2y.bkt.clouddn.com/printMessage.svg"
          />
            <Item
                type="node"
                size="72*72"
                shape="flow-circle"
                model={{
                    color: '#FA8C16',
                    label: 'git',
                    myProps:{
                        stepType:'git'
                    }
                }}
                src="http://prr2i4muo.bkt.clouddn.com/git.svg"
            />
        </ItemPanel>
        <Flow data={data} graph={graph} grid={grid}
              onClick={(e) => {
                console.log("点击画布");
                console.log(e);
              }}
              getSelected={(e) => {
                console.log("点击选中" + e)
              }}
              onNodeClick={(e) => {
                console.log("点击节点")
                console.log(e.item.model);
                if(e.item.model.label==="shellScript"){
                  e.item.model.color = '#00A1F3'
                }
                if(e.item.model.label==="print"){
                  e.item.model.color = '#FF0066'
                }
              }}
              onEdgeClick={(e) => {
                console.log("点击边线");
                console.log(e);
              }}
              onAnchorDragStart={(e) => {
                console.log("鼠标开始拖拽事件\n\n");
                // console.log(e);
              }}
              onAnchorDrag={(e) => {
                console.log("鼠标拖拽事件\n");
                // console.log(e);
              }}
              onAnchorDragEnd={(e) => {
                console.log("鼠标拖拽结束事件");
                // console.log(e);
              }}
              onAnchorDragEnter={(e) => {
                console.log("鼠标拖拽进入事件");
                // console.log(e);
              }}
              onAnchorDragLeave={(e) => {
                console.log("鼠标拖拽移出事件");
                // console.log(e);
              }}
              onAnchorDrop={(e) => {
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
                )
              }}
              onGroupClick={(e) => {
                console.log("点击群组");
                console.log(e);
              }}
              onGuideClick={(e) => {
                console.log("点击导引");
                console.log(e);
              }}
              onAnchorClick={(e) => {
                console.log("点击锚点");
                console.log(e);
              }}/>
        <DetailPanel>

          <NodePanel>
            {/*<ShellScriptStepEditor step={getNewStep()}*/}
            {/*                  onChange={step => {*/}
            {/*                    console.log("修改后的step：" + JSON.stringify(step.data));*/}
            {/*                  }*/}
            {/*                  }/>*/}
            <StepEditor/>
          </NodePanel>

          <EdgePanel>
            {/* <EdgeDetail /> */}
          </EdgePanel>

          <GroupPanel>
            {/* <GroupDetail /> */}
          </GroupPanel>

          <MultiPanel>
            {/* <MultiDetail /> */}
          </MultiPanel>

          <CanvasPanel>
            {/* <CanvasDetail /> */}
          </CanvasPanel>

        </DetailPanel>
      </GGEditor>
    </div>
  }
}

export default App;
