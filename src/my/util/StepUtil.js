import idgen from "../service/IdGenerator";

export function getDefaultStep(name){
    return {
        id: idgen.next(),
        isContainer: false,
        children: [],
        name: name,
        label: "",
        data: {},
        script:""
    };
}

export function getStepFromModel(model){
    let {myProps}=model;
    if(myProps && myProps.step){
        return  myProps.step;
    }
}

export function setStepToModel(model,step){
    if(!model.myProps){
        model.myProps={};
    }
    model.myProps.step=step;
    return model;
}
