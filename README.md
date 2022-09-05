<h1 align="center">SpaceONE Design System</h1>  

<br/>

<div align="center" style="display:flex; flex-direction: column;">
    <div>
        <img width="245" src="https://user-images.githubusercontent.com/35549653/76694897-de236300-66bb-11ea-9ace-b9edde9c12da.png">
    </div>
<br/>
<div>
<a  href="https://www.apache.org/licenses/LICENSE-2.0"  target="_blank">  
<img  alt="License: Apache 2.0"  src="https://img.shields.io/badge/License-Apache 2.0-yellow.svg"  />  
</a> 
<a href="http://storybook.developer.spaceone.dev/"  target="_blank">  
    <img alt="spaceone storybook" src="https://img.shields.io/badge/Design System-SpaceOne-blueviolet.svg?logo=storybook" />  
</a> 
</div>

</div>  

  
    
 

  

<br/>

[![](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/images/0)](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/links/0)[![](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/images/1)](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/links/1)[![](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/images/2)](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/links/2)[![](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/images/3)](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/links/3)[![](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/images/4)](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/links/4)[![](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/images/5)](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/links/5)[![](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/images/6)](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/links/6)[![](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/images/7)](https://sourcerer.io/fame/WANZARGEN/spaceone-dev/spaceone-design-system/links/7)


<br/>

## 🧩 SpaceOne Design System  
[SpaceOne storybook](http://storybook.developer.spaceone.dev/)  

<br/> 
<br/>

## 👨‍👩‍👧 Author

See our [OWNERS](https://github.com/spaceone-dev/spaceone-design-system/blob/master/AUTHORS) file.

<br/>
<br/>

## 📝 License

This project is [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) licensed.

<br/>
<br/>

### Chart License
SpaceONE design system internally uses amCharts for Dynamic Chart. <br/>
Before using the design system, look carefully at amCharts' license. <br/>
If you want to purchase the amCharts license that suits you and use it on your application,
see the license FAQ.

https://www.amcharts.com/online-store/licenses-explained/

## How to Use


### 1. Install

```shell
npm install @spaceone/design-system vue @vue/composition-api vue-router vue-i18n vue-fragment @amcharts
```

### 2. Set plugin
   
Add following lines to ```main.js``` file. <br/>

```javascript
import SpaceDesignSystem from '@spaceone/design-system';

Vue.use(SpaceDesignSystem, pluginOptions);
```

#### Plugin Options

| Option | Description |
| --- | ---- |
| installVueRouter | Whether to install Vue Router. Some components use Vue Router, so don't give this option if you have already installed it in your application. |
| installVueI18n | Whether to install Vue I18n. Some components use Vue I18n, so don't give this option if you have already installed it in your application. |
| installVueCompositionApi | Whether to install the Vue Composition API. All components use the Vue Composition API, so don't give this option if you have already installed it in your application. |
| installFragment | Whether to install Vue Fragment. Some components use Vue Fragment, so don't give this option if you have already installed it in your application. |
| amchartsLicenses | If you use the amcharts library such as Dynamic Chart, license the amcharts as a string array. |

```typescript
interface SpaceoneDSOptions {
    installVueRouter?: boolean;
    installVueI18n?: boolean;
    installVueCompositionApi?: boolean;
    installFragment?: boolean;
    amchartsLicenses?: string[];
}
```

### 3. Set components locally

Example: 

```javascript
import { PButtonTab, PDynamicLayout } from '@spaceone/design-system';

export default {
    components: {
        PButtonTab,
        PDynamicLayout,
    },
    ...
}
```

<br/>

## How to Apply Styles

SpaceONE Design System is based on Tailwindcss.<br/>

### Global Styles

#### Case 1. All styles
If your project doesn't use tailwindcss, add the code below to ```main.ts```.

```javascript
import '@spaceone/design-system/dist/css/style.css';
```

### Case 2. Without tailwindcss styles
If your project use tailwindcss, you don't need to import all styles. <br/>
In that case, add codes below to your ```tailwind.config.js```.

```javascript
const spaceoneTailwind = require('@spaceone/design-system/tailwind.config.js')

module.exports = {
    theme: {
        ...spaceoneTailwind.theme,
        // your customized theme
    },
    variants: [...spaceoneTailwind.variants, 
    //your customized variants 
    ],
    plugins: [
        ...spaceoneTailwind.plugins,
        //your customized plugins 
    ]
}
```

Also, you need to add codes below to your ```main.js```.

```javascript
import '@spaceone/design-system/dist/css/light-style.css';
```


