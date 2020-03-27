import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import avatar from '../assets/jessie.jpg';
import logo from '../assets/logo-dark.svg';
import {
  Box,
  CloseButton,
  Flex,
  Heading,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList
} from '@chakra-ui/core';
import {Link as GatsbyLink, graphql, useStaticQuery} from 'gatsby';
import {Helmet} from 'react-helmet';

function Header(props) {
  return (
    <Box as="header" bg="gray.800" pb="32">
      <Box as="nav" maxW="7xl" mx="auto" px={[6, 8]}>
        <Box borderBottom="1px" borderColor="gray.700">
          <Flex align="center" justify="space-between" h="16" px="0">
            <Flex align="center">
              <Box flexShrink="0">
                <Image h="8" w="8" src={logo} alt="Oxide logo" />
              </Box>
              <Box display={{base: 'none', md: 'block'}}>
                <Flex ml="10" items="baseline">
                  <Link
                    as={GatsbyLink}
                    to={props.title}
                    px="3"
                    py="1"
                    rounded="sm"
                    fontSize="md"
                    color="white"
                    bg="gray.900"
                    _hover={{color: 'white', bg: 'gray.900'}}
                    _focus={{color: 'white', bg: 'gray.900'}}
                  >
                    Dashboard
                  </Link>
                  <Link
                    as={GatsbyLink}
                    to="/"
                    ml="4"
                    px="3"
                    py="1"
                    rounded="sm"
                    fontSize="md"
                    color="gray.300"
                    _hover={{color: 'white', bg: 'gray.700'}}
                    _focus={{color: 'white', bg: 'gray.700'}}
                  >
                    Team
                  </Link>
                </Flex>
              </Box>
            </Flex>
            <Box display={{base: 'none', md: 'block'}}>
              <Flex ml={[4, 6]} align="center">
                <IconButton
                  variant="link"
                  color="gray.200"
                  aria-label="Notifications"
                  icon="warning-2"
                  size="lg"
                />
                <Menu>
                  <MenuButton ml="3" position="relative">
                    <Image
                      rounded="full"
                      h="8"
                      w="8"
                      src={avatar}
                      alt="Avatar"
                    />
                  </MenuButton>
                  <MenuList>
                    <MenuGroup title="Profile">
                      <MenuItem>Account</MenuItem>
                      <MenuItem>Profile</MenuItem>
                      <MenuItem>Settings</MenuItem>
                      <MenuItem>Log out</MenuItem>
                    </MenuGroup>
                    <MenuDivider />
                    <MenuGroup title="Help">
                      <MenuItem>Docs</MenuItem>
                      <MenuItem>Support</MenuItem>
                    </MenuGroup>
                  </MenuList>
                </Menu>
              </Flex>
            </Box>
            <Flex mr="-2" display={{base: 'block', md: 'none'}}>
              <CloseButton></CloseButton>
            </Flex>
          </Flex>
        </Box>
      </Box>
      <Box py="10">
        <Box maxW="7xl" mx="auto" px={[4, 6, 8]}>
          <Heading as="h1" size="xl" color="white">
            Dashboard
          </Heading>
        </Box>
      </Box>
    </Box>
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
      <Box bg="gray.100">
        <Header title={title} />
        <Box mt="-8rem">
          <Box maxW="7xl" mx="auto" pb="12" px={[4, 6, 8]}>
            <Box
              rounded="md"
              shadow="sm"
              backgroundColor="white"
              h="48rem"
              p={[4, 6, 8]}
            >
              {props.children}
            </Box>
          </Box>
        </Box>
      </Box>
    </Fragment>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
};
