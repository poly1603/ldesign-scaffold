# 字体管理

LDesign Scaffold 提供了强大的字体管理和优化功能，帮助你优化 Web 字体的加载性能。

## 字体优化特性

### 启用字体管理

创建项目时启用字体管理功能：

```bash
ldesign-scaffold create my-project --features fontmin
```

或为现有项目添加字体管理：

```bash
ldesign-scaffold add fontmin
```

## 字体压缩

### 自动字体压缩

LDesign Scaffold 使用 fontmin 进行字体压缩和子集化：

```bash
# 压缩项目中的所有字体
ldesign-scaffold font compress

# 压缩指定目录的字体
ldesign-scaffold font compress --input ./src/assets/fonts --output ./dist/fonts

# 压缩特定字体文件
ldesign-scaffold font compress --file ./src/assets/fonts/custom.ttf
```

### 字体子集化

根据项目中使用的文字生成字体子集：

```bash
# 自动分析项目文字并生成子集
ldesign-scaffold font subset

# 指定文字内容生成子集
ldesign-scaffold font subset --text "Hello World 你好世界"

# 从文件读取文字内容
ldesign-scaffold font subset --text-file ./content.txt
```

### 配置文件

**fontmin.config.js：**
```javascript
export default {
  // 输入目录
  src: './src/assets/fonts/**/*.{ttf,otf,woff,woff2}',
  
  // 输出目录
  dest: './dist/fonts',
  
  // 字体子集化配置
  subset: {
    // 自动分析项目文字
    autoDetect: true,
    
    // 扫描的文件类型
    scanFiles: ['**/*.{vue,js,ts,jsx,tsx,html}'],
    
    // 额外包含的字符
    extraText: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    
    // 中文字符集
    chineseCharsets: {
      // 常用汉字 (3500字)
      common: true,
      
      // 通用规范汉字表 (8105字)
      standard: false,
      
      // 完整字符集
      full: false
    }
  },
  
  // 压缩选项
  compression: {
    // 启用 gzip 压缩
    gzip: true,
    
    // 启用 brotli 压缩
    brotli: true,
    
    // 压缩级别 (1-9)
    level: 6
  },
  
  // 格式转换
  formats: {
    // 生成 WOFF 格式
    woff: true,
    
    // 生成 WOFF2 格式
    woff2: true,
    
    // 保留原格式
    original: false
  },
  
  // 字体优化
  optimization: {
    // 移除字体提示信息
    removeHinting: true,
    
    // 优化字形轮廓
    optimizeGlyphs: true,
    
    // 移除未使用的表
    removeTables: ['DSIG', 'GPOS', 'GSUB']
  }
}
```

## 字体加载优化

### 字体预加载

自动生成字体预加载标签：

```html
<!-- 在 HTML head 中添加 -->
<link rel="preload" href="/fonts/custom.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/custom.woff" as="font" type="font/woff" crossorigin>
```

### CSS 字体声明

自动生成优化的 CSS 字体声明：

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2'),
       url('/fonts/custom.woff') format('woff');
  font-display: swap;
  font-weight: 400;
  font-style: normal;
}

/* 字体回退策略 */
.custom-font {
  font-family: 'CustomFont', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
               'Roboto', 'Helvetica Neue', Arial, sans-serif;
}
```

### 字体显示策略

配置不同的字体显示策略：

```css
/* 立即显示，无回退期 */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: block;
}

/* 短暂回退期后显示 */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
}

/* 可选字体，不阻塞渲染 */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: optional;
}
```

## 中文字体优化

### 中文字体子集化

针对中文字体的特殊优化：

```bash
# 生成常用汉字子集 (约 3500 字)
ldesign-scaffold font subset --chinese common

# 生成通用规范汉字表子集 (约 8105 字)
ldesign-scaffold font subset --chinese standard

# 自定义中文字符集
ldesign-scaffold font subset --chinese custom --chars "你好世界欢迎使用"
```

### 分片加载

将大字体文件分片加载：

```javascript
// 字体分片配置
const fontChunks = {
  base: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  common: '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严';

// 动态加载字体分片
async function loadFontChunk(chunk) {
  const font = new FontFace('CustomFont', `url(/fonts/custom-${chunk}.woff2)`);
  await font.load();
  document.fonts.add(font);
}

// 根据页面内容加载相应字体分片
function loadRequiredFonts(text) {
  const chunks = detectRequiredChunks(text);
  return Promise.all(chunks.map(loadFontChunk));
}
```

## 字体性能监控

### 字体加载监控

监控字体加载性能：

```javascript
// 字体加载性能监控
class FontPerformanceMonitor {
  constructor() {
    this.fonts = new Map();
    this.observer = new PerformanceObserver(this.handleEntries.bind(this));
    this.observer.observe({ entryTypes: ['resource'] });
  }

  handleEntries(list) {
    for (const entry of list.getEntries()) {
      if (entry.name.includes('.woff') || entry.name.includes('.ttf')) {
        this.fonts.set(entry.name, {
          loadTime: entry.duration,
          size: entry.transferSize,
          cached: entry.transferSize === 0
        });
      }
    }
  }

  getFontMetrics() {
    return Array.from(this.fonts.entries()).map(([name, metrics]) => ({
      name: name.split('/').pop(),
      ...metrics
    }));
  }

  getTotalLoadTime() {
    return Array.from(this.fonts.values())
      .reduce((total, font) => total + font.loadTime, 0);
  }
}

// 使用监控器
const monitor = new FontPerformanceMonitor();

// 页面加载完成后查看字体性能
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('字体加载指标:', monitor.getFontMetrics());
    console.log('总加载时间:', monitor.getTotalLoadTime(), 'ms');
  }, 1000);
});
```

### 字体回退检测

检测字体是否成功加载：

```javascript
// 字体加载检测
function checkFontLoaded(fontFamily, timeout = 3000) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // 使用回退字体绘制文本
    context.font = '72px monospace';
    const fallbackWidth = context.measureText('test').width;
    
    // 使用目标字体绘制文本
    context.font = `72px ${fontFamily}, monospace`;
    
    const checkFont = () => {
      const currentWidth = context.measureText('test').width;
      if (currentWidth !== fallbackWidth) {
        resolve(true); // 字体已加载
      } else {
        resolve(false); // 字体未加载
      }
    };
    
    // 立即检查一次
    checkFont();
    
    // 设置超时
    setTimeout(() => resolve(false), timeout);
  });
}

// 使用示例
checkFontLoaded('CustomFont').then(loaded => {
  if (loaded) {
    console.log('字体加载成功');
  } else {
    console.log('字体加载失败，使用回退字体');
  }
});
```

## 字体管理工具

### 字体信息查看

```bash
# 查看字体文件信息
ldesign-scaffold font info ./src/assets/fonts/custom.ttf

# 查看字体包含的字符
ldesign-scaffold font chars ./src/assets/fonts/custom.ttf

# 分析项目字体使用情况
ldesign-scaffold font analyze
```

### 字体格式转换

```bash
# TTF 转 WOFF2
ldesign-scaffold font convert --input custom.ttf --output custom.woff2 --format woff2

# 批量转换
ldesign-scaffold font convert --input ./fonts/*.ttf --format woff2

# 转换并压缩
ldesign-scaffold font convert --input custom.ttf --format woff2 --compress
```

### 字体验证

```bash
# 验证字体文件完整性
ldesign-scaffold font validate ./src/assets/fonts/

# 检查字体兼容性
ldesign-scaffold font compatibility ./src/assets/fonts/custom.woff2
```

## 构建集成

### Vite 插件

**vite.config.ts：**
```typescript
import { defineConfig } from 'vite'
import { fontminPlugin } from 'ldesign-scaffold/plugins'

export default defineConfig({
  plugins: [
    fontminPlugin({
      // 字体文件匹配模式
      include: /\.(ttf|otf|woff|woff2)$/,
      
      // 输出目录
      outDir: 'dist/fonts',
      
      // 子集化配置
      subset: {
        text: 'auto', // 自动检测
        chinese: 'common' // 常用汉字
      },
      
      // 格式转换
      formats: ['woff2', 'woff'],
      
      // 生成 CSS
      generateCSS: true,
      
      // CSS 输出路径
      cssOutput: 'src/styles/fonts.css'
    })
  ]
})
```

### Webpack 插件

**webpack.config.js：**
```javascript
const FontminPlugin = require('ldesign-scaffold/webpack-plugin');

module.exports = {
  plugins: [
    new FontminPlugin({
      src: './src/assets/fonts/**/*.{ttf,otf}',
      dest: './dist/fonts',
      subset: {
        autoDetect: true,
        chinese: 'common'
      }
    })
  ]
};
```

## 最佳实践

### 字体选择策略

1. **系统字体优先**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Helvetica Neue', Arial, sans-serif;
```

2. **Web 字体作为增强**
```css
font-family: 'CustomFont', -apple-system, BlinkMacSystemFont, sans-serif;
```

3. **关键内容使用系统字体**
```css
.critical-text {
  font-family: system-ui, sans-serif;
}

.enhanced-text {
  font-family: 'CustomFont', system-ui, sans-serif;
}
```

### 加载优化

1. **预加载关键字体**
```html
<link rel="preload" href="/fonts/critical.woff2" as="font" type="font/woff2" crossorigin>
```

2. **使用 font-display: swap**
```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
}
```

3. **字体子集化**
```bash
# 只包含项目中使用的字符
ldesign-scaffold font subset --auto-detect
```

### 性能监控

1. **监控字体加载时间**
2. **检测字体回退情况**
3. **分析字体文件大小**
4. **优化字体加载策略**

## 故障排除

### 常见问题

1. **字体文件过大**
   ```bash
   # 使用字体子集化
   ldesign-scaffold font subset --chinese common
   
   # 压缩字体文件
   ldesign-scaffold font compress --level 9
   ```

2. **字体加载失败**
   ```css
   /* 确保正确的 CORS 设置 */
   @font-face {
     font-family: 'CustomFont';
     src: url('/fonts/custom.woff2') format('woff2');
     font-display: swap;
   }
   ```

3. **中文字体显示问题**
   ```bash
   # 检查字符集包含情况
   ldesign-scaffold font chars ./fonts/chinese.ttf
   
   # 重新生成中文子集
   ldesign-scaffold font subset --chinese standard
   ```

### 调试技巧

```javascript
// 检查字体加载状态
document.fonts.ready.then(() => {
  console.log('所有字体加载完成');
  
  // 检查特定字体
  if (document.fonts.check('16px CustomFont')) {
    console.log('CustomFont 可用');
  } else {
    console.log('CustomFont 不可用');
  }
});

// 监听字体加载事件
document.fonts.addEventListener('loadingdone', (event) => {
  console.log('字体加载完成:', event.fontfaces.length);
});
```

## 下一步

- [图标管理](/guide/icon-management) - 图标字体管理
- [性能优化](/guide/performance) - 项目性能优化
- [API 参考](/api/) - 查看完整的 API 文档
