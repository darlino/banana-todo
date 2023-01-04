import React, { useState } from "react";
import Todo from "./Todo";
import { ApolloProvider, ApolloClient, InMemoryCache,  } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://e4e5-154-72-171-237.eu.ngrok.io/api/graphql",
  cache: new InMemoryCache()
})

 export default function App (props) {
  return (
    <ApolloProvider client={client}>
      <Todo/>
    </ApolloProvider>
  ) 
  
}

