import React from 'react';
import PropTypes from 'prop-types';
import { getArg, setArg } from '../../service/ArgService';
import { withPropsAPI } from 'gg-editor';
import './ShellScriptStepEditor.css';
import 'antd/dist/antd.css';
import { Input} from 'antd';

import {stepUtil} from "../../util/StepUtil"
const { TextArea } = Input;
class EchoStepEditor extends React.Component {

    textChanged = (name,targetValue) => {

        const { propsAPI } = this.props;
        let item=propsAPI.getSelected()[0];
        let {model}=item;
        let step;
        if(model.myProps&&model.myProps.step){
            step=model.myProps.step;
        }else {
            step=stepUtil.getDefaultStep(EchoStepEditor.stepType);
        }

        step=setArg(step,name,targetValue);
        model=stepUtil.setStepToModel(model,step);

        propsAPI.update(item,model);

        if(this.props.onChange){
            this.props.onChange(step);
        }
    };


    render() {
        const { propsAPI } = this.props;
        let item=propsAPI.getSelected()[0];
        let {model}=item;
        let step=stepUtil.getStepFromModel(model);
        if(!step){
            step=stepUtil.getDefaultStep(EchoStepEditor.stepType);
        }
        return <div className="wrapper">
        <div className="stage">
            <div className="text">step类型:{step.name}</div>
        </div>
            <div>打印信息：
                <TextArea
                    className="editor-step-detail-script echo-step"
                    defaultValue={getArg(step,"message").value}
                    onChange={e => this.textChanged("message",e.target.value)}
                    rows={10}
                />
            </div>
        </div>;
    }
}
export default withPropsAPI(EchoStepEditor);
EchoStepEditor.propTypes = {
    onChange: PropTypes.func,
};

EchoStepEditor.stepType = 'echo';
