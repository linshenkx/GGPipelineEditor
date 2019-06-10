import pipelineStore from "../service/PipelineStore";
// import type {EnvironmentEntryInfo, StepInfo} from "../service/PipelineStore";  , {UnknownSection}

class JenkinsContext {
  stageMap = {};
  currentStageId;
  userId = "";
  dataList = [];
  isLogin = false;
  IPaddress = "";
  jobName: "";
  jobData: "";
  isAutoRun = true;
  handleURL: "";
  description: "";
  isRunning;
  jenkinsfile;
  shortDescription;
  id;
  trigger;
  duration;
  timestamp;
  result;

  init(){
    let contextStage = pipelineStore.createAnyStage("contextStage");
    contextStage.id = 9999;
    this.currentStageId = contextStage.id;
    this.stageMap[contextStage.id] = contextStage;
  };

}

const jenkinsContext = new JenkinsContext();

jenkinsContext.init();

export default jenkinsContext;
