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
    title: "Type",
    dataIndex: "type"
  },
  {
    title: "Expression",
    dataIndex: "expression"
  },
  {
    title: "True/False",
    dataIndex: "state"
  }
];
const data = [
  //   {
  //     key: "1",
  //     type: "branch",
  //     expression: "master",
  //     state: "是"
  //   },
  //   {
  //     key: "2",
  //     type: "environment",
  //     expression: "AA:aa",
  //     state: "是"
  //   },
  //   {
  //     key: "3",
  //     type: "expression",
  //     expression: "return aa",
  //     state: "否"
  //   }
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
  handleAddBranch = value => {
    console.log("Click!");
    data.push({
      type: "branch",
      expression: this.state.branch,
      state: this.state.check.toString()
    });
    console.log(data);
    this.setState({});
  };
  handleAddExpre = value => {
    console.log("Click!");
    data.push({
      type: "expression",
      expression: this.state.expression,
      state: this.state.check.toString()
    });
    console.log(data);
    this.setState({});
  };
  state = {
    branch: "",
    check: true,
    expression: ""
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
            <Input
              addonBefore="branch"
              defaultValue=""
              id="inputBranch"
              onChange={e => {
                console.log("branch：" + e.target.value);
                this.setState({ branch: e.target.value }, () => {
                  console.log(this.state.branch);
                });
              }}
            />
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              id="branchSwitch"
              defaultChecked
              onChange={e => {
                console.log("你当前选中的项：" + e);
                this.setState(
                  {
                    check: e
                  },
                  () => {
                    console.log("state里面的项：" + this.state.check);
                  }
                );
              }}
            />
            <Button
              type="primary"
              size="small"
              shape="circle"
              icon="plus"
              id="inputBtn"
              onClick={() => {
                this.handleAddBranch();
              }}
            />
          </div>
          <div className="expression">
            <Input
              addonBefore="expression"
              defaultValue=""
              id="inputExpree"
              onChange={e => {
                console.log("expression:" + e.target.value);
                this.setState({ expression: e.target.value }, () => {
                  console.log(this.state.expression);
                });
              }}
            />
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              id="branchSwitch"
              defaultChecked
              onChange={e => {
                console.log("你当前选中的项：" + e);
                this.setState(
                  {
                    check: e
                  },
                  () => {
                    console.log("state里面的项：" + this.state.check);
                  }
                );
              }}
            />
            <Button
              type="primary"
              size="small"
              shape="circle"
              icon="plus"
              id="inputBtn"
              onClick={() => {
                this.handleAddExpre();
              }}
            />
          </div>
          <div className="environment">
            <Input addonBefore="environment" defaultValue="" id="inputEnvi" />
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              id="branchSwitch"
              defaultChecked
              onChange={e => {}}
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
