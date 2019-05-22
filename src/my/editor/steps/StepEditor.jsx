import React from 'react';
import PropTypes from 'prop-types';
import { getArg, setArg } from '../../service/ArgService';
import { withPropsAPI } from 'gg-editor';
import './ShellScriptStepEditor.css';
import Test from '../../../test'
import 'antd/dist/antd.css';
import { Input,Select} from 'antd';
import ShellScriptStepEditor from './ShellScriptStepEditor'
import EchoStepEditor from './EchoStepEditor'
import GitStepEditor from './GitStepEditor'
import AnyAgent from './AnyAgent'
import DockerAgent from './DockerAgent'



// import Button from 'antd/lib/button';
import {stepUtil} from "../../util/StepUtil"
import {stageUtil} from "../../util/StageUtil"
import jenkinsContext from "../../util/JenkinsContext"
import pipelineStore from "../../service/PipelineStore";
import {convertInternalModelToJson} from "../../service/PipelineSyntaxConverter";
const { TextArea } = Input;
const Option = Select.Option;



class StepEditor extends React.Component {

    newStage=()=>{
        console.log("新建Stage");
        let newStage= pipelineStore.createNoneStage("newStage");
        jenkinsContext.stageMap[newStage.id]=newStage;
        jenkinsContext.currentStageId=newStage.id;

        const { propsAPI } = this.props;
        let item=propsAPI.getSelected()[0];
        let {model}=item;

        model=stepUtil.setStageIdToModel(model,newStage.id);
        model=stepUtil.setStageTypeToModel(model,'leader');

        propsAPI.update(item,model);

    };

    getAgentEditor=(agent,stageId)=>{
        console.log("agent:"+agent);

        stageUtil.setAgentType(stageId,agent);
        let agentEditor;
        switch (agent) {
            case "docker":
                agentEditor=<div>
                    <div>Image:
                        <Input
                            defaultValue={stageUtil.getAgentArg(stageId,"image")}
                            onChange={e => stageUtil.setAgentArg(stageId,"image",e.target.value)}
                        />
                    </div>
                    <div>Args:
                        <Input
                            defaultValue={stageUtil.getAgentArg(stageId,"args")}
                            onChange={e => stageUtil.setAgentArg(stageId,"args",e.target.value)}
                        />
                    </div>
                </div>;break;
            case "any":
                agentEditor=<div></div>;break;
            default:
                agentEditor=<div></div>;break;
        }
        return agentEditor;
    };



    render() {
        const { propsAPI } = this.props;
        let item=propsAPI.getSelected()[0];
        let {model}=item;
        let step=stepUtil.getStepFromModel(model);
        if(!step){
            step=stepUtil.getDefaultStep(ShellScriptStepEditor.stepType);
        }
        let stageId=stepUtil.getStageIdFromModel(model);
        let stageType=stepUtil.getStageTypeFromModel(model);
        let stepType=stepUtil.getStepTypeFromModel(model);

        if(!stepType){
            stepType='empty';
        }
        if(!stageType){
            //新stageType默认为follower
            stageType='follower';
        }
        if(!stageId){
            //新stageId默认为当前StageId
            stageId=jenkinsContext.currentStageId;
            const { propsAPI } = this.props;
            let item=propsAPI.getSelected()[0];
            let {model}=item;

            model=stepUtil.setStageIdToModel(model,stageId);

            propsAPI.update(item,model);
        }

        let stage=jenkinsContext.stageMap[stageId];

        let stepEditorDetail;
        switch (stepType) {
            case 'sh':stepEditorDetail=<ShellScriptStepEditor/>;break;
            case 'echo':stepEditorDetail=<EchoStepEditor/>;break;
            case 'git':stepEditorDetail=<GitStepEditor/>;break;
            default:stepEditorDetail=<div>空白编辑区 </div>;break;
        }
        console.log("before return this.getAgentType(stageId):"+stageUtil.getAgentType(stageId));
        let agentEditor=this.getAgentEditor(stageUtil.getAgentType(stageId),stageId);
        return <div className="wrapper">
                <div className="stage">
                    <div className="text">
                        当前Stage:{stageType}:{stage.name}
                        <button onClick={()=>{this.newStage();this.setState({});}}>新stage</button>
                    </div>
                </div>

                {stepEditorDetail}

                <div className="agent">
                    <div className="text">代理</div>
                    <Select defaultValue={stageUtil.getAgentType(stageId)} style={{ width: 120 }} className="Select"
                            onChange={
                                (option)=>{
                                    agentEditor=this.getAgentEditor(option,stageId);
                                    this.setState({});
                                }
                            }>
                        <Option value="any">any</Option>
                        <Option value="docker">docker</Option>
                    </Select>
                    {agentEditor}
                </div>


            <div className="evironment">
                    <div className="text">环境变量</div>
                    <Test />
                </div>
            </div>

    }
}

export default withPropsAPI(StepEditor);


