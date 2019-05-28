import * as React from "react";
import {stepUtil} from "../util/StepUtil";
import PostStepEditor from "./structure/PostStepEditor";
import WhenStepEditor from "./structure/WhenStepEditor";
import {withPropsAPI} from "gg-editor";
import StepEditor from "./function/StepEditor";

class NodeEditor extends React.Component{
    render() {

        const {propsAPI} = this.props;
        let item = propsAPI.getSelected()[0];
        let {model} = item;

        let type = stepUtil.getTypeFromModel(model);

        //功能节点返回 StepEditor
        if (type === "function") {
            return <StepEditor/>;
        }

        //结构节点返回 各自对应类型 Editor
        if(type==="structure"){
            let stepType = stepUtil.getStepTypeFromModel(model);
            switch (stepType) {
                case "when":
                    return <WhenStepEditor/>;
                case "post":
                    return <PostStepEditor/>;
                default:
                    return <div>stepType:{stepType} 类型有误</div>;
            }
        }

        return <div>type:{type} 类型有误</div>

    }
}

export default withPropsAPI(NodeEditor);
