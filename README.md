# Rex - A very simple store 

## Aritecture

Rex consists of 2 main parts - *sotore* and *actions*. *Store* - contains the data and changes the data, *actions* are triggering store change. Store and actions are connected with an *event emitter*.

## Usage example

```
import { createStore, createEmitter, createActions } from "rex-store";
import { useState } from "rex-hooks";
import * as React from "react";

interface IUser {
  id: string;
  login: string;
}

interface IUserStore {
  user: IUser;
  loading: boolean;
}

const userEmitter = createEmitter();

const userStore = createStore<IUserStore>(userEmiter, {
  user: null,
  loading: false,
}, "user");

function loadUser(id: string) {
  userStore.setState({ loading: true });
  readUserFromApi(id).then((user) => { // readUserFromApi - is not defined in the example
    userStore.setState({
      user,
      loading: false,
    });
  });
}

const userActions = createActions(userStore, {
  loadUser,
});

function AppContainer() {
  const userState = useStore(userStore);
  
  if (userState.user) {
    return (
      <div>
        {user.id} {user.login}
      </div>
    );
  }

  return (
    <button onClick={userActions.loadUser}>Load User</button>
  );
}

ReactDom.render(<AppContainer />, window.document.querySelector('.app'));
```
