import React, { Component } from 'react';
import { Row, Col, Input } from 'antd';
import { INSwagOption, INSwagOptionDefnition, NSwagOption } from './NSwagOption';
import { PlusCircleOutlined, CloseOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';

interface IProps {
    reference: IOpenApiReference;
    id: number;
    nSwagOptions: INSwagOptionDefnition[];
    onChange: ((key: number, value: IOpenApiReference) => void);
}

interface IState {
    reference: IOpenApiReference;
}

export interface IOpenApiReference {
    include: string;
    codeGenerator: string;
    namespace: string;
    className: string;
    outputPath: string;
    options: INSwagOption[];
    [name: string]: string | INSwagOption[];
}


interface IState { }


export class OpenApiReference extends Component<IProps, IState> {
    static displayName = OpenApiReference.name;

    constructor(props: IProps) {
        super(props);
        this.state = { reference: props.reference };
        this.HandleOptionChanged = this.HandleOptionChanged.bind(this);
        this.HandleAddNewOption = this.HandleAddNewOption.bind(this);
        this.HandleValueChanged = this.HandleValueChanged.bind(this);
    }

    HandleValueChanged(key: string, value: any) {
        this.setState({ reference: { ...this.state.reference, [key]: value } });
        this.props.onChange(this.props.id, { ...this.state.reference, [key]: value });
    }

    HandleOptionChanged(key: number, value: INSwagOption) {
        var currentReference = this.state.reference;
        currentReference.options[key] = value;
        this.setState({ reference: currentReference });
        this.props.onChange(this.props.id, currentReference);
    }

    HandleAddNewOption() {
        var selectedOptions = this.getSelectedOptions();
        var firstUnselecteOption = this.props.nSwagOptions.filter(x => !selectedOptions.includes(x.name))[0];
        var newOptions = [...this.state.reference.options, { name: firstUnselecteOption.name, value: "" }]
        var newReference = { ...this.state.reference, options: newOptions };
        this.setState({ reference: newReference });
        this.props.onChange(this.props.id, newReference);
    }

    HandleRemoveOption(key: number) {
        var newOptions = this.state.reference.options;
        newOptions.splice(key, 1);
        var newReference = { ...this.state.reference, options: newOptions };
        this.setState({ reference: newReference });
        this.props.onChange(this.props.id, newReference);
    }

    getSelectedOptions(): string[] {
        return this.state.reference.options.map(option => option.name);
    }

    render() {
        var reference = this.state.reference;
        return (<>
            <h5>{reference.className}</h5>
            <Row className="generic-row">
                <Col span={3}>Include: </Col>
                <Col span={15}>
                    <Input defaultValue={reference.include} onChange={e => this.HandleValueChanged("include", e.target.value)} />
                </Col>
            </Row>
            <Row className="generic-row">
                <Col span={3}>ClassName: </Col>
                <Col span={15}>
                    <Input defaultValue={reference.className} onChange={e => this.HandleValueChanged("className", e.target.value)} />
                </Col>
            </Row>
            <Row className="generic-row">
                <Col span={3}>CodeGenerator: </Col>
                <Col span={15}>
                    <Input defaultValue={reference.codeGenerator} onChange={e => this.HandleValueChanged("codeGenerator", e.target.value)}
                        status={this.state.reference.codeGenerator === "NSwagCSharp" ? "" : "error"} />
                </Col>
            </Row>
            <Row className="generic-row">
                <Col span={3}>Namespace: </Col>
                <Col span={15}>
                    <Input defaultValue={reference.namespace} onChange={e => this.HandleValueChanged("namespace", e.target.value)} />
                </Col>
            </Row>
            <Row className="generic-row">
                <Col span={3}>Output path: </Col>
                <Col span={15}>
                    <Input defaultValue={reference.outputPath} onChange={e => this.HandleValueChanged("outputPath", e.target.value)} />
                </Col>
            </Row>
            <Row className='generic-row'>
                Options:
                <Col span={24}>
                    {this.state.reference.options.length === 0 &&
                        <Row className='generic-row'>
                            <Col span={1}><PlusCircleOutlined style={{ fontSize: 24, marginLeft: 5, marginTop: 4 }} onClick={this.HandleAddNewOption} /></Col>
                        </Row>
                    }
                    {this.state.reference.codeGenerator === "NSwagCSharp" && this.state.reference.options?.map((option, index) =>
                        <Row className='generic-row'>
                            <CloseOutlined style={{ fontSize: 16, marginRight: 5, marginTop: 8 }} onClick={() => this.HandleRemoveOption(index)} />
                            <NSwagOption key={option.name + index} id={index} option={option} onChange={this.HandleOptionChanged} nSwagOptions={this.props.nSwagOptions} getSelectedOptions={this.getSelectedOptions.bind(this)} />
                            {index + 1 === this.state.reference.options.length &&
                                <Col span={1}><PlusCircleOutlined style={{ fontSize: 24, marginLeft: 5, marginTop: 4 }} onClick={this.HandleAddNewOption} /></Col>
                            }
                        </Row>
                    )}
                </Col>

            </Row>
        </>);
    }
}
