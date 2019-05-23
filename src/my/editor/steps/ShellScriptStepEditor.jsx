import React from 'react';
import PropTypes from 'prop-types';
import { getArg, setArg } from '../../service/ArgService';
import { withPropsAPI } from 'gg-editor';
import './ShellScriptStepEditor.css';
import 'antd/dist/antd.css';
import { Input} from 'antd';

import {stepUtil} from "../../util/StepUtil"
const { TextArea } = Input;
class ShellScriptStepEditor extends React.Component {

    textChanged = (name,targetValue) => {

        const { propsAPI } = this.props;
        let item=propsAPI.getSelected()[0];
        let {model}=item;
        let step;
        if(model.myProps&&model.myProps.step){
            step=model.myProps.step;
        }else {
            step=stepUtil.getDefaultStep(ShellScriptStepEditor.stepType);
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
            step=stepUtil.getDefaultStep(ShellScriptStepEditor.stepType);
            model=stepUtil.setStepToModel(model,step);
            propsAPI.update(item,model);
        }
        return <div className="wrapper">
        <div className="stage">
            <div className="text">step类型:{step.name}</div>
        </div>
            <div>shell 脚本：
                <TextArea
                    className="editor-step-detail-script"
                    defaultValue={getArg(step,"script").value}
                    onChange={e => this.textChanged("script",e.target.value)}
                    rows={10}
                />
            </div>
        </div>;
    }
}
export default withPropsAPI(ShellScriptStepEditor);
ShellScriptStepEditor.propTypes = {
    onChange: PropTypes.func,
};

ShellScriptStepEditor.stepType = 'sh'; // FIXME do this a better way
