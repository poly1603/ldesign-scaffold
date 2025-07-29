import { shallowMount } from '@vue/test-utils';
import Button from '@/components/Button/Button.vue';

describe('Button.vue', () => {
  it('renders slot content', () => {
    const wrapper = shallowMount(Button, {
      slots: {
        default: 'Test Button'
      }
    });
    expect(wrapper.text()).toBe('Test Button');
  });

  it('applies correct type class', () => {
    const wrapper = shallowMount(Button, {
      propsData: {
        type: 'primary'
      }
    });
    expect(wrapper.classes()).toContain('l-button--primary');
  });

  it('applies correct size class', () => {
    const wrapper = shallowMount(Button, {
      propsData: {
        size: 'large'
      }
    });
    expect(wrapper.classes()).toContain('l-button--large');
  });

  it('applies disabled class when disabled', () => {
    const wrapper = shallowMount(Button, {
      propsData: {
        disabled: true
      }
    });
    expect(wrapper.classes()).toContain('l-button--disabled');
    expect(wrapper.attributes('disabled')).toBe('disabled');
  });

  it('emits click event when clicked', async () => {
    const wrapper = shallowMount(Button);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('does not emit click event when disabled', async () => {
    const wrapper = shallowMount(Button, {
      propsData: {
        disabled: true
      }
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('does not emit click event when loading', async () => {
    const wrapper = shallowMount(Button, {
      propsData: {
        loading: true
      }
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });
});
