<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      你已经成功创建了一个使用 ldesign-scaffold 脚手架的 Vue 2 项目！
    </h3>
    <p>
      推荐的 IDE 设置:
      <a href="https://code.visualstudio.com/" target="_blank" rel="noopener">VS Code</a>
      +
      <a href="https://marketplace.visualstudio.com/items?itemName=octref.vetur" target="_blank" rel="noopener">Vetur</a>
    </p>
    <p>
      <a href="https://vitejs.dev/guide/features.html" target="_blank" rel="noopener">
        Vite 文档
      </a>
      |
      <a href="https://v2.vuejs.org/" target="_blank" rel="noopener">Vue 2 文档</a>
    </p>
    <p>
      计数器: <button type="button" @click="count++">{{ count }}</button>
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'HelloWorld',
  props: {
    msg: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      count: 0
    }
  }
})
</script>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}

.green {
  color: hsla(160, 100%, 37%, 1);
}
</style>
