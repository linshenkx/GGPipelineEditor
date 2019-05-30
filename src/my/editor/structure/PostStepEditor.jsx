import React from "react";
import PropTypes from "prop-types";
import {withPropsAPI} from "gg-editor";
import "../function/steps/ShellScriptStepEditor.css";
import "antd/dist/antd.css";
import {  Select } from "antd";
const { Option } = Select;
class PostStepEditor extends React.Component {
  handleChange = value => {
    console.log(`selected ${value}`);
    const { propsAPI } = this.props;
    let item = propsAPI.getSelected()[0];
    let {model} = item;
    model.myProps.post.condition=value;
    propsAPI.update(item, model);
  };
  render() {
    const { propsAPI } = this.props;
    let item = propsAPI.getSelected()[0];
    let {model} = item;
    let post=model.myProps.post;
    if(!post){
      post={
        "condition":"always",
      };
      model.myProps.post=post;
      propsAPI.update(item, model);
    }
    let condition=post.condition;
    return (
        <div>
          <div className="wrapper">
            <div className="text">Post</div>
          </div>
          <div>
            condition:
            <Select
                className="editor-step-detail-script postStep"
                defaultValue={condition}
                style={{ width: 120 }}
                onChange={value => this.handleChange(value)}
            >
              <Option value="always">always</Option>
              <Option value="success">success</Option>
              <Option value="failure">failure</Option>
              <Option value="changed">changed</Option>
              <Option value="unstable">unstable</Option>
              <Option value="aborted">aborted</Option>

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
