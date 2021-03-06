import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink } from "apollo-link";
import { GC_USER_ID, GC_AUTH_TOKEN } from "./constants/settings";
import {
  SubscriptionClient,
  addGraphQLSubscriptions
} from "subscriptions-transport-ws";

import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueApollo from "vue-apollo";
import "vue-loaders/dist/vue-loaders.css";
import * as VueLoaders from "vue-loaders";

Vue.config.productionTip = false;

const httpLink = new HttpLink({
  uri: "https://api.graph.cool/simple/v1/cjg1ya1hs7afk0119xtu0e4n7"
});

const wsClient = new SubscriptionClient(
  "wss://subscriptions.graph.cool/v1/cjg1ya1hs7afk0119xtu0e4n7",
  {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(GC_AUTH_TOKEN)
    }
  }
);
const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  const token = localStorage.getItem(GC_AUTH_TOKEN);
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : null
    }
  });

  return forward(operation);
});

const httpLinkWithSubscriptions = addGraphQLSubscriptions(
  authMiddleware.concat(httpLink),
  wsClient
);

const apolloClient = new ApolloClient({
  link: httpLinkWithSubscriptions,
  cache: new InMemoryCache(),
  connectToDevTools: true
});
Vue.use(Buefy.default);
Vue.use(VueApollo);
Vue.use(VueLoaders);

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    $loadingKey: "loading"
  }
});

let userId = localStorage.getItem(GC_USER_ID);

new Vue({
  provide: apolloProvider.provide(),
  router,
  data: {
    userId
  },
  render: h => h(App)
}).$mount("#app");
