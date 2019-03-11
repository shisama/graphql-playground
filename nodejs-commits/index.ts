import gql from "graphql-tag";
import {ApolloClient} from "apollo-client";
import {HttpLink} from "apollo-link-http";
import {ApolloLink, concat} from "apollo-link";
import {InMemoryCache} from "apollo-cache-inmemory";
import fetch from "node-fetch";

const uri = 'https://api.github.com/graphql';
const access_token = process.argv[2];

const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      Authorization: `bearer ${access_token}`,
      Accept: 'application/vnd.github.v4.idl'
    }
  })
  return forward ? forward(operation) : null;
});

const httpLink = new HttpLink({uri, fetch: (fetch as any)});
const client = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache()
});

client.query({ query: gql`{
	repository(owner:"nodejs", name:"node") {
		object(expression:"master"){
			... on Commit {
				history(first: 30) {
					edges{
						node{
							committedDate
              messageHeadline
              url
						}
					}
				}
			}
		}
	}
}`
}).then(response => {
  return JSON.stringify(response);
}).then(console.log);