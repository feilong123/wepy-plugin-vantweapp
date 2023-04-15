# wepy-plugin-vantweapp
* 一个wepy插件
* 本插件适用于wepy1.7.x及以下版本
* 根据wpy文件以及引入的组件中使用的<van-xxx>标签自动找到对应json文件进行usingComponents注入
* 页面wpy代码中再也不需要写如下配置了 实在是麻烦的一批
```
config = {
  usingComponents: {
    'van-icon': '/components/vant-weapp/icon/index',
    'van-search': '/components/vant-weapp/search/index',
  },
}
```

## 特性
* 自动注入
* 简易配置

## 用法
1. 安装`@vant/weapp`
```bash
  $ npm i @vant/weapp -S --production 
```
2. 安装`wepy-plugin-vantweapp`
```bash
  $ npm i wepy-plugin-vantweapp
```
3. 在`wepy.config.js`中`plugins`项中添加 `vant:{}`
```javascript
  plugins: {
    // ...
    vant: {
      pagePath: 'pages',
      // 可选，默认为 pages。如果页面目录不为pages，或有多个目录, 通过此值设置。
      // 参考配置：
      // pagePath: 'page2'                         page2为页面有目录
      // pagePath:['page1','page2',...]            多页面目录
         
      config: {
        // 可选 是否拷贝 node_module 中@vant/weapp到 src/components目录下 如果不拷贝请手动进行拷贝 如果拷贝的话那么ui 就是@vant/weapp
        copy: false,

        // ui 组件在 components下的文件夹名 由于我修改过几个组件 所以这里不拷贝node_module下的文件 而是用我原来的 我的文件夹名是 vant-weapp
        ui: 'vant-weapp'
        
        // 可选，默认为 'van', 组件名前缀。 如果使用其他组件名前缀, 通过此值设置。 通常不用修改
        prefix: 'van-',
      }
    }
    // ...
  }
```
4. 运行项目

## 插件开发的一些提示
* 编译器是先根据wpy中config配置生成json的，也就是说index.json是先于index.wxml文件生成的。
* 代码逻辑中处理wxml时分析需要注入的van组件直接去修改对应json文件即可
* op_obj.json是op内容的格式 也许对你开发插件也有用


## 其他
非常感谢 wepy-plugin-vant插件的作者 本插件是在其基础上修改得到的

