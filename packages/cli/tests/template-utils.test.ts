import { describe, it, expect } from 'vitest';
import { getAvailableTemplates, getTemplateByName } from '../src/utils/template-utils.js';

describe('template-utils', () => {
  describe('getAvailableTemplates', () => {
    it('should return all available templates', () => {
      const templates = getAvailableTemplates();
      
      expect(templates).toHaveLength(10);
      
      // 检查是否包含所有新模板
      const templateNames = templates.map(t => t.name);
      expect(templateNames).toContain('vue3-basic');
      expect(templateNames).toContain('vue3-component-lib');
      expect(templateNames).toContain('vue2-basic');
      expect(templateNames).toContain('vue2-component-lib');
      expect(templateNames).toContain('react-basic');
      expect(templateNames).toContain('react-component-lib');
      expect(templateNames).toContain('typescript-lib');
      expect(templateNames).toContain('nodejs-api');
      expect(templateNames).toContain('less-style-lib');
    });

    it('should have correct template structure', () => {
      const templates = getAvailableTemplates();
      
      templates.forEach(template => {
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('displayName');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('framework');
        expect(template).toHaveProperty('buildTool');
        expect(template).toHaveProperty('packageManager');
        expect(template).toHaveProperty('features');
        expect(template).toHaveProperty('dependencies');
        expect(template).toHaveProperty('devDependencies');
        expect(template).toHaveProperty('scripts');
        expect(template).toHaveProperty('templatePath');
      });
    });
  });

  describe('getTemplateByName', () => {
    it('should return correct template by name', () => {
      const template = getTemplateByName('vue3-component-lib');
      
      expect(template).toBeDefined();
      expect(template?.name).toBe('vue3-component-lib');
      expect(template?.displayName).toBe('Vue 3 组件库');
      expect(template?.framework).toBe('vue3');
    });

    it('should return undefined for non-existent template', () => {
      const template = getTemplateByName('non-existent-template');
      
      expect(template).toBeUndefined();
    });
  });

  describe('component library templates', () => {
    it('should have correct configuration for Vue 2 component lib', () => {
      const template = getTemplateByName('vue2-component-lib');
      
      expect(template?.features).toContain('storybook');
      expect(template?.features).toContain('jest');
      expect(template?.features).toContain('typescript');
      expect(template?.features).toContain('jsx');
      expect(template?.features).toContain('less');
      expect(template?.scripts.dev).toBe('storybook dev -p 6006');
      expect(template?.scripts.test).toBe('jest');
    });

    it('should have correct configuration for Vue 3 component lib', () => {
      const template = getTemplateByName('vue3-component-lib');
      
      expect(template?.features).toContain('storybook');
      expect(template?.features).toContain('vitest');
      expect(template?.features).toContain('typescript');
      expect(template?.features).toContain('jsx');
      expect(template?.features).toContain('less');
      expect(template?.scripts.dev).toBe('storybook dev -p 6006');
      expect(template?.scripts.test).toBe('vitest');
    });

    it('should have correct configuration for React component lib', () => {
      const template = getTemplateByName('react-component-lib');
      
      expect(template?.features).toContain('storybook');
      expect(template?.features).toContain('jest');
      expect(template?.features).toContain('typescript');
      expect(template?.features).toContain('jsx');
      expect(template?.features).toContain('less');
      expect(template?.scripts.dev).toBe('storybook dev -p 6006');
      expect(template?.scripts.test).toBe('jest');
    });
  });

  describe('other templates', () => {
    it('should have correct configuration for TypeScript lib', () => {
      const template = getTemplateByName('typescript-lib');
      
      expect(template?.framework).toBe('typescript');
      expect(template?.buildTool).toBe('rollup');
      expect(template?.features).toContain('typescript');
    });

    it('should have correct configuration for Node.js API', () => {
      const template = getTemplateByName('nodejs-api');
      
      expect(template?.framework).toBe('nodejs');
      expect(template?.features).toContain('express');
      expect(template?.dependencies).toHaveProperty('express');
      expect(template?.scripts.dev).toContain('nodemon');
    });

    it('should have correct configuration for Less style lib', () => {
      const template = getTemplateByName('less-style-lib');
      
      expect(template?.framework).toBe('less');
      expect(template?.buildTool).toBe('rollup');
      expect(template?.features).toContain('less');
      expect(template?.features).toContain('postcss');
    });
  });
});
