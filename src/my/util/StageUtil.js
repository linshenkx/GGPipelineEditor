import jenkinsContext from "./JenkinsContext";
import idgen from "../service/IdGenerator"

class StageUtil {
  setAgentType = (stageId, agentType) => {
    let stage = jenkinsContext.stageMap[stageId];
    stage.agent.type = agentType;
    jenkinsContext.stageMap[stageId] = stage;
  };
  setAgentArg = (stageId, key, value) => {
    let stage = jenkinsContext.stageMap[stageId];
    stage.agent.arguments = stage.agent.arguments.filter(currentValue => {
      return currentValue.key !== key;
    });
    stage.agent.arguments.push({
      key: key,
      value: {
        isLiteral: true,
        value: value
      }
    });
    jenkinsContext.stageMap[stageId] = stage;
  };

  getAgentType = stageId => {
    let stage = jenkinsContext.stageMap[stageId];
    if (stage) {
      return stage.agent.type;
    }
  };

  getAgentArg = (stageId, key) => {
    let stage = jenkinsContext.stageMap[stageId];
    console.log("stage json:" + JSON.stringify(stage));
    if (stage) {
      let arg = stage.agent.arguments.filter(currentValue => {
        return currentValue.key === key;
      })[0];
      if (arg) {
        return arg.value.value;
      }
    }
  };



  getEnvironment = stageId => {
      let { environment } = jenkinsContext.stageMap[stageId];
      if(environment){
        return environment;
    }else {
        jenkinsContext.stageMap[stageId].environment=[];
        return jenkinsContext.stageMap[stageId].environment;

    }

  };

  addEnvironment=(stageId,envKey,envValue)=>{
      let { environment } = jenkinsContext.stageMap[stageId];
      if(environment){
          environment=environment.filter((currentValue)=>{
              return currentValue.key!==envKey;
          });
      }else {
          environment=[];
      }

      environment.push({
          id:idgen.next(),
          key: envKey,
          value: {
              isLiteral: true,
              value: envValue
          }
      });
      jenkinsContext.stageMap[stageId].environment=environment;
  };

  updateEnv=(stageId,envId,envKey,envValue)=>{
      let { environment } = jenkinsContext.stageMap[stageId];
      if(!environment){
          return;
      }
      jenkinsContext.stageMap[stageId].environment=environment.map((currentValue)=>{
          if(currentValue.id===envId){
              currentValue.key=envKey;
              currentValue.value.value=envValue;
          }
          return currentValue;
      });
  };

  delEnvByKey=(stageId,envKey)=>{
      let { environment } = jenkinsContext.stageMap[stageId];
      if(!environment){
          return;
      }
      jenkinsContext.stageMap[stageId].environment= environment.filter((currentValue)=>{
          return currentValue.key!==envKey;
      });

  };

}

export const stageUtil = new StageUtil();
