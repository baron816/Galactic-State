# Galactic State

A "global" state library for React, with an API similar to `useState`.

![NPM](https://img.shields.io/npm/l/galactic-state) ![npm](https://img.shields.io/npm/v/galactic-state)

## Install

`npm i galactic-state`

## Usage

`createGalactic` receives a single argument, which corresponds to the default state value. It returns a hook, and that hook returns a tuple array with the current value itself in the first position, and a setter function in the second position. The setter function works like `useStates` (if called with a callback function, that callback has a parameter for the current state value). Any component that uses that hook returned from `createGalactic` will correctly update if another component anywhere in the app "sets" the value.

```typescript
// state.js
import { createGalactic } from 'galactic-state';

export const useEmail = createGalactic('');
export const usePassword = createGalactic('');

...
// Login.jsx
import { useEmail, usePassword } from 'src/state';

function Login(props) {
    const [email, setEmail] = useEmail();
    const [password, setPassword] = usePassword();

    ...
}

```

### Observer
If you pass an optional second `true` argment to `createGalactic`, it will return a tuple, with the hook in the first position, and an "observer" in the second.

This observer can be used to listen to state changes OR update your state outside of the component tree.

```typescript
// UserSettings.js
const [useUserSettings, UserSettingsObserver] = createGalactic({ ... }, true);
export useUserSettings;
export isLoggedInObserver;

export const [useUserSettings, UserSettingsObserver] = createGalactic({ ... }, true);

// Update state from server websocket

UserSettingsWebSocket.subscribe((serverSettings) => {
    UserSettingsObserver.update(serverSettings);
});


// Listen to state changes on server
UserSettingsObserver.subscribe((settingsUpdate) => {
    console.log('User settings updated to', settingsUpdate);
})

```

## FAQ

### Why this instead of Context?

React Context's API can be a bit clunky to use. If you have contexts that depend on each other, it can be very tricky to get them to work. You also still have some boilerplate (though not as much as Redux), a learning curve, and you often end up with lots of imports to consume your context. Context can also result in performance issues since providers will rerender the whole app when they render if you're wrapping all your components.

Galactic State provides a much simpler API and intuitive API which can help create a more performant application.

### Why "Galactic"?

"Global" state has bad connotations, and it needed to have a differentiating name.
