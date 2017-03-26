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

const Container = styled.div`
  display: flex;
`;

const Sidebar = styled.div`
  margin-right: 30px;
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
