import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {Box, Flex, Text} from '@chakra-ui/core';
import {Helmet} from 'react-helmet';
import {Link, graphql, useStaticQuery} from 'gatsby';

function Header(props) {
  return (
    <Flex py="2" px="4" bg="gray.200">
      <Link to="/">{props.title}</Link>
      <Text ml="3">
        Status:{' '}
        <Box as="span" color="green.300" fontWeight="bold">
          OK
        </Box>
      </Text>
      <Box ml="auto" as={Link} to="/account">
        My account
      </Box>
    </Flex>
  );
}

Header.propTypes = {
  title: PropTypes.string.isRequired
};

export default function Layout(props) {
  const data = useStaticQuery(
    graphql`
      {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  );

  const {title} = data.site.siteMetadata;
  return (
    <Fragment>
      <Helmet defaultTitle={title} titleTemplate={`%s - ${title}`} />
      <Header title={title} />
      {props.children}
    </Fragment>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
};
