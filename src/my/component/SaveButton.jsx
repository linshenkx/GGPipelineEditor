import React from "react";
import { withPropsAPI } from "gg-editor";
import { Button ,message} from "antd";
import PropTypes from "prop-types";
import "../editor/steps/StepEditor.css";
import jenkinsContext from "../util/JenkinsContext";
import pipelineStore from "../service/PipelineStore";
import { convertInternalModelToJson } from "../service/PipelineSyntaxConverter";
import store from '../store.js';


class SaveButton extends React.Component {
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
        encodeURIComponent(convertInternalModelToJson(pipelineStore.pipeline)),
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
