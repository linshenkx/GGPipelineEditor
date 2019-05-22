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
import jenkinsContext from "../../util/JenkinsContext"
import pipelineStore from "../../service/PipelineStore";
import {convertInternalModelToJson} from "../../service/PipelineSyntaxConverter";
const { TextArea } = Input;
const Option = Select.Option;



class StepEditor extends React.Component {

    getAgentEditor=(agent,stageId)=>{
        console.log("agent:"+agent);

        this.setAgentType(stageId,agent);
        let agentEditor;
        switch (agent) {
            case "docker":
                agentEditor=<div>
                    <div>Image:
                        <Input
                            defaultValue={this.getAgentArg(stageId,"image")}
                            onChange={e => this.setAgentArg(stageId,"image",e.target.value)}
                        />
                    </div>
                    <div>Args:
                        <Input
                            defaultValue={this.getAgentArg(stageId,"args")}
                            onChange={e => this.setAgentArg(stageId,"args",e.target.value)}
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
    state = {
      agent:'any'
    };
    newStage=()=>{
        console.log("新建Stage");
        let newStage= pipelineStore.createNoneStage("newStage");
        jenkinsContext.stageMap.set(newStage.id,newStage);
        jenkinsContext.currentStageId=newStage.id;

        const { propsAPI } = this.props;
        let item=propsAPI.getSelected()[0];
        let {model}=item;

        model=stepUtil.setStageIdToModel(model,newStage.id);
        model=stepUtil.setStageTypeToModel(model,'leader');

        propsAPI.update(item,model);

        this.setState({});
    };
    setAgentType=(stageId,agentType)=>{
        let stage= jenkinsContext.stageMap.get(stageId);
        stage.agent.type=agentType;
        jenkinsContext.stageMap.set(stageId,stage);
    };
    setAgentArg=(stageId,key,value)=>{
        let stage= jenkinsContext.stageMap.get(stageId);
        stage.agent.arguments=stage.agent.arguments.filter((currentValue)=>{
            return currentValue.key!==key;
        });
        stage.agent.arguments.push({
            key: key,
            value: {
                isLiteral: true,
                value: value,
            },
        });
        jenkinsContext.stageMap.set(stageId,stage);
    };

    getAgentType=(stageId)=>{
        let stage= jenkinsContext.stageMap.get(stageId);
        if(stage){
            return stage.agent.type;
        }
    };

    getAgentArg=(stageId,key)=>{
        let stage= jenkinsContext.stageMap.get(stageId);
        console.log("stage json:"+JSON.stringify(stage));
        if(stage){
            let arg=stage.agent.arguments.filter((currentValue)=>{
                return currentValue.key===key;
            })[0];
            if(arg){
                return arg.value.value;
            }
        }
    };

    setEnvironment=(stageId,envList)=>{
        let stage= jenkinsContext.stageMap.get(stageId);
        stage.environment=[];
        envList.forEach((env)=>{
            stage.environment.push({
                key: env.key,
                value: {
                    isLiteral: true,
                    value: env.value,
                },
            });
        });
        jenkinsContext.stageMap.set(stageId,stage);
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

        let stage=jenkinsContext.stageMap.get(stageId);

        let stepEditorDetail;
        switch (stepType) {
            case 'sh':stepEditorDetail=<ShellScriptStepEditor/>;break;
            case 'echo':stepEditorDetail=<EchoStepEditor/>;break;
            case 'git':stepEditorDetail=<GitStepEditor/>;break;
            default:stepEditorDetail=<div>空白编辑区 </div>;break;
        }
        console.log("before return this.getAgentType(stageId):"+this.getAgentType(stageId));
        let agentEditor=this.getAgentEditor(this.getAgentType(stageId),stageId);
        return <div className="wrapper">
                <div className="stage">
                    <div className="text">
                        当前Stage:{stageType}:{stage.name}
                        <button onClick={this.newStage}>新stage</button>
                    </div>
                </div>

                {stepEditorDetail}

                <div className="agent">
                    <div className="text">代理</div>
                    <Select defaultValue={this.getAgentType(stageId)} style={{ width: 120 }} className="Select"
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


