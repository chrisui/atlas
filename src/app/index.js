import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import memoize from 'lodash/memoize';
import loadable from 'react-loadable';
import styled from 'styled-components';

import docs from '!resolve-docs-loader!./docs';

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
    () => (
      <Anchors>
        {doc.data.meta.anchors.map(anchor => (
          <li>
            <a href={`#${anchor.slug}`} key={anchor.slug}>{anchor.title}</a>
          </li>
        ))}
      </Anchors>
    ),
  doc => doc.data.path.join('/')
);

const Anchors = styled.ul`
  
`;

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
          <ul>
            {docs.map(doc => (
              <li key={doc.id}>
                <Link to={`/${doc.data.path.join('/')}`} title={doc.data.file}>
                  {doc.data.path.join('/')} [{doc.data.type}:{doc.data.ext}]
                </Link>
                <Route
                  path={`/${doc.data.path.join('/')}`}
                  component={routeAnchor(doc)}
                  exact={true}
                />
              </li>
            ))}
          </ul>
        </Sidebar>
        <Content>
          {docs.map(doc => (
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
