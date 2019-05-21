import React from 'react';
import PropTypes from 'prop-types';
import { getArg, setArg } from '../../service/ArgService';
import { withPropsAPI } from 'gg-editor';
import './ShellScriptStepEditor.css';
import 'antd/dist/antd.css';
import { Input} from 'antd';

import {stepUtil} from "../../util/StepUtil"
const { TextArea } = Input;
class GitStepEditor extends React.Component {

    textChanged = (name,targetValue) => {

        const { propsAPI } = this.props;
        let item=propsAPI.getSelected()[0];
        let {model}=item;
        let step;
        if(model.myProps&&model.myProps.step){
            step=model.myProps.step;
        }else {
            step=stepUtil.getDefaultStep(GitStepEditor.stepType);
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
            step=stepUtil.getDefaultStep(GitStepEditor.stepType);
        }
        return <div className="wrapper">
        <div className="stage">
            <div className="text">step类型:{step.name}</div>
        </div>
            <div>url(必填)：
                <TextArea
                    className="editor-step-detail-script"
                    defaultValue={getArg(step,"url").value}
                    onChange={e => this.textChanged("url",e.target.value)}
                    rows={1}
                />
            </div>
            <div>branch：
                <TextArea
                    className="editor-step-detail-script"
                    defaultValue={getArg(step,"branch").value}
                    onChange={e => this.textChanged("branch",e.target.value)}
                    rows={1}
                />
            </div>
            <div>credentialsId：
                <TextArea
                    className="editor-step-detail-script"
                    defaultValue={getArg(step,"credentialsId").value}
                    onChange={e => this.textChanged("credentialsId",e.target.value)}
                    rows={1}
                />
            </div>
        </div>;
    }
}
export default withPropsAPI(GitStepEditor);
GitStepEditor.propTypes = {
    onChange: PropTypes.func,
};

GitStepEditor.stepType = 'git'; // FIXME do this a better way
