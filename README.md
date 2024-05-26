# Instrucciones

```
// Paquetes necesarios...
// aunque estan para instalar
// es necesario instalarlo globalmente :/

npm install -g typescript
install -g react-scripts

// tambien instalar pnpm para lerna
npm install -g pnpm
```

## Como Versionar y Publicar

Bueno esto siempre es tranbolico, pero la idea siempre es la misma, actualizar versiones de paquetes y sus dependencias, crear tag y publicar.

esto gracias a lerna y npm es mas facil, hay varias maneras de hacerla, pero la mas sencilla es la opcion 1.

Siempre es bueno hacer un build antes de versionar y publicar, para que los cambios se reflejen en los paquetes.

- primero instalar las dependencias
  `npm i`
- luego hacer el build
  `npm run build`
- luego versionar y publicar

Hay 2 opciones ya que lerna tiene varios pasos y puede que tengamos un error en alguno de ellos, pero la idea es siempre la misma, versionar, tag y publicar.

### Opcion 1:

#### Versionar y Publicar

`npm run publish `

- Esto lanza lerna
  - lerna hace el build, versiona, crea tag y publica

Opcion 2:

#### Versionar

`npx lerna version `

- Esto bumpea la version de los paquetes y crea un tag (no publica)
- igual verifica que el tag y todo se haya subido a github

#### Publicar

`npm run publish-npm `

- Esto solo publica los paquetes en npm
