import React from "react";
import { withPropsAPI } from "gg-editor";
import "./ShellScriptStepEditor.css";
import "./StepEditor.css";
import EnvironmentEditor from "./EnvironmentEditor";
import "antd/dist/antd.css";
import { Input, Select, Button, Alert } from "antd";
import ShellScriptStepEditor from "./ShellScriptStepEditor";
import EchoStepEditor from "./EchoStepEditor";
import GitStepEditor from "./GitStepEditor";

import { stepUtil } from "../../util/StepUtil";
import { stageUtil } from "../../util/StageUtil";
import jenkinsContext from "../../util/JenkinsContext";
import pipelineStore from "../../service/PipelineStore";
const Option = Select.Option;
class StepEditor extends React.Component {
  newStage = () => {
    console.log("新建Stage");

    const { propsAPI } = this.props;
    let item = propsAPI.getSelected()[0];
    let { model } = item;

    let newStage = pipelineStore.createNoneStage("newStage");
    jenkinsContext.stageMap[newStage.id] = newStage;
    jenkinsContext.currentStageId = newStage.id;

    model = stepUtil.setStageIdToModel(model, newStage.id);
    model = stepUtil.setStageTypeToModel(model, "leader");

    propsAPI.update(item, model);
  };

  getAgentEditor = (agent, stageId, disabled) => {
    console.log("agent:" + agent);

    stageUtil.setAgentType(stageId, agent);
    let agentEditor;
    switch (agent) {
      case "docker":
        agentEditor = (
          <div>
            <div>
              Image:
              <Input
                defaultValue={stageUtil.getAgentArg(stageId, "image")}
                onChange={e =>
                  stageUtil.setAgentArg(stageId, "image", e.target.value)
                }
                disabled={disabled}
              />
            </div>
            <div>
              Args:
              <Input
                defaultValue={stageUtil.getAgentArg(stageId, "args")}
                onChange={e =>
                  stageUtil.setAgentArg(stageId, "args", e.target.value)
                }
                disabled={disabled}
              />
            </div>
          </div>
        );
        break;
      case "any":
        agentEditor = <div />;
        break;
      default:
        agentEditor = <div />;
        break;
    }
    return agentEditor;
  };

  render() {
    const { propsAPI } = this.props;
    let item = propsAPI.getSelected()[0];
    let { model } = item;

    let stepType = stepUtil.getStepTypeFromModel(model);

    if (jenkinsContext.currentStageId === 9999 && stepType !== "first") {
      let newStage = pipelineStore.createAnyStage("newStage");
      jenkinsContext.stageMap[newStage.id] = newStage;
      jenkinsContext.currentStageId = newStage.id;

      model = stepUtil.setStageIdToModel(model, newStage.id);
      model = stepUtil.setStageTypeToModel(model, "leader");

      propsAPI.update(item, model);
    }
    let stageId = stepUtil.getStageIdFromModel(model);
    let stageType = stepUtil.getStageTypeFromModel(model);

    if (!stageType) {
      //新stageType默认为follower
      stageType = "follower";
      stepUtil.setStageTypeToModel(model, stageType);
    }
    if (!stageId) {
      //新stageId默认为当前StageId
      stageId = jenkinsContext.currentStageId;
      const { propsAPI } = this.props;
      let item = propsAPI.getSelected()[0];
      let { model } = item;

      model = stepUtil.setStageIdToModel(model, stageId);

      propsAPI.update(item, model);
    }

    let stage = jenkinsContext.stageMap[stageId];

    let stepEditorDetail;
    switch (stepType) {
      case "sh":
        stepEditorDetail = <ShellScriptStepEditor />;
        break;
      case "echo":
        stepEditorDetail = <EchoStepEditor />;
        break;
      case "git":
        stepEditorDetail = <GitStepEditor />;
        break;
      default:
        stepEditorDetail = <div>空白编辑区 </div>;
        break;
    }
    console.log(
      "before return this.getAgentType(stageId):" +
        stageUtil.getAgentType(stageId)
    );
    let agentEditor = this.getAgentEditor(
      stageUtil.getAgentType(stageId),
      stageId,
      stageType === "follower"
    );

    return (
      <div className="wrapper">
        <div className="stage">
          <div className="text">
            当前Stage:{stageType}:
            <Input
              defaultValue={stage.name}
              onChange={e => {
                jenkinsContext.stageMap[stageId].name = e.target.value;
              }}
              id="stateInput"
              disabled={stageType === "follower"}
            />
            <Button
              type="primary"
              onClick={() => {
                this.newStage();
                this.setState({});
                console.log(stageUtil.getEnvironment(stageId));
              }}
            >
              新建stage
            </Button>
          </div>
        </div>

        {stepEditorDetail}

        <div className="agent">
          <Alert message="代理" className="text" type="info" />
          <Select
            // defaultValue={stageUtil.getAgentType(stageId)}
            defaultValue='any'
            style={{ width: 120 }}
            className="Select"
            onChange={option => {
              agentEditor = this.getAgentEditor(option, stageId);
              this.setState({});
            }}
            disabled={stageType === "follower" ? true : false}
          >
            <Option value="any">any</Option>
            <Option value="docker">docker</Option>
          </Select>
          {agentEditor}
        </div>

        <div className="evironment">
          <Alert message="环境变量" className="text" type="info" />
          <EnvironmentEditor
            stageId={stageId}
            disabled={stageType === "follower"}
          />
        </div>
      </div>
    );
  }
}

export default withPropsAPI(StepEditor);
