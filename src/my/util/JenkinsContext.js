import pipelineStore from "../service/PipelineStore";

class JenkinsContext {
    stageMap=new Map();
    currentStageId;
}

const jenkinsContext = new JenkinsContext();

let contextStage= pipelineStore.createNoneStage("contextStage");
contextStage.id='00000';
jenkinsContext.stageMap.set(contextStage.id,contextStage);
jenkinsContext.currentStageId=contextStage.id;

export default jenkinsContext;
