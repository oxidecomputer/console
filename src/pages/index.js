import Layout from '../components/layout';
import React from 'react';
import {Helmet} from 'react-helmet';
import {Text} from '@chakra-ui/core';

export default function Index() {
  return (
    <Layout>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <Text>Hello world</Text>
    </Layout>
  );
}
