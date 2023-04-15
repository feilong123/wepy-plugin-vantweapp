import { readdirSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join, resolve, relative, dirname, basename } from "path";
import {
  VERSION_FILE_NAME,
  COMPONENT_IGNORE,
  DESKTOP_SERVICES_STORE_FILE_NAME,
} from "./config";

import { getPageConfigFilter, getPageWxmlFilter } from "./units";
import { normalize } from "upath";

// 获取需要注入的组件
const getInjectComponents = (
  op,
  setting,
  globalConfig,
  pageConfig,
  componentsDir
) => {
  const targetPath = join("src", "components", componentsDir);
  // console.log("目标路径", targetPath);
  // 这里是vantweapp 所有的组件
  const components = readdirSync(targetPath).filter(
    (component) =>
      !COMPONENT_IGNORE[component] &&
      component != VERSION_FILE_NAME &&
      component != DESKTOP_SERVICES_STORE_FILE_NAME
  );

  // 处理全局注入配置
  let globalInject = globalConfig.inject ? components : [];
  if (
    typeof globalConfig.inject !== "boolean" &&
    globalConfig.inject instanceof Array
  ) {
    globalInject = globalConfig.inject;
  }

  // 处理页面中局部注入配置
  let vantConfig;
  if (pageConfig.hasOwnProperty("vant")) {
    vantConfig = pageConfig.vant;
    delete pageConfig.vant;
  }

  return [...new Set(globalInject.concat(vantConfig))].filter(
    (component) => component
  );
};

// 分析wxml文件得到需要注入的组件
const getInjectComponentsByWxml = (op, setting, componentsDir) => {
  // console.log("op文件", op.file);

  let components = [];
  // 按需注入 根据页面 template 标签内使用了哪些 vant 组件 进行注入
  // /<van-(\w+)/
  const reg = /<van-(\w+-?\w*-?\w*)/g;
  // '<van-nav-bar-na' 可以匹配到nav-bar-na vant最多也就是三个单词了

  let match = reg.exec(op.code);

  while (match) {
    const componentName = match[1];
    if (!components.includes(componentName)) {
      components.push(componentName);
    }
    match = reg.exec(op.code);
  }

  // console.log("全部需要注入的组件", components);

  return components;
};

const injectComponents = (op, setting, componentsDir) => {
  // op 有不同的 type 比如component、config、wxml、js
  // console.log("op内容", JSON.stringify(op));

  // if (op.type === "wxml" || op.type === "component") {
  //   // console.log("op 文件路径", op.file);
  // }

  // 过滤出wxml 文件
  const pageWxmlFilte = getPageWxmlFilter(setting.pagePath);
  if (pageWxmlFilte.test(op.file) && op.type === "wxml") {
    // console.log("整个 op 内容", JSON.stringify(op));
    // console.log("当前处理文件", op.file);
    // 获取需要注入的组件 根据分析页面 van 标签获得
    const injectComponents = getInjectComponentsByWxml(
      op,
      setting,
      componentsDir
    );
    const globalConfig = setting.config;

    // 在这之前 json 文件已经生成了
    // 得到对应的 pages 页面需要注入什么组件

    // 找到对应的 json 文件路径
    const pageConfigFile = op.file.replace(/\.wxml$/, ".json");

    if (existsSync(pageConfigFile)) {
      // 读取该文件
      const pageConfigCode = readFileSync(pageConfigFile, "utf-8");

      const pageConfig = JSON.parse(pageConfigCode);
      // console.log("对应的 json 文件内容", pageConfig);

      // 获取相对的路径 修改对应的 json 文件中的 usingComponents
      const relativePath = relative(dirname(op.file), resolve("dist/"));
      pageConfig.usingComponents = pageConfig.usingComponents || {};
      injectComponents.forEach((component) => {
        pageConfig.usingComponents[globalConfig.prefix + component] =
          normalize(relativePath) +
          "/components/" +
          componentsDir +
          "/" +
          component +
          "/index";
      });

      // console.log("最后的配置文件内容", JSON.stringify(pageConfig));

      // 写入对应的 json文件
      writeFileSync(pageConfigFile, JSON.stringify(pageConfig));
      // 输出重要操作日志
      op.output &&
        op.output({
          action: "注入所需组件",
          file: pageConfigFile,
        });
    }
  }

  // 过滤出配置文件 .json
  // const filter = getPageConfigFilter(setting.pagePath);
  // if (filter.test(op.file) && op.type === "config") {
  //   console.log("当前处理文件", op.file);
  //   const globalConfig = setting.config;
  //   const pageConfig = JSON.parse(op.code);
  //   // 获取setting.pages中对应需要注入的组件
  //   const key = op.file.replace(/\.json$/, ".wxml");
  //   console.log("原始键名", op.file);
  //   console.log("修改后键名", key);
  //   let injectComponents = [];
  //   // 如果存在该键值
  //   if (setting.pages.has(key)) {
  //     injectComponents = setting.pages.get(key);
  //     console.log("键值", injectComponents);
  //   }

  //   // 获取相对的路径
  //   const relativePath = relative(dirname(op.file), resolve("dist/"));
  //   pageConfig.usingComponents = pageConfig.usingComponents || {};
  //   injectComponents.forEach((component) => {
  //     pageConfig.usingComponents[globalConfig.prefix + component] =
  //       normalize(relativePath) +
  //       "/components/" +
  //       componentsDir +
  //       "/van-" +
  //       component +
  //       "/index";
  //   });

  //   console.log(
  //     "最后的usingComponents",
  //     JSON.stringify(pageConfig.usingComponents)
  //   );

  //   op.code = JSON.stringify(pageConfig); // 更新文件内容
  //   op.output &&
  //     op.output({
  //       action: "变更",
  //       file: op.file,
  //     });
  // }
  return op;
};

export default injectComponents;
