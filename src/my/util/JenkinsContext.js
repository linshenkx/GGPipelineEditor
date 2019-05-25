import pipelineStore from "../service/PipelineStore";
// import type {EnvironmentEntryInfo, StepInfo} from "../service/PipelineStore";  , {UnknownSection}



class JenkinsContext {
    stageMap={};
    currentStageId;
    userId="";
    dataList=[];
    isLogin=false;
    IPaddress="";
}


const jenkinsContext = new JenkinsContext();

let contextStage= pipelineStore.createNoneStage("contextStage");
contextStage.id=9999;
// jenkinsContext.stageMap.set(contextStage.id,contextStage);
jenkinsContext.currentStageId=contextStage.id;
jenkinsContext.stageMap[contextStage.id]=contextStage;

export default jenkinsContext;
