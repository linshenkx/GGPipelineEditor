import React from "react";
import { withPropsAPI } from "gg-editor";
import { Button ,message} from "antd";
import PropTypes from "prop-types";
import "../editor/function/StepEditor.css";
import jenkinsContext from "../util/JenkinsContext";
import pipelineStore from "../service/PipelineStore";
import { convertInternalModelToJson } from "../service/PipelineSyntaxConverter";
import store from '../store.js';
import type {WhenInfo} from "../service/PipelineStore";


class SaveButton extends React.Component {

    getToEdges=(node,data)=>{
        return  data.edges.filter(
            edge=>{
                return edge.source === node.id;
            }
        )
    };

    getNodeById=(nodeId,data)=> {
        return  data.nodes.filter(currentValue => {
            return currentValue.id === nodeId;
        })[0];
    };
    getNextNodes=(node,data)=> {
        let ids=data.edges.filter(
            edge=>{
                return edge.source === node.id;
            }
        ).map(edge=>{
            return edge.target;
        });
        console.log("getNextNodes ids:"+JSON.stringify(ids));
        console.log("getNextNodes node:"+JSON.stringify(node));

        return  data.nodes.filter(node=>{
            return ids.some(id=>{
                return  id===node.id;
            })
        })
    };
    getPostFromNodeId=(nodeId,data) =>{
        let currentNode = this.getNodeById(nodeId,data);
        let post=currentNode.myProps.post;
        let nextNodes = this.getNextNodes(currentNode,data);

        if(!nextNodes.length){
            return post;
        }
        if(nextNodes!==1){
            console.log("post只能单一链式调用！");
            return ;
        }
        currentNode=nextNodes[0];

        while (currentNode) {
            if(currentNode.myProps.type!=="function"){
                console.log("post节点后只能接功能节点！");
                return ;
            }
            pipelineStore.addOldStepToPost(post,currentNode.myProps.step);
            nextNodes = this.getNextNodes(currentNode,data);
            if(!nextNodes.length){
                return post;
            }
            if(nextNodes!==1){
                console.log("post只能单一链式调用！");
                return ;
            }
            currentNode=nextNodes[0];
        }
    };
    getStageAndNextNodeIdFromNodeId=(nodeId,data)=> {
        console.log("getStageAndNextNodeIdFromNodeId:",nodeId);

        let currentNode=this.getNodeById(nodeId,data);
        console.log("getStageAndNextNodeIdFromNodeId currentNode:"+JSON.stringify(currentNode));

        let stepType=currentNode.myProps.stepType;

        // stage 的开头可能是 when/leader
        let isWhen;
        let when;
        if(stepType==="when"){
            isWhen=true;
            when=currentNode.myProps.when;
            let nextNodes=this.getNextNodes(currentNode,data);
            if(nextNodes.length!==1){
                console.log(currentNode+" 该node导出边只能为1");
                return;
            }
            currentNode=nextNodes[0];
        }

        //从leader节点获取stage信息以及第一个step
        if (currentNode.myProps.stageType !== "leader") {
            console.log(" leader位置缺失！");
            return;
        }
        let currentStage = JSON.parse(
            JSON.stringify(jenkinsContext.stageMap[currentNode.myProps.stageId])
        );
        if(isWhen){
            pipelineStore.addOldWhen(currentStage,when);
        }
        pipelineStore.addOldStep(currentStage, null, currentNode.myProps.step);


        //处理leader后面的post
        let nextNodes= this.getNextNodes(currentNode,data);
        console.log("getStageAndNextNodeIdFromNodeId nextNodes:"+JSON.stringify(nextNodes));

        let postNodes= nextNodes.filter(node=>{
            return node.myProps.stepType==="post";
        });

        for(let postNode of postNodes){
            let post=this.getPostFromNodeId(postNode.id,data);
            pipelineStore.addOldPost(currentStage,post);
        }

        //获取第一个follower
        //检查leader是否连接了其他类型

        let nextNodesWithoutPost= nextNodes.filter(node=>{
            return  node.myProps.stepType!=="post";
        });
        console.log("getStageAndNextNodeIdFromNodeId nextNodesWithoutPost:"+JSON.stringify(nextNodesWithoutPost));

        if(nextNodesWithoutPost.length>1){
            console.log("stage只能单一链式调用！");
            return;
        }
        let nextNode=nextNodesWithoutPost[0];

        if(!nextNode){
            //该stage只有leader没有follower
            return {
                stage:currentStage,
                nextNodeId:undefined,
            };
        }
        console.log("getStageAndNextNodeIdFromNodeId nextNode:"+JSON.stringify(nextNode));

        if(nextNode.myProps.stageType !== "follower"){
            return {
                stage:currentStage,
                nextNodeId:nextNode.id,
            };
        }

        currentNode=nextNode;

        //处理后面单一follower链
        while (currentNode) {
            console.log("getStageAndNextNodeIdFromNodeId addOldStep:"+JSON.stringify(currentNode));

            pipelineStore.addOldStep(currentStage, null, currentNode.myProps.step);

            nextNodes=this.getNextNodes(currentNode,data);
            if(nextNodes.length>1){
                console.log("followers只能单一链式调用！");
                return;
            }
            let nextNode=nextNodes[0];

            if(!nextNode){
                return {
                    stage:currentStage,
                };
            }
            if(nextNode.myProps.stageType==="follower"){
                currentNode=nextNode;
            }else {
                return {
                    stage:currentStage,
                    nextNodeId:nextNode.id,
                };
            }

        }
    };

  constructor(props) {
    super(props);
    this.state = {
      enable: this.props.enable
    };
  }

  resolveData = data => {
      console.log("保存:" + JSON.stringify(data));

      //获取起始节点的stage,完成全局初始化
      let nodeList = data.nodes;
      let edgeList = data.edges;
      if (!nodeList||!edgeList) {
          console.log("节点/边表为空！");
          return;
      }

      let contextNode = nodeList.filter(currentValue => {
          return currentValue.id === "00000";
      })[0];

      let contextStage = jenkinsContext.stageMap[9999];

      pipelineStore.setPipeline(JSON.parse(JSON.stringify(contextStage)));

      console.log(
          "pipelineStore.pipeline:" + JSON.stringify(pipelineStore.pipeline)
      );

      let currentEdges = this.getToEdges(contextNode,data);

      let nextNodeId;

      while (currentEdges.length || nextNodeId) {
          let targetId;
          if(currentEdges.length){
              let currentEdge = currentEdges.pop();
              console.log("currentEdge:" + JSON.stringify(currentEdge));
              targetId= currentEdge.target;
          }else {
              targetId=nextNodeId;
              nextNodeId=undefined;
          }

          let currentNode = this.getNodeById(targetId,data);

          let type=currentNode.myProps.type;
          let stepType=currentNode.myProps.stepType;

          switch (type) {
              case "structure":
                  if (stepType === "parallel") {
                      console.log("开始处理平行stage！");
                      let toEdges = this.getToEdges(currentNode,data);
                      if(toEdges.length<1){
                          console.log("parallel 的导出边条数为："+toEdges.length+",不符合要求！");
                      }
                      for (let toEdge of toEdges) {

                          //构造stage
                          let stageAndNextNodeId= this.getStageAndNextNodeIdFromNodeId(toEdge.target,data);
                          console.log("stageAndNextNodeId:"+JSON.stringify(stageAndNextNodeId));
                          let toEdgeStage=stageAndNextNodeId.stage;
                          let toEdgeNextNodeId=stageAndNextNodeId.nextNodeId;
                          if(nextNodeId){
                              if(nextNodeId!==toEdgeNextNodeId){
                                  console.log("stage没有回归到同一节点！");
                                  return;
                              }
                          }else {
                              nextNodeId=toEdgeNextNodeId;
                          }

                          pipelineStore.addParallelStage(toEdgeStage);
                      }
                  } else {
                      console.log("节点类型："+stepType+" 位置有误！");
                      return;
                  }
                  break;
              case "function":
                  let stageType=currentNode.myProps.stageType;
                  if (stageType === "leader") {
                      let stageAndNextNodeId= this.getStageAndNextNodeIdFromNodeId(targetId,data);
                      pipelineStore.addSequentialStage(stageAndNextNodeId.stage);
                      nextNodeId=stageAndNextNodeId.nextNodeId;
                  } else {
                      console.log("stageType类型："+stageType+" 无法处理");
                      return;
                  }
                  break;
              default:
                  console.log("节点类型："+type+" 无法处理");
                  return;
          }

      }

      console.log(
          "pipelineStore.pipeline:" + JSON.stringify(pipelineStore.pipeline)
      );

      console.log(
          "convertInternalModelToJson:" +
          JSON.stringify(convertInternalModelToJson(pipelineStore.pipeline))
      );
      // console.log(
      //     encodeURIComponent(convertInternalModelToJson(pipelineStore.pipeline))
      // );
      // fetch(
      //     "http://149.129.127.108:9090/job/convert/jsonToJenkinsfile?jenkinsJson=" +
      //     encodeURIComponent(convertInternalModelToJson(pipelineStore.pipeline)),
      //     {
      //         method: "POST"
      //     }
      // )
      //     .then(res => res.json())
      //     .then(data => {
      //         console.log("data json:" + JSON.stringify(data));
      //     })
      //     .catch(err => {
      //         console.log("error json:" + JSON.stringify(err));
      //     });
      // console.log("contextStage last:" + JSON.stringify(contextStage));

  };
  handleSaveClick = () => {
    const { propsAPI } = this.props;
    let data = propsAPI.save();
    this.resolveData(data);
  };

  render() {
    return (
      <Button
        id="saveBtn"
        type="primary"
        onClick={this.handleSaveClick}
        size="large"
      >
        保存
      </Button>
    );
  }
}
SaveButton.propTypes = {
  enable: PropTypes.bool
};
export default withPropsAPI(SaveButton);
