import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { OpenApiReferenceEditor } from './components/OpenApiReferenceEditor';

import './custom.css'

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
        <Route path='/' component={OpenApiReferenceEditor} />
      </Layout>
    );
  }
}
