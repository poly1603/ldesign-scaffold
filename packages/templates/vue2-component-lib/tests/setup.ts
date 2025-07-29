import Vue from 'vue';
import { config } from '@vue/test-utils';

// 配置 Vue Test Utils
config.mocks = {
  $t: (msg: string) => msg
};

// 全局配置
Vue.config.productionTip = false;
