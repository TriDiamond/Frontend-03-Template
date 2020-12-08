<template>
  <p>{{ greeting }} World!</p>
</template>
<script>
  module.exports = {
    name: 'HelloWorld',
    data: function() {
      return {
        greeting: 'Hello vue',
      };
    },
  }
</script>
<style>
p {
  font-size: 14px;
  text-align: center;
}
</style>