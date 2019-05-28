import React from "react";
import PropTypes from "prop-types";
import { getArg, setArg } from "../../service/ArgService";
import { withPropsAPI } from "gg-editor";
import "./ShellScriptStepEditor.css";
import "antd/dist/antd.css";
import { Input, Select } from "antd";

import { stepUtil } from "../../util/StepUtil";
const { TextArea } = Input;
const { Option } = Select;
class PostStepEditor extends React.Component {
  textChanged = (name, targetValue) => {
    const { propsAPI } = this.props;
    let item = propsAPI.getSelected()[0];
    let { model } = item;
    let step;
    if (model.myProps && model.myProps.step) {
      step = model.myProps.step;
    } else {
      step = stepUtil.getDefaultStep(PostStepEditor.stepType);
    }

    step = setArg(step, name, targetValue);
    model = stepUtil.setStepToModel(model, step);

    propsAPI.update(item, model);

    if (this.props.onChange) {
      this.props.onChange(step);
    }
  };
  handleChange = value => {
    console.log(`selected ${value}`);
  };
  render() {
    const { propsAPI } = this.props;
    let item = propsAPI.getSelected()[0];
    let { model } = item;
    let step = stepUtil.getStepFromModel(model);
    if (!step) {
      step = stepUtil.getDefaultStep(PostStepEditor.stepType);
      model = stepUtil.setStepToModel(model, step);
      propsAPI.update(item, model);
    }
    return (
      <div className="wrapper">
        <div className="stage">
          <div className="text">step类型:{step.name}</div>
        </div>
        <div>
          选择区：
          {/* <TextArea
                    className="editor-step-detail-script post-step"
                    defaultValue={getArg(step,"message").value}
                    onChange={e => this.textChanged("message",e.target.value)}
                    rows={10}
                /> */}
          <Select
          className="editor-step-detail-script postStep"
            defaultValue="Always"
            style={{ width: 120 }}
            onChange={e => this.handleChange(e.target.value)}
          >
            <Option value="Always">Always</Option>
            <Option value="success">success</Option>
            <Option value="failure">failure</Option>
          </Select>
        </div>
      </div>
    );
  }
}
export default withPropsAPI(PostStepEditor);
PostStepEditor.propTypes = {
  onChange: PropTypes.func
};

PostStepEditor.stepType = "post";
