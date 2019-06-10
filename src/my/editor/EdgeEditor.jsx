import * as React from "react";
import { withPropsAPI } from "gg-editor";

import "./EdgeEditor.css";
import { Select, Alert } from "antd";
const { Option } = Select;


class EdgeEditor extends React.Component {
  state={
    isTrue:''
  };

  render() {
    const { propsAPI } = this.props;
    let item = propsAPI.getSelected()[0];
    let { model } = item;
    if(model.myProps.whenEdge){
      model.label=model.myProps.whenEdge;
    }
    model.labelCfg= {
      refY: -20,
      refX: 0,
      autoRotate: true,
      style: {
        fill: 'red'
      }
    };
    model.myProps.whenEdge=this.state.isTrue;
    propsAPI.update(item, model);
    console.log(model);
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
