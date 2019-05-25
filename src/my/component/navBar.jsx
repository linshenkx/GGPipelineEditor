import React, { Component, PropTypes } from 'react';
import { Input, Select, Checkbox } from "antd";
import jenkinsContext from "../util/JenkinsContext";
const Option = Select.Option;
class navBar extends React.Component {
  render() {
       function handleChange(value) {
      console.log(`selected ${value}`);
    }
    function onChange(e) {
      console.log(`checked = ${e.target.checked}`);
    }
    return <div>
    <div className="navInput">
          <Input size="large" placeholder="Job Name" />
          <Select
            defaultValue="选择类型"
            style={{ width: 120 }}
            onChange={handleChange}
            size="large"
          >
            <Option value="caseO">{jenkinsContext.dataList[0]}</Option>
          </Select>
          <Input size="large" placeholder="接受触发工程URL" />
          <Input size="large" placeholder="项目描述" id="todoCheck" />
          <Checkbox onChange={onChange} checked>
            保存自动运行
          </Checkbox>
        </div>
    </div>
  }
}
export default navBar;