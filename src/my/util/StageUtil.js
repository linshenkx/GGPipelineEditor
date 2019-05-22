import pipelineStore from "../service/PipelineStore";
import jenkinsContext from "./JenkinsContext";
import {stepUtil} from "./StepUtil";

class StageUtil {

    setAgentType=(stageId,agentType)=>{
        let stage= jenkinsContext.stageMap[stageId];
        stage.agent.type=agentType;
        jenkinsContext.stageMap[stageId]=stage;
    };
    setAgentArg=(stageId,key,value)=>{
        let stage= jenkinsContext.stageMap[stageId];
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
        jenkinsContext.stageMap[stageId]=stage;
    };

    getAgentType=(stageId)=>{
        let stage= jenkinsContext.stageMap[stageId];
        if(stage){
            return stage.agent.type;
        }
    };

    getAgentArg=(stageId,key)=>{
        let stage= jenkinsContext.stageMap[stageId];
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
        let stage= jenkinsContext.stageMap[stageId];
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
        jenkinsContext.stageMap[stageId]=stage;
    };

    getEnvironment=(stageId)=>{
        let {environment}= jenkinsContext.stageMap[stageId];
        return environment?environment:[];
    };
}

export const stageUtil=new StageUtil();
