export default {
  beforeMount(el, binding) {
    let iconClass = `fa fa-${binding.value.icon} text-green-400 text-xl`

    // checking for modifiers:
    if (binding.value.right) {
      iconClass += ' float-right'
    }

    el.innerHTML += `<i class="${iconClass}"></i>`
  }
}
