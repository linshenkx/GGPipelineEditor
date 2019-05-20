import React from 'react';
import PropTypes from 'prop-types';
import { getArg, setArg } from '../../service/ArgService';
import { withPropsAPI } from 'gg-editor';
import './ShellScriptStepEditor.css';
import Test from '../../../test'
import 'antd/dist/antd.css';
import { Input,Select} from 'antd';


// import Button from 'antd/lib/button';
import {getDefaultStep,getStepFromModel,setStepToModel} from "../../util/StepUtil"
import pipelineStore from "../../service/PipelineStore";
import {convertInternalModelToJson} from "../../service/PipelineSyntaxConverter";
const { TextArea } = Input;
const Option = Select.Option;
class ShellScriptStepEditor extends React.Component {

    textChanged = (name,targetValue) => {
        const { propsAPI } = this.props;
        let item=propsAPI.getSelected()[0];
        let {model}=item;
        let step;
        if(model.myProps&&model.myProps.step){
            step=model.myProps.step;
        }else {
            step=getDefaultStep(ShellScriptStepEditor.stepType);
        }

        switch (name) {
            case "name":
                step.name=targetValue;break;
            case "label":
                step.label=targetValue;break;

            default:
                step=setArg(step,name,targetValue);
        }
        model=setStepToModel(model,step);
        propsAPI.update(item,model);

        this.props.onChange(step);
    };




    render() {
        const { propsAPI } = this.props;
        let item=propsAPI.getSelected()[0];
        let {model}=item;
        let step=getStepFromModel(model);
        if(!step){
            step=getDefaultStep(ShellScriptStepEditor.stepType);
        }
        return <div className="wrapper">
        <div className="stage">
            <div className="text">step类型:{step.name}</div>
        </div>
            <div>shell 脚本：
                <TextArea
                    className="editor-step-detail-script"
                    defaultValue={getArg(step,"script").value}
                    onChange={e => this.textChanged("script",e.target.value)}
                    rows={2}
                />
            </div>
            <button onClick={
                ()=>{
                    const { propsAPI } = this.props;
                    let item=propsAPI.getSelected()[0];
                    let {model}=item;
                    let step=getStepFromModel(model);

                    console.log("step json:"+JSON.stringify(step));
                    pipelineStore.setPipeline({
                        agent: { type: 'any' },
                        children: [],
                    });
                    console.log("pipeline:"+JSON.stringify(pipelineStore.pipeline));

                    let defaultStage= pipelineStore.createSequentialStage("firstStage");
                    console.log("pipeline:"+JSON.stringify(pipelineStore.pipeline));

                    pipelineStore.addOldStep(defaultStage,null,step);
                    console.log("pipeline:"+JSON.stringify(pipelineStore.pipeline));
                    let pipelineJsonObject=convertInternalModelToJson(pipelineStore.pipeline);
                    console.log("pipelineJsonObject json:"+JSON.stringify(pipelineJsonObject));
                }

            }>打印jenkinsJson</button>
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
                <Test />
                {/* <Table columns={columns} dataSource={data} pagination={ paginationProps }/> */}
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
