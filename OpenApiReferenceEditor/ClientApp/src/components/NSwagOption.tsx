import React, { Component, ChangeEventHandler } from 'react';
import { Col, Input, Select } from 'antd';
import 'antd/dist/antd.css';

const { Option } = Select;
const { TextArea } = Input;

interface IProps {
    option: INSwagOption;
    id: number;
    nSwagOptions: INSwagOptionDefnition[];
    onChange: ((key: number, value: INSwagOption) => void);
    getSelectedOptions: (() => string[]);
}

interface IState {
    option: INSwagOption;
}

export interface INSwagOptionDefnition {
    name: string;
    value: string;
    enumValues: string[];
    type: string;
}

export interface INSwagOption {
    name: string;
    value: string;
    [name: string]: any;
}

interface IState { }


export class NSwagOption extends Component<IProps, IState> {
    static displayName = NSwagOption.name;

    constructor(props: IProps) {
        super(props);
        this.state = { option: props.option };
        this.HandleOptionChanged = this.HandleOptionChanged.bind(this);
        // this.HandleNameChanged = this.HandleNameChanged.bind(this);
    }

    HandleOptionChanged(key: string, value: string) {
        value = value.replace(new RegExp('^using\\s|;|,*', 'gm'), "");
        var newOption = { ...this.state.option, [key]: value };
        this.setState({ option: newOption });
        this.props.onChange(this.props.id, newOption)
    }

    render() {
        var selectedOptions = this.props.getSelectedOptions();
        var selectedOptionDefinition = this.props.nSwagOptions.find(x => x.name === this.state.option.name);
        return (<>
            <Col span={5}>
                <Select defaultValue={this.state.option.name} onChange={e => this.HandleOptionChanged("name", e)} style={{ width: '100%' }}>
                    {this.props.nSwagOptions?.map(option => !selectedOptions.includes(option.name) &&
                        <Option value={option.name}>{option.name}</Option>
                    )}
                </Select>
                {/* <Input defaultValue={this.state.option.name} onChange={e => this.HandleOptionChanged("name", e.target.value)} /> */}
            </Col>
            <Col span={15}>
                {!selectedOptionDefinition?.enumValues ?
                    selectedOptionDefinition?.type.endsWith("[]") ?
                    <TextArea autoSize={true} value={this.state.option.value} onChange={e => this.HandleOptionChanged("value", e.target.value)} />
                    :
                    <Input value={this.state.option.value} onChange={e => this.HandleOptionChanged("value", e.target.value)} />
                    :
                    <Select defaultValue={this.state.option.value} onChange={e => this.HandleOptionChanged("value", e)}  style={{ width: '100%' }}>
                        {selectedOptionDefinition.enumValues?.map(enumValue => 
                        <Option value={enumValue}>{enumValue}</Option>
                    )}
                    </Select>
                }
            </Col>
        </>);
    }
}
