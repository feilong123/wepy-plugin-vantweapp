// config
export const VANT_SOURCE_DIR = "dist";
export const VERSION_FILE_NAME = ".version";
export const DESKTOP_SERVICES_STORE_FILE_NAME = ".DS_Store";

export const COMPONENT_IGNORE = {
  common: true,
  mixins: true,
  wxs: true,
};
export const DEFAULT_CONFIG = {
  pagePath: "pages",
  config: {
    copy: false,
    inject: true,
    prefix: "van-",
    ui: "@vant/weapp",
    px2: {
      isVantOnly: false,
      relative: 400,
      decimalPlaces: 2,
      comment: "no",
      targetUnits: "rpx",
    },
  },
};
