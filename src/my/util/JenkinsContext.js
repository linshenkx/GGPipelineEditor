import pipelineStore, {UnknownSection} from "../service/PipelineStore";
import type {EnvironmentEntryInfo, StepInfo} from "../service/PipelineStore";



class JenkinsContext {
    stageMap={};
    currentStageId;
}


const jenkinsContext = new JenkinsContext();

let contextStage= pipelineStore.createNoneStage("contextStage");
contextStage.id='00000';
// jenkinsContext.stageMap.set(contextStage.id,contextStage);
jenkinsContext.currentStageId=contextStage.id;
jenkinsContext.stageMap[contextStage.id]=contextStage;

export default jenkinsContext;
