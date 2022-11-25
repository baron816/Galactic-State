# Galactic State

<p align="center">
    <img alt="galaxy" src="https://astronomy.com/-/media/Images/andromeda.jpg?mw=600" />
</p>

A "global" state library for React, with an API similar to `useState`.

![NPM](https://img.shields.io/npm/l/galactic-state) ![npm](https://img.shields.io/npm/v/galactic-state) ![NPM](https://img.shields.io/bundlephobia/minzip/galactic-state)

## Install

`npm i galactic-state`

## Usage

`createGalactic` receives a single argument, which corresponds to the default state value. It returns a tuple with a hook in the first position that works like `useState`, but whose state will be "global", ie any component that uses it will update when its value gets updated.

```typescript
// state.js
import { createGalactic } from 'galactic-state';

export const [useEmail] = createGalactic('');
export const [usePassword] = createGalactic('');

...
// Components.jsx
import { useEmail, usePassword } from 'src/state';

function Login() {
    const [email, setEmail] = useEmail();
    const [password, setPassword] = usePassword();

    return (
        <div>
          <input 
            type='email'
            onChange={e => setEmail(e.target.value)}
            value={email}
          />
          <input 
            type='password'
            onChange={e => setPassword(e.target.value)}
            value={password}
          />
        </div>
    );
}

function OtherComponent() {
    const [email] = useEmail();

    return (
        <h1>{email}</h1> // will update when `setEmail` is called in `Login` Component
    );
}

function App() {
    return (
        <div>
            <OtherComponent />
            <Login />
        </div>
    );
}

```

### Setter
The second value in the tuple returned from `createGalactic` is a setter function that can be called from anywhere. This is the exact same setter that is returned from the generated hook, and it will have the same function.

If you have a component that is just setting state and not consuming the state value, you can use this setter instead to prevent unnecessary rerendering of your component.

You could also use this within a websocket connection to sync your server state and your client state.

```javascript
// state.js
export const [useIsAuthenticated, setIsAuthenticated] = createGalactic(false);

// Login.jsx
import { setIsAuthenticated } from 'src/state';

function Login() {
    ...

    return (
        <form onSubmit={async () => {
            const isAuthenticated = await serverValidateCredentials(email, password);
            setIsAuthenticated(isAuthenticated);
        }}>
            ...
        </form>
    )
}

// Logs out user from the server (for security reasons).
ServiceAuthenticationValidWS.subscribe(isAuthenticated => {
    setIsAuthenticated(isAuthenticated)
})

```

### Observer
The third value in the tuple is an observer, which can be used to subscribe to state changes from anywhere in the app, not necessarily within a component.

## FAQ

### Why this instead of Context?

React Context's API can be a bit clunky to use. If you have contexts that depend on each other, it can be very tricky to get them to work. You also still have some boilerplate (though not as much as Redux), a learning curve, and you often end up with lots of imports to consume your context. Context can also result in performance issues since providers will rerender the whole app when they render if you're wrapping all your components.

Galactic State provides a much simpler API and intuitive API which can help create a more performant application.

### Why "Galactic"?

"Global" state has bad connotations, and it needed to have a differentiating name.
