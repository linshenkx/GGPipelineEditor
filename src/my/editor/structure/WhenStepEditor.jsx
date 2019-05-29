import React from "react";
import PropTypes from "prop-types";
import { getArg, setArg } from "../../service/ArgService";
import { withPropsAPI } from "gg-editor";
import "../function/steps/ShellScriptStepEditor.css";
import "antd/dist/antd.css";
import "./WhenStepEditor.css";
import { Input, Radio, Switch, Button, Table } from "antd";

import { stepUtil } from "../../util/StepUtil";

const { TextArea } = Input;
const columns = [
  {
    title: "Name",
    dataIndex: "name"
  },
  {
    title: "Age",
    dataIndex: "age"
  },
  {
    title: "Address",
    dataIndex: "address"
  }
];
const data = [
  {
    key: "1",
    name: "branch",
    age: 'master',
    address: "是"
  },
  {
    key: "2",
    name: "environment",
    age: 'AA:aa',
    address: "是"
  },
  {
    key: "3",
    name: "expression",
    age: 'return aa',
    address: "否"
  }
];

class WhenStepEditor extends React.Component {
  textChanged = (name, targetValue) => {
    const { propsAPI } = this.props;
    let item = propsAPI.getSelected()[0];
    let { model } = item;
    let step;
    if (model.myProps && model.myProps.step) {
      step = model.myProps.step;
    } else {
      step = stepUtil.getDefaultStep(WhenStepEditor.stepType);
    }

    step = setArg(step, name, targetValue);
    model = stepUtil.setStepToModel(model, step);

    propsAPI.update(item, model);

    if (this.props.onChange) {
      this.props.onChange(step);
    }
  };

  render() {
    const { propsAPI } = this.props;
    let item = propsAPI.getSelected()[0];
    let { model } = item;
    let step = stepUtil.getStepFromModel(model);
    if (!step) {
      step = stepUtil.getDefaultStep(WhenStepEditor.stepType);
      model = stepUtil.setStepToModel(model, step);
      propsAPI.update(item, model);
    }
    return (
      <div className="wrapper">
        <div className="stage">
          <div className="text">step类型:{step.name}</div>
        </div>
        when：
        <div>
          <Radio.Group name="radiogroup" defaultValue={1}>
            <Radio value={1}>allOf</Radio>
            <Radio value={2}>anyOf</Radio>
          </Radio.Group>
          <div className="branch">
            <Input addonBefore="branch" defaultValue="" id="inputBranch" />
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              id="branchSwitch"
              defaultChecked
            />
            <Button
              type="primary"
              size="small"
              shape="circle"
              icon="plus"
              id="inputBtn"
            />
          </div>
          <div className="expression">
            <Input addonBefore="expression" defaultValue="" id="inputExpree" />
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              id="branchSwitch"
              defaultChecked
            />
            <Button
              type="primary"
              size="small"
              shape="circle"
              icon="plus"
              id="inputBtn"
            />
          </div>
          <div className="environment">
            <Input addonBefore="environment" defaultValue="" id="inputEnvi" />
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              id="branchSwitch"
              defaultChecked
            />
            <Button
              type="primary"
              size="small"
              shape="circle"
              icon="plus"
              id="inputBtn"
            />
          </div>
          <Table columns={columns} dataSource={data} size="small" />
        </div>
      </div>
    );
  }
}
export default withPropsAPI(WhenStepEditor);
WhenStepEditor.propTypes = {
  onChange: PropTypes.func
};

WhenStepEditor.stepType = "when";
