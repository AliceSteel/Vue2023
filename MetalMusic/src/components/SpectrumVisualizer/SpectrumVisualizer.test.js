import { shallowMount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SpectrumVisualizer from './SpectrumVisualizer.vue'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('p5', () => {
  const p5Mock = vi.fn().mockImplementation(() => ({
    FFT: vi.fn().mockImplementation(() => ({
      analyze: vi.fn(),
      setInput: vi.fn()
    })),
    loadSound: vi.fn(),
    createCanvas: vi.fn().mockReturnThis(),
    parent: vi.fn().mockReturnThis(),
    background: vi.fn(),
    rect: vi.fn(),
    resizeCanvas: vi.fn(),
    windowWidth: 800,
    windowHeight: 600
  }))

  p5Mock.prototype = {
    loadSound: vi.fn()
  }

  return {
    __esModule: true,
    default: p5Mock
  }
})
vi.mock('p5/lib/addons/p5.sound', () => ({
  __esModule: true,
  default: {}
}))

describe('SpectrumVisualizer.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  it('renders correctly', () => {
    const wrapper = shallowMount(SpectrumVisualizer)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the play button when sound is not playing', () => {
    const wrapper = shallowMount(SpectrumVisualizer)
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('i.fas.fa-play').exists()).toBe(true)
  })

  it('displays the pause button when sound is playing', async () => {
    const wrapper = shallowMount(SpectrumVisualizer)
    wrapper.vm.isSoundPLaying = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('i.fas.fa-pause').exists()).toBe(true)
  })

  it('pause music when pause button is clicked', async () => {
    const wrapper = shallowMount(SpectrumVisualizer)
    wrapper.vm.sound = { pause: vi.fn() }
    wrapper.vm.isSoundPLaying = true
    await wrapper.vm.$nextTick()

    const button = wrapper.find('button')
    expect(button).toBeDefined()
    await button.trigger('click.prevent')
    await flushPromises()
    expect(wrapper.vm.sound.pause).toHaveBeenCalled()
  })
})
