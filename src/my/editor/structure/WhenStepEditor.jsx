import React from "react";
import PropTypes from "prop-types";
import { getArg, setArg } from "../../service/ArgService";
import { withPropsAPI } from "gg-editor";
import "../function/steps/ShellScriptStepEditor.css";
import "antd/dist/antd.css";
import "./WhenStepEditor.css";
import {Input, Radio, Switch, Button, Table, Popconfirm} from "antd";

import type {WhenInfo} from "../../service/PipelineStore";
import idgen from "../../service/IdGenerator";
import {stageUtil} from "../../util/StageUtil";




class WhenStepEditor extends React.Component {
    columns = [
        {
            title: "Type",
            dataIndex: "type"
        },
        {
            title: "Expression",
            dataIndex: "expression"
        },
        {
            title: "成立条件",
            dataIndex: "state"
        },
        {
            title: "操作",
            dataIndex: "operation",
            render: (text, record) =>
                <Popconfirm
                    title="Sure to delete?"
                    onConfirm={() => {
                        this.handleDelete(record.id);
                    }}
                >
                    <Button type="primary" disabled={this.props.disabled}>
                        Delete
                    </Button>
                </Popconfirm>
        }
    ];

    handleDelete=(id)=>{
        const { propsAPI } = this.props;
        let item = propsAPI.getSelected()[0];
        let { model } = item;
        console.log("handleAddBranch model json:"+JSON.stringify(model));
        let whens=model.myProps.when.children;
        model.myProps.when.children=whens.filter((when)=>{
           return when.id!==id;
        });
        propsAPI.update(item, model);
        this.setState({});
    };

  getColumnsFromWhens=(whens:WhenInfo[])=>{
      console.log("whens json:"+JSON.stringify(whens));

      if(!whens||!whens.length){
        return[];
    }
    let columns=[];
    for(let when of whens){

        console.log("when json:"+JSON.stringify(when));

        console.log("when name:"+when.name+",arguments:"+JSON.stringify(when.arguments));
        let check=true;
        if(when.name==="not"){
            check=false;
            when=when.children[0];
        }
        let expression=when.arguments;
        if(when.name==="environment"){
            expression=when.arguments.filter(item=>{return  item.key==="name"})[0].value
                +" : "+when.arguments.filter(item=>{return  item.key==="value"})[0].value
        }
        columns.push({
           "type":when.name,
            "expression":expression,
            "state":check?"为真":"为假",
            "id":when.id,
        });
    }
    return  columns;
  };

  handleAddBranch = (branch,branchCheck) => {
    const { propsAPI } = this.props;
    let item = propsAPI.getSelected()[0];
    let { model } = item;
    console.log("handleAddBranch model json:"+JSON.stringify(model));
    let when=model.myProps.when;
    let id=idgen.next();
    if(branchCheck){
      when.children.push(
          {
              id:id,
            name: "branch",
            arguments: branch,
          }
      );
    }else {
      when.children.push(
          {
              id:id,
              name: "not",
            children: [
              {
                  id:id,
                  name: "branch",
                arguments: branch,
              },
            ],
          }
      )
    }

    model.myProps.when=when;
    propsAPI.update(item, model);

    this.setState({});
  };
  handleAddExpression = (expression,expressionCheck) => {

        const { propsAPI } = this.props;
        let item = propsAPI.getSelected()[0];
        let { model } = item;
        let when=model.myProps.when;
        let id=idgen.next();
        if(expressionCheck){
            when.children.push(
                {
                    id:id,
                    name: "expression",
                    arguments: expression,
                }
            );
        }else {
            when.children.push(
                {
                    id:id,
                    name: "not",
                    children: [
                        {
                            id:id,
                            name: "expression",
                            arguments: expression,
                        },
                    ],
                }
            )
        }

        model.myProps.when=when;
        propsAPI.update(item, model);

        this.setState({});
  };
  handleAddEnviron = (envKey,envValue,envCheck) => {
      const { propsAPI } = this.props;
      let item = propsAPI.getSelected()[0];
      let { model } = item;
      let when=model.myProps.when;
      let id=idgen.next();
      if(envCheck){
          when.children.push(
              {
                  id:id,
                  name: "environment",
                  arguments:  [
                      {
                          key:"name",
                          value:envKey,
                      },
                      {
                          key:"value",
                          value:envValue,
                      }
                  ],
              }
          );
      }else {
          when.children.push(
              {
                  id:id,
                  name: "not",
                  children: [
                      {
                          id:id,
                          name: "environment",
                          arguments:  [
                              {
                                  key:"name",
                                  value:envKey,
                              },
                              {
                                  key:"value",
                                  value:envValue,
                              }
                          ],
                      },
                  ],
              }
          )
      }

      model.myProps.when=when;
      propsAPI.update(item, model);

      this.setState({});
  };
  state = {
    branch: "",
    branchCheck:true,
    expressionCheck:true,
    envCheck:true,
    check: true,
    expression: "",
    inputEnvKey:"",
    inputEnvKeyVal:''
  };
  render() {
    const { propsAPI } = this.props;
    let item = propsAPI.getSelected()[0];
    let { model } = item;
    let when=model.myProps.when;
    if(!when){
      when={
        name: "allOf",
        children: [],
      };
      model.myProps.when=when;
      propsAPI.update(item, model);
    }

      let columnsFromWhens = this.getColumnsFromWhens(when.children);
    console.log("columnsFromWhens json:"+JSON.stringify(columnsFromWhens));
    return (
      <div className="wrapper">
        when：
        <div>
          <Radio.Group name="radiogroup" defaultValue={when.name}>
            <Radio value="allOf">allOf</Radio>
            <Radio value="anyOf">anyOf</Radio>
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
                    branchCheck: e
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
                this.handleAddBranch(this.state.branch,this.state.branchCheck);
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
                    expressionCheck: e
                  },
                  () => {
                    console.log("state里面的项：" + this.state.expressionCheck);
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
                this.handleAddExpression(this.state.expression,this.state.expressionCheck);
              }}
            />
          </div>
          {/* 这里是环境变量的添加 */}
          <div className="environment">
            <Input
              addonBefore="environment"
              defaultValue=""
              id="inputEnvKey"
              placeholder="key"
              onChange={e => {
                console.log("inputEnvKey:" + e.target.value);
                this.setState({ inputEnvKey: e.target.value }, () => {
                  console.log(this.state.inputEnvKey);
                });
              }}
            />
            <Input
              defaultValue=""
              id="inputEnvKeyVal"
              placeholder="value"
              onChange={e => {
                console.log("inputEnvKeyVal:" + e.target.value);
                this.setState({ inputEnvKeyVal: e.target.value }, () => {
                  console.log(this.state.inputEnvKeyVal);
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
                          envCheck: e
                      },
                      () => {
                          console.log("state里面的项：" + this.state.envCheck);
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
                this.handleAddEnviron(this.state.inputEnvKey,this.state.inputEnvKeyVal,this.state.envCheck);
              }}
            />
          </div>
          <Table columns={this.columns} dataSource={columnsFromWhens} rowKey={(record)=>{return  record.id}} size="small" />
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
