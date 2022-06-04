import React, { Component } from 'react';
import { Row, Col, Button, Input, Tabs } from 'antd';
import { IOpenApiReference, OpenApiReference } from './OpenApiReference';
import { INSwagOptionDefnition, INSwagOption } from './NSwagOption';
import 'antd/dist/antd.css';

const { TabPane } = Tabs;

interface IProps {


}

interface IState {
    openApiReferences: IOpenApiReference[];
    currentInput: string;
    loading: boolean;
    nSwagOptions: INSwagOptionDefnition[];
}


export class OpenApiReferenceEditor extends Component<IProps, IState> {
    static displayName = OpenApiReferenceEditor.name;

    constructor(props: IProps) {
        super(props);
        this.state = { openApiReferences: [], currentInput: "", loading: false, nSwagOptions: [] };
        this.OnPathChanged = this.OnPathChanged.bind(this);
        this.HandleOpenApiReferenceChanged = this.HandleOpenApiReferenceChanged.bind(this);
        this.HandleSave = this.HandleSave.bind(this);
        this.loadSavedState();
        this.getAllNSwagOptions();
    }

    async getAllNSwagOptions()
    {
        const response = await fetch('api/openApiReference/getAvailableNSwagOptions');
        const data: INSwagOptionDefnition[] = await response.json();
        this.setState({nSwagOptions: data});
    }

    loadSavedState() {
        var savedState = localStorage.getItem('savedState');
        if (savedState != null) {
            const rehydrate:IState = JSON.parse(savedState);
            rehydrate.nSwagOptions = [];
            // eslint-disable-next-line react/no-direct-mutation-state
            this.state = rehydrate;
        }
    }

    componentWillUnmount() {
        localStorage.setItem('savedState', JSON.stringify(this.state))
    }

    async OnPathChanged(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ openApiReferences: [], currentInput: "" });
        var path = event.target.value;
        const response = await fetch(`api/openApiReference/readFile?filePath=${path}`);
        const data: IOpenApiReference[] = await response.json();
        this.setState({ openApiReferences: [...data], currentInput: path });
    }

    HandleOpenApiReferenceChanged(key: number, value: IOpenApiReference) {
        var currentReferences = this.state.openApiReferences;
        currentReferences[key] = value;
        this.setState({ openApiReferences: currentReferences });
    }

    async HandleSave() {
        var currentOpenApiRefs = this.state.openApiReferences;
        var response = await fetch(`api/openApiReference/writeFile?filePath=${this.state.currentInput}`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentOpenApiRefs),

        });

    }

    addNewReference()
    {
        var newReference = { className: "NewClass", include: "", codeGenerator: "NSwagCSharp", outputPath: "", namespace: "", options: []  };
        var newReferences = [...this.state.openApiReferences, newReference]
        this.setState({ openApiReferences: newReferences });
    }

    handleTabChanged(key: string)
    {
        if(key==="+")
        {
            this.addNewReference();
        }
    }

    handleTabClicked()
    {
        if(this.state.openApiReferences.length === 0)
        {
            this.addNewReference();
        }
    }

    render() {
        return (<>
            <h1 id="tabelLabel" >Open API Reference Editor</h1>
            <Row id="project-row">
                <Col span={3}>
                    Project Location:
                </Col>
                <Col span={10}>
                    <Input onChange={this.OnPathChanged} defaultValue={this.state.currentInput} />
                </Col>
                <Col span={3}>
                    <Button onClick={this.HandleSave}>Save</Button>
                </Col>
            </Row>
            <Tabs tabPosition="top" onChange={this.handleTabChanged.bind(this)} onClick={this.handleTabClicked.bind(this)}>
                {this.state.openApiReferences.map((reference, index) =>
                    <TabPane tab={reference.className} key={reference.className + index}>
                        <OpenApiReference key={reference.className + index} id={index} reference={reference} onChange={this.HandleOpenApiReferenceChanged} nSwagOptions={this.state.nSwagOptions} />
                    </TabPane>
                )}
                <TabPane tab="+" key="+"/>
            </Tabs>
        </>);
    }
}
