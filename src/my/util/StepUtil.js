import idgen from "../service/IdGenerator";

class StepUtil {
    getDefaultStep=(name)=>{
        return {
            id: idgen.next(),
            isContainer: false,
            children: [],
            name: name,
            label: "",
            data: {},
            script:""
        };
    };
    getStepFromModel=(model)=>{
        let {myProps}=model;
        if(myProps && myProps.step){
            return  myProps.step;
        }
    };

    setStepToModel=(model,step)=>{
        if(!model.myProps){
            model.myProps={};
        }
        model.myProps.step=step;
        return model;
    };

    getStageTypeFromModel= (model) =>{
        let {myProps}=model;
        if(myProps && myProps.stageType){
            return  myProps.stageType;
        }
    };
    setStageTypeToModel= (model,stageType)=>{
        if(!model.myProps){
            model.myProps={};
        }
        model.myProps.stageType=stageType;
        return model;
    };

    getStageIdFromModel= (model)=> {
        let {myProps}=model;
        if(myProps && myProps.stageId){
            return  myProps.stageId;
        }
    };
    setStageIdToModel=(model,stageId)=>{
        if(!model.myProps){
            model.myProps={};
        }
        model.myProps.stageId=stageId;
        return model;
    };
    getStepTypeFromModel=(model) =>{
        let {myProps}=model;
        if(myProps && myProps.stepType){
            return  myProps.stepType;
        }
    };
    setStepTypeToModel=(model,stepType)=>{
        if(!model.myProps){
            model.myProps={};
        }
        model.myProps.stepType=stepType;
        return model;
    };


}
export const stepUtil=new StepUtil();



