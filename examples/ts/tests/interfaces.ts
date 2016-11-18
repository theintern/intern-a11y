export type TestModuleInit = (registerSuite: Function) => void

export interface TestModule {
	init: TestModuleInit
}
