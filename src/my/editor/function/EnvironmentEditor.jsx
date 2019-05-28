/* eslint-disable react/react-in-jsx-scope */
import React from "react";
import { Table, Input, Button, Popconfirm, Form } from "antd/lib/index";

import { stageUtil } from "../../util/StageUtil";
import PropTypes from "prop-types";
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);
const paginationProps = {
  hideOnSinglePage: true
};
class EditableCell extends React.Component {
  state = {
    editing: false
  };

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  };

  save = e => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  };

  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title } = this.props;
    const { editing } = this.state;
    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            {
              required: true,
              message: `${title} is required.`
            }
          ],
          initialValue: record[dataIndex]
        })(
          <Input
            ref={node => (this.input = node)}
            onPressEnter={this.save}
            onBlur={this.save}
          />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={this.toggleEdit}
      >
        {children}
      </div>
    );
  };

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    );
  }
}

class EnvironmentEditor extends React.Component {
  columns = [
    {
      title: "变量名",
      dataIndex: "key",
      width: "30%",
      editable: !this.props.disabled
    },
    {
      title: "变量值",
      dataIndex: "value.value",
      editable: !this.props.disabled
    },
    {
      title: (
        <Button
          disabled={this.props.disabled}
          onClick={() => this.handleAdd()}
          type="primary"
          style={{ marginBottom: 10 }}
        >
          添加
        </Button>
      ),
      dataIndex: "operation",
      render: (text, record) =>
        stageUtil.getEnvironment(this.props.stageId).length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => {
              this.handleDelete(record.key);
            }}
          >
            <Button type="primary" disabled={this.props.disabled}>
              Delete
            </Button>
          </Popconfirm>
        ) : null
    }
  ];

  handleDelete = key => {
    stageUtil.delEnvByKey(this.props.stageId, key);
    this.setState({});
  };

  handleAdd = () => {
    stageUtil.addEnvironment(this.props.stageId, "defaultKey", "defaultValue");
    this.setState({});
  };

  handleSave = row => {
    stageUtil.updateEnv(this.props.stageId, row.id, row.key, row.value.value);
    this.setState({});
  };

  render() {
    let stageId = this.props.stageId;

    let envList = stageUtil.getEnvironment(stageId);
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell
      }
    };
    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave
        })
      };
    });
    return (
      <div>
        <Table
          components={components}
          rowClassName={() => "editable-row"}
          dataSource={envList}
          columns={columns}
          pagination={paginationProps}
        />
      </div>
    );
  }
}
export default EnvironmentEditor;
EnvironmentEditor.propTypes = {
  stageId: PropTypes.number,
  disabled: PropTypes.bool
};