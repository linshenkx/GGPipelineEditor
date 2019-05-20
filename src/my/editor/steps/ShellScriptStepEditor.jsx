import React from 'react';
import PropTypes from 'prop-types';
import { getArg, setArg } from '../../service/ArgService';
import { withPropsAPI } from 'gg-editor';
import './ShellScriptStepEditor.css';

import 'antd/dist/antd.css';
import { Input,Button,Select,Table} from 'antd';


// import Button from 'antd/lib/button';
import {getDefaultStep} from "../../util/StepUtil"
const { TextArea } = Input;
const Option = Select.Option;
const paginationProps={
    hideOnSinglePage:true
}
const columns = [
  {
    title: '变量名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '变量值',
    dataIndex: 'value',
    key: 'value',
  }
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    value: 32,
  }
];
class ShellScriptStepEditor extends React.Component {

    
    textChanged = (name,targetValue) => {
        const { propsAPI } = this.props;
        let item=propsAPI.getSelected()[0];
        let {model}=item;
        let step;
        if(model.myProps&&model.myProps.step){
            step=model.myProps.step;
        }else {
            step=getDefaultStep();
        }

        switch (name) {
            case "name":
                step.name=targetValue;break;
            case "label":
                step.label=targetValue;break;
                
            default:
                step=setArg(step,name,targetValue);
        }
        model=this.setStepToModel(model,step);
        propsAPI.update(item,model);

        this.props.onChange(step);
    };

    getStepFromModel(model){
        let {myProps}=model;
        if(myProps && myProps.step){
            return  myProps.step;
        }
    }

    setStepToModel(model,step){
        if(!model.myProps){
            model.myProps={};
        }
        model.myProps.step=step;
        return model;
    }


    render() {
        const { propsAPI } = this.props;
        let item=propsAPI.getSelected()[0];
        let {model}=item;
        let step=this.getStepFromModel(model);
        if(!step){
            step=getDefaultStep();
        }
        return <div className="wrapper">
        <div className="stage">
            <div className="text">step</div>
        </div>
            <div className="name">name:
                <TextArea rows={2}
                className="editor-step-detail-name"
                defaultValue={step.name}
                onChange={e => this.textChanged("name",e.target.value)} />
            </div>
            <div>label
                <TextArea
                    className="editor-step-detail-script"
                    defaultValue={step.label}
                    onChange={e => this.textChanged("label",e.target.value)}
                    rows={2}
                />
            </div>
            <div>arg1
                <TextArea
                    className="editor-step-detail-script"
                    defaultValue={getArg(step,"arg1").value}
                    onChange={e => this.textChanged("arg1",e.target.value)}
                    rows={2}
                />
            </div>
            <div className="step">
              <div className="text">stage</div>
              <div className="print">
                <TextArea className="print"  defaultValue={step.script} rows={2} />
              </div>
            </div>
            <div className="agent">
                <div className="text">代理</div>
                <Select defaultValue="lucy" style={{ width: 120 }} className="Select">
                    <Option value="docker">docker</Option>
                    <Option value="any">any</Option>
                </Select>
            </div>
            <div className="evironment">
                <div className="text">环境变量</div>
                <Table columns={columns} dataSource={data} pagination={ paginationProps }/>
            </div>
        </div>;
    }
}
export default withPropsAPI(ShellScriptStepEditor);
ShellScriptStepEditor.propTypes = {
    step: PropTypes.any,
    onChange: PropTypes.func,
};

ShellScriptStepEditor.stepType = 'sh'; // FIXME do this a better way
