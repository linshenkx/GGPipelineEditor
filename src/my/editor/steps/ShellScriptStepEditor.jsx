import React from 'react';
import PropTypes from 'prop-types';
import { getArg, setArg } from '../../service/ArgService';
import { withPropsAPI } from 'gg-editor';

import 'antd/dist/antd.css';
import { Input } from 'antd';

import Button from 'antd/lib/button';
import idgen from "../../service/IdGenerator";
import {getDefaultStep} from "../../util/StepUtil"
const { TextArea } = Input;

class ScriptStepEditor extends React.Component {


    textChanged = (name,targetValue) => {
        const { propsAPI } = this.props;
        let item=propsAPI.getSelected()[0];
        let {model}=item;
        let {step}=model.myProps;
        if(!step){
            step=getDefaultStep();
        }

        switch (name) {
            case "name":
                step.name=targetValue;break;
            case "label":
                step.label=targetValue;break;
            default:
                step=setArg(step,name,targetValue);
        }

        model=this.setStepToModel(model,step);
        propsAPI.update(item,model);
    };

    getStepFromModel(model){
        let {myProps}=model;
        if(myProps && myProps.step){
            return  myProps.step;
        }else {
            return getDefaultStep();
        }
    }

    setStepToModel(model,step){
        let {myProps}=model;
        myProps.step=step;
        return model;
    }


    render() {

        const { propsAPI } = this.props;
        let item=propsAPI.getSelected()[0];
        let {model}=item;
        let step=this.getStepFromModel(model);

        return <div>
            <div className="name">name:
                <TextArea rows={2}
                className="editor-step-detail-name"
                defaultValue={step.name}
                onChange={e => this.textChanged("name",e.target.value)} />
            </div>
            <div>label
                <TextArea
                    className="editor-step-detail-script"
                    defaultValue={step.label}
                    onChange={e => this.textChanged("label",e.target.value)}
                    rows={2}
                />
            </div>
            <div>arg1
                <TextArea
                    className="editor-step-detail-script"
                    defaultValue={getArg(step,"arg1").value}
                    onChange={e => this.textChanged("arg1",e.target.value)}

                    rows={2}
                />
            </div>
            <Button type="primary">完成</Button>
        </div>;
    }
}
export default withPropsAPI(ScriptStepEditor);
ScriptStepEditor.propTypes = {
    step: PropTypes.any,
    onChange: PropTypes.func,
};

ScriptStepEditor.stepType = 'sh'; // FIXME do this a better way
