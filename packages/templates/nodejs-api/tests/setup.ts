// 测试环境配置
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // 使用随机端口

// 全局测试配置
jest.setTimeout(30000);
