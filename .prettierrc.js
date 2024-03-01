export default {
  printWidth: 100,
  tabWidth: 2,
  /**
   * 是否使用制表符代替空格
   * @default false
   * @type {boolean}
   */
  useTabs: false,
  /**
   * 末尾是否加上逗号
   * @default "es5"
   * @type {"es5"|"none"|"all"}
   */
  trailingComma: "none",
  /**
   * 是否使用单引号替代双引号
   * @default false
   * @type {boolean}
   */
  singleQuote: false,
  /**
   * 是否在代码块结尾加上分号
   * @default true
   * @type {boolean}
   */
  semi: true,
  /**
   * 在对象，数组括号与文字之间加空格 "{ foo: bar }"
   * @default true
   * @type {boolean}
   */
  bracketSpacing: true,
  /**
   * 当箭头函数只有一个参数是否加括号
   * @default "always"
   * @type {"always"|"avoid"}
   */
  arrowParens: "always",
  // 是否使用根目录下的EditorConfig配置文件
  useEditorConfig: false
};
