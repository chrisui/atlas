import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import memoize from 'lodash/memoize';
import loadable from 'react-loadable';
import styled from 'styled-components';
import formatName from '../utils/formatName';

import {tree, list} from '!resolve-docs-loader!./docs';

const MyLoadingComponent = ({isLoading, error, pastDelay}) => {
  if (isLoading) {
    return pastDelay ? <div>Loading...</div> : null; // Don't flash "Loading..." when we don't need to.
  } else if (error) {
    return <div>Error! Component failed to load</div>;
  }

  return null;
};

const routeComponent = memoize(
  doc =>
    loadable({
      loader: doc.load,
      LoadingComponent: MyLoadingComponent,
    }),
  doc => doc.data.path.join('/')
);

const routeAnchor = memoize(
  doc =>
    () =>
      doc.meta.anchors.length
        ? <Tree>
            {doc.meta.anchors.map(anchor => (
              <Item>
                <a href={`#${anchor.slug}`} key={anchor.slug}>{anchor.title}</a>
              </Item>
            ))}
          </Tree>
        : null,
  doc => doc.path.join('/')
);

const Tree = styled.ul`

`;

const Item = styled.li`

`;

const NavTree = ({root}) => (
  <Tree>
    {root.children.map(child => <NavItem key={child.value} node={child} />)}
  </Tree>
);

const NavItem = ({node, ctx = []}) => (
  <Item>
    {node.data
      ? [
          <Link to={`/${node.data.path.join('/')}`} title={node.data.file}>
            {node.value} [{node.data.type}:{node.data.ext}]
          </Link>,
          <Route
            path={`/${node.data.path.join('/')}`}
            component={routeAnchor(node.data)}
            exact={true}
          />,
        ]
      : <Link to={`/${[...ctx, node.value].join('/')}`}>
          {node.value}
        </Link>}
    <Route path={`/${[...ctx, node.value].join('/')}`}>
      {({match}) =>
        match && node.children.length
          ? <Tree>
              {node.children.map(child => (
                <NavItem
                  node={child}
                  key={child.value}
                  ctx={[...ctx, node.value]}
                />
              ))}
            </Tree>
          : null}
    </Route>
  </Item>
);

const Container = styled.div`
  display: flex;
  max-width: 100%;
`;

const Sidebar = styled.div`
  margin-right: 30px;
  max-width: 360px;
`;

const Content = styled.div`
  flex: 1;
`;

const App = () => {
  return (
    <Router>
      <Container>
        <Sidebar>
          <NavTree root={tree} />
        </Sidebar>
        <Content>
          {list.map(doc => (
            <Route
              key={doc.id}
              path={`/${doc.data.path.join('/')}`}
              component={routeComponent(doc)}
              exact={true}
            />
          ))}
        </Content>
      </Container>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
