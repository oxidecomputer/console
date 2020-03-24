import Layout from '../components/layout';
import React from 'react';
import {Heading} from '@chakra-ui/core';
import {Helmet} from 'react-helmet';
import {Link} from 'gatsby';

export default function Index() {
  return (
    <Layout>
      <Helmet>
        <title>Account</title>
      </Helmet>
      <Heading>Account</Heading>
      <Link to="/">Back to home</Link>
    </Layout>
  );
}
