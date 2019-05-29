import * as React from "react";
import { stepUtil } from "../util/StepUtil";
import PostStepEditor from "./structure/PostStepEditor";
import WhenStepEditor from "./structure/WhenStepEditor";
import { withPropsAPI } from "gg-editor";
import StepEditor from "./function/StepEditor";
import jenkinsContext from "../util/JenkinsContext";

import "./EdgeEditor.css";
import { Select, Alert } from "antd";
const { Option } = Select;
const graph = {
  container: "mountNode",
  width: 1300,
  height: 800
};

class EdgeEditor extends React.Component {
  state={
    isTrue:''
  }
  render() {
    const { propsAPI } = this.props;
    let item = propsAPI.getSelected()[0];
    let { model } = item;
    model=stepUtil.setEdgeType(model,this.state.isTrue);
    propsAPI.update(item, model);
    console.log(model)
    return (
      <div className="edgeWrapper">
        <Alert message="选择类型" type="info" />
        <Select
          defaultValue="none"
          style={{ width: 120 }}
          onChange={(e)=>{
            this.setState({isTrue:e})
          }}
          className="edgeSelect"
        >
          <Option value="true" className="edgeOption">
            true
          </Option>
          <Option value="false" className="edgeOption">
            false
          </Option>
        </Select>
      </div>
    );
  }
}

export default withPropsAPI(EdgeEditor);
