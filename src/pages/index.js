import Layout from '../components/layout';
import React from 'react';
import {Heading} from '@chakra-ui/core';
import {Helmet} from 'react-helmet';

export default function Index() {
  return (
    <Layout>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <Heading>Hello world</Heading>
    </Layout>
  );
}
