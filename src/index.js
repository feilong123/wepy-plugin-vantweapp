import merge from "deepmerge";
import copyVant from "./copy";
import injectComponents from "./inject";
import px2 from "./px2";
import { DEFAULT_CONFIG } from "./config";
import { extname } from "path";

export default class WepyPluginVant {
  constructor(c = {}) {
    c = merge(c, { isPx2On: c.config && c.config.px2 });
    if (c.isPx2On) {
      c = merge(c, { isVantOnly: c.config.isVantOnly });
    }
    // 合并默认配置和新增配置 c
    this.setting = merge(DEFAULT_CONFIG, c);

    // console.log("插件的最终配置", this.setting);

    // vant ui框架所在的目录
    // this.setting.uiDir = this.setting.config.ui + "-weapp";
    this.setting.uiDir = this.setting.config.ui;

    // const def = {
    //   filter: new RegExp(".(js)$"),
    //   config: {
    //     compress: { warnings: false },
    //   },
    // };

    // this.setting = Object.assign({}, def, c);

    if (this.setting.config.copy) {
      copyVant(this.setting.uiDir);
    }

    // 存储找的page页面
    // this.setting.pages = new Map();
  }

  apply(op) {
    const setting = this.setting;
    const asyncApply = async () => {
      // 文件的扩展名
      let ext = extname(op.file);
      if (setting.isPx2On && (ext === ".wxss" || ext === ".wxml")) {
        op = await px2(op, setting);
      }
      // 注入组件
      op = injectComponents(op, setting, setting.uiDir);
    };
    asyncApply().then(() => {
      op.next();
    });
  }
}
