---
description: Sync a new JSX file from Downloads into the project src/ and make it the active app
---

When the user drops a new JSX file in Downloads and wants the running project to reflect it, follow these steps:

1. Identify the target file. The user will either name it explicitly or it will be the most recently modified `.jsx` file in `/Users/aeknotebook/Downloads/`.

// turbo
2. Copy the file into the project src/ folder:
```
cp "/Users/aeknotebook/Downloads/<filename>.jsx" "/Users/aeknotebook/Documents/GitHub/Custom E-Service/src/<filename>.jsx"
```

// turbo
3. Update `src/App.jsx` to import and re-export the new component:
Replace the contents of `/Users/aeknotebook/Documents/GitHub/Custom E-Service/src/App.jsx` with:
```jsx
import App from './<filename>.jsx';
export default App;
```

4. Vite's HMR will automatically reload the browser at http://localhost:5173. Confirm with the user that the update is visible.
