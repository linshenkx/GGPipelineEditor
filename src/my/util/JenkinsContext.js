import pipelineStore from "../service/PipelineStore";

class JenkinsContext {
     stageMap=new Map();
    currentStageId;
}

const jenkinsContext = new JenkinsContext();
pipelineStore.setPipeline({
    agent: { type: 'any' },
    children: [],
});
let contextStage= pipelineStore.createSequentialStage("contextStage");
jenkinsContext.stageMap.set(contextStage.id,contextStage);
jenkinsContext.currentStageId=contextStage.id;

export default jenkinsContext;
