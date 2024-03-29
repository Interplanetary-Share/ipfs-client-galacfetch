# Welcome to your Bit Workspace

To get started straight away run `bit start` and open [localhost:3000](http://localhost:3000). It may take a while to build the first time you run this command as it is building the whole User Interface for your development environment.

```bash
bit start
```

## What's included

- **workspace.jsonc**

This is the main configuration file of your bit workspace. Here you can modify the workspace name and icon as well as default directory and scope. It is where dependencies are found when you install anything. It is also where you register aspects, bit extensions as well as apply the environments for your components. This workspace has been setup so that all components use the React env. However you can create other components and apply other envs to them such as node, html, angular and aspect envs.

- **.bitmap**

This is an auto-generated file and includes the mapping of your components. There is one component included here. In order to remove this component you can run the following command.

- **Demo Components**

A folder (unless the --empty flag was used) containing demo components are included in this workspace. These components are used to demonstrate the different features of Bit. If you would like to remove these components you can run the following command.

```jsx
bit remove "ui/*" --delete files
```

This removes the components from the bitmap as well as removes the files.

- **.gitignore**

Ignoring any files from version control

- **publicar**

bit compile (Compila los componentes)
bit status (tiene que estar todo OK)

bit snap --message ":start: examplew" (Crea un snapshot) => crea un tag
bit tag --message ":start: examplew" (Crea un tag)

<!-- FORCE MODE -->

bit tag --skip-tests --unmodified --message "fix build issues"
bit tag --increment-by 8 // incrementa el tag en 8

bit login (Inicia sesion en la nube)
bit export (Lo envia a la nube)
bit publish hooks/ipfs-client (Lo publica en npm)
bit publish hooks/indexdb (Lo publica en npm)

## to work again in the workspace

<!-- intershare workspace name -->

bit use <workspace name>
bit install
bit start

### complete flow

bit compile; bit status; bit snap --message ":start: examplew"; bit login; bit export; bit publish hooks/ipfs-client

## PROBlemas de entonrno

bit install --add-missing-deps (instala las dependencias que faltan)
