import * as React from "react";
import { stepUtil } from "../util/StepUtil";
import PostStepEditor from "./structure/PostStepEditor";
import WhenStepEditor from "./structure/WhenStepEditor";
import { withPropsAPI } from "gg-editor";
import StepEditor from "./function/StepEditor";
import './EdgeEditor.css';
import { Select,Alert } from "antd";
const { Option } = Select;
function handleChange(value) {
  console.log(`selected ${value}`);
}
class EdgeEditor extends React.Component {
  render() {
    return (
      <div className="edgeWrapper">
        <Alert message="选择类型" type="info" />
        <Select
          defaultValue="none"
          style={{ width: 120 }}
          onChange={handleChange}
          className="edgeSelect"
        >
          <Option value="true" className="edgeOption">true</Option>
          <Option value="false" className="edgeOption">false</Option>
        </Select>
      </div>
    );
  }
}

export default withPropsAPI(EdgeEditor);
