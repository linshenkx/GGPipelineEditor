import React from "react";
import { withPropsAPI } from "gg-editor";
import { Button ,message} from "antd";
import PropTypes from "prop-types";
import "../editor/function/StepEditor.css";
import pipelineUtil from "../util/PipelineUtil"


class SaveButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      enable: this.props.enable
    };
  }

  handleSaveClick = () => {
        const { propsAPI } = this.props;
        let data = propsAPI.save();
        pipelineUtil.resolveData(data);
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
